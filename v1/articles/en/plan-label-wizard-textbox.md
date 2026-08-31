# Plan: LabelWizardTextBox Migration (Canvas Test Harness)

**Goal:** Replace the harness’s `fabric.Group` + PNG text with a custom Fabric object `LabelWizardTextBox`, then remove all old group-based code. No backwards compatibility with the old implementation.

---

## Completed

1. **Shared `buildHiddenTextbox` util** – `scripts/canvas-test/buildHiddenTextbox.ts` holds font-fitting logic (`TEXT_PADDING`, `getLinesFromTextbox`, `buildHiddenTextbox`). Used by `LabelWizardTextBox` and `main.ts`.
2. **`LabelWizardTextBoxOptions` and instance attributes** – Options and instance props (`textContent`, `fontFamily`, `textAlign`, `verticalAlign`, `minFont`, `maxFont`, `lineHeight`, `hiddenTextbox`) added to `LabelWizardTextBox`.
3. **Static `LabelWizardTextBox.create(text, options)`** – Uses shared `buildHiddenTextbox` for font-fitting, builds instance, sets `hiddenTextbox`, returns `Promise<LabelWizardTextBox>`.
4. **`main.ts` uses shared util** – Imports `buildHiddenTextbox`, `getLinesFromTextbox`, `TEXT_PADDING` from `buildHiddenTextbox.ts`; local definitions removed.
5. **Override `toSVG()`** – `LabelWizardTextBox.toSVG()` returns full label export SVG (wrapper + `hiddenTextbox.toSVG()` content, viewBox, `preserveAspectRatio` from `verticalAlign`). Shared `convertSvgToPngDataUrl` moved to `svgToPng.ts`.
6. **Modify `_render()` to show label content** – `_render()` uses `toSVG()` → `convertSvgToPngDataUrl` → cached PNG; draws image in object-local coords (centered). Cache key from `textContent`, `width`, `height`, `fontFamily`, `textAlign`, `verticalAlign`; guard so stale PNG is not applied after invalidation.
7. **`createLabelWizardTextBox` uses `LabelWizardTextBox.create()`** – Harness creates LWT with text and font-fitting via `create()`; no shell-only instances.
8. **Recalc font size on resize** – `object:modified` for `LabelWizardTextBox`: get scaled dimensions, rebuild `hiddenTextbox` with `buildHiddenTextbox(textContent, w, h, options)`, set width/height/scaleX/scaleY; cache key change triggers new PNG in `_render()`.

---

## Remaining

None. Migration complete.

**Removed:** All Group-based text box code: `createSvgTextElement`, `buildGroupFromPng`, `buildGroupFromLines`, `produceAndStoreComparisonSvg`, `createGroupFromSvg`, `createFabricImageFromUrl`, `showHiddenTextbox`, `TestElement`, `elements` array. Harness uses only `LabelWizardTextBox`; `getSvgTextData` remains as a proxy over LWT for controls; `replaceSvgTextContent` only updates LWT in place.

---

## Principles

- **Single source of truth:** Text and layout live on `LabelWizardTextBox`; harness only reads/writes via its API.
- **No Group fallback:** Migration is complete removal of the old path.
- **Validation in one place:** Font-fitting and SVG/PNG logic live in the shared util or on `LabelWizardTextBox`; callers do not duplicate logic.
