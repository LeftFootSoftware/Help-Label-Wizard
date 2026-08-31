# Plan: EditorPage filters consistent for label-harness and main app

## Goal

Make filters work in **EditorPage** the same way for both the **label-harness** (non-Remix) and the **main app** (Remix). **EditorPage is plug-and-play:** the same component and behavior run in both environments; the **caller** is responsible for creating the data source and passing the **query handler** (e.g. `runGraphQL`) so that “how the query is run” is the only difference. The query, variables, and filter definition are shared.

Include a pattern for **static single-record info** (e.g. shop) so it can be loaded once and made available to the editor without prop drilling.

---

## Current state

- **Filter definition:** Lives in the data object registry (e.g. `app/routes/Canvas/variables/dataObjects/variant.ts`). `VARIANT_FILTER_DEFINITION` has Search (query) and Filters (productTypes). **buildFullQuery** (filter values → query string) lives in a shared module (`app/routes/Canvas/DataSource/buildListQuery.ts`); CanvasDataSource and the label_design action both use it.
- **EditorPage:** Uses `EMPTY_FILTER_VALUES` and `setFilterValues={() => {}}`, so filter UI is rendered but changing filters has no effect and no refetch. Initial fetch always uses empty filters.
- **GraphQL execution (query handler injection):** CanvasDataSource accepts a **runGraphQL** handler in config. When provided, it uses that to execute the list query instead of building a URL and calling `fetch` itself. Callers pass the handler that fits the environment so EditorPage needs no env logic.
  - **Main app (Remix):** Creates the data source with `runGraphQL: (query, variables) => fetch("/api/graphql", { method: "POST", body: JSON.stringify({ query, variables }) }).then(r => r.json())`. Same-origin `/api/graphql` is handled by `app/routes/api.graphql.tsx`.
  - **Harness:** Creates the data source with `runGraphQL` that fetches to `VITE_VARIANTS_API_ORIGIN/api/graphql` (or `/api/graphql` when unset). Same request body `{ query, variables }`.
- **Query source:** The **query string** is always from the registry (`getQuery("variant")` = GetVariantList in variant.ts). No override in either app.

---

## Implementation status

| Phase | Status | Notes |
|-------|--------|--------|
| **Phase 2** (2.0–2.2) | Done | runGraphQL injection, shared `buildFullQuery`, label_design action uses registry + buildFullQuery; unused code removed. |
| **Phase 1** (1.1–1.4) | Not done | EditorPage still uses `EMPTY_FILTER_VALUES` and `setFilterValues={() => {}}`; filter UI does not refetch when user changes search or product type. |
| **Phase 3** (static info) | Not started | Pattern defined only. |
| **Phase 4** (filter evolution) | Optional / later | e.g. collection filter, search fields. |

**Next:** Implement Phase 1 so that changing filters in the sidebar triggers a refetch and updates the variant list.

---

## Principles

1. **Single query, no override**  
   Both harness and main app use the same GraphQL query from the registry (`getQuery(dataObjectType)`). No duplicate or app-specific variant list query in the main app.

2. **Query execution is injected via a handler (runGraphQL)**  
   The caller passes a **runGraphQL** function when creating the data source. CanvasDataSource uses it to execute the list query; same code path everywhere. Remix passes a handler that fetches same-origin `/api/graphql`; harness passes a handler that fetches to the variants server (or same-origin when unset). Same body `{ query, variables }` in both cases.

3. **Filter state lives with the variant control (EditorPage)**  
   EditorPage owns filter state; when the user changes a filter in the sidebar, state updates and a refetch runs with the new filter values. The editor does not “override” or ignore filters.

4. **Static info (e.g. shop): load once, state + context, pass into non-React**  
   Load at startup (route loader in Remix, or mount in harness). Store in React state at the level that owns the editor; expose via a React context so any descendant (sidebar, token control) can consume it. For non-React code (expression resolver, export), pass the same data as an argument or via a small bridge (e.g. ref/callback set by EditorPage) when calling that code.

---

## Phase 1: Filter state and refetch in EditorPage

