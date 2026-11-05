## Add a barcode

Add a barcode that prints each variant's own barcode or SKU, so every label scans as the right product.

### Before you start

- A saved design. See [Create a label design](/category/designing-labels/create-label-design).
- A barcode or SKU on your variants in Shopify. Label Wizard prints the value you have; it does not check that the number is valid.

### Add the barcode

1. Open the design and choose **Add object**, then **Barcode**.
2. Select the barcode on the canvas. The **Barcode** panel opens.
3. In **Field**, choose **Barcode** to print each variant's barcode, or **SKU** to print its SKU.
4. Leave **Format** at **Automatic**, unless a retailer asks for a specific symbol.
5. Drag the corner handles to make the barcode as wide as the label allows.
6. In the **Variant** panel, check a few products.
7. Choose **Save** in the **Unsaved changes** bar.

**Value** shows the code for the product in the **Variant** panel, and the canvas draws its bars and digits.

![screenshot:Barcode panel for Canvas Tote - Natural: Field Barcode, Value 05065023978496, Format Automatic, Bar height 50, and the Style settings below](AddingBarcodesSidebar-v2.png)

### Choose where the code comes from

- **Barcode:** the variant's barcode in Shopify. If a variant has more than one, the first one prints; there is no setting to pick another.
- **SKU:** the variant's SKU. Set **Format** to **Code 128**, which takes letters, digits and dashes.
- **Static text:** the same code on every label. Type it in the **Static text** box.

**Field** has no option for metafields. A code kept in a metafield, such as an FNSKU, prints only as text. To print it as bars, store it in the variant's barcode or SKU.

### Choose a format

**Format** offers **Automatic**, **EAN-13**, **UPC**, **GTIN-14**, **GS1-128** and **Code 128**.

**Automatic** picks the symbol from the value. A 14-digit value such as 05065023978496, or an 8-digit value such as 12345678, prints as Code 128. If a retailer or marketplace asks for a specific symbol, choose it in **Format** and print a test label.

### Change how the barcode looks

- **Bar height:** how tall the bars are.
- **Text placement:** the digits above the bars, below them, or hidden (the cross).
- **Font size** and **Text margin:** the size of the digits and the gap between them and the bars.
- **Line color** and **Background:** keep black bars on a white or clear background so scanners read them.

### If something goes wrong

- **The editor shows a faint grey barcode:** the product in the **Variant** panel has no value in the chosen field. Its label prints with that space empty. Add the barcode or SKU in Shopify.
- **Many of your products have no barcode:** see [My products have no barcodes: what now?](/category/account-troubleshooting/products-without-barcodes)
- **The wrong one of two barcodes prints:** Label Wizard prints the variant's first barcode.
- **The barcode does not scan:** make it wider, keep clear space on both sides, and print one test label. See [Get sharp, scannable barcodes](/category/account-troubleshooting/print-quality-dpi).

### Related articles

- [Print barcode labels for your products and variants](/category/printing/printing-labels)
- [Get sharp, scannable barcodes](/category/account-troubleshooting/print-quality-dpi)
- [My products have no barcodes: what now?](/category/account-troubleshooting/products-without-barcodes)
