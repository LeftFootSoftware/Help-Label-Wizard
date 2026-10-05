/**
 * Captures the screenshots used by the help articles, into `v1/assets/en`.
 *
 * Every shot in this repo came from here, so a re-shoot after a UI change is a re-run rather than
 * 34 manual captures at inconsistent sizes. It drives the Label Wizard label harness in headless
 * Chrome; see `scripts/README.md` for what has to be running first.
 *
 * Any store will do, including an empty development one. Nothing below names a design, product or
 * variant: the editor stages open samples that ship in the app, and the stages that need a product
 * read whichever one the store happens to list first. An earlier version pointed at a real
 * merchant's store and opened one of their saved designs by name, which made a screenshot run
 * depend on a live store continuing to hold a particular row.
 *
 * Read-only against the store. It opens designs, selects objects and fills in forms, but never
 * saves or deletes, and it answers the editor's unsaved-changes prompt by discarding.
 *
 * Shots are taken of a marked element rather than the viewport, so they crop to the thing the
 * article is about and stay the same size between runs.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer";

const repoRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = path.join(repoRoot, "v1", "assets", "en");

const HARNESS =
  process.env.HARNESS_URL ?? "http://localhost:3003/scripts/label-harness/index.html";
/** Unset means puppeteer's own bundled Chromium, which is the normal case. */
const CHROME = process.env.CHROME_PATH;

/**
 * Designs the editor stages open, by their title on the Samples page.
 *
 * All of these ship in the app, in `Label-Wizard/app/labels/sampleLabels.json`, so every store has
 * them and a rename shows up in that file rather than in someone's account. Renaming one there
 * breaks a stage here, which is the trade for not depending on a store's own data.
 */
const SAMPLES = {
  /** 4x1 carrying text, a barcode, an image, a rectangle and a flex region — most stages use it. */
  everything: "Shoebox Label",
  qr: "Round product QR Code",
  shapes: "Product Label",
  flex: "Markdown Sticker",
};

const SAMPLES_ROUTE = "#/app/sample_labels";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const failures = [];

/** Stage names from the command line. Empty runs every capture stage and no probes. */
const requested = process.argv.slice(2);

/**
 * A timed-out stage keeps running in the background; its ticket goes stale so a late `shoot`
 * cannot overwrite a file the next stage already wrote.
 */
let stageTicket = 0;
function currentTicket() {
  return stageTicket;
}

async function goto(page, hash, settle = 3000) {
  // Hash-only navigation does not remount the SPA, so a second visit to a route we are already on
  // would leave the editor open. Bounce through about:blank to force a real load every time.
  await page.goto("about:blank");
  await page.goto(`${HARNESS}${hash}`, { waitUntil: "networkidle0" });
  await sleep(settle);
  await page.evaluate(() => document.activeElement?.blur());
}

/**
 * Clicks in-page rather than through the input pipeline: several of these controls sit inside
 * scroll panes, and puppeteer's own click waits for them to be scrolled into view, which hangs.
 */
async function clickText(page, selector, text, { exact = false, settle = 1800 } = {}) {
  const ok = await page.evaluate(
    (sel, needle, isExact) => {
      const match = [...document.querySelectorAll(sel)].find((n) => {
        const t = (n.textContent ?? "").replace(/\s+/g, " ").trim();
        return isExact ? t === needle : t.includes(needle);
      });
      if (match == null) return false;
      match.click();
      return true;
    },
    selector,
    text,
    exact,
  );
  if (!ok) throw new Error(`clickText: no ${selector} matching "${text}"`);
  await sleep(settle);
}

/** Tables here run to thousands of px; end on a row boundary instead of clipping one in half. */
async function keepRows(page, count) {
  await page.evaluate((n) => {
    for (const body of document.querySelectorAll("tbody")) {
      [...body.querySelectorAll(":scope > tr")].forEach((tr, i) => {
        if (i >= n) tr.style.display = "none";
      });
    }
  }, count);
}

/** Drop a trailing sidebar section so the panel ends cleanly instead of running 1300px tall. */
async function hideSection(page, title) {
  await page.evaluate((name) => {
    const header = [...document.querySelectorAll(".sidebar-section-header")].find(
      (h) => (h.textContent ?? "").trim() === name,
    );
    const section = header?.parentElement;
    if (section) section.style.display = "none";
  }, title);
}