**1.1 Add real filter state in EditorPage**

- **File:** `app/routes/Canvas/EditorPage/EditorPage.tsx`
- **Change:**
  - Replace the constant `EMPTY_FILTER_VALUES` usage for **state** with `useState<DataSourceFilterValues>({})` (e.g. `filterValues`, `setFilterValues`).
  - Keep a stable empty object for **initial** fetch only if you want the first load to be unfiltered; otherwise initial fetch can use `filterValues` once it exists.
- **Use:** Pass `filterValues` and `setFilterValues` into `DataSourceCard` instead of `EMPTY_FILTER_VALUES` and `() => {}`.

**1.2 Refetch when filter values change**

- **File:** `app/routes/Canvas/EditorPage/EditorPage.tsx`
- **Change:**
  - When `filterValues` change (e.g. user types in search or changes product type), call `activeDataSource.fetch(filterValues)` and update `rows`, `currentRowIndex`, and `hasNextPage` from the result.
  - Option A: `useEffect` that depends on `filterValues` (and optionally `activeDataSource`), and runs fetch then sets state. Reset `currentRowIndex` to 0 when filters change.
  - Option B: In `DataSourceCard`, when a control’s `onChange` calls `setFilterValues`, the parent could also trigger a refetch in the same flow (e.g. callback from DataSourceCard or effect in EditorPage). Prefer effect in EditorPage so one place owns “when filters change → refetch.”
- **Detail:** Avoid effect loops: initial fetch already runs when `canvasReady` and `activeDataSource` are set; filter-driven refetch should run when `filterValues` change (and optionally when data source changes). Ensure the initial load and the filter-refetch path do not double-fetch (e.g. first load with empty filters, then effect only when filterValues reference or key changes).

**1.3 Initial load**

- Either: First load uses empty `filterValues` (e.g. `{}`) so the first fetch is unfiltered; thereafter any change to `filterValues` triggers the effect and refetch.
- Or: Single effect that runs when `canvasReady`, `activeDataSource`, and `filterValues` are ready, and refetches whenever `filterValues` or data source changes. Then initial load is “fetch with current filterValues” (empty object).

**1.4 DataSourceCard**

- No change to the card’s contract: it already accepts `filterValues` and `setFilterValues`. EditorPage will now pass real state and setter so the Filters UI and chips work and the parent refetches on change.

---

## Phase 2: Query handler injection, shared code, main app action

**2.0 CanvasDataSource accepts runGraphQL; callers pass handler**

- **CanvasDataSourceConfig** accepts **runGraphQL**: `(query, variables) => Promise<{ data?, errors? }>`. When provided, CanvasDataSource uses it to execute the list query; otherwise it falls back to `graphqlOrigin` + fetch (legacy).
- **Harness** and **main app** each create the data source with the appropriate `runGraphQL` implementation. EditorPage is unchanged; it only receives `activeDataSource`.

**2.1 Shared buildFullQuery; main app action uses it**

- **buildFullQuery** lives in `app/routes/Canvas/DataSource/buildListQuery.ts`. CanvasDataSource and the label_design action both import and use it so filter values → query string is defined in one place.
- **app.label_design** is a **Remix route used only by the main app** (the harness does not use it). The route’s **action** (server-side form handler) uses the **same** shared functions: `getQuery("variant")` and `buildFullQuery("variant", filterValues)`; builds variables `{ first, after, query }`; calls `admin.graphql(query, { variables })`; handles `data.productVariants.edges` and `pageInfo`. Map to the shape the UI (e.g. FilterVariantsModal) expects. Stub or omit `shopInfo` for now.

**2.2 Remove unused code in label_design action**

- Delete the inline `fetchProductVariants` and `SearchProductsByTitle` GraphQL documents and the old products/shop-based response handling (deriveRegion, processMetafields, processVariants). Single path: registry query + buildFullQuery + productVariants response.

---

## Phase 3: Static info (e.g. shop) – load once, state + context

**3.1 Where to load**

