# Plan: Restore Space+drag pan in label-harness

## Problem

Space+drag no longer starts panning. Clicks on the **canvas** (white area) do not start pan because the handler only allows pan when the mousedown target is the viewport div, content div, or inner div. With `pointer-events: none` on content/inner, only the viewport (grey margin) and the **canvas** receive events; the canvas was not in the allowed list.

## Chosen approach

1. **Allow the canvas as a pan target** so that Space+drag on the white canvas area starts panning.
2. **Use a ref for “Space pressed”** so the mousedown handler always sees the current key state (avoids a timing window where Space is pressed but the handler still sees the old state from a stale closure).

## Implementation

**File:** [scripts/label-harness/EditorPage.tsx](scripts/label-harness/EditorPage.tsx)

### 1. Add a ref for Space key state

- Keep existing state `isSpacePressed` for any UI that might depend on it (e.g. cursor), but add `spacePressedRef = useRef(false)`.
- In the keydown handler: set `spacePressedRef.current = true` when Space is pressed (same time as `setIsSpacePressed(true)`).
- In the keyup handler: set `spacePressedRef.current = false` when Space is released (same time as `setIsSpacePressed(false)`).

### 2. Use viewport containment for the pan target check

- In the pan effect’s `handleMouseDown`, replace the strict target check with a containment check: **allow pan when Space is pressed and the event target is inside the viewport** (`vp.contains(target)`).
- This allows pan when clicking on the viewport div, the canvas, or any child of the viewport (e.g. content/inner if they ever get pointer-events), without listing every element.
- Continue to use `spacePressedRef.current` inside `handleMouseDown` instead of `isSpacePressed` so the handler always sees the current key state.

### 3. Pan effect dependencies

- The pan effect can keep `[isSpacePressed, isPanning]` in the dependency array so it still re-subscribes when state changes, but the critical read for “can we start pan?” is `spacePressedRef.current` and `vp.contains(target)`.

## Summary of code changes

| Location | Change |
|----------|--------|
| Refs (near line 56) | Add `const spacePressedRef = useRef(false)`. |
| keydown handler (Space) | Set `spacePressedRef.current = true` before `setIsSpacePressed(true)`. |
| keyup handler (Space) | Set `spacePressedRef.current = false` before `setIsSpacePressed(false)`. |
| handleMouseDown in pan effect | Use `if (!spacePressedRef.current) return;`. Then replace the target check with `if (!vp.contains(target)) return;` (and update the comment to say we allow pan when clicking anywhere inside the viewport, including the canvas). |

No changes to viewport.css or other files.

## Alternatives considered

- **Only add `target === canvasRef.current`** to the existing condition: Would fix the canvas case but would require updating the condition again if the DOM structure changes. Using `vp.contains(target)` is more robust.
- **No ref for Space**: Relying only on `isSpacePressed` can leave a short window after keydown where the old handler still runs with `false`; the ref ensures the mousedown handler always sees the latest key state.
