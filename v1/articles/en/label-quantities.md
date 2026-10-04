## Setting label quantities

This guide explains how quantities work on Print labels: per-row edits, **Set Quantity**, inventory-based defaults, and the shop-wide default quantity setting.

### Edit a single quantity

In the Products table, change the quantity field on a row. That value is how many labels print for that product or variant in the next run.

![screenshot:Products table with quantity field set on a selected row](LabelQuantitiesRowEdit.png)

### Set Quantity for many products

1. Select one or more rows (or Select all).
2. Choose **Set Quantity**.
3. Enter the quantity.
4. Apply to the selected products, or use the options offered for filtered/all products when Select all is active.

### Default print quantity (Settings)

In **Settings**, **Default print quantity** controls the starting quantity when you open Print labels:

- **1 label per product** — starts at 1
- **Inventory on hand** — starts from inventory for the selected location (the app may cap the suggested default per SKU; you can still type a higher number)

Help text in Settings: you can change quantities on Print labels at any time.

![screenshot:Settings Default print quantity options](LabelQuantitiesSettingsDefault.png)

### Inventory and locations

When quantities follow inventory, pick the right **Location** filter first. Quantities match inventory for that location. Order-based printing uses ordered line quantities instead — see [Printing labels from an order](/category/printing/print-from-order).

### Related articles

- [Printing labels for your products](/category/printing/printing-labels)
- [Printing labels for every product at once](/category/printing/print-all-products)
- [Settings: language, units, and preferences](/category/account-troubleshooting/app-settings)