async function mark(page, strategy, value) {
  const ok = await page.evaluate(
    (how, needle) => {
      document.querySelectorAll("[data-shot]").forEach((n) => n.removeAttribute("data-shot"));
      const climb = (start) => {
        let el = start;
        while (el != null && !el.classList.contains("Polaris-ShadowBevel")) el = el.parentElement;
        return el;
      };
      let node = null;
      if (how === "selector") node = document.querySelector(needle);
      if (how === "closestCard") node = climb(document.querySelector(needle));
      if (how === "cardWithHeading") {
        node = climb(
          [...document.querySelectorAll("h1,h2,h3,h4")].find(
            (h) => (h.textContent ?? "").replace(/\s+/g, " ").trim() === needle,
          ) ?? null,
        );
      }
      if (how === "cardContaining") {
        node =
          [...document.querySelectorAll(".Polaris-ShadowBevel")].find((c) =>
            (c.textContent ?? "").includes(needle),
          ) ?? null;
      }
      if (how === "gridContaining") {
        node =
          [...document.querySelectorAll(".Polaris-InlineGrid")].find((c) =>
            (c.textContent ?? "").includes(needle),
          ) ?? null;
      }
      if (node == null) return false;
      // Polaris pages end flush with the last card, which clips its shadow and rounded corner.
      if (node.classList.contains("Polaris-Page")) node.style.paddingBottom = "16px";
      node.setAttribute("data-shot", "1");
      return true;
    },
    strategy,
    value,
  );
  if (!ok) throw new Error(`mark: ${strategy} "${value}" matched nothing`);
}

async function shoot(page, file) {
  const ticket = currentTicket();
  const el = await page.$('[data-shot="1"]');
  if (ticket !== stageTicket) throw new Error(`shoot: ${file} abandoned, stage already timed out`);
  if (el == null) throw new Error(`shoot: nothing marked for ${file}`);
  const box = await el.boundingBox();
  if (box == null || box.width < 40 || box.height < 40) {
    throw new Error(`shoot: ${file} box unusable ${JSON.stringify(box)}`);
  }
  if (box.height > 2000) {
    throw new Error(`shoot: ${file} is ${Math.round(box.height)}px tall; trim it first`);
  }
  await el.screenshot({ path: path.join(OUT_DIR, file) });
  console.log(`  ok  ${file}  ${Math.round(box.width)}x${Math.round(box.height)}`);
}

/** Open the editor for the design whose card heading matches `title`. */
async function openDesign(page, hash, title) {
  await goto(page, hash, 6000);
  // The sample-labels page puts every design in one card, so climbing to the card and taking its
  // first Edit always opened the first sample. Take the next Edit after the heading instead.
  const ok = await page.evaluate((needle) => {
    const heading = [...document.querySelectorAll("h3,h4")].find(
      (h) => (h.textContent ?? "").replace(/\s+/g, " ").trim() === needle,
    );
    if (heading == null) return false;
    const edit = [...document.querySelectorAll("button")].find(
      (b) =>
        (b.textContent ?? "").trim() === "Edit" &&
        (heading.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0,
    );
    if (edit == null) return false;
    edit.click();
    return true;
  }, title);
  if (!ok) {
    throw new Error(
      `openDesign: no Edit button for "${title}" on ${hash}. ` +
        `If it is a sample, check the title in app/labels/sampleLabels.json. ` +
        `Either way: npm run capture -- probe-designs`,
    );
  }
  await sleep(8000);
}

/**
 * Marks the property sidebar. Short panels get trimmed to their content, because the panel itself
 * is full height and a short one leaves most of the shot empty grey.
 */
async function markSidebar(page) {
  const ok = await page.evaluate(() => {
    const panel = document.querySelector(".label-harness-sidebar-properties");
    if (panel == null) return false;
    const content = panel.firstElementChild;
    const fits =
      content != null &&
      content.getBoundingClientRect().height < panel.getBoundingClientRect().height;
    document.querySelectorAll("[data-shot]").forEach((n) => n.removeAttribute("data-shot"));
    (fits ? content : panel).setAttribute("data-shot", "1");
    return true;
  });
  if (!ok) throw new Error("markSidebar: no property sidebar");
}

/** Select a canvas object through the dev handle so its sidebar opens. */
async function selectObject(page, predicate) {
  const picked = await page.evaluate((test) => {
    const canvas = window.__lwCanvas;
    if (canvas == null) return null;
    const objects = canvas.getObjects();
    const described = objects.map((o, i) => ({
      i,
      type: String(o.type ?? ""),
      id: String(o.data?.id ?? ""),
      text: typeof o.text === "string" ? o.text.slice(0, 30) : "",
    }));
    const match = described.find((d) =>
      Object.entries(test).every(([k, v]) =>
        String(d[k]).toLowerCase().includes(String(v).toLowerCase()),
      ),
    );
    if (match == null) return { objects: described, selected: null };
    canvas.discardActiveObject();
    canvas.setActiveObject(objects[match.i]);
    canvas.requestRenderAll();
    return { objects: described, selected: match };
  }, predicate);
  if (picked == null) throw new Error("selectObject: window.__lwCanvas missing");
  if (picked.selected == null) {
    throw new Error(
      `selectObject: no match for ${JSON.stringify(predicate)}; saw ${JSON.stringify(picked.objects)}`,
    );
  }
  await sleep(2500);
  return picked;
}

/**
 * Advances the data-source card to the next record.
 *
 * The point of the shots that use this is that the canvas tracks whichever variant is highlighted,
 * so it only has to be a different one, not a particular one. Driving the card's own next arrow
 * keeps that true in a store whose products we know nothing about.
 */
async function nextRecord(page, settle = 4000) {
  const ok = await page.evaluate(() => {
    const next = document.querySelector('button[aria-label="Next"]');
    if (next == null || next.disabled) return false;
    next.click();
    return true;
  });
  if (!ok) {
    throw new Error(
      "nextRecord: no enabled Next button. The store needs at least two variants for this shot.",
    );
  }
  await sleep(settle);
}

/** The editor fills the window, so the window height is the only way to keep the shot short. */
async function setWindow(page, height) {
  await page.setViewport({ width: 1180, height, deviceScaleFactor: 2 });
}

/** Runs one named stage under a timeout, recording rather than throwing on failure. */
async function runStage(name, fn) {
  console.log(`\n# ${name}`);
  stageTicket += 1;
  let timer;
  const guard = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error("stage timed out after 120s")), 120_000);
  });
  try {
    await Promise.race([fn(), guard]);
  } catch (err) {
    console.log(`  FAIL ${name}: ${err.message}`);
    failures.push(`${name}: ${err.message}`);
  } finally {
    clearTimeout(timer);
  }
}

