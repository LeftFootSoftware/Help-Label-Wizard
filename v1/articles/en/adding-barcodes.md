## Adding barcodes

This guide covers barcode objects, supported formats, linking to product barcode or SKU, and sizing so codes scan reliably.

### Add a barcode

1. Open your design in the editor.
2. Add a **Barcode** object.
3. Select it to open barcode settings in the sidebar.

<!-- SCREENSHOT: AddingBarcodesSidebar.png | Barcode selected with format and field options in the sidebar | source: harness -->

### Supported formats

Label Wizard barcode formats include:

- **Automatic** — picks a format from the data when possible
- **EAN-13**
- **UPC**
- **GTIN-14**
- **GS1-128**
- **Code 128**

Choose the format your retailers or scanners expect. If you are unsure, start with **Automatic** and verify with a scanner.

### Link to product data

Common field presets:

- **Barcode** — the product/variant barcode from Shopify
- **SKU** — the variant SKU
- **Static text** — a fixed value you type

You can also use expressions for more advanced cases. See [Formulas and advanced fields](/category/designing-labels/formulas-and-expressions).

### Size the barcode to scan

- Keep quiet space (clear margin) around the bars.
- Avoid shrinking barcodes until the bars blur at print DPI.
- Prefer printing barcodes at **203 DPI** on thermal printers or **300 DPI** on laser, then test with your scanner.

See [Getting the best print quality](/category/printing/print-quality-dpi).

### Related articles

- [Adding QR codes](/category/designing-labels/adding-qr-codes)
- [Showing product data on labels](/category/designing-labels/dynamic-product-data)
- [Troubleshooting common printing problems](/category/account-troubleshooting/troubleshooting-printing)
