# Proposal: `application/label-template` Sidekick intent type

**Status:** Draft for Shopify [app-intent-types](https://github.com/Shopify/app-intent-types) (RFC discussion → PR).  
**Do not submit** until ready; this file is the in-repo source for the proposal text.

- **Type:** `application/label-template`
- **Actions:** `create`, `edit`
- **Blocks deploy today:** `shopify app deploy` rejects unknown intent types. Label Wizard’s extension already declares this type in `extensions/sidekick-label-action/`.

## Motivation

Merchants ask Sidekick to create or revise **printable label templates** (price tags, hangtags, barcode/QR labels today; order/shipping labels later). Label design apps need a stable intent so Sidekick can:

1. Navigate into the app editor (`admin.app.intent.link`)
2. Pass compact create/edit hints via query params (name, size, optional resource GIDs for preview)
3. Call in-page tools that apply a validated public design JSON (not Fabric internals)

No existing catalog type fits: `shopify/product` is resource import; `application/email` / campaign / ticket / shipment are different domains. The merchant-facing artifact is a **label template** (a reusable print design), not a Shopify Admin resource and not a carrier shipment label.

Prefer `label-template` over bare `label` to avoid confusion with UI labels and `application/shipment`.

## When to register

Register `application/label-template` when your app can open a label editor and accept a partially specified template (size, name, optional preview resource GID), then let the merchant review a live preview before save.

Examples:

- “Create a 2×1 price label for this variant” → `create` + `resource_id` (ProductVariant GID)
- “Open my hangtag template and make the barcode larger” → `edit` + storage key in `value`
- “Add a QR code to the product URL on this label” → `edit` after tools load current design

`resource_id` is **preview context only** — a single Shopify GID; type is inferred from the GID (`ProductVariant`, `Order`, `Fulfillment`, …). It does not encode label style. Style comes from tools + examples after the editor opens.

## Naming

Follow Shopify app-intent conventions: short lowercase names; multi-word types use hyphens (`loyalty-program`, `label-template`); multi-word fields use **snake_case**. Map into the URL with `mapTo` / `fieldName`.

## Example registration (admin link)

```toml
[[extensions.targeting]]
target = "admin.app.intent.link"
url = "/app/label_design?sidekick=1"
tools = "./tools.json"
instructions = "./instructions.md"

[[extensions.targeting.intents]]
type = "application/label-template"
action = "create"
schema = "./label-template-schema.json"

[[extensions.targeting.intents]]
type = "application/label-template"
action = "edit"
schema = "./label-template-schema.json"
```

## Draft input schema (no `required` fields)

Canonical CDN schema (once published) should be referenced via `$ref`. Local draft used by Label Wizard (`extensions/sidekick-label-action/label-template-schema.json`):

```json
{
  "$schema": "https://extensions.shopifycdn.com/shopifycloud/schemas/v1/intent.json",
  "value": {
    "type": "string",
    "description": "Existing label storage key (slug) when editing. Omit when creating a new label.",
    "mapTo": "query_param",
    "fieldName": "edit"
  },
  "inputSchema": {
    "$ref": "https://extensions.shopifycdn.com/shopifycloud/schemas/v1/application/label-template.json",
    "type": "object",
    "properties": {
      "name": {
        "type": "string",
        "description": "Suggested template name",
        "maxLength": 120,
        "mapTo": "query_param",
        "fieldName": "name"
      },
      "width": {
        "type": "number",
        "description": "Suggested label width in the given unit",
        "mapTo": "query_param",
        "fieldName": "width"
      },
      "height": {
        "type": "number",
        "description": "Suggested label height in the given unit",
        "mapTo": "query_param",
        "fieldName": "height"
      },
      "unit": {
        "type": "string",
        "enum": ["in", "mm"],
        "mapTo": "query_param",
        "fieldName": "unit"
      },
      "resource_id": {
        "type": "string",
        "description": "Shopify GID for editor preview bindings (ProductVariant, Order, Fulfillment, …)",
        "mapTo": "query_param",
        "fieldName": "resource_id"
      }
    }
  }
}
```

Suggested canonical `application/label-template.json` (CDN) shape:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://extensions.shopifycdn.com/shopifycloud/schemas/v1/application/label-template.json",
  "title": "Label Template Schema",
  "type": "object",
  "properties": {
    "id": { "type": "string", "description": "The label template ID / storage key" },
    "name": { "type": "string", "description": "Suggested template name" },
    "width": { "type": "number" },
    "height": { "type": "number" },
    "unit": { "type": "string", "enum": ["in", "mm"] },
    "resource_id": { "type": "string", "description": "Shopify GID for preview (type inferred from GID)" }
  },
  "additionalProperties": true
}
```

| Field | Role |
|-------|------|
| `value` → `edit` | Storage key for `edit` (app URL param; conceptually the template `id`) |
| `name`, `width`, `height`, `unit` | Create shell hints only (query ≤ ~500 chars) |
| `resource_id` | Preview parent object (Shopify GID; v1 pins ProductVariant) |

Full geometry and elements are applied **after** navigation via tools (`create_label_design` / `update_label_design`) using a separate public label schema owned by the app.

## Design JSON vs intent payload

- **Intent:** navigation + small hints + optional resource GIDs.
- **Tools:** validated public design (`schemaVersion`, `label.elements[]`, …). Apps must not put full designs in the query string.

## Common pitfalls

- Declaring `required` on `inputSchema` (rejected by Sidekick).
- Treating intent as a silent webhook — merchant must confirm in the editor UI before persistence.
- Using resource GIDs as “label type” — type/style belongs in tools and examples.
- Returning PNGs / base64 from tools (token + time limits; Sidekick is not the visual QA loop).

## Related types

- **`shopify/product`** — product import/create; not label templates.
- **`application/shipment`** — carrier shipping labels as a shipment workflow; distinct from printable product/order label templates in a design app.
- **`application/email`** — messaging, not print geometry.

## Suggested app-intent-types file

Add `types/application-label-template.md` using [`types/application-email.md`](https://github.com/Shopify/app-intent-types/blob/main/types/application-email.md) as the template. Prefer an [RFC discussion](https://github.com/Shopify/app-intent-types/discussions) first.

## Confirmation checklist (before / after submit)

- [ ] Search existing `types/` and Discussions for overlap
- [ ] Open RFC discussion with this draft
- [ ] Confirm nested `elements[]` tool args + payload size with Shopify docs/support
- [ ] After type is published: point `$ref` at CDN schema; redeploy extension
- [ ] Live Sidekick E2E against create + edit intents
