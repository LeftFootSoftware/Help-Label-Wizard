# Incremental Plan: Text Control Parity (Testable Steps)

**Goal:** Improve main canvas text behavior to match the test harness where useful, **without breaking** existing behavior (Discard/Cancel revert, expression/variable substitution, variant display).

---

## Why the previous attempt broke things

- **Cancel/Discard cleared text instead of reverting:** The main app stores **display** text in `originalPopupText` (LabelToValue, e.g. "Red"). Calling `syncPopupTextToFabric(originalPopupText)` on Discard pushed that display text into the textbox and overwrote the **stored** form (placeholders + padding, e.g. `Option_1`). That broke variant substitution because the textbox no longer had placeholders.
- **Variables not substituted:** Changing textWrap/verticalAlign and touching many text paths (selection, load, save, scaling) likely affected when/where `convertText` or expression application ran, so variant display broke.
- **Lesson:** Revert must restore the **stored** textbox text (with placeholders), not the display text. Do not call `syncPopupTextToFabric` with display text on Discard. Store the textbox’s current `text` when opening and set it back on Discard/Escape.

**Principle:** Each step is a small, isolated change with a clear **How to verify** so you can test before moving on. Do not change expression/variant logic, `convertText`, or how `originalPopupText` / stored text is used except where explicitly stated.

---

## What must never break

- **Expression/variable substitution:** Text with placeholders (e.g. `Option_1`) must still show the correct variant value (e.g. "Red") on canvas and in popup when switching variants. Do not change `convertText`, `getTextboxExpression`, or the flow that applies expressions on variant change or selection.
- **Popup open content:** When opening the text popup, the content shown must remain the current variant’s value (LabelToValue form). Only the **revert** mechanism may be changed (what we restore on Discard/Escape).
- **Save path:** Saving from the popup must continue to use `syncPopupTextToFabric(popupTextContent)` and existing expression padding/highlight logic. Do not change `syncPopupTextToFabric` except if a later step explicitly adds optional behavior (e.g. live preview) that does not alter the Save path.

---

## Step 1: Discard and Escape revert canvas text (no other changes)

**Problem:** Today, Discard and Escape only reset popup state and close; they do **not** restore the text on the fabric textbox, so the canvas keeps the edited text.

**Cause:** We only have `originalPopupText` in **display form** (LabelToValue). Restoring via `syncPopupTextToFabric(originalPopupText)` would push display text into the textbox and break the **stored form** (placeholders + padding), which breaks variant substitution.

**Fix:** Restore the **stored** textbox text on Discard/Escape, not the display text.

1. **Store original stored text when opening the popup**
   - In the same place where you set `setOriginalPopupText(displayText)` (and `setPopupTextContent(displayText)`), also store the **current textbox text** (stored form with placeholders):
     - Add state or a ref, e.g. `originalStoredTextRef` (ref is enough).
     - When opening: `originalStoredTextRef.current = this.text ?? ""` (the fabric textbox’s `text` at open time).
   - Do **not** change how `originalPopupText` or `displayText` is set; keep that for popup display only.

2. **Discard button**
   - Before closing: get the textbox by `popupTextboxId`, then `textbox.set({ text: originalStoredTextRef.current ?? "" })`.
   - Then run your existing “Remove highlighting when closing” and close (e.g. `removeFontStyleToLabel`, `setShowPopupTextEditor(false)`, etc.).
   - Optionally re-apply expression highlighting after setting text so the canvas looks like it did when the popup opened (only if you already have a function that applies highlight from expressions; if not, skip to avoid scope creep).

3. **Escape key**
   - Same as Discard: set `textbox.text = originalStoredTextRef.current ?? ""`, then the same “Remove highlighting when closing” and close logic.

**Files:** `app/routes/Canvas/Components/Fabric/Fabric.tsx` only.

