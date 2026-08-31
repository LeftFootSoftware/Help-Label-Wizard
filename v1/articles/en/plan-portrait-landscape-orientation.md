# Plan: Orientation toggle

## Goal

Add an orientation toggle to the label editor (label-harness).

## Toggle behavior

1. Swap the canvas width and height.
2. Update canvas object locations so the layout makes sense after the swap (recompute object positions/angles as needed).

## Toggle icon

Show **landscape** or **portrait** icon based solely on the current canvas width and height:

- If `canvasWidth >= canvasHeight` → show portrait icon (click to switch to portrait).
- If `canvasWidth < canvasHeight` → show landscape icon (click to switch to landscape).

No other state. No ratio, no “toggled” indicator, no template dimensions—just width and height.

## File

`scripts/label-harness/EditorPage.tsx`: add the toggle button, handler that swaps canvas dimensions and updates object locations, and icon derived from current canvas width/height.
