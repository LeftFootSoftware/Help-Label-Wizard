# Help content tooling

Nothing here ships with the site. The repo root stays a static bundle — `index.html`, `config.json`
and `v1/` — and this directory has its own `package.json` so installing a Node dependency for a
one-off script does not put one at the root.

## capture-screenshots.mjs

Every PNG in `v1/assets/en` came from this script. Re-run it after a UI change rather than
re-shooting 34 images by hand at inconsistent sizes.

It is read-only against the store: it opens designs, selects objects and fills in forms, but never
saves or deletes, and it discards the editor's unsaved changes when prompted.

### Running it

The script drives the Label Wizard label harness, so that has to be up first:

```bash
cd ~/src/Label-Wizard && npm run dev:variants-server   # loads .env, serves store data
cd ~/src/Label-Wizard && npm run dev:label-harness     # serves the harness on :3003
cd ~/src/Help-Label-Wizard/scripts && npm install && npm run capture
```

**Pick the Eliel Cycling store in the harness before running.** Every `editor-*` stage opens a
design by name — "Eliel Retail Price Tag V2" and three samples — and those exist in that store
only. Against any other store they fail with `openDesign: no Edit button for ...`, which reads
like a broken selector and is not one. The harness remembers the choice in
`Label-Wizard/node_modules/.cache/label-harness/selected-store.json`, and that file wins over
`SHOP` in `.env`, so a store picked months ago is still the one in effect.

Shots land in `v1/assets/en`, overwriting what is there. Review the diff before committing — a
changed image is as much a content change as a changed sentence, and a shot taken against the
wrong store looks fine in isolation.

| Variable      | Default                                                     |
| ------------- | ----------------------------------------------------------- |
| `HARNESS_URL` | `http://localhost:3003/scripts/label-harness/index.html`     |
| `CHROME_PATH` | unset, meaning puppeteer's own bundled Chromium              |
| `KEEP_OPEN`   | unset; `1` leaves the browser open so you can inspect it     |

### Running part of it

Name stages to run only those. Useful when one article needs a new shot and the rest are fine:

```bash
npm run capture -- editor-text editor-barcode
```

A stage that fails is reported in the summary at the end rather than stopping the run, so one
broken selector does not cost you the other thirty shots.

### When a stage stops matching

Stages find things by Polaris class name and by visible text, both of which move when the app's UI
changes. The `probe-*` stages exist for that: they take no screenshots and only run when named,
and each one dumps the markup a nearby capture stage depends on — card sizes and headings, toolbar
button labels, the canvas object list, the stock modal's selects and their options.

```bash
npm run capture -- probe-editor
```

That is faster than reading the app's source to work out what the selector should now be. Start
with `probe-designs` for anything that failed in `openDesign`: it lists every design the harness
can actually see, which usually shows you are pointed at the wrong store.