/** A capture stage. Runs unless the command line asked for particular stages by name. */
async function stage(name, fn) {
  if (requested.length > 0 && !requested.includes(name)) return;
  await runStage(name, fn);
}

/**
 * A diagnostic stage, which takes no screenshots and only runs when named.
 *
 * These dump the shape of the markup a nearby capture stage depends on: card sizes and headings,
 * toolbar button labels, the canvas object list, the stock modal's selects and their options. The
 * selectors above are matched against Polaris class names and visible text, both of which move
 * when the app's UI changes, and a probe is how you find the new one without reading the app's
 * source. That is the whole reason they are kept — they are stale the moment the UI moves, and
 * re-running one is how you un-stale it.
 */
async function probe(name, fn) {
  if (!requested.includes(name)) return;
  await runStage(name, fn);
}

const browser = await puppeteer.launch({
  headless: true,
  executablePath: CHROME,
  defaultViewport: { width: 1180, height: 1500, deviceScaleFactor: 2 },
});
const page = await browser.newPage();
// Leaving the editor with unsaved edits raises beforeunload, which blocks every later navigation
// until something answers it. Accepting discards the edits, which is what we want: never save.
page.on("dialog", (dialog) => void dialog.accept());
fs.mkdirSync(OUT_DIR, { recursive: true });

await page.goto(`${HARNESS}#/app`, { waitUntil: "networkidle0" });
await page.evaluate(() => localStorage.setItem("lw-harness-nav-collapsed", "1"));
await page.reload({ waitUntil: "networkidle0" });
await sleep(2500);

// ------------------------------------------------------------------- dashboard

await stage("dashboard", async () => {
  await setWindow(page, 1500);
  await goto(page, "#/app", 5000);
  await mark(page, "gridContaining", "Book a 30-minute call");
  await shoot(page, "TroubleshootingPrintingSupportCards.png");
});

// ------------------------------------------------------------------- gallery

await stage("gallery", async () => {
  await setWindow(page, 1500);
  await goto(page, "#/app/library", 9000);
  await mark(page, "cardContaining", "Use this design");
  await shoot(page, "DesignLibraryGallery.png");
  // Variant picker plus the first row of tiles, so the shot shows which variant the previews render.
  await page.evaluate(() => {
    const grid = [...document.querySelectorAll(".Polaris-InlineGrid")].find((g) =>
      (g.textContent ?? "").includes("Use this design"),
    );
    [...(grid?.children ?? [])].forEach((tile, i) => {
      if (i >= 3) tile.style.display = "none";
    });
  });
  await sleep(600);
  await mark(page, "selector", ".Polaris-Page");
  await shoot(page, "DesignLibraryPreviewVariant.png");
});

// ------------------------------------------------------------------- templates

await stage("templates", async () => {
  await setWindow(page, 1500);
  await goto(page, "#/app/templates", 5000);
  await keepRows(page, 9);
  await mark(page, "selector", ".Polaris-Page");
  await shoot(page, "SheetsAndRollsList.png");
  // Row actions sit inline on each row, so a short table is the clearest way to show them.
  await keepRows(page, 3);
  await mark(page, "selector", "table");
  await shoot(page, "SheetsAndRollsDesignAction.png");
});

await stage("templates-filter", async () => {
  await setWindow(page, 1500);
  await goto(page, "#/app/templates", 5000);
  await clickText(page, "button", "Manufacturer", { exact: true, settle: 2500 });
  await keepRows(page, 6);
  await mark(page, "selector", ".Polaris-Page");
  await shoot(page, "ChoosingStockSheetsAndRolls.png");
});

await stage("custom-template", async () => {
  // Tall window so the form fits without the modal's own scrollbar clipping a field mid-row.
  await setWindow(page, 2400);
  await goto(page, "#/app/templates", 5000);
  await clickText(page, "button", "Add custom", { settle: 3000 });
  await mark(page, "selector", ".Polaris-Modal-Dialog__Modal");
  await shoot(page, "CustomLabelTemplateForm.png");
});

// ------------------------------------------------------------------- settings

