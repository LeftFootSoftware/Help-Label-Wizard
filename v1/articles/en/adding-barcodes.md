## Add a barcode

This guide covers barcode objects, supported formats, linking to product barcode or SKU, and sizing so codes scan reliably.

### Add a barcode

1. Open your design in the editor.
2. Add a **Barcode** object.
3. Select it to open barcode settings in the sidebar.

![screenshot:Barcode selected with format and field options in the sidebar](AddingBarcodesSidebar.png)

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

You can also use expressions for more advanced cases. See [Format values with formulas](/category/designing-labels/formulas-and-expressions).

### Size the barcode to scan

- Keep quiet space (clear margin) around the bars.
- Avoid shrinking barcodes until the bars blur at print DPI.
- Prefer printing barcodes at **203 DPI** on thermal printers or **300 DPI** on laser, then test with your scanner.

See [Get sharp, scannable barcodes](/category/account-troubleshooting/print-quality-dpi).

### Related articles

- [Add a QR code](/category/designing-labels/adding-qr-codes)
- [Show product data on a label](/category/designing-labels/dynamic-product-data)
- [Fix common printing problems](/category/account-troubleshooting/troubleshooting-printing)