- **Remix:** In the route that renders the label design/editor (e.g. loader for `app.label_design` or the route that mounts EditorPage), fetch shop (minimal query) and pass the result into the page component as a prop, or store in state at that level.
- **Harness:** In the component that mounts EditorPage (e.g. HarnessApp or a wrapper), fetch shop once on mount (e.g. `useEffect` + `useState`), or from a small API the harness can call.

**3.2 Where to store and expose**

- Store in **React state** at the level that owns the editor (route/page or EditorPage’s parent).
- Provide via a **React context** (e.g. `EditorStaticContext` or `StaticInfoContext`) with value `{ shop }` (or `{ shop, ... }`). Provider wraps EditorPage (or the route content that includes EditorPage and sidebar).
- **React children** (SelectionSidebar, DataSourceCard, token expression control) that need shop use `useContext(EditorStaticContext)`.

**3.3 Non-React code (canvas, resolver, export)**

- **Do not** put app-level static data on the Fabric canvas instance itself.
- **Pass** the same data into code that needs it:
  - Expression resolver: when resolving tokens, call the resolver with an extra argument (e.g. `staticContext: { shop }`) or a ref/callback that EditorPage sets so the resolver can read current static context.
  - Export/print: same—receive static context as an argument or from a small bridge (e.g. ref held by EditorPage and read at export time).

**3.4 Scope**

- Implementation of the actual shop query and UI use of shop can be deferred; this plan only defines the pattern: load once at boundary → state → context for React, pass/bridge for non-React.

---

## Phase 4: Filter definition evolution (optional, later)

- **Variant filters:** The registry already defines Search (query) and productTypes. When adding **collection**, add a control (e.g. `collectionIds` or `collections`) to `VARIANT_FILTER_DEFINITION` in `variant.ts` and extend **buildFullQuery** in `app/routes/Canvas/DataSource/buildListQuery.ts` to map it to Shopify’s `collection:` query syntax. Product type and collection remain “standard” filters applied in the same way in both apps.
- **Text search fields:** If the backend or API supports restricting which fields are searched, extend the filter control or definition (e.g. optional `searchFields` on the query control) and have `buildFullQuery` or the API use it; no change to “only difference is how GraphQL is run.”

---

## Summary

**Done (Phase 2)**

| Step | Action |
|------|--------|
| 2.0 | CanvasDataSource: accept `runGraphQL` in config; callers (harness and main app) pass the appropriate handler. EditorPage unchanged. |
| 2.1 | **buildFullQuery** in shared module (`buildListQuery.ts`); CanvasDataSource and label_design action use it. Main app action: `getQuery("variant")` + `buildFullQuery("variant", filterValues)`; handle `data.productVariants`; stub/omit shopInfo. |
| 2.2 | Unused code removed in label_design action (inline GraphQL, products/shop handling). |

**Todo (Phase 1 – filters working)**

| Step | Action |
|------|--------|
| 1.1 | EditorPage: add `filterValues` / `setFilterValues` state; pass into DataSourceCard instead of `EMPTY_FILTER_VALUES` and no-op setter. |
| 1.2 | EditorPage: when `filterValues` change, refetch via `activeDataSource.fetch(filterValues)` and update rows, currentRowIndex, hasNextPage. Prefer one `useEffect` with deps `[canvasReady, activeDataSource, filterValues]`. Reset currentRowIndex to 0 when filters change. |
| 1.3 | Initial load: use current filterValues (e.g. `{}`) so one code path handles first load and filter-driven refetch; avoid double-fetch. |
| 1.4 | DataSourceCard: no contract change; EditorPage passes real state so Filters UI and chips work and parent refetches on change. |

**Later (Phase 3–4)**

| Phase | Action |
|-------|--------|
| 3.x | Static info: load once at boundary, state + context for React, pass/bridge for non-React (resolver, export). |
| 4   | Filter evolution: e.g. collection filter, search fields (optional). |

After Phase 2, EditorPage is plug-and-play and shared query/buildFullQuery are in place. After Phase 1, filters work: changing search or product type refetches the list. Static info (Phase 3) is defined for when you add it.