await stage("settings", async () => {
  await setWindow(page, 1500);
  await goto(page, "#/app/settings", 3500);
  await mark(page, "cardWithHeading", "Print resolution");
  await shoot(page, "PrintQualityDpiSettings.png");
  await mark(page, "cardWithHeading", "Default print quantity");
  await shoot(page, "LabelQuantitiesSettingsDefault.png");
  await mark(page, "selector", ".Polaris-Page");
  await shoot(page, "AppSettingsPage.png");
});

// ------------------------------------------------------------------- design a label

await stage("design-label", async () => {
  await setWindow(page, 1500);
  await goto(page, "#/app/design_label", 6000);
  await mark(page, "selector", ".Polaris-ShadowBevel");
  await shoot(page, "CreateLabelDesignChooser.png");
  // Just the "Describe my label" block: the whole card is already CreateLabelDesignChooser.png.
  const ok = await page.evaluate(() => {
    const textarea = document.querySelector("textarea");
    if (textarea == null) return false;
    let group = textarea.parentElement;
    while (group != null && !(group.textContent ?? "").includes("Describe my label")) {
      group = group.parentElement;
    }
    if (group == null) return false;
    document.querySelectorAll("[data-shot]").forEach((n) => n.removeAttribute("data-shot"));
    group.setAttribute("data-shot", "1");
    return true;
  });
  if (!ok) throw new Error("design-label: no Describe my label group");
  await shoot(page, "SidekickLabelsDashboardDesign.png");
});

// ------------------------------------------------------------------- editor

await stage("editor-basics", async () => {
  await setWindow(page, 860);
  await openDesign(page, SAMPLES_ROUTE, SAMPLES.everything);
  await mark(page, "selector", ".label-harness-editor-container");
  await shoot(page, "LabelEditorBasicsCanvas.png");
});

await stage("editor-variant", async () => {
  await setWindow(page, 860);
  await openDesign(page, SAMPLES_ROUTE, SAMPLES.everything);
  // Move off the first variant so the preview is visibly tracking the picker rather than just
  // showing a default.
  await nextRecord(page);
  // Keep the picker in frame: the point of the shot is that the highlighted row drives the canvas.
  await mark(page, "selector", ".label-harness-editor-container");
  await shoot(page, "DynamicProductDataVariantPreview.png");
});

await stage("editor-text", async () => {
  await setWindow(page, 860);
  await openDesign(page, SAMPLES_ROUTE, SAMPLES.everything);
  await selectObject(page, { type: "LabelWizardTextBox" });
  await hideSection(page, "Advanced");
  await markSidebar(page);
  await shoot(page, "TextAndRichTextSidebar.png");
  await clickText(page, "button", "Formula", { exact: true, settle: 2500 });
  await shoot(page, "FormulasAndExpressionsEditor.png");
});

await stage("editor-attribute", async () => {
  await setWindow(page, 860);
  await openDesign(page, SAMPLES_ROUTE, SAMPLES.everything);
  await selectObject(page, { type: "LabelWizardTextBox" });
  await hideSection(page, "Advanced");
  await clickText(page, "button", "Attribute", { exact: true, settle: 3000 });
  await markSidebar(page);
  await shoot(page, "DynamicProductDataInsert.png");
});

await stage("editor-barcode", async () => {
  await setWindow(page, 860);
  await openDesign(page, SAMPLES_ROUTE, SAMPLES.everything);
  await selectObject(page, { type: "LabelWizardBarcode" });
  await hideSection(page, "Advanced");
  await markSidebar(page);
  await shoot(page, "AddingBarcodesSidebar.png");
});

await stage("editor-image", async () => {
  await setWindow(page, 860);
  await openDesign(page, SAMPLES_ROUTE, SAMPLES.everything);
  await selectObject(page, { type: "LabelWizardImage" });
  await hideSection(page, "Advanced");
  await markSidebar(page);
  await shoot(page, "ImagesAndShapesImageSidebar.png");
});

await stage("editor-qr", async () => {
  await setWindow(page, 860);
  await openDesign(page, SAMPLES_ROUTE, SAMPLES.qr);
  await selectObject(page, { type: "QR" });
  await hideSection(page, "Advanced");
  await markSidebar(page);
  await shoot(page, "AddingQrCodesSidebar.png");
});

await stage("editor-shapes", async () => {
  await setWindow(page, 860);
  await openDesign(page, SAMPLES_ROUTE, SAMPLES.shapes);
  await mark(page, "selector", ".label-harness-viewport");
  await shoot(page, "ImagesAndShapesOnCanvas.png");
});

await stage("editor-flex", async () => {
  await setWindow(page, 860);
  await openDesign(page, SAMPLES_ROUTE, SAMPLES.flex);
  await selectObject(page, { type: "Flex" });
  await mark(page, "selector", ".label-harness-viewport");
  await shoot(page, "FlexRegionsOnCanvas.png");
  await hideSection(page, "Advanced");
  await markSidebar(page);
  await shoot(page, "FlexRegionsSidebar.png");
});

