# Plan: Flex region in flex slot (one level)

## Goal

Allow a flex region to be placed in a top-level flex slot. Inner slots hold text, barcode, image, and QR code as today. Nested flex regions cannot accept another flex region in their slots.

## Binding rule

- `bindChild`: allow `LabelWizardFlexRegion` when the parent region is not itself bound (`getFlexBinding(parent) == null`).
- Reject binding a flex region into a slot of a bound (nested) flex region.

Centralize in `canBindChildToFlexSlot(parent, child)` in `flexRegionUtils.ts`; call from `bindChild`, `setFlexBinding`, `bindObjectToFlexSlot`, and `canBindObjectToRegion`.

## Treat nested flex as a slot child

Update child enumeration so bound flex regions are included:

- `LabelWizardFlexRegion.buildSlotChildrenMap`
- `getFlexRegionChildren`
- `repairBindings`, `clearAllBindings`, `repairOrphanBindings` (validate bound flex regions like other slot children)

## Layout

- `layoutChildInBand`: size nested flex regions via width/height with scale 1 (box-model path, same idea as `LabelWizardImage`).
- Single-pass `reconcileFlex` in canvas object order; parent must reconcile before nested region (see sort step).

## Canvas object order

Add `sortFlexCanvasObjectsForLayout(canvas)` (or sort parsed `objects[]` pre-add):

- Each flex region appears before objects bound to it.
- Stable sort; one-level nesting only.

Run after:

- `loadFromJSON` (post-enliven)
- Paste (`preparePastedFlexBindings` + add)
- Optional full-canvas repair helper if order drifts

Keep incremental `normalizeStackOrder` on bind; include nested flex in parent `getBoundChildren` / stack block.

## Add / bind UX

- Toolbar `handleAddObject("flexregion")`: bind to active slot when `getActiveFlexSlotBindTarget` is set (same as textbox/barcode/qrcode).
- HTML drop `flexregion`: call `bindObjectToFlexSlot` when drop hits a slot.
- Canvas drag: same participant pipeline as text/barcode/image/QR (`isFlexSlotDragParticipant`); nesting depth enforced only in `canBindChildToFlexSlot`.

## Stack, copy, delete

- `getFlexStackUnit`: outer region includes nested flex region and all descendants one level (nested + its slot children).
- `expandFlexClipboardObjects` / `preparePastedFlexBindings`: unchanged contract; copy set must include full stack via updated `getFlexStackUnit`.
- Deleting a flex region: `clearAllBindings` clears bindings on bound flex children; cascade remove nested flex and its slot children when deleting parent region (or explicit orphan cleanup).

## Tests

- Bind outer → nested flex OK; bind nested → flex throws.
- `sortFlexCanvasObjectsForLayout` orders parent before nested.
- Reconcile: outer sizes nested; nested lays out inner content in one pass.
- Copy/paste preserves nested structure and bindings.
- Delete parent removes nested flex and inner children.

## Files

| Area | Files |
|------|--------|
| Binding + sort + repair | `app/editor/Utils/flexRegionUtils.ts` |
| Region bind/layout | `app/editor/FabricObjects/LabelWizardFlexRegion.ts` |
| Load order | `app/editor/FabricObjects/LabelWizardCanvas.ts` |
| Drag/drop | `app/editor/EditorPage/flexRegionDropDrag.ts` |
| Editor UX | `app/editor/EditorPage/EditorPage.tsx` |
| Tests | `app/editor/Utils/flexRegionUtils.test.ts`, `app/editor/FabricObjects/LabelWizardFlexRegion.test.ts` |
