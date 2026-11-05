## Add a QR code

Add a QR code that opens each product's page, or holds another product field, when a customer scans it with a phone.

### Before you start

- A saved design. See [Create a label design](/category/designing-labels/create-label-design).

### Add the QR code

1. Open the design and choose **Add object**, then **QR Code**.
2. Select the QR code on the canvas. The **QR code** panel opens.
3. A new QR code holds the **barcode** field. To hold something else, click right after **barcode** in the **Content** box and press Backspace. **Value** then shows 0000000000000 until you pick a field.
4. Choose **Attribute** and pick a field, for example **Product.URL**.
5. Check **Value**. It shows what the QR code holds for the product in the **Variant** panel. With **Product.URL**, it starts with your store's web address.
6. Drag the corner handles to make the QR code as large as the label allows. Keep all of it inside the label.
7. Choose **Save** in the **Unsaved changes** bar.

With **Product.URL**, each label's QR code opens that product's page in your store.

![screenshot:QR code panel for Canvas Tote - Natural: Content holds the barcode field, Value 05065023978496, and Style with Foreground and Background](AddingQrCodesSidebar-v3.png)

### What a QR code can hold

**Attribute** offers the same fields as text. See [Show product data on a label](/category/designing-labels/dynamic-product-data). Common choices:

- **Product.URL:** the product's page.
- **Variant.Barcode** or **Variant.SKU:** the code, for scanning in your stockroom.

### Set the size and colours

- **Advanced:** type an exact **Width** and **Height**, and the position in **X** and **Y**.
- **Style:** keep a dark **Foreground** on a light **Background**. Phones read dark squares on light paper.

A QR code that filled the height of a 1.00 x 0.50 in label decoded in our tests; a small one on the same label did not. Print one label and scan it with a phone before a large run.

### Start from a ready-made QR design

The **Design gallery** has two: **Round product QR Code** and **Round Store QR sticker**. See [Start from a ready-made design](/category/designing-labels/design-library).

### If something goes wrong

- **The QR code does not scan:** make it larger, keep dark on light, and print one test label. See [Get sharp, scannable barcodes](/category/account-troubleshooting/print-quality-dpi).
- **The printed QR code is cut off:** it runs past the edge of the label, and a cut-off code does not scan. Make it smaller or move it inside the label.
- **Value is empty for a product:** that product has no value in the chosen field. Choose another field, or fill it in Shopify.
- **The QR code holds the barcode number, not a link:** in the **Content** box, remove **barcode** first, then choose **Attribute** and pick **Product.URL**.
- **Value shows more than one thing run together:** **Content** holds more than one field. Remove the extra one.

### Related articles

- [Print barcode labels for your products and variants](/category/printing/printing-labels)
- [Get sharp, scannable barcodes](/category/account-troubleshooting/print-quality-dpi)