await stage("editor-unsaved", async () => {
  await setWindow(page, 860);
  await openDesign(page, SAMPLES_ROUTE, SAMPLES.everything);
  // Drop a rectangle on the canvas so the editor is dirty, then Print. Nothing is ever saved.
  await clickText(page, "button", "Shape", { exact: true, settle: 2000 });
  await clickText(page, "button", "Rectangle", { settle: 3000 });
  await clickText(page, "button", "Print", { exact: true, settle: 4000 });
  await mark(page, "selector", ".Polaris-Modal-Dialog__Modal");
  await shoot(page, "LabelEditorUnsavedPrint.png");
});

// ------------------------------------------------------------------- print

await stage("print-page", async () => {
  await setWindow(page, 1500);
  await goto(page, "#/app/printlabels", 7000);
  await keepRows(page, 5);
  await mark(page, "selector", ".Polaris-Page");
  await shoot(page, "PrintingLabelsPage.png");
});

/**
 * A design key and a product to filter to, both taken from whatever the store has.
 *
 * Neither can be written down here. `label` is a saved design's metafield key and `variantId` a
 * Shopify GID, so they differ in every store, and the key is not in the markup at all — the design
 * card holds it in a closure and only reveals it by navigating. Pressing the card's own Print
 * button and reading the address bar is how you get it without naming a store's design.
 */
async function printFilterFromStore() {
  await goto(page, "#/app/label_design", 8000);
  const opened = await page.evaluate(() => {
    const print = [...document.querySelectorAll("button")].find(
      (b) => (b.textContent ?? "").trim() === "Print labels",
    );
    if (print == null) return false;
    print.click();
    return true;
  });
  if (!opened) {
    throw new Error(
      "printFilterFromStore: no saved design to print. This shot needs a store with at least one " +
        "saved design; samples alone are not enough, because the URL carries a metafield key.",
    );
  }
  await sleep(9000);

  const found = await page.evaluate(() => {
    const label = new URLSearchParams(location.hash.split("?")[1] ?? "").get("label");
    if (label == null) return { reason: "the Print button did not put a label key in the URL" };
    const checkbox = document.querySelector('tbody input[type="checkbox"][id^="Select-gid://"]');
    if (checkbox == null) return { reason: "the print list came up with no product rows" };
    // The title shares its cell with the thumbnail, and the thumbnail contributes text: "No image"
    // when there is none, the product's own name when there is. Reading the cell whole picks that
    // up and the filter chip then reads "No imageSavory Blue / 24". Strip the media first.
    const title = [...(checkbox.closest("tr")?.querySelectorAll("td") ?? [])]
      .filter((td) => td.querySelector("input, button") == null)
      .map((td) => {
        const copy = td.cloneNode(true);
        copy.querySelectorAll("img, svg, .Polaris-Thumbnail, .Polaris-Avatar").forEach((n) => n.remove());
        // The product name and the variant options are separate elements in the same cell with no
        // separator between them, so the cell's own text runs them together. Take the first block
        // that has text: the chip wants the product, as it would read coming from the admin.
        const leaf = [...copy.querySelectorAll("*")]
          .filter((n) => n.childElementCount === 0)
          .map((n) => (n.textContent ?? "").replace(/\s+/g, " ").trim())
          .find((t) => t !== "");
        return leaf ?? (copy.textContent ?? "").replace(/\s+/g, " ").trim();
      })
      .find((t) => t !== "");
    return {
      label,
      variantId: checkbox.id.replace(/^Select-/, ""),
      productTitle: title ?? "",
    };
  });
  if (found.reason != null) throw new Error(`printFilterFromStore: ${found.reason}`);
  return found;
}

await stage("print-filtered", async () => {
  await setWindow(page, 1500);
  const filter = await printFilterFromStore();
  console.log(`      filtering to: ${filter.productTitle} (${filter.label})`);
  const params = new URLSearchParams({
    limit: "20",
    page: "1",
    sortKey: "TITLE",
    sortDirection: "ASC",
    label: filter.label,
    variantId: filter.variantId,
    productTitle: filter.productTitle,
  });
  await goto(page, `#/app/printlabels?${params.toString()}`, 9000);
  await keepRows(page, 5);
  await mark(page, "selector", ".Polaris-Page");
  await shoot(page, "AdminBlocksPrintFiltered.png");
});

await stage("print-select", async () => {
  await setWindow(page, 1500);
  await goto(page, "#/app/printlabels", 7000);
  await page.evaluate(() => {
    const cbs = [...document.querySelectorAll('tbody input[type="checkbox"]')];
    cbs[0]?.click();
    cbs[1]?.click();
  });
  await sleep(2500);
  await keepRows(page, 5);
  await mark(page, "cardWithHeading", "Products");
  await shoot(page, "LabelQuantitiesRowEdit.png");
});

await stage("print-all", async () => {
  await setWindow(page, 1500);
  await goto(page, "#/app/printlabels", 7000);
  await clickText(page, "button", "Select all", { settle: 3000 });
  await keepRows(page, 5);
  await mark(page, "cardWithHeading", "Products");
  await shoot(page, "PrintAllProductsSelectAll.png");
});

/** Open the stock picker from the print page with one product selected. */
async function openStockModal() {
  await setWindow(page, 1500);
  await goto(page, "#/app/printlabels", 7000);
  await page.evaluate(() => {
    document.querySelectorAll('tbody input[type="checkbox"]')[0]?.click();
  });
  await sleep(2500);
  await clickText(page, "button", "Print 1 label", { settle: 6000 });
  await mark(page, "selector", ".Polaris-Modal-Dialog__Modal");
}

