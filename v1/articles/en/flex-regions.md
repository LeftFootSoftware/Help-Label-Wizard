## Fit long product names on a label

Print long product names in full: give the name a box that can wrap, and let the text shrink only as far as you allow.

### Before you start

- A design with the product name in a text element. See [Show product data on a label](/category/designing-labels/dynamic-product-data).
- The name of your longest product, to test with.

### Make long names fit

1. Select the text element that holds the product name.
2. Drag its corner handles so the box is as wide as the label allows and tall enough for two or three lines.
3. Under **Style**, tick **Size range**.
4. Set **Min** to a small size, for example 6. A long name never shrinks below this.
5. Set **Max** to the size you want for short names.
6. In the **Variant** panel, choose your longest product and check the canvas.
7. Choose **Save** in the **Unsaved changes** bar.

Names wrap onto extra lines at the spaces. A name that still needs room shrinks, down to **Min**.

![screenshot:Text panel Style section: Font family Arial, Text and Background colour buttons, Font size with Size range ticked, Min 12, Max 24, and the Font style buttons](FlexRegionsSizeRange-v2.png)

### If a name is still cut off

- **The top or bottom line is cut off:** the name needs more lines than the box holds. Lower **Min**, or make the box taller. In a test, a long name cut off at Min 12 printed in full at Min 6.
- **A name written as one long word does not wrap:** Label Wizard wraps at spaces. Add a space to the name in Shopify, or print a shorter name.
- **The name is too long for any size:** keep a short label name in a metafield and insert it with **@** instead of the full title. The metafield shows in the **@** list when the product in the **Variant** panel has a value for it.

### Stack fields with a flex region

A **Flex region** is a box divided into slots that share its space, for example name, price and SKU stacked in one area. The ready-made **Hangtag Sticker** design uses one; start from it and change the fields in its slots. See [Start from a ready-made design](/category/designing-labels/design-library).

To add one, choose **Add object**, then **Flex region**. It starts with three slots. In its panel:

- **Stack direction:** **Vertical** stacks the slots; **Horizontal** puts them side by side.
- **Redistribute:** how the slots share the space.
- **Padding** and **Gap:** space inside the region and between slots.
- **Add slot:** adds a slot. Open a slot to set its **Background color**, **Hide when empty** (ticked at first), **Fixed size**, **Move Slot Down** or **Remove slot**.

### Related articles

- [Print barcode labels for your products and variants](/category/printing/printing-labels)
- [Fix common printing problems](/category/account-troubleshooting/troubleshooting-printing)
