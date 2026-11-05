## Format values with formulas

A formula changes how a product field prints, for example a price with a dollar sign. Insert the formula from the list, then insert the field inside it with **@**.

### Before you start

- A text element on your design. See [Add text, images and shapes](/category/designing-labels/text-and-rich-text).
- The field you want to format. See [Show product data on a label](/category/designing-labels/dynamic-product-data).

### Insert a formula

1. Select the text element and click inside its text box.
2. Choose **Formula**, or type **$**. The list of formulas opens.
3. Choose a formula, for example **$MONEY()**.
4. With the cursor between the brackets, type **@** and choose the field, for example **Variant.Price**.
5. In the **Variant** panel, choose a product and check the preview.

The text box shows the formula with the field highlighted inside it. The canvas shows the result, for example **$32.00**.

![screenshot:Text panel with $ typed in the text box and the formula list open, starting with $COALESCE(), $IF(), $UPPER() and $LOWER()](FormulasFunctionList-v2.png)

### Add words around a formula

Type words before or after the formula in the same text box. They print with the result. For example, **Sale:** followed by **$MONEY(@Variant.Price)** prints "Sale: $785.95".

To hide the whole line when the field is empty, tick **Hide when empty**. See [Print price and sale tags](/category/designing-labels/print-price-sale-tags).

### Formulas in the list

The list holds: **$COALESCE()**, **$IF()**, **$UPPER()**, **$LOWER()**, **$TITLE()**, **$TRIM()**, **$LEFT()**, **$MID()**, **$TRUNCATE()**, **$ADD()**, **$NUMBER()**, **$ROUND()**, **$MONEY()**, **$DATE()**, **$TODAY()** and **$DATEADD()**.

**$MONEY()** formats a number as a price with a dollar sign, a thousands comma and two decimals: 2629.95 prints as "$2,629.95".

### If something goes wrong

- **A red message says "Disallowed expression node: MemberExpression. It will print blank.":** the field name inside the formula was typed by hand. Delete it, type **@** and choose the field from the list.
- **The label prints the words "Variant.Price":** the field name was typed as plain text, outside a formula and without **@**. Delete it and insert the field with **@**.
- **The result is blank for some products:** those products have no value in that field. That is expected; tick **Hide when empty** if the line should disappear.

### Related articles

- [Print barcode labels for your products and variants](/category/printing/printing-labels)
- [Fix common printing problems](/category/account-troubleshooting/troubleshooting-printing)
