# Fabric.tsx – Changes to Reapply (Recovery Checklist)

This document lists all changes that were made to `Fabric.tsx` (and related files) during the refactor and conversation, so they can be reapplied after the file was reverted by `git checkout`. **Order matters:** do refactor integration first, then conversation fixes.

---

## Part 1: Refactor (LabelWizardTextBox + LabelWizardBarcode integration)

### 1.1 Imports and registration
- **Import** `LabelWizardTextBox` from `../../FabricObjects/LabelWizardTextBox` and `LabelWizardBarcode` from `../../FabricObjects/LabelWizardBarcode`.
- **Register with Fabric** (so `loadFromJSON` can revive them), e.g. after canvas creation or at top level:
  - `(fabric as any).LabelWizardTextBox = LabelWizardTextBox;`
  - `(fabric as any).LabelWizardBarcode = LabelWizardBarcode;`

### 1.2 saveObjectsState
- In `toJSON` property list (second argument to `canvas.toJSON([...])`), **add** custom props for:
  - **LabelWizardTextBox:** e.g. `textContent`, `fontFamily`, `textAlign`, `verticalAlign`, `minFont`, `maxFont`, `lineHeight`, `hiddenTextbox` (or whatever the class serializes), plus standard object props.
  - **LabelWizardBarcode:** e.g. `value`, `barcodeProperties`, plus standard object props.
- Ensure custom types are included in the serialized `type` field so reviver can recognize them.

### 1.3 loadFromJSON / loadObjectsState
- **Reviver:** When parsing JSON, instantiate `LabelWizardTextBox` and `LabelWizardBarcode` from saved objects (Fabric’s reviver receives `type` and the object; create the right class and return it).
- **Migration (optional):** Before or during load, migrate old `type === "textbox"` to LabelWizardTextBox and old barcode groups to LabelWizardBarcode so existing projects still work.
- **After load:** When applying custom render to loaded text objects, **skip** objects with `type === "LabelWizardTextBox"` (they have their own `_render`). Only call `applyCustomTextRender` on legacy `fabric.Textbox`.

### 1.4 addTextElement
- **Replace** the path that creates `new fabric.Textbox(...)` and attaches scaling/editing handlers with:
  - Build a `CanvasElement` for type `'text'` (same as now).
  - Call `LabelWizardTextBox.create(text, options)` with position, dimensions, and font/align options from the element (use `buildHiddenTextbox` options from element properties).
  - Set `object.data = { id: element.id }` (and any other data the app expects).
  - Add the returned object to the canvas and sync to `elements` state.
  - Attach **scaling** handler: for LWT, do **not** set `hideContentWhileScaling = true`; on `object:modified` commit scale to width/height; LWT will rebuild its own hidden textbox.
  - Attach **editing** / double-click: open popup text editor (same as current flow); ensure `openPopupTextEditor` is available (use ref if needed – see Part 2).

### 1.5 addBarcodeElement
- **Replace** the path that builds the barcode from SVG (loadSVGFromString, group, etc.) with:
  - Build a `CanvasElement` for type `'barcode'` (same as now).
  - Create a `LabelWizardBarcode` instance (or use a static `LabelWizardBarcode.create()` if it exists) with value and `barcodeProperties` from the element.
  - Set `object.data = { id: element.id }`.
  - Add to canvas and sync to `elements`.

### 1.6 Sidebar
- When **selected object** is `LabelWizardTextBox`: show text sidebar; sync property changes (fontFamily, textAlign, verticalAlign, etc.) to the LWT instance; call `(obj as LabelWizardTextBox).invalidatePngCache()` when content or dimensions change.
- When **selected object** is `LabelWizardBarcode`: show barcode sidebar; sync to `barcodeProperties` and call `invalidateBarcodeCache()`.

### 1.7 Barcode helpers
- **updateAllBarcodes:** When collecting “barcode objects,” include both (1) existing group-based barcodes and (2) `object.type === "LabelWizardBarcode"`. Use a shared `isBarcodeObject(object)` helper. For LabelWizardBarcode, get value and field from the object; call the same update logic.
- **applyBarcodeOpacity:** Same: include LabelWizardBarcode in the loop; get barcode field from object or elements.

### 1.8 handleObjectModified
- For **LabelWizardTextBox:** commit scale to width/height (same idea as for barcode); do not reach into `buildHiddenTextbox` from the app – LWT rebuilds its own hidden textbox.
- For **LabelWizardBarcode:** commit scale/dimensions as needed.

