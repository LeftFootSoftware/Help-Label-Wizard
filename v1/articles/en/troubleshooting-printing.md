## Fix common printing problems

Find the problem you see below, follow its steps, and print again. If nothing here fixes it, contact the Label Wizard team from the Dashboard.

| What you see | Most likely cause | Section |
|---|---|---|
| Your sheet or roll is not in the list when you print | The sheet's label size does not match the design's size | Your sheet or roll is not in the list |
| Labels print on spots you already used | Used positions were not skipped | Labels print on positions you already used |
| Labels are shifted on the sheet | Browser scale or margins | Labels are misaligned on the sheet |
| A label prints with no barcode | The variant has no barcode in Shopify | A label prints without its barcode |
| A barcode does not scan | Size or barcode format | Barcode will not scan |
| A price prints blank or with no currency sign | The field was typed, not inserted | A price or formula prints blank |
| A PDF downloads when you expected the print dialog, or the reverse | The **When you print** setting | The print dialog does not open |
| No preview in the product page block | That variant has not been printed yet | Preview missing on the product block |

### Your sheet or roll is not in the list

The **Select a sheet or roll to print** window lists only sheets and rolls whose label size matches your design. If your stock has a different size, the search shows **No sheets or rolls found**.

1. Read the label size on your stock's packaging.
2. Open your design and check its size.
3. If the sizes differ, create a new design at your stock's size. A copy of a design keeps the original size.
4. If your stock is not in the catalog at all, add it in **Sheets and rolls** with **Add custom**. See [Add a label size that isn't listed](/category/sheets-rolls-templates/custom-label-template).

Your sheet or roll now appears in the list for that design.

### Labels print on positions you already used

On a sheet you have used before, tell Label Wizard which positions are gone before you print.

1. In **Select a sheet or roll to print**, choose your sheet.
2. In the sheet preview, click each position you already used.
3. Check the counter, for example **2 positions skipped on the first sheet**.
4. Print.

The used positions stay blank, and labels start at the first free position. Choose **Clear** to undo the skipped positions. Skipping applies to the first sheet of the run only. See [Print on a partly used label sheet](/category/printing/print-partly-used-sheet).

### Labels are misaligned on the sheet

1. Confirm you selected the same sheet in **Sheet or roll** as your physical stock.
2. In the browser print dialog, set scale to **100%** and margins to **None**.
3. Load the sheet according to your printer tray guides.
4. Print one test page on plain paper, hold it against a label sheet, and check the fit before a large run.

If you download a PDF instead of using the print dialog, set the same scale and margins in the program you print the PDF from. See [Get sharp, scannable barcodes](/category/account-troubleshooting/print-quality-dpi).

### A label prints without its barcode

The barcode comes from the variant's **Barcode** field in Shopify, or from its **SKU** if you chose SKU for the barcode. When that field is empty, the label prints with an empty space where the barcode goes.

The editor still draws a faint grey barcode for these variants. That placeholder does not print.

1. Open the product in Shopify admin.
2. Add the barcode (or SKU) to each variant that is missing one, and save.
3. Print the labels again.

Label Wizard prints the barcodes your products already have. It does not create barcode numbers.

### Barcode will not scan

1. Make the barcode larger on the design. In our tests, a barcode that filled the label decoded where a small one did not.
2. Choose the barcode format your retailer or scanner expects (UPC, EAN-13, GTIN-14, Code 128 and so on). **Automatic** can pick Code 128 for an 8-digit or 14-digit value.
3. Print at the DPI that matches your printer: **203** for thermal printers, **300** for laser.
4. Avoid stretching barcodes unevenly.
5. Print a sample and test it with your scanner.

See [Add a barcode](/category/designing-labels/adding-barcodes).

### A price or formula prints blank

A product field typed by hand is not read as product data. Typed as plain text, it prints the words themselves, for example "Variant.Price". Typed inside a formula, the editor shows a red message such as:

> Formula $MONEY(Variant.Price) cannot be evaluated: Disallowed expression node: MemberExpression. It will print blank.

1. Select the text on your design.
2. Delete the field name you typed.
3. Type **@** and choose the field from the list. It appears as a highlighted field inside the text.
4. Check the label preview.

The preview now shows the value. Use `$MONEY(@Variant.Price)` rather than the plain price field when you want the price to print with its currency sign. See [Format values with formulas](/category/designing-labels/formulas-and-expressions).

### The print dialog does not open

The **When you print** setting decides what happens when you print.

1. Open **Settings**.
2. Find **Print action**.
3. Under **When you print**, choose **Open the print dialog** or **Download a PDF**.

The setting saves as soon as you choose it. Your next print follows it.

### Preview missing on the product block

The admin block preview appears after a successful print that saves a preview image.

1. Print at least once for that variant from Label Wizard.
2. Reload the product or variant page.
3. If the preview still does not appear, try printing again and check that the print completed successfully.

On multi-variant products, only variants that have been printed appear in the carousel.

<!-- SCREENSHOT: TroubleshootingPrintingAdminBlock.png | Product block after a successful print showing preview | source: admin -->

### Not enough credits

If you see **Insufficient credits**:

1. Check **Remaining Credits** in Settings.
2. Reduce the number of labels in the run, or
3. Upgrade / change plan under **Plans**.

See [How do plans and label credits work?](/category/getting-started/plans-and-credits).

### Contact support

From the Label Wizard **Dashboard**:

- **Chat with us** starts a chat with the Label Wizard team.
- **Book a call** books a 30-minute call for setup help, a walkthrough, or feature requests.

![screenshot:Dashboard cards "Need help?" with a Chat with us button and "Prefer to talk it through?" with a Book a call button](TroubleshootingPrintingSupportCards.png)

### Related articles

- [Print barcode labels for your products and variants](/category/printing/printing-labels)
- [Add a barcode](/category/designing-labels/adding-barcodes)
- [Format values with formulas](/category/designing-labels/formulas-and-expressions)