/** The modal's three selects, in order: manufacturer, paper size, printer resolution. */
async function setStock({ manufacturer, size, dpi }) {
  const selects = await page.$$(".Polaris-Modal-Dialog__Modal select");
  if (selects.length < 3) throw new Error(`setStock: found ${selects.length} selects, expected 3`);
  const pick = async (index, label) => {
    if (label == null) return;
    const value = await selects[index].evaluate(
      (sel, want) => [...sel.options].find((o) => (o.textContent ?? "").trim() === want)?.value,
      label,
    );
    if (value == null) throw new Error(`setStock: no option "${label}" in select ${index}`);
    await selects[index].select(value);
    await sleep(1200);
  };
  await pick(0, manufacturer);
  await pick(1, size);
  await pick(2, dpi);
  await sleep(2000);
}

/** Choose a shape, then a stock from the combobox, so the modal renders its label preview. */
async function pickStock(query) {
  await clickText(page, "button", "Rectangle", { exact: true, settle: 2000 });
  const input = await page.$(".Polaris-Modal-Dialog__Modal input[type='text']");
  if (input == null) throw new Error("pickStock: combobox input missing");
  // The listbox only opens once the field has been typed in; focus alone leaves it closed.
  await input.focus();
  await page.keyboard.type(query, { delay: 60 });
  await sleep(2500);
  const picked = await page.evaluate(() => {
    const option = document.querySelector("[role='option']");
    if (option == null) return null;
    const text = (option.textContent ?? "").replace(/\s+/g, " ").trim();
    option.click();
    return text;
  });
  if (picked == null) throw new Error(`pickStock: no options for "${query}"`);
  console.log(`      stock: ${picked}`);
  await sleep(4000);
}

await stage("print-modal", async () => {
  await openStockModal();
  await shoot(page, "PrintingLabelsStockModal.png");
});

await stage("print-modal-sheet", async () => {
  await openStockModal();
  await setStock({ manufacturer: "Avery", size: "Letter" });
  await pickStock("5");
  await shoot(page, "ChoosingStockPrintPicker.png");
});

await stage("print-modal-roll", async () => {
  await openStockModal();
  await setStock({ size: "Continuous Feed", dpi: "203 DPI" });
  await pickStock("2");
  await shoot(page, "ThermalPrintersStockPicker.png");
});

// ------------------------------------------------------------------- probes
//
// None of these run unless you name one. See `probe` above for what they are for.

await probe("probe-modal", async () => {
  await goto(page, "#/app/printlabels", 7000);
  await page.evaluate(() => {
    document.querySelectorAll('tbody input[type="checkbox"]')[0]?.click();
  });
  await sleep(2500);
  await clickText(page, "button", "Print 1 label", { settle: 6000 });
  const info = await page.evaluate(() => {
    const dlg = document.querySelector(".Polaris-Modal-Dialog__Modal") ?? document.body;
    const r = dlg.getBoundingClientRect();
    return {
      box: `${Math.round(r.width)}x${Math.round(r.height)}`,
      selects: [...dlg.querySelectorAll("select")].map((s) => ({
        label: s.closest(".Polaris-Labelled__LabelWrapper")?.textContent ?? s.name ?? "?",
        value: s.value,
        options: [...s.options].map((o) => o.textContent).slice(0, 14),
      })),
      inputs: [...dlg.querySelectorAll("input")].map((i) => `${i.type}:${i.placeholder || i.value}`),
    };
  });
  console.log("MODAL:", JSON.stringify(info, null, 1));
});

async function dumpCards(page, label) {
  const info = await page.evaluate(() => {
    const t = (el) => (el.textContent ?? "").replace(/\s+/g, " ").trim().slice(0, 70);
    return [...document.querySelectorAll(".Polaris-ShadowBevel,.Polaris-InlineGrid")].map((c, i) => {
      const r = c.getBoundingClientRect();
      return `[${i}] ${c.className.split(" ")[0]} ${Math.round(r.width)}x${Math.round(r.height)} :: ${t(c)}`;
    });
  });
  console.log(`${label}:\n ` + info.join("\n "));
}

await probe("probe-gallery", async () => {
  await goto(page, "#/app/library", 9000);
  await dumpCards(page, "GALLERY");
});

await probe("probe-templates", async () => {
  await goto(page, "#/app/templates", 5000);
  const info = await page.evaluate(() => ({
    page: [...document.querySelectorAll(".Polaris-Page > div > *")].map(
      (n) => `${n.className.split(" ")[0]} ${Math.round(n.getBoundingClientRect().height)}`,
    ),
    buttons: [...document.querySelectorAll("button")]
      .map((b) => (b.textContent ?? "").trim())
      .filter(Boolean)
      .slice(0, 30),
    rowButtons: [...(document.querySelector("tbody tr")?.querySelectorAll("button") ?? [])].map(
      (b) => (b.textContent ?? "").trim() || b.getAttribute("aria-label"),
    ),
  }));
  console.log("TEMPLATES:", JSON.stringify(info, null, 1));
});

