## My products have no barcodes: what now?

Label Wizard prints the barcodes and SKUs already on your products; it does not create barcode numbers. Choose a route by where the labels are scanned.

### Choose your route

- **Labels scanned only in your own shop or stockroom:** print your SKU as the barcode, or create store barcodes in Shopify.
- **Products sold through retailers or marketplaces that ask for a UPC, EAN or GTIN:** get GS1 numbers. Store codes are not GS1 numbers.

### Print your SKU as the barcode

1. Open your design and select the barcode on the canvas.
2. In **Field**, choose **SKU**.
3. In **Format**, choose **Code 128**.
4. In the **Variant** panel, check a few products.
5. Choose **Save** in the **Unsaved changes** bar.

Each label now prints the variant's SKU as bars. Give every variant its own SKU, so two products never scan as the same code. See [Add a barcode](/category/designing-labels/adding-barcodes).

### Create store barcodes in Shopify

Shopify's **Retail Barcode Labels** app can fill the empty barcode fields.

1. Open **Retail Barcode Labels** and choose **Get started**.
2. In the **Getting started** box, choose **Create barcodes**.

The app creates a barcode for every product and variant that has none, all at once. It does not let you pick products, and it keeps the barcodes you already have. A banner reports the count, for example "Barcodes created for 4 of 47 variants".

The new barcodes are 8 digits, for example 65928839. Label Wizard prints them as Code 128 with **Format** set to **Automatic**.

These numbers come from Shopify, not from GS1, so they are unique only inside your store.

### Get GS1 numbers for retail

A UPC, EAN or GTIN that a retailer accepts is a number licensed to your company by GS1. You buy a company prefix from GS1 in your country, then give each product a number from it.

[GS1 Assistant](https://apps.shopify.com/gs1-assistant), a separate app from the makers of Label Wizard, assigns GTINs from the GS1 company prefix you own and saves them on your products. Label Wizard then prints them.

### Print labels in the meantime

A product without a barcode still prints. Its name, price and SKU print, and the barcode space stays empty.

### If something goes wrong

- **The Barcode column on the print page is empty for a variant:** that variant has no barcode in Shopify.
- **Some SKU labels print without bars:** those variants have no SKU. Add one in Shopify.
- **Two products scan as the same item:** they share a SKU or barcode. Give each variant its own code.

### Related articles

- [Add a barcode](/category/designing-labels/adding-barcodes)
- [Print barcode labels for your products and variants](/category/printing/printing-labels)
