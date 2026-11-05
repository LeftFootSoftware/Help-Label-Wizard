## Add text, images and shapes

Add words, product photos, logos and shapes to a label, and set how each one looks.

### Before you start

- A design open in the editor. See [Find your way around the label editor](/category/designing-labels/label-editor-basics).

### Add text

1. Choose **Add object**, then **Text**.
2. Click inside the text box in the panel and type your words. To add a product field, type **@**.
3. Under **Style**, choose the **Font family**, the **Text** colour and the **Font size**.
4. Choose **Save** in the **Unsaved changes** bar.

![screenshot:Text section of a new text element: Rich text unticked, Attribute and Formula buttons, an empty text box with the hint "Type your text here. Use @ to insert a product attribute or $ for a formula.", and Hide when empty](TextPanelNewText-v2.png)

For fields and formulas, see [Show product data on a label](/category/designing-labels/dynamic-product-data) and [Format values with formulas](/category/designing-labels/formulas-and-expressions).

### Format text

- **Font style:** bold, italic, strikethrough, underline and overline.
- **Horizontal** and **Vertical:** where the text sits inside its box.
- **Size range:** lets long text shrink to fit. See [Fit long product names on a label](/category/designing-labels/flex-regions).
- **Rich text:** tick it to format part of the text. A toolbar appears with bold, italic, underline, bullet and numbered lists, alignment, font, size and **Text** colour. Select the words in the text box, then choose the format. A product field works as one piece, so bold on **@Product.Title** makes the whole title bold.
- **Edit token:** double-click a product field in the text box to change its **Format**, see a preview, or choose **Remove token**.
- **Advanced:** **Line height**, **Spacing**, **Stroke**, **Padding**, a shadow **Type** (**None**, **Subtle**, **Medium**, **Strong** or **Very strong**), and exact position, **Rotation**, **Flip X** and **Flip Y**.

### Add an image

1. Choose **Add object**, then **Image**.
2. In **Select image type**, choose **Product image** or **Variant image** to show each product's own photo, or **Custom** for an image of your own, such as a logo.
3. Drag the corner handles to size it.
4. In the **Variant** panel, check a few products.

![screenshot:Select image type dialog with Custom, Product image and Variant image](ImageTypeDialog-v2.png)

Under **Style**, **Opacity** fades the image and **Make background transparent** removes its background. To change the source later, use **Image type** in the panel.

### Add a shape

1. Choose **Add object**, then **Shape**.
2. In **Select shape**, choose **Box**, **Rectangle**, **Circle**, **Ellipse**, **Line**, **Triangle** or **Polygon**.
3. In the panel, set **Fill**, **Stroke**, **Border width** and, for corners, **Corner radius**.

Use shapes for borders, colour blocks and dividers.

### If something goes wrong

- **Typing @ does nothing:** click inside the text box first, then type **@**.
- **You cannot type on the label itself:** edit text in the text box in the panel, not on the canvas.
- **You want only part of a product name in bold:** a product field cannot be part bold. Type those words as plain text instead.
- **A shape or image covers the price or barcode:** select it, choose **Layers**, then **Send to Back**.
- **Text prints too small to read:** raise **Min** under **Size range**, or make the text box larger.

### Related articles

- [Print barcode labels for your products and variants](/category/printing/printing-labels)
- [Fix common printing problems](/category/account-troubleshooting/troubleshooting-printing)