await probe("probe-editor", async () => {
  await openDesign(page, SAMPLES_ROUTE, SAMPLES.everything);
  const info = await page.evaluate(() => {
    const box = (sel) => {
      const n = document.querySelector(sel);
      if (n == null) return "missing";
      const r = n.getBoundingClientRect();
      return `${Math.round(r.width)}x${Math.round(r.height)}`;
    };
    return {
      container: box(".label-harness-editor-container"),
      canvasSection: box(".label-harness-canvas-section"),
      viewport: box(".label-harness-viewport"),
      viewportContent: box(".label-harness-viewport-content"),
      sidebarVariant: box(".label-harness-sidebar-variant"),
      variantText: (
        document.querySelector(".label-harness-sidebar-variant")?.textContent ?? ""
      ).slice(0, 120),
      toolbar: [...document.querySelectorAll(".label-harness-toolbar button")].map(
        (b) => (b.textContent ?? "").trim() || b.getAttribute("aria-label"),
      ),
      objects: (window.__lwCanvas?.getObjects() ?? []).map(
        (o) => `${o.type}:${o.data?.id ?? ""}`,
      ),
    };
  });
  console.log("EDITOR:", JSON.stringify(info, null, 1));
});

/**
 * Every heading on a design-listing route and the Edit buttons near it — that is, exactly what
 * `openDesign` matches on. Run this when a stage reports "no Edit button for ...", to see whether
 * the design was renamed, is on another page of the list, or the store the harness is pointed at
 * simply does not have it.
 */
async function dumpDesignList(page, hash, label) {
  await goto(page, hash, 8000);
  const info = await page.evaluate(() => {
    const climb = (start) => {
      let el = start;
      while (el != null && !el.classList.contains("Polaris-ShadowBevel")) el = el.parentElement;
      return el;
    };
    return {
      editButtons: document.querySelectorAll("button").length,
      editCount: [...document.querySelectorAll("button")].filter(
        (b) => (b.textContent ?? "").trim() === "Edit",
      ).length,
      perHeading: [...document.querySelectorAll("h3,h4")].map((h) => {
        const card = climb(h);
        const edits = [...(card ?? document).querySelectorAll("button")].filter(
          (b) => (b.textContent ?? "").trim() === "Edit",
        );
        return `${(h.textContent ?? "").trim()} -> card=${card?.className?.split(" ")[0] ?? "none"} size=${card ? Math.round(card.getBoundingClientRect().width) + "x" + Math.round(card.getBoundingClientRect().height) : "-"} edits=${edits.length}`;
      }),
    };
  });
  console.log(`${label}:`, JSON.stringify(info, null, 1));
}

await probe("probe-samples", async () => {
  await dumpDesignList(page, "#/app/sample_labels", "SAMPLES");
});

await probe("probe-designs", async () => {
  await dumpDesignList(page, "#/app/label_design", "DESIGNS");
});

await probe("probe-print-dirty", async () => {
  await setWindow(page, 860);
  await openDesign(page, SAMPLES_ROUTE, SAMPLES.everything);
  await page.evaluate(() => {
    const canvas = window.__lwCanvas;
    const obj = canvas.getObjects()[0];
    obj.set({ left: obj.left + 6 });
    canvas.setActiveObject(obj);
    canvas.fire("object:modified", { target: obj });
    canvas.requestRenderAll();
  });
  await sleep(1500);
  await clickText(page, "button", "Shape", { exact: true, settle: 3000 });
  const mid = await page.evaluate(() => ({
    buttons: [...new Set([...document.querySelectorAll("button")].map((b) => (b.textContent ?? "").trim()))].slice(0, 25),
    objects: (window.__lwCanvas?.getObjects() ?? []).length,
  }));
  console.log("AFTER SHAPE:", JSON.stringify(mid));
  await clickText(page, "button", "Print", { exact: true, settle: 5000 });
  const info = await page.evaluate(() => ({
    url: location.hash,
    dialogs: [...document.querySelectorAll('[role="dialog"]')].map((d) =>
      (d.textContent ?? "").replace(/\s+/g, " ").trim().slice(0, 160),
    ),
    modalClass: [...document.querySelectorAll(".Polaris-Modal-Dialog__Modal")].length,
  }));
  console.log("DIRTY PRINT:", JSON.stringify(info, null, 1));
});

