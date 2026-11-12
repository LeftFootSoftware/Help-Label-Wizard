## Show product data on a label

Fill a label with each product's own name, price, SKU, barcode and other fields, so one design prints the right label for every variant.

### Before you start

- A saved design. See [Create a label design](/category/designing-labels/create-label-design).
- The data filled in on your products in Shopify. Label Wizard reads it; it does not change it.

### Insert a field into text

1. Choose **Add object**, then **Text**.
2. Click inside the text box.
3. Type **@**, or choose **Attribute**. The field list opens.
4. Choose a field, for example **Variant.DisplayName**.
5. In the **Variant** panel, choose a few products and check the preview.

![screenshot:Text panel with @ typed in the text box and the field list open: Variant.DisplayName, Variant.Price, Variant.CompareAtPrice, Variant.SKU, Variant.Barcode, Variant.CreatedAt, Product.Title, Product.Handle](ProductDataFieldList-v2.png)

### What happens

The field appears highlighted in the text box, and the canvas shows that product's value.

### Fields you can use

- **Variant:** DisplayName (product and variant name), Price, CompareAtPrice, SKU, Barcode, CreatedAt.
- **Product:** Title, Handle, URL, Tags, Status, Description, DescriptionHtml.
- **Store:** URL.
- **Options:** Option1, Option2 and Option3, each as **.Name** (for example "Color") and **.Value** (for example "Black").
- **Metafields:** a variant metafield shows in the list as, for example, **Variant.Metafield(custom, fnsku)**.

The list has no field for vendor, product type, weight, inventory quantity, cost or location.

### Fields in barcodes, QR codes and images

- **Barcode:** choose the source in **Field**: **Barcode**, **SKU** or **Static text**. See [Add a barcode](/category/designing-labels/adding-barcodes).
- **QR code:** in **Content**, remove the **barcode** field, then choose **Attribute** and pick a field, for example **Product.URL**. See [Add a QR code](/category/designing-labels/adding-qr-codes).
- **Image:** in **Image type**, choose **Product image** or **Variant image** to show each product's picture, or **Custom** for your own file.

### If something goes wrong

- **Your metafield is not in the list:** the list shows a metafield only when the product chosen in the **Variant** panel has a value for it. Choose a product that has one.
- **Typing @ does nothing:** click inside the text box first, then type **@**.
- **A field prints blank for some products:** those products have no value in Shopify. Fill it in, or tick **Hide when empty** to drop the line.
- **The editor shows a faint grey barcode that does not print:** that is a placeholder for a product with no barcode. The printed label leaves the space empty.
- **A price prints without a dollar sign:** see [Print price and sale tags](/category/designing-labels/print-price-sale-tags).

### Related articles

- [Print barcode labels for your products and variants](/category/printing/printing-labels)
- [Fix common printing problems](/category/account-troubleshooting/troubleshooting-printing)
