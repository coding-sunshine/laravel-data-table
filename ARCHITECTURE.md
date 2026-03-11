# Architecture

## Overview

`machour/laravel-data-table` is a full-stack DataTable package for **Laravel + Inertia.js + React**. You define a table entirely in a single PHP class (a Spatie Data DTO), and the package provides server-side sorting, filtering, pagination, exports, inline editing, AI features, and a feature-rich React UI built on TanStack Table v8.

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | PHP 8.2+, Laravel 11/12 |
| Data Layer | [spatie/laravel-data](https://github.com/spatie/laravel-data) v4, [spatie/laravel-query-builder](https://github.com/spatie/laravel-query-builder) v6 |
| Frontend | React, TanStack Table v8, Inertia.js |
| TypeScript | [spatie/laravel-typescript-transformer](https://github.com/spatie/laravel-typescript-transformer) (optional) |
| Exports | [maatwebsite/excel](https://github.com/SpartnerNL/Laravel-Excel) (optional) |
| AI | Laravel AI SDK or Prism PHP (optional), Thesys C1 for generative UI (optional) |

---

## Directory Structure

```
├── config/
│   └── data-table.php              # Package configuration
├── database/
│   └── migrations/                  # Audit log + saved views tables
├── src/
│   ├── AbstractDataTable.php        # Base class — the core of every table
│   ├── DataTableResponse.php        # Response DTO sent to frontend
│   ├── DataTableMeta.php            # Pagination metadata DTO
│   ├── DataTableExport.php          # Maatwebsite Excel export adapter
│   ├── QuickView.php                # Quick view preset DTO
│   ├── SavedView.php                # Eloquent model for user-saved views
│   ├── DataTableServiceProvider.php # Routes, config, commands registration
│   ├── Columns/
│   │   ├── Column.php               # Column definition DTO (36 properties)
│   │   └── ColumnBuilder.php        # Fluent builder for columns
│   ├── Concerns/                    # Opt-in traits for features
│   │   ├── HasExport.php
│   │   ├── HasImport.php
│   │   ├── HasInlineEdit.php
│   │   ├── HasToggle.php
│   │   ├── HasReorder.php
│   │   ├── HasSelectAll.php
│   │   ├── HasAuditLog.php
│   │   └── HasAi.php
│   ├── Filters/
│   │   └── OperatorFilter.php       # 14-operator filter for query builder
│   ├── Http/Controllers/            # 11 single-action controllers
│   │   ├── DataTableExportController.php
│   │   ├── DataTableImportController.php
│   │   ├── DataTableInlineEditController.php
│   │   ├── DataTableToggleController.php
│   │   ├── DataTableReorderController.php
│   │   ├── DataTableSelectAllController.php
│   │   ├── DataTableDetailRowController.php
│   │   ├── DataTableAsyncFilterController.php
│   │   ├── DataTableCascadingFilterController.php
│   │   ├── DataTableAiController.php
│   │   └── SavedViewController.php
│   ├── Ai/Agents/                   # AI agent classes (Laravel AI SDK)
│   │   ├── DataTableQueryAgent.php
│   │   ├── DataTableInsightsAgent.php
│   │   ├── DataTableColumnSummaryAgent.php
│   │   ├── DataTableSuggestAgent.php
│   │   ├── DataTableEnrichAgent.php
│   │   └── DataTableVisualizationAgent.php
│   ├── Console/Commands/
│   │   ├── MakeDataTable.php        # make:data-table scaffolding generator
│   │   ├── GenerateTypeScript.php   # data-table:types TS type generator
│   │   ├── GenerateTranslations.php # data-table:translations i18n generator
│   │   └── AuditReport.php          # data-table:audit-report CLI report
│   └── Testing/
│       └── DataTableTestHelper.php  # Fluent assertion helper for tests
├── react/
│   └── src/
│       ├── data-table/
│       │   ├── data-table.tsx       # Main DataTable React component
│       │   ├── data-table-column.tsx
│       │   ├── data-table-column-header.tsx
│       │   ├── data-table-pagination.tsx
│       │   ├── data-table-quick-views.tsx
│       │   ├── data-table-row-actions.tsx
│       │   ├── use-data-table.ts    # Core hook (TanStack Table + Inertia nav)
│       │   ├── use-data-table-filters.ts
│       │   ├── types.ts             # TypeScript interfaces
│       │   ├── i18n.ts              # Default translations
│       │   └── index.ts             # Public exports
│       └── filters/
│           ├── filters.tsx
│           ├── filter-controls.tsx
│           ├── types.ts
│           └── use-filters.ts
└── tests/
```

---

## Core Classes

### `AbstractDataTable` (`src/AbstractDataTable.php`)

The base class every DataTable extends. It is a `Spatie\LaravelData\Data` DTO — the constructor properties become the row shape. Key responsibilities:

- **`tableColumns()`** (abstract) — Returns `Column[]` defining the table schema
- **`tableBaseQuery()`** (abstract) — Returns an Eloquent `Builder` for the data source
- **`makeTable()`** — The main entry point. Builds a `QueryBuilder`, applies filters/sorting/search, paginates, and returns a `DataTableResponse`
- **`buildFilteredQuery()`** — Shared query builder used by `makeTable()`, exports, and select-all
- **`tableSummary()`** — Computes full-dataset aggregations (sum, avg, min, max, count, range)
- **Overridable hooks**: `tableDefaultSort()`, `tableQuickViews()`, `tableSearchableColumns()`, `tableResource()`, `tableFooter()`, `tableDetailRow()`, `tableAuthorize()`, `tableAnalytics()`, `tableActionRules()`, `tablePaginationType()` (standard/simple/cursor), `tablePollingInterval()`, `tablePersistState()`, `tableGroupByColumn()`, `tablePinnedTopRows()`, `tablePinnedBottomRows()`, `tableTreeDataEnabled()`, `tableInfiniteScroll()`, `tablePivotEnabled()`, etc.

### `Column` (`src/Columns/Column.php`)

A Spatie Data DTO with 36 properties defining a column's behavior, appearance, and filtering. Supports 16 column types:

`text`, `number`, `date`, `option`, `multiOption`, `boolean`, `image`, `badge`, `currency`, `percentage`, `link`, `email`, `phone`, `icon`, `color`, `select`

Key properties: `sortable`, `filterable`, `editable`, `toggleable`, `visible`, `summary`, `prefix`, `suffix`, `tooltip`, `description`, `lineClamp`, `iconMap`, `colorMap`, `stacked`, `avatarColumn`, `computedFrom`, `sparkline`, `headerFilter`, `responsivePriority`, `colSpan`, `autoHeight`, `valueGetter`, `valueFormatter`.

### `ColumnBuilder` (`src/Columns/ColumnBuilder.php`)

Fluent builder for `Column` instances. Supports closures for dynamic suffixes and computed columns (resolved server-side).

```php
ColumnBuilder::make('price', 'Price')
    ->currency('EUR')
    ->sortable()
    ->summary('sum')
    ->build()
```

### `DataTableResponse` (`src/DataTableResponse.php`)

The DTO sent to the frontend via Inertia. Contains: `data`, `columns`, `quickViews`, `meta`, `exportUrl`, `footer`, `selectAllUrl`, `summary`, `config`, `toggleUrl`, `enumOptions`, `reorderUrl`, `importUrl`, `groupByColumn`, `pinnedTopRows`, `pinnedBottomRows`, `actionRules`, `analytics`.

### `DataTableMeta` (`src/DataTableMeta.php`)

Pagination metadata: `currentPage`, `lastPage`, `perPage`, `total`, `sorts`, `filters`, `paginationType`, `nextCursor`, `prevCursor`.

### `OperatorFilter` (`src/Filters/OperatorFilter.php`)

A Spatie QueryBuilder `Filter` implementation supporting 14 operators:

`eq`, `neq`, `gt`, `gte`, `lt`, `lte`, `between`, `in`, `not_in`, `contains`, `before`, `after`, `null`, `not_null`

Filter values are passed as `operator:value` strings (e.g., `gte:100`, `between:10,50`).

---

## Traits (Concerns)

Each trait is opt-in — add it to your DataTable class to enable the feature:

| Trait | Purpose | Key Methods |
|-------|---------|-------------|
| `HasExport` | XLSX/CSV/PDF export via Maatwebsite Excel | `tableExportEnabled()`, `downloadExport()`, `makeExportQuery()` |
| `HasImport` | CSV/XLSX file import | `tableImportEnabled()`, `processImport()`, `handleImport()` |
| `HasInlineEdit` | Cell-level inline editing | `tableInlineEditModel()`, `handleInlineEdit()`, auto-generates validation rules from column type |
| `HasToggle` | Boolean column toggle switch | `tableToggleModel()`, `handleToggle()` |
| `HasReorder` | Drag-and-drop row reordering | `tableReorderModel()`, `tableReorderColumn()`, `handleReorder()` |
| `HasSelectAll` | Server-side select-all (returns all IDs matching filters) | `handleSelectAll()`, `tableSelectAllKey()` |
| `HasAuditLog` | Audit trail for edits, toggles, reorders, bulk actions | `logInlineEdit()`, `logToggle()`, `logReorder()`, `logBulkAction()`, `getAuditLog()` |
| `HasAi` | AI-powered features (query, insights, suggestions, enrichment, visualization) | `handleAiQuery()`, `handleAiInsights()`, `handleAiColumnSummary()`, `handleAiSuggest()`, `handleAiEnrich()`, `handleAiVisualize()` |

---

## HTTP Routes & Controllers

All routes are registered by `DataTableServiceProvider` under a configurable prefix (default: `/data-table`). Controllers use a static `register()` pattern for table name resolution.

| Method | Route | Controller | Purpose |
|--------|-------|-----------|---------|
| GET | `/data-table/export/{table}` | `DataTableExportController` | Download XLSX/CSV/PDF export |
| GET | `/data-table/export-status` | `DataTableExportController@status` | Queued export status |
| GET | `/data-table/select-all/{table}` | `DataTableSelectAllController` | Fetch all matching IDs |
| PATCH | `/data-table/inline-edit/{table}/{id}` | `DataTableInlineEditController` | Update a single cell |
| PATCH | `/data-table/toggle/{table}/{id}` | `DataTableToggleController` | Toggle a boolean column |
| GET | `/data-table/detail/{table}/{id}` | `DataTableDetailRowController` | Fetch detail/expand data |
| GET | `/data-table/filter-options/{table}/{column}` | `DataTableAsyncFilterController` | Async filter option loading |
| GET | `/data-table/cascading-options/{table}/{column}` | `DataTableCascadingFilterController` | Dependent filter options |
| PATCH | `/data-table/reorder/{table}` | `DataTableReorderController` | Reorder rows |
| POST | `/data-table/import/{table}` | `DataTableImportController` | Upload import file |
| POST | `/data-table/ai/{table}/query` | `DataTableAiController@query` | Natural language query |
| POST | `/data-table/ai/{table}/insights` | `DataTableAiController@insights` | AI data insights |
| POST | `/data-table/ai/{table}/column-summary` | `DataTableAiController@columnSummary` | AI column analysis |
| POST | `/data-table/ai/{table}/suggest` | `DataTableAiController@suggest` | AI filter suggestions |
| POST | `/data-table/ai/{table}/enrich` | `DataTableAiController@enrich` | AI row enrichment |
| POST | `/data-table/ai/{table}/visualize` | `DataTableAiController@visualize` | Thesys C1 generative UI |
| GET | `/data-table/saved-views/{tableName}` | `SavedViewController@index` | List saved views |
| POST | `/data-table/saved-views/{tableName}` | `SavedViewController@store` | Create saved view |
| PUT | `/data-table/saved-views/{tableName}/{viewId}` | `SavedViewController@update` | Update saved view |
| DELETE | `/data-table/saved-views/{tableName}/{viewId}` | `SavedViewController@destroy` | Delete saved view |

---

## AI Agents

Six agents under `src/Ai/Agents/`, used when Laravel AI SDK is the backend:

| Agent | Purpose |
|-------|---------|
| `DataTableQueryAgent` | Converts natural language to filter/sort parameters |
| `DataTableInsightsAgent` | Analyzes sample data for anomalies, trends, patterns |
| `DataTableColumnSummaryAgent` | Provides distribution analysis for a single column |
| `DataTableSuggestAgent` | Recommends useful filters based on data |
| `DataTableEnrichAgent` | Generates new column values via LLM |
| `DataTableVisualizationAgent` | Creates visualizations (used with Thesys C1) |

The `HasAi` trait auto-detects the backend: Laravel AI SDK (preferred) or Prism PHP (fallback). Each handler works with both backends.

---

## Console Commands

| Command | Purpose |
|---------|---------|
| `make:data-table {model}` | Scaffolds a DataTable PHP class + React page stub. Supports flags: `--export`, `--inline-edit`, `--select-all`, `--reorder`, `--import`, `--toggle`, `--soft-deletes`, `--detail-rows`, `--resource`, `--route`, `--all` |
| `data-table:types` | Generates TypeScript type definitions from PHP DTOs |
| `data-table:translations` | Generates frontend i18n files (en, fr, es, de, pt, ar, zh, ja) |
| `data-table:audit-report` | CLI audit report with table/json/csv output, filterable by table, action, user, date range |

---

## Frontend Architecture

### React Components (`react/src/data-table/`)

- **`data-table.tsx`** — Main `<DataTable>` component. Accepts `DataTableProps<TData>` with extensive customization: actions, bulk actions, slots, renderCell, row links, AI integration, kanban mode, master/detail, find & replace, etc.
- **`use-data-table.ts`** — Core hook wrapping TanStack Table. Manages server-side pagination, sorting, and filtering via Inertia.js `router.get()`. Persists column visibility and order in localStorage. Supports multi-table prefix for multiple tables per page.
- **`use-data-table-filters.ts`** — Filter state management hook
- **`data-table-column-header.tsx`** — Sortable column header with sort indicators
- **`data-table-pagination.tsx`** — Pagination controls (standard/simple/cursor)
- **`data-table-quick-views.tsx`** — Quick view tab bar
- **`data-table-row-actions.tsx`** — Row action dropdown menu
- **`types.ts`** — Full TypeScript interfaces (`DataTableResponse`, `DataTableColumnDef`, `DataTableProps`, `DataTableOptions`, etc.)
- **`i18n.ts`** — Default English translations

### `DataTableOptions` (50+ feature flags)

The frontend supports a rich set of opt-in features via the `options` prop:

Column features: `columnVisibility`, `columnOrdering`, `columnResizing`, `columnPinning`, `columnAutoSize`, `columnVirtualization`, `columnStatistics`

Table features: `stickyHeader`, `virtualScrolling`, `density`, `printable`, `globalSearch`, `keyboardNavigation`, `searchHighlight`, `contextMenu`, `undoRedo`, `shortcutsOverlay`, `cellFlashing`, `statusBar`

Layout modes: `layoutSwitcher` (table/grid/cards/kanban), `kanbanView`, `masterDetail`

Editing: `batchEdit`, `clipboardPaste`, `dragToFill`, `spreadsheetMode`, `findReplace`

Selection: `persistSelection`, `cellRangeSelection`

Filtering: `headerFilters`, `facetedFilters`, `conditionalFormatting`

Data: `infiniteScroll`, `rowGrouping`, `rowReorder`, `integratedCharts`

Performance: `autoSizer`, `cellMeasurer`, `scrollAwareRendering`, `windowScroller`, `directionalOverscan`

---

## Data Flow

```
1. User visits page
   │
2. Laravel Controller calls YourDataTable::makeTable()
   │
3. AbstractDataTable::makeTable()
   ├── buildFilteredQuery()  →  Spatie QueryBuilder (filters, sorts, search)
   ├── Paginate (standard / simple / cursor)
   ├── Transform via API Resource (optional)
   ├── Compute footer aggregations
   ├── Compute full-dataset summary
   ├── Resolve dynamic suffixes & computed columns
   └── Return DataTableResponse DTO
   │
4. Inertia passes DataTableResponse as page prop
   │
5. React <DataTable> component
   ├── useDataTable() hook → TanStack Table instance
   ├── Renders columns, rows, pagination, filters, quick views
   └── User interactions → Inertia router.get() → back to step 3
```

---

## Configuration (`config/data-table.php`)

| Key | Default | Description |
|-----|---------|-------------|
| `default_per_page` | 25 | Default rows per page |
| `max_per_page` | 100 | Maximum rows per page |
| `middleware` | `['web']` | Route middleware |
| `route_prefix` | `'data-table'` | URL prefix for all routes |
| `storage_prefix` | `'dt-'` | localStorage key prefix |
| `translations` | `null` | Override default translations |
| `export.queue` | `false` | Queue exports |
| `export.max_rows` | `50000` | Export row limit |
| `import.max_file_size` | `10240` | Import file size limit (KB) |
| `import.allowed_extensions` | `['csv', 'xlsx', 'xls']` | Allowed import file types |
| `rate_limit.*` | varies | Per-endpoint rate limits |
| `audit_table` | `'data_table_audit_log'` | Audit log table name |
| `ai.model` | `env(...)` | AI model override |
| `ai.sample_size` | `50` | Rows sent to AI for context |
| `ai.thesys_api_key` | `env(...)` | Thesys C1 API key |

---

## Testing

The `DataTableTestHelper` (`src/Testing/DataTableTestHelper.php`) provides a fluent assertion API:

```php
DataTableTestHelper::for(ProductDataTable::class)
    ->assertColumnExists('price')
    ->assertColumnType('price', 'currency')
    ->assertFilterable('status')
    ->assertSortable('created_at')
    ->assertExportEnabled()
    ->assertColumnCount(5);
```

Assertions available: `assertColumnExists`, `assertColumnNotExists`, `assertColumnCount`, `assertColumnType`, `assertSortable`, `assertNotSortable`, `assertFilterable`, `assertNotFilterable`, `assertEditable`, `assertVisible`, `assertHidden`, `assertHasSummary`, `assertColumnGroup`, `assertExportEnabled`, `assertInlineEditEnabled`, `assertSelectAllEnabled`, `assertReorderEnabled`, `assertToggleEnabled`, `assertImportEnabled`, `assertHasQuickViews`, `assertDefaultSort`.