await probe("probe-print", async () => {
  await goto(page, "#/app/printlabels", 8000);
  const info = await page.evaluate(() => ({
    // `firstPrintableRow` builds the filtered URL out of these, so when that stage fails this is
    // the row it could not read.
    firstRowControls: [
      ...(document.querySelector("tbody tr")?.querySelectorAll("select,input,button") ?? []),
    ].map((n) => {
      const options = [...(n.options ?? [])].map((o) => `${o.value}|${o.textContent?.trim()}`);
      return `${n.tagName.toLowerCase()}${n.type ? `[${n.type}]` : ""} id=${n.id || "-"} ${
        options.length > 0 ? `options=${JSON.stringify(options.slice(0, 6))}` : `value=${n.value ?? ""}`
      }`;
    }),
    links: [...document.querySelectorAll("tbody tr")].slice(0, 3).map((tr) => ({
      text: (tr.textContent ?? "").replace(/\s+/g, " ").trim().slice(0, 60),
      ids: [...tr.querySelectorAll("[id],[data-product-id],[href]")]
        .map((n) => n.id || n.getAttribute("data-product-id") || n.getAttribute("href"))
        .filter(Boolean)
        .slice(0, 4),
    })),
    buttons: [...new Set([...document.querySelectorAll("button")].map((b) => (b.textContent ?? "").trim()))].slice(0, 20),
  }));
  console.log("PRINT:", JSON.stringify(info, null, 1));
});

await probe("probe-unsaved", async () => {
  await page.setViewport({ width: 1180, height: 820, deviceScaleFactor: 2 });
  await openDesign(page, SAMPLES_ROUTE, SAMPLES.everything);
  const before = await page.evaluate(() => [
    ...new Set([...document.querySelectorAll("button")].map((b) => (b.textContent ?? "").trim())),
  ]);
  console.log("EDITOR BUTTONS:", JSON.stringify(before));
  await page.evaluate(() => {
    const c = window.__lwCanvas;
    const o = c.getObjects()[0];
    o.set({ left: o.left + 6 });
    c.setActiveObject(o);
    c.fire("object:modified", { target: o });
    c.requestRenderAll();
  });
  await sleep(1500);
  const after = await page.evaluate(() => [
    ...new Set([...document.querySelectorAll("button")].map((b) => (b.textContent ?? "").trim())),
  ]);
  console.log("AFTER EDIT:", JSON.stringify(after));
});

await probe("probe-stock", async () => {
  await openStockModal();
  await clickText(page, "button", "Rectangle", { exact: true, settle: 2000 });
  const input = await page.$(".Polaris-Modal-Dialog__Modal input[type='text']");
  if (input == null) throw new Error("probe-stock: no combobox input");
  await input.focus();
  await page.keyboard.type("Avery");
  await sleep(2500);
  const info = await page.evaluate(() => ({
    listbox: [...document.querySelectorAll("[role='option'],li")]
      .map((o) => (o.textContent ?? "").replace(/\s+/g, " ").trim())
      .filter(Boolean)
      .slice(0, 12),
  }));
  console.log("STOCK:", JSON.stringify(info, null, 1));
});

await probe("probe-qr", async () => {
  await setWindow(page, 860);
  await openDesign(page, SAMPLES_ROUTE, SAMPLES.qr);
  await nextRecord(page);
  const picked = await selectObject(page, { type: "QR" });
  console.log("QR OBJECTS:", JSON.stringify(picked.objects));
  const info = await page.evaluate(() => {
    const panel = document.querySelector(".label-harness-sidebar-properties");
    const obj = window.__lwCanvas.getActiveObject();
    return {
      content: obj?.data?.expression ?? obj?.expression ?? obj?.text ?? "?",
      keys: Object.keys(obj?.data ?? {}),
      critical: [...(panel?.querySelectorAll(".Polaris-Text--critical") ?? [])].map(
        (n) => n.parentElement?.parentElement?.outerHTML?.slice(0, 900) ?? "",
      ),
    };
  });
  console.log("QR PANEL:", JSON.stringify(info, null, 1));
});

await probe("probe-settings", async () => {
  await setWindow(page, 1500);
  await goto(page, "#/app/settings", 4000);
  const info = await page.evaluate(() => {
    const t = (el) => (el.textContent ?? "").replace(/\s+/g, " ").trim().slice(0, 40);
    return [...document.querySelectorAll(".Polaris-Page, .Polaris-Page *")]
      .filter((n) => n.getBoundingClientRect().height > 200)
      .slice(0, 14)
      .map((n) => {
        const r = n.getBoundingClientRect();
        return `${n.className.split(" ")[0]} ${Math.round(r.width)}x${Math.round(r.height)} top=${Math.round(r.top)} :: ${t(n)}`;
      });
  });
  console.log("SETTINGS:\n " + info.join("\n "));
});

await probe("probe-dash", async () => {
  await goto(page, "#/app", 5000);
  const info = await page.evaluate(() => {
    const t = (el) => (el.textContent ?? "").replace(/\s+/g, " ").trim().slice(0, 60);
    return [...document.querySelectorAll(".Polaris-ShadowBevel")].map((c, i) => {
      const r = c.getBoundingClientRect();
      return `[${i}] ${Math.round(r.width)}x${Math.round(r.height)} parent=${c.parentElement?.className?.slice(0, 40)} :: ${t(c)}`;
    });
  });
  console.log("DASH CARDS:\n " + info.join("\n "));
});

console.log("\n==================== SUMMARY ====================");
if (failures.length === 0) {
  console.log("all stages ok");
} else {
  console.log(`${failures.length} failed:`);
  for (const f of failures) console.log(`  - ${f}`);
}

if (process.env.KEEP_OPEN !== "1") await browser.close();
if (failures.length > 0) process.exitCode = 1;