### 1.9 applyCustomTextRender
- **Do not** call `applyCustomTextRender` on objects where `object.type === "LabelWizardTextBox"`. They use custom `_render`. In every place that calls `applyCustomTextRender` (e.g. after load, when creating legacy textbox), guard: `if (object.type !== "LabelWizardTextBox") applyCustomTextRender(object as fabric.Textbox);`

---

## Part 2: Conversation fixes (apply after refactor)

### 2.1 openPopupTextEditor “before initialization”
- Store the popup-open function in a **ref** so it’s available when object handlers (e.g. double-click) run. For example:
  - Define `openPopupTextEditor` with `useCallback` as usual.
  - In a `useEffect`, set `openPopupTextEditorRef.current = openPopupTextEditor`.
  - Where objects call `openPopupTextEditor(this)`, use `openPopupTextEditorRef.current?.(this)` (or pass the ref into the handler setup).

### 2.2 lowerCanvasEl / ctx null
- **Guard** all uses of `fabricCanvas.lowerCanvasEl` (e.g. reading `.width`). If `!fabricCanvas?.lowerCanvasEl`, skip or no-op.
- **Wrap** `canvas.renderAll()` and `canvas.requestRenderAll()` (e.g. right after canvas creation) so they check that the canvas’s 2D context exists before calling the original. Use something like: get `ctx = lowerCanvasEl.getContext('2d')`; if `!ctx` return; else call original. This avoids “ctx is null” after unmount/HMR.

### 2.3 hideContentWhileScaling
- **Remove** (or do not add) the line that sets `(selectedObject as LabelWizardTextBox).hideContentWhileScaling = true` so LWT content stays visible during resize.

### 2.4 Variant substitution (display value for LWT)
- In **all** code paths that apply variant-substituted text to the canvas (e.g. when switching variant, when loading, when updating “textReal” display), ensure **LabelWizardTextBox** objects get the substituted value. Use `convertText(..., "ValueToLabel")` (or your existing converter) and set the LWT’s display text (e.g. `textContent` or whatever the LWT exposes). There were **four** such paths identified; each should treat `object.type === "LabelWizardTextBox"` and set the substituted value on the object.

### 2.5 verticalAlign for LabelWizardTextBox
- Add **state** and **sidebar** for `verticalAlign` (Top/Center/Bottom) when the selected object is LabelWizardTextBox. Sync changes to the LWT and call `invalidatePngCache()`.

### 2.6 Padding and cache (top-align fix)
- Set **padding: 0** on LabelWizardTextBox instances when creating or syncing from sidebar (in Fabric.tsx and in `buildHiddenTextbox` if used for LWT). After setting padding, call `(obj as LabelWizardTextBox).invalidatePngCache()` so the next render uses the new padding.

### 2.7 Clip/Wrap and “Select Text Mode” dialog
- **Remove** the Clip/Wrap toggle from the popup text editor UI.
- **Remove** the “Select Text Mode” dialog that appeared when dropping text. When the user drops a text element, call **directly** `addTextElement(adjustedY, adjustedX)` (with a default for textWrap, e.g. `false`). Remove state: `showTextModeDialog`, `pendingTextDropCoordinates` (and any `(window as any).pendingTextDropCoordinates`).

### 2.8 Duplicate / clone
- When duplicating or cloning, if the object is LabelWizardTextBox or LabelWizardBarcode, create a new instance with a new `id` and a new `CanvasElement`; do not reuse the old id.

---

## Part 3: LabelWizardTextBox.ts (if reverted)

- **Zoom-aware rendering:** Use `_getRenderScale()` (or equivalent) so the LWT renders at high resolution when the canvas is zoomed (crisp text at all zoom levels).
- **set() override:** When setting properties that affect the rendered PNG, call `canvas?.requestRenderAll()` so the canvas redraws immediately.
- **Top align:** For `verticalAlign === "top"`, use `translateY = 0` in `toSVG()` and `_toSVGForBox()` (not `TEXT_PADDING`) so there’s no extra space at the top.

---

## File reference

- **Fabric.tsx:** `app/routes/Canvas/Components/Fabric/Fabric.tsx`
- **LabelWizardTextBox:** `app/routes/Canvas/FabricObjects/LabelWizardTextBox.ts`
- **LabelWizardBarcode:** `app/routes/Canvas/FabricObjects/LabelWizardBarcode.ts`
- **buildHiddenTextbox:** `app/routes/Canvas/Utils/buildHiddenTextbox.ts`
- **Handlers:** `app/routes/Canvas/Components/Fabric/handlers/` (textHandlers, etc.)
- **Plans:** `docs/plan-label-wizard-textbox.md`, `docs/plan-text-control-incremental.md`
