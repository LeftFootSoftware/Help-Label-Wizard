# Plan: State-driven sidebar and variant sync (label-harness)

## Goal

Fix the `sidebar:sync` → `applyVariant` → `_notifySidebarSync` recursion and align behavior with React’s state-driven model: **state is the source of truth for when variant is applied**; **sidebar:sync** is used only to refresh the sidebar UI.

## Current behavior (problem)

- **`sidebar:sync`** is a global event meaning “something on the canvas changed; refresh the sidebar.”
- **EditorPage `handleSidebarSync`** does two things:
  1. Calls **`applyVariant(variantData)`** on the active Fabric object.
  2. Bumps **`sidebarVersion`** and calls **`updateSelectionSidebar()`** to re-render the sidebar.
- Fabric objects (e.g. **LabelWizardTextBox**) call **`_notifySidebarSync()`** at the end of **`applyVariant()`**.
- That creates a loop: `_notifySidebarSync` → `sidebar:sync` → `handleSidebarSync` → `applyVariant` → `_notifySidebarSync` → …

So “apply variant” is triggered by an **imperative** event instead of **React state**, and the same event is used both to “refresh UI” and to “re-apply variant,” which causes recursion.

## Principles

1. **Variant application is driven by state**  
   “Apply current variant” should run when **`currentVariantIndex`** (or **`variants`**) or **selection** changes, via **effects** or **event handlers that update state**, not as a side effect of a generic “sync” event.

2. **`sidebar:sync` is UI-only**  
   The only responsibility of **`sidebar:sync`** is: “selection or object props may have changed; refresh the sidebar.” It must **not** call **`applyVariant`**.

3. **Fabric objects don’t re-request variant on sync**  
   **`applyVariant()`** updates the object from variant data; it should **not** call **`_notifySidebarSync()`**, because the React side already refreshes the sidebar when needed. The recursion comes from that call.

---

## Phase 1: Stop the recursion (minimal fix)

**1.1 EditorPage – `handleSidebarSync` does not apply variant**

- **File:** `scripts/label-harness/EditorPage.tsx`
- **Change:** In the **`sidebar:sync`** listener, **remove** the block that gets the active object and calls **`lw.applyVariant(variantData)`**.
- **Keep:** Bump **`sidebarVersion`** and call **`updateSelectionSidebar()`** so the sidebar still re-renders when an object notifies.

**1.2 Fabric objects – `applyVariant()` does not notify**

- **Files:**
  - `app/routes/Canvas/FabricObjects/LabelWizardTextBox.ts`
  - `app/routes/Canvas/FabricObjects/LabelWizardBarcode.ts`
  - `app/routes/Canvas/FabricObjects/LabelWizardQRCode.ts`
  - `app/routes/Canvas/FabricObjects/LabelWizardImage.ts`
- **Change:** In **`applyVariant()`**, **remove** the final **`this._notifySidebarSync()`** (or equivalent) call.
- **Reason:** The caller (e.g. **`applyVariantToAll`** or an effect) is responsible for any follow-up UI refresh; the object shouldn’t trigger another sync and re-apply.

After Phase 1, adding a text box (or any object that calls **`_notifySidebarSync`** from setters) no longer causes a stack overflow, and **sidebar:sync** is UI-only.

---

## Phase 2: Drive variant application from state

**2.1 Keep “apply to all” on variant change**

- **Already in place:** When the user changes variant, **`handleSelectVariant`** updates **`currentVariantIndex`** and calls **`applyVariantToAll()`**. Leave this as-is so “change variant” is state-driven (index in state → apply to all).

**2.2 Apply variant to selection when selection changes (optional)**

- **Goal:** When the user **selects a different object**, that object should show the **current** variant’s resolved value (in case it wasn’t in the “apply to all” path or was added later).
- **Option A – Effect:** Add an effect that depends on **`selectedObject`** (and optionally **`currentVariantIndex`**). When they change, if **`selectedObject`** is an **`ILabelWizardSidebarObject`** with **`applyVariant`**, call **`applyVariant(variantData)`** with **`stateRef.current.variants[stateRef.current.currentVariantIndex]`**, then call **`updateSelectionSidebar()`** or **`setSidebarVersion((v) => v + 1)`** once so the sidebar reflects the updated object.
- **Option B – In `updateSelectionSidebar`:** After **`setSelectedObject(active)`**, if **`active`** has **`applyVariant`**, call **`applyVariant(currentVariantData)`** once, then no extra effect. Prefer this only if it doesn’t reintroduce loops (e.g. **applyVariant** must not trigger **sidebar:sync** after Phase 1).

**2.3 New object gets current variant**

- **Already in place:** **`addObject`** (and any “add textbox/barcode” flow) should apply the current variant to the new object after add. Verify **canvas-test** / **label-harness** **addObject** or post-add logic does this; if not, add a single **`applyVariant(variantData)`** on the newly added object after it’s added.

---

## Phase 3: Clarify “sync” semantics (optional)

**3.1 Rename or document the event**

- Consider renaming **`sidebar:sync`** to something like **`sidebar:requestRefresh`** and document that it means “re-read selection and re-render the sidebar; do not apply variant or mutate canvas.”

**3.2 When Fabric objects call `_notifySidebarSync`**

- **Keep** calls from **sidebar control setters** (e.g. when the user changes “Field” or “Expression” in the sidebar). Those are “object state changed; refresh sidebar.”
- **Removed** from **`applyVariant()`** in Phase 1.
- No other new call sites unless a clear “user changed something on the object and the sidebar must reflect it” case appears.

---

## Phase 4: Optional longer-term – lift sidebar-relevant state (future)

- **Idea:** Hold “sidebar-relevant props” for the selected object in React state (e.g. **`selectionProps`** or a small snapshot). The sidebar reads from state; control changes update both state and the Fabric object. Then **`sidebar:sync`** could be reduced or removed for simple cases.
- **Scope:** Larger refactor (Fabric object ↔ state sync, controlled sidebar). Not required to fix the recursion or to make “variant apply” state-driven.

---

## Summary

| Step | Action |
|------|--------|
| 1.1 | In **EditorPage**, **remove** **`applyVariant`** from **`handleSidebarSync`**; keep **`setSidebarVersion`** and **`updateSelectionSidebar`**. |
| 1.2 | In **LabelWizardTextBox**, **LabelWizardBarcode**, **LabelWizardQRCode**, **LabelWizardImage**, **remove** **`_notifySidebarSync()`** from **`applyVariant()`**. |
| 2.x | Ensure variant is applied from state (variant index change, selection change, new object) only; no **applyVariant** in **sidebar:sync**. |
| 3.x | (Optional) Rename/document **sidebar:sync** and limit who calls **`_notifySidebarSync`**. |

After Phase 1 and 2, React state (**currentVariantIndex**, **selectedObject**) drives when variant is applied; **sidebar:sync** only triggers a sidebar refresh and no longer causes recursion or duplicate variant application.
