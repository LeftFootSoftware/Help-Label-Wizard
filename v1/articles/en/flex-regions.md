## Flex regions: content that adjusts to fit

This guide explains flex regions — areas on a label where text and other content can grow or shrink inside a fixed frame.

### What a flex region is

A **Flex region** is a container you place on the label. Objects inside it (text, barcodes, images, or QR codes) share that space and adjust so content fits without overflowing the region’s bounds.

Shapes cannot be bound into flex slots. Use text, barcode, image, or QR code content inside a flex region.

<!-- SCREENSHOT: FlexRegionsOnCanvas.png | Label with a flex region selected and content inside it | source: harness -->

### When to use one

Use a flex region when:

- Product titles vary a lot in length
- You want a price and description to share a fixed block
- You need content to stay inside a printed “window” on the label

### Add a flex region

1. Open the editor.
2. Add a **Flex region** object.
3. Size and position the region where the adjustable content should live.
4. Add or bind supported objects into the region’s slots as the editor allows.
5. Preview with several variants to confirm long and short text both look right.

<!-- SCREENSHOT: FlexRegionsSidebar.png | Flex region sidebar showing membership / slot options | source: harness -->

### Tips

- Keep the region large enough for your longest expected title at a readable size.
- Avoid nesting more complexity than you need — start with one region and a few fields.
- Print a sample after large catalog changes.

### Related articles

- [Adding and formatting text](/category/designing-labels/text-and-rich-text)
- [Showing product data on labels](/category/designing-labels/dynamic-product-data)
- [Using the label editor](/category/designing-labels/label-editor-basics)
