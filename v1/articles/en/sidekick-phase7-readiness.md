# Sidekick Phase 7 — E2E / safety / deploy readiness

Use this checklist before relying on live Sidekick. Local sim (harness + variants-server) covers adapter/tools without an intent type.

## Hard blockers

- [ ] Shopify publishes / acknowledges `application/label-template` ([proposal draft](./sidekick-application-label-template-intent-proposal.md))
- [ ] Re-enable the extension: `mv extensions/sidekick-label-action/shopify.extension.toml.pending extensions/sidekick-label-action/shopify.extension.toml` (parked because `shopify app dev` rejects the unpublished type and fails the whole dev preview)
- [ ] Extension deploy succeeds with `type = "application/label-template"` intents
- [ ] Confirm tool argument size + nested `elements[]` behavior in Sidekick preview — `inputSchema` is capped at 1 KB, so `label` is a free-form object and the shape is taught via `instructions.md`

## Automated (run locally / CI)

- [x] Unit: `npm test -- app/sidekick` (validate, adapt, catalog, tools, previewContext, extension contract limits)
- [ ] No AI calls on create/update/get tool path in production (sim OpenAI path is harness-only via variants-server)
- [ ] Tool responses never include `data:image` / large base64 (`toolResponseContainsImagePayload`)

## Manual — local sim (no live Sidekick)

1. [ ] Variants server + label harness; Sidekick sim panel **Generate & apply**
2. [ ] Create: blank canvas → instruction → design loads; SaveBar dirty
3. [ ] Revise: follow-up with elements present preserves size unless asked
4. [ ] Catalog: load an example from sim / `list_label_examples` path
5. [ ] Invalid design → structured errors (`BARCODE_TOO_NARROW`, `OUT_OF_BOUNDS`, `INVALID_CONTEXT`, …)
6. [ ] Discard / reload restores prior baseline (unsaved create)

## Manual — preview context (Phase 6)

1. [ ] Open `/app/label_design?sidekick=1&resource_id=gid://shopify/ProductVariant/{id}` → that variant pinned when data loads
2. [ ] `create_label_design` / sim apply with `context.resource_id` → bindings show real title/price/barcode
3. [ ] Missing variant GID → no infinite retry; merchant can still pick a row

## Manual — live Sidekick (after Phase 0)

| # | Scenario | Pass? |
|---|----------|-------|
| 1 | 2×1 product / price label | |
| 2 | Price + SKU + barcode | |
| 3 | Markdown / compare-at | |
| 4 | QR to product URL | |
| 5 | Hangtag image + vendor | |
| 6 | Follow-up edit via get → update | |
| 7 | Impossible barcode → error → retry | |
| 8 | Current product context GIDs in intent | |
| 9 | Selected products (preview first) | |
| 10 | Merchant Save + print path | |

## Safety / content scan

- [ ] `instructions.md` factual; no upsell; ≤2048 tokens
- [ ] Tools describe actions only; no marketing copy in tool results
- [ ] HTTPS-only static image URLs; source/font allowlists enforced
- [ ] No foreign-shop IDs trusted — GIDs resolved only via authenticated admin session
- [ ] Shopify Sidekick content / security scan green (when available)

## Deploy

- [ ] `[sidekick] extensions_summary` present on all app TOMLs
- [ ] Extension `url` includes `sidekick=1`
- [ ] Intent schema has **no** `required` fields
- [ ] Prod/dev/beta configs point at the same extension handle
- [ ] Post-deploy smoke: create intent opens editor; one tool round-trip

## Out of v1 (do not block)

- Hosted catalog `previewUrl` CDN assets
- Sidekick vision / returned PNGs
- Metafield dynamic sources
- Flex / order labels