**How to verify**
1. Add a text box; add an expression (e.g. variant option) so the canvas shows a value (e.g. "Red").
2. Double-click to open the popup; change the text (e.g. to "Blue"); click **Discard**.
3. **Pass:** Canvas text reverts to what it was when you opened (e.g. "Red"), and switching variants still updates the text correctly.
4. Repeat: open popup, change text, press **Escape**.
5. **Pass:** Same revert behavior. Variant substitution still works after revert.

---

## Step 2: Debounced live preview in popup (optional, after Step 1)

**Goal:** While typing in the popup, update the canvas after a short pause (e.g. 200 ms), without changing Save or Discard.

**Constraints**
- Use the **same** text source and cleaning as Save: read from the contenteditable, then call `syncPopupTextToFabric(currentText)` in a debounced way.
- Do **not** change when or how `syncPopupTextToFabric` is called on **Save** or **Discard/Escape** (Step 1 must still restore stored text).
- Clear any debounce timer when the popup closes (Save, Discard, Escape).

**Implementation sketch**
- In the popup’s `onInput` (or equivalent): read current text from the contenteditable; schedule a debounced (e.g. 200 ms) call to `syncPopupTextToFabric(currentText)`.
- Use a ref for the timeout; clear it in the same code paths that close the popup (Save, Discard, Escape).
- Ensure Debounce runs **after** any existing logic that updates highlights so you don’t double-update or move the cursor.

**How to verify**
1. Open text popup; type; after ~200 ms pause, canvas text should update.
2. Click **Save**: final text must match.
3. Open again; type; click **Discard**: canvas must still revert to pre-edit text (Step 1 behavior).
4. Variant substitution still works.

---

## Step 3: Resize UX – hide text during scale, reflow on release

**Goal:** While resizing a textbox, hide its text (e.g. opacity 0); on release, restore opacity and reflow (e.g. `adjustFontSizeToFitTextbox` or equivalent).

**Constraints**
- Do not change how text is stored or how expressions/variants are applied.
- Add only canvas-level `object:scaling` and `object:modified` handlers (or equivalent) that:
  - On `object:scaling`: if target is a textbox, set opacity to 0 (and requestRenderAll).
  - On `object:modified`: if target is a textbox, set opacity back to 1 and run your existing reflow (e.g. `adjustFontSizeToFitTextbox`), then requestRenderAll.
- If you have an existing “cancel transform” path (e.g. Escape during resize), ensure opacity is restored there too so the textbox never stays invisible.

**How to verify**
1. Select a textbox; drag a corner to resize; text should disappear during drag and reappear after release, reflowed.
2. Discard/Cancel and variant substitution still work as before.

---

## Step 4+: Later improvements (only after 1–3 are solid)

These can be separate, testable steps later; they are **out of scope** until Steps 1–3 are verified and stable.

- **Vertical alignment:** Add `verticalAlign` to `TextProperties` and a small UI control; use it only in export/print if you introduce a shared SVG/PNG path later. Do not change in-canvas text storage or expression logic.
- **Shared SVG/PNG text util:** Extract from the test harness into e.g. `textSvgPngUtils.ts` and use it **only** for export/print so that preview and print match. Do not replace the main canvas textbox with PNG groups in this phase.
- **Wrap/Clip toggle:** Leave as-is unless you have a separate, tested plan that preserves expression and revert behavior.

---

## Summary

| Step | Change | Verify |
|------|--------|--------|
| 1 | Store `originalStoredTextRef.current = textbox.text` on popup open; on Discard and Escape set `textbox.text = originalStoredTextRef.current` then close | Discard and Escape revert canvas; variant substitution still works |
| 2 | Debounced (200 ms) `syncPopupTextToFabric` from popup `onInput`; clear timeout on close | Live preview; Save/Discard unchanged; variants still work |
| 3 | `object:scaling` → textbox opacity 0; `object:modified` → opacity 1 + reflow | Resize hides text then reflows; no regression to 1–2 |

Do not combine steps. Test after each step before proceeding.
