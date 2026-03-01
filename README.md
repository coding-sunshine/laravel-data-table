# Laravel DataTable

A reusable, server-side DataTable system for **Laravel + Inertia.js + React** (TanStack Table v8). Define your table in a single PHP class — get sorting, filtering, pagination, exports, inline editing, and a full-featured React UI out of the box.

## Features

### Core

- **Single-file backend** — One PHP class per model acts as both DTO and table configuration
- **Server-side everything** — Sorting, filtering, pagination handled by Spatie QueryBuilder
- **17 column types** — text, number, date, option, multiOption, boolean, image, badge, currency, percentage, link, email, phone, icon, color, select
- **Relational data** — `internalName` + `relation` for dot-notation columns with auto eager loading
- **Operator-based filters** — URL format `filter[price]=gte:1000` with 14 operators
- **3 pagination modes** — Standard, simple (no total count), and cursor-based
- **URL-driven state** — Everything is bookmarkable — filters, sorts, pagination, search
- **Multiple tables per page** — URL parameter namespacing via `prefix` prop
- **Dark mode** — Full dark mode support across all components
- **Feature flags** — Disable any feature via `options` prop

### Filtering & Search

- **Global search** — Server-side search across configurable columns with debounced input
- **Operator filters** — eq, neq, gt, gte, lt, lte, between, in, not_in, contains, before, after, null, not_null
- **Enum-based filters** — Auto-resolve filter options from PHP `BackedEnum` classes
- **Async filter options** — Lazy-load options from the server with search support
- **Cascading/interdependent filters** — Options that depend on parent filter values (e.g. Country → City)
- **Active filter indicators** — Dot indicators on column headers when filters are active
- **Search result highlighting** — Matched search terms highlighted with a yellow marker in cells
- **Custom filter components** — Provide your own filter UI per column via `renderFilter`

### Columns

- **Column visibility** — Toggle columns on/off, persisted to localStorage
- **Column ordering** — Drag-to-reorder via GripVertical handles, persisted to localStorage
- **Column resizing** — Drag-to-resize widths, persisted to localStorage
- **Column pinning** — Pin columns to left or right via context menu with sticky positioning
- **Column groups** — Group columns under shared headers with custom background colors
- **Column header context menu** — Right-click for sort, hide, pin/unpin actions
- **Responsive column collapse** — Auto-hide columns on small screens based on priority levels
- **Fluent column builder** — `ColumnBuilder::make('price', 'Price')->currency('EUR')->sortable()->build()`
- **Column prefix/suffix** — Add text before/after cell values (e.g., `->prefix('$')`, `->suffix(' kg')`)
- **Column tooltips** — Hover text on cells, static or dynamic from another column (`->tooltip('description')`)
- **Column descriptions** — Small text below column header labels (`->description('Before tax')`)
- **Line clamping** — CSS line-clamp to truncate long text (`->lineClamp(2)`)
- **Icon columns** — Map values to icon names (`->iconColumn(['active' => 'check-circle'])`)
- **Color columns** — Display color swatches with hex value (`->color()`)
- **Select columns** — Inline dropdown editing (`->select([['label' => 'Active', 'value' => 'active']])`)
- **Stacked/composite columns** — Show multiple fields vertically (`->stacked(['name', 'email'])`)
- **Row index column** — Auto-incrementing row number (`->rowIndex()`)
- **Conditional cell colors** — Map values to color classes (`->colorMap(['active' => 'text-green-600'])`)
- **Icon mapping** — Map values to icon names for display (`->iconMap(['yes' => 'check'])`)
- **HTML/Markdown rendering** — Render cell content as sanitized HTML or Markdown (`->html()`, `->markdown()`)
- **Bulleted lists** — Display array values as bullet points (`->bulleted()`)

### Data Display

- **Footer aggregations** — Per-page computed values (sum, avg, etc.) with custom rendering
- **Full-dataset summaries** — Built-in sum/count/avg/min/max/range across the entire filtered dataset
- **Range summarizer** — Show min–max range for numeric columns (`->summary('range')`)
- **Row grouping** — Group rows by any column with collapsible sections
- **User-selectable grouping** — Dropdown in toolbar to pick which column to group by (`groupByOptions` prop)
- **Date grouping** — Group rows by day, week, month, or year with i18n labels
- **Conditional rules** — Server-side declarative rules for row/cell styling
- **Cell copy to clipboard** — Hover-to-copy button on any cell
- **Density toggle** — Switch between compact, comfortable, and spacious row heights
- **Empty state illustrations** — Customizable SVG illustration for empty tables

### Selection & Actions

- **Bulk actions** — Checkbox selection with configurable action buttons and confirmation dialogs
- **Server-side selection** — "Select all X matching items" across pages with backend ID resolution
- **Row actions** — Per-row dropdown menu with visibility, variant, and confirmation support
- **Action groups** — Nested submenu dropdowns for organizing related actions (`group` property)
- **Forms-in-actions** — Modal forms with text, number, select, textarea, and checkbox fields (`form` property)
- **Header actions** — Custom buttons in the table toolbar (e.g., "Create New") via `headerActions` prop
- **Replicate action** — Duplicate a row with a single click (i18n label: "Duplicate")
- **Force-delete/Restore** — Soft delete management actions with confirmation dialogs
- **Shift+click range selection** — Select a range of rows by holding Shift
- **Radio button selection** — Single-select mode via `selectionMode="radio"`
- **Row selection persistence** — Selections persist across page navigation via localStorage

### Filter UX

- **Filter chips** — Removable badge chips above the table showing active filters with one-click clear
- **Active filter indicators** — Dot indicators on column headers when filters are active

### Editing

- **Inline editing** — Double-click to edit cells with server-side PATCH save
- **Batch inline editing** — Edit a column value across multiple selected rows at once
- **Undo/redo** — Stack-based undo/redo for inline edits with Ctrl+Z / Ctrl+Y
- **Boolean toggle switch** — One-click switch to toggle boolean columns inline (uses Inertia `router.patch`)
- **Inline row creation** — "Add row" button with inline form for creating new records
- **Auto-validation by type** — Inline edit rules auto-generated from column type (e.g., `email` → `required|email|max:255`)
- **Toast notifications** — Success/error toasts with auto-dismiss on inline edits and toggles
- **Rate limiting** — Configurable per-minute limits on inline edits, toggles, exports, and imports

### Security

- **Authorization hooks** — Override `tableAuthorize($action, $request)` to gate export, import, inline edit, and toggle actions
- **HTML sanitization** — All rendered HTML content is sanitized via DOMPurify (with regex fallback)
- **Soft delete safeguards** — Toggle and inline edit controllers prevent mutation of trashed/soft-deleted records
- **Rate limiting** — Per-user rate limiting on all mutation endpoints (configurable per action)

### Data Import/Export

- **XLSX/CSV/PDF export** — Via Maatwebsite Excel with optional queued exports and DomPDF
- **Export with progress** — Spinner and blob download instead of raw navigation
- **Export status polling** — Dedicated `/export-status` endpoint for polling queued export completion
- **CSV/Excel import** — Upload dialog with file validation and error handling
- **Export/import rate limiting** — Configurable per-minute limits (default: 10 exports, 5 imports)

### Row Features

- **Row drag-and-drop reorder** — Drag rows to reorder with server-side position persistence
- **Detail rows** — Expandable inline rows, centered modal dialog, or side drawer/sheet
- **Row links / click handlers** — Make rows clickable with href links or custom callbacks
- **Soft deletes toggle** — Show/hide trashed records with a single click
- **Row data attributes** — Add custom `data-*` attributes to rows for styling/testing

### Views

- **Quick Views** — Server-defined filter presets
- **Saved Views** — User-saved custom views (localStorage or database-persisted across devices)

### Navigation & Accessibility

- **Keyboard navigation** — Arrow keys, Enter, Escape, Space for accessible table interaction
- **Keyboard shortcuts overlay** — Press `?` to see all available shortcuts
- **Ctrl+F search focus** — Press `Ctrl+F` / `Cmd+F` to jump to the search input
- **ARIA attributes** — `role="grid"`, `aria-sort`, `aria-rowindex`, `aria-selected` on table elements
- **Toggle ARIA** — `role="switch"`, `aria-checked`, `aria-label` on boolean toggle cells
- **Drag handle ARIA** — `aria-label="Drag to reorder"` on row reorder handles
- **Accessible toasts** — `aria-live="polite"` + `role="status"` on toast notification container
- **Print-friendly** — `@media print` stylesheet with print button

### Responsive

- **Mobile card layout** — Automatic card-based layout on small screens via `mobileBreakpoint` prop
- **Responsive column collapse** — Auto-hide columns on small screens based on priority levels
- **Mobile toolbar stacking** — Toolbar wraps gracefully on small screens with `flex-wrap` and `min-w-0`

### Real-time & Performance

- **Real-time updates** — Laravel Echo integration for auto-refreshing on server events
- **Auto-refresh polling** — Timer-based automatic data refresh at configurable intervals
- **Deferred/lazy loading** — Render table shell immediately, load data asynchronously
- **Virtual scrolling** — Lightweight built-in `useVirtualRows` hook — no external dependencies needed
- **Lazy detail rows** — Detail row content only renders when expanded (inline) or opened (modal/drawer)
- **Undo/redo cleanup** — Undo and redo stacks are automatically cleared on component unmount to prevent memory leaks
- **Persist state** — Save filters/sort/pagination to localStorage across page reloads
- **Partial reloads** — Inertia.js partial reload support for optimized data fetching
- **Inertia v2 prefetching** — Pagination buttons prefetch the next/prev page on hover for instant navigation
- **Loading state** — Skeleton rows and spinner during Inertia navigation
- **Inertia router for mutations** — Toggle and import use `router.patch`/`router.post` instead of raw `fetch()`

### Internationalization

- **i18n / translations** — Full translation system with English and French built-in
- **8 built-in languages** — EN, FR, ES, DE, PT, AR, ZH, JA via artisan command
- **Fully customizable** — Override any translation string via the `translations` prop

### Developer Experience

- **Artisan generator** — `php artisan make:data-table Product --export --inline-edit --all`
- **TypeScript generation** — `php artisan data-table:types` generates `.d.ts` from PHP classes
- **Translation generation** — `php artisan data-table:translations --lang=es` generates i18n files
- **Audit report** — `php artisan data-table:audit-report --days=7 --format=table` CLI report
- **Testing helpers** — `DataTableTestHelper::for(Table::class)->assertColumnExists('x')->assertSortable('x')`
- **Publishable config** — `php artisan vendor:publish --tag=data-table-config`
- **Audit log** — `HasAuditLog` trait records inline edits, toggles, reorders, and bulk actions
- **Layout slots** — Composable slot overrides for toolbar, pagination, and surrounding content
- **Barrel exports** — First-class `index.ts` barrel with all hooks, components, and types
- **Composable hooks** — `useDataTable` and `useDataTableFilters` for headless usage without `<DataTable>`
- **JSX column API** — `<DataTable.Column id="name" renderCell={...} />` declarative column configuration
- **State change callback** — `onStateChange` event callback for reacting to any table state change

## Requirements

### PHP

| Package | Version |
|---------|---------|
| PHP | ^8.2 |
| Laravel | ^11.0 \| ^12.0 |
| spatie/laravel-data | ^4.0 |
| spatie/laravel-query-builder | ^6.0 |

**Optional:**
- `maatwebsite/excel ^3.1` — for XLSX/CSV export
- `barryvdh/laravel-dompdf ^2.0 || ^3.0` — for PDF export
- `spatie/laravel-typescript-transformer ^2.5` — for TypeScript type generation from DTOs

### JavaScript

Your project must be set up with [shadcn/ui](https://ui.shadcn.com) (React + Tailwind CSS).

The `shadcn add` command will automatically install all required shadcn components (button, table, checkbox, skeleton, etc.) and npm dependencies (`@tanstack/react-table`, `@inertiajs/react`, `date-fns`, `lucide-react`).

## Installation

### 1. Install the Composer package

```bash
composer require machour/laravel-data-table
```

### 2. Install the React components via shadcn

```bash
npx shadcn@latest add ./vendor/machour/laravel-data-table/react/public/r/data-table.json
```

This copies all DataTable components into your project (you own the code!) and installs the required shadcn UI dependencies automatically.

### 3. (Optional) Publish config

```bash
php artisan vendor:publish --tag=data-table-config
```

This publishes `config/data-table.php` with defaults for pagination, middleware, routes, export, and import.

### 4. (Optional) Publish migrations

```bash
php artisan vendor:publish --tag=data-table-migrations
php artisan migrate
```

This creates:
- `data_table_saved_views` — for backend-persisted saved views
- `data_table_audit_log` — for changelog/audit trail (used with `HasAuditLog` trait)

### 5. (Optional) Install export dependencies

```bash
# For XLSX/CSV export
composer require maatwebsite/excel

# For PDF export (additionally)
composer require barryvdh/laravel-dompdf
```

## Quick Start

### 1. Scaffold with the Artisan command

```bash
php artisan make:data-table Product
```

This generates:
- `app/DataTables/ProductDataTable.php` — your DataTable class
- `resources/js/pages/product-table.tsx` — a React page stub

Available options:

```bash
php artisan make:data-table Product --export            # Include HasExport trait
php artisan make:data-table Product --inline-edit       # Include HasInlineEdit trait
php artisan make:data-table Product --select-all        # Include HasSelectAll trait
php artisan make:data-table Product --reorder           # Include HasReorder trait
php artisan make:data-table Product --import            # Include HasImport trait
php artisan make:data-table Product --toggle            # Include HasToggle trait
php artisan make:data-table Product --soft-deletes      # Enable soft deletes
php artisan make:data-table Product --detail-rows       # Enable detail rows
php artisan make:data-table Product --searchable=name   # Searchable columns
php artisan make:data-table Product --pagination=cursor # Pagination type
php artisan make:data-table Product --resource          # Generate API Resource
php artisan make:data-table Product --route             # Append route to web.php
php artisan make:data-table Product --all               # Include all traits
php artisan make:data-table Product --route-file=routes/api.php  # Custom route file
php artisan make:data-table Product --page-path=resources/js/views # Custom React page path
```

### 2. Or create your DataTable class manually

```php
<?php

namespace App\DataTables;

use Machour\DataTable\AbstractDataTable;
use Machour\DataTable\Columns\Column;
use App\Models\Product;
use Illuminate\Database\Eloquent\Builder;

class ProductDataTable extends AbstractDataTable
{
    public function __construct(
        public int $id,
        public string $name,
        public float $price,
        public ?string $created_at,
    ) {}

    public static function fromModel(Product $model): self
    {
        return new self(
            id: $model->id,
            name: $model->name,
            price: $model->price,
            created_at: $model->created_at?->format('Y-m-d H:i'),
        );
    }

    public static function tableColumns(): array
    {
        return [
            new Column(id: 'id', label: 'ID', type: 'number', sortable: true),
            new Column(id: 'name', label: 'Name', type: 'text', sortable: true, filterable: true),
            new Column(id: 'price', label: 'Price', type: 'number', sortable: true, filterable: true),
            new Column(id: 'created_at', label: 'Created at', type: 'date', sortable: true, filterable: true),
        ];
    }

    public static function tableBaseQuery(): Builder
    {
        return Product::query();
    }

    public static function tableDefaultSort(): string
    {
        return '-created_at';
    }
}
```

### 3. Add a route

```php
use App\DataTables\ProductDataTable;
use Inertia\Inertia;

Route::get('/products', function () {
    return Inertia::render('products', [
        'tableData' => ProductDataTable::makeTable(),
    ]);
});
```

### 4. Create your React page

```tsx
import { DataTable } from "laravel-data-table";
import type { DataTableResponse } from "laravel-data-table";
import { Head } from "@inertiajs/react";

type Row = App.DataTables.ProductDataTable;

interface Props {
    tableData: DataTableResponse<Row>;
}

export default function ProductsPage({ tableData }: Props) {
    return (
        <>
            <Head title="Products" />
            <DataTable<Row>
                tableData={tableData}
                tableName="products"
            />
        </>
    );
}
```

That's it! You get sorting, filtering, pagination, column visibility, and column ordering out of the box.

---

## Backend API

### `AbstractDataTable`

Extend this class for each model. It extends `Spatie\LaravelData\Data`, so it's both a DTO and table configuration.

| Method | Required | Description |
|--------|----------|-------------|
| `tableColumns()` | **Yes** | Returns `Column[]` defining the table structure |
| `tableBaseQuery()` | **Yes** | Returns the base Eloquent `Builder` |
| `tableDefaultSort()` | No | Default sort column (prefix with `-` for desc). Default: `'-id'` |
| `tablePaginationType()` | No | `'standard'`, `'simple'`, or `'cursor'`. Default: `'standard'` |
| `tableSearchableColumns()` | No | Column names for global search. Default: `[]` |
| `tableResource()` | No | API Resource class for row transformation. Default: `null` |
| `tableQuickViews()` | No | Returns `QuickView[]` for filter presets |
| `tableAllowedFilters()` | No | Auto-derived from `filterable: true` columns |
| `tableAllowedSorts()` | No | Auto-derived from `sortable: true` columns |
| `tableFooter(Collection)` | No | Compute per-page footer aggregations |
| `tableSummary(Builder)` | No | Compute full-dataset aggregations |
| `tableGroupByColumn()` | No | Column ID to group rows by. Default: `null` |
| `tableDetailRowEnabled()` | No | Enable expandable rows. Default: `false` |
| `tableDetailRow(Model)` | No | Return detail data array for the given model |
| `tableSoftDeletesEnabled()` | No | Show soft-delete toggle. Default: `false` |
| `tableWithTrashedDefault()` | No | Default state of trashed toggle. Default: `false` |
| `tableRules()` | No | Conditional rule arrays for row/cell styling |
| `tablePollingInterval()` | No | Auto-refresh interval in seconds. Default: `0` |
| `tablePersistState()` | No | Persist filters/sorts to localStorage. Default: `false` |
| `tableDeferLoading()` | No | Defer data loading. Default: `false` |
| `tableAsyncFilterColumns()` | No | Column IDs with lazy-loaded filter options |
| `resolveAsyncFilterOptions(column, ?search)` | No | Return filter options for an async column |
| `tableEnumFilters()` | No | Map column IDs to BackedEnum classes |
| `tableCascadingFilters()` | No | Map child → parent column IDs |
| `resolveCascadingFilterOptions(column, parentValues)` | No | Return cascading options |
| `tableDetailDisplay()` | No | Detail row display mode: `'inline'`, `'modal'`, `'drawer'`. Default: `'inline'` |
| `tableEagerLoad()` | No | Auto-derived from column `relation` fields. Override to add extra relationships |
| `tableAuthorize(string $action, Request $request)` | No | Authorization gate for actions (`export`, `import`, `inline_edit`, `toggle`). Return `false` to deny. Default: `true` |
| `buildFilteredQuery(?Request, ?prefix)` | Inherited | Builds a filtered+sorted QueryBuilder (shared by table, export, select-all) |
| `makeTable(?Request, ?string)` | Inherited | Builds the `DataTableResponse`. Optional `$prefix` for multi-table pages |

**Per-class overrides:**

Override these protected static properties in your DataTable subclass to customize per-page defaults at the class level (instead of globally via config):

```php
class ProductDataTable extends AbstractDataTable
{
    protected static ?int $defaultPerPage = 50;  // Override config('data-table.default_per_page')
    protected static ?int $maxPerPage = 200;     // Override config('data-table.max_per_page')
}
```

### `Column`

```php
new Column(
    id: 'price',             // Must match DTO property name
    label: 'Price',          // Display label
    type: 'currency',        // See Column Types below
    sortable: true,          // Allow sorting
    filterable: true,        // Show in filter bar
    visible: true,           // Default visibility (user can toggle)
    options: [...],          // For option/badge: [['label' => 'X', 'value' => 'x', 'variant' => 'success']]
    min: 0,                  // For number range filter
    max: 100000,             // For number range filter
    icon: 'check',           // Lucide icon name
    searchThreshold: 5,      // Show search in option filter if >= N options
    group: 'Details',        // Group columns under a header
    editable: true,          // Enable inline editing
    currency: 'EUR',         // Currency code for type=currency
    locale: 'fr-FR',         // Locale for formatting
    summary: 'sum',          // Aggregation: 'sum', 'count', 'avg', 'min', 'max', 'range'
    toggleable: true,        // Boolean toggle switch
    responsivePriority: 3,   // Auto-hide on small screens (lower = hidden first)
    internalName: 'user.name', // Database column path (for relational/aliased columns)
    relation: 'user',        // Relationship to eager load
    prefix: '$',             // Text before cell value
    suffix: ' USD',          // Text after cell value
    tooltip: 'description',  // Hover tooltip (static text or column ID)
    description: 'Before tax', // Text below column header
    lineClamp: 2,            // CSS line clamp for long text
    iconMap: ['active' => '✓'], // Map values to icons (for type=icon)
    colorMap: ['high' => 'text-red-600'], // Map values to CSS classes
    selectOptions: [['label' => 'A', 'value' => 'a']], // For type=select
    html: false,             // Render cell as HTML
    markdown: false,         // Render cell as Markdown
    bulleted: false,         // Display arrays as bullet lists
    stacked: ['name', 'email'], // Stack multiple columns vertically
    rowIndex: false,         // Auto-incrementing row number
);
```

### `ColumnBuilder` (Fluent API)

For a cleaner column definition syntax:

```php
use Machour\DataTable\Columns\ColumnBuilder;

public static function tableColumns(): array
{
    return [
        ColumnBuilder::make('id', 'ID')->number()->sortable()->build(),
        ColumnBuilder::make('name', 'Name')->text()->sortable()->filterable()->editable()->build(),
        ColumnBuilder::make('price', 'Price')->currency('EUR')->sortable()->filterable()->summary('sum')->build(),
        ColumnBuilder::make('status', 'Status')->badge()->options([
            ['label' => 'Active', 'value' => 'active', 'variant' => 'success'],
            ['label' => 'Draft', 'value' => 'draft', 'variant' => 'warning'],
        ])->filterable()->build(),
        ColumnBuilder::make('email', 'Email')->email()->filterable()->responsivePriority(2)->build(),
        ColumnBuilder::make('is_active', 'Active')->boolean()->toggleable()->build(),
        ColumnBuilder::make('photo', 'Photo')->image()->hidden()->build(),

        // Filament-inspired column features:
        ColumnBuilder::make('row_num', '#')->rowIndex()->build(),
        ColumnBuilder::make('weight', 'Weight')->number()->prefix('#')->suffix(' kg')->build(),
        ColumnBuilder::make('user', 'User')->stacked(['name', 'email'])->build(),
        ColumnBuilder::make('status_icon', 'Status')
            ->iconColumn(['active' => 'check-circle', 'inactive' => 'x-circle'])->build(),
        ColumnBuilder::make('brand_color', 'Color')->color()->build(),
        ColumnBuilder::make('priority', 'Priority')->select([
            ['label' => 'Low', 'value' => 'low'],
            ['label' => 'High', 'value' => 'high'],
        ])->build(),
        ColumnBuilder::make('bio', 'Bio')->text()->lineClamp(2)->build(),
        ColumnBuilder::make('score', 'Score')
            ->number()->colorMap(['high' => 'text-green-600', 'low' => 'text-red-600'])
            ->tooltip('Performance score')->description('Out of 100')->build(),
        ColumnBuilder::make('notes', 'Notes')->text()->markdown()->build(),
        ColumnBuilder::make('tags', 'Tags')->text()->bulleted()->build(),
        ColumnBuilder::make('revenue', 'Revenue')->currency('USD')->summary('range')->build(),
    ];
}
```

#### Column Types

| Type | Description | Rendering |
|------|-------------|-----------|
| `text` | String content | Displayed as-is |
| `number` | Numeric content | Right-aligned with `toLocaleString()` formatting |
| `date` | Date content | Displayed as-is (format in your DTO) |
| `option` | Single-select option | Displayed as-is (use `renderCell` for custom) |
| `multiOption` | Multi-select option | Displayed as-is |
| `boolean` | True/false | Green check or red X icon |
| `image` | Image URL | 32x32 rounded thumbnail |
| `badge` | Status badge | Colored pill with variant styling |
| `currency` | Monetary value | Locale-aware currency formatting (e.g., `$1,234.56`) |
| `percentage` | Percentage value | Locale-aware percent formatting (e.g., `42%`) |
| `link` | URL | Clickable link with external icon |
| `email` | Email address | Clickable `mailto:` link |
| `phone` | Phone number | Clickable `tel:` link |
| `icon` | Icon mapping | Displays icon name from `iconMap` based on cell value |
| `color` | Color swatch | Shows colored square with hex code |
| `select` | Inline dropdown | Editable select dropdown with `selectOptions` |

#### Badge Variants

| Variant | Colors |
|---------|--------|
| `default` | Primary color |
| `success` | Green |
| `warning` | Yellow |
| `danger` | Red |
| `info` | Blue |
| `secondary` | Muted gray |

#### Column Modifiers (ColumnBuilder Fluent API)

All `ColumnBuilder` methods return `$this` for chaining. Call `->build()` at the end to create the `Column` instance.

| Method | Description | Example |
|--------|-------------|---------|
| `sortable(bool)` | Enable sorting | `->sortable()` |
| `filterable(bool)` | Enable filtering | `->filterable()` |
| `visible(bool)` | Set default visibility | `->visible(false)` |
| `hidden()` | Hide by default (shorthand for `visible(false)`) | `->hidden()` |
| `editable(bool)` | Enable inline editing | `->editable()` |
| `toggleable(bool)` | Enable boolean toggle switch | `->toggleable()` |
| `options(array)` | Set filter/badge options | `->options([['label' => 'A', 'value' => 'a']])` |
| `range(?float, ?float)` | Set min/max for number range filter | `->range(0, 1000)` |
| `icon(string)` | Set Lucide icon name | `->icon('star')` |
| `searchThreshold(int)` | Show search in filter dropdown at N+ options | `->searchThreshold(5)` |
| `group(string)` | Group column under a shared header | `->group('Contact')` |
| `locale(string)` | Locale for number/currency formatting | `->locale('fr-FR')` |
| `summary(string)` | Aggregation type for footer (`sum`, `avg`, `min`, `max`, `count`, `range`) | `->summary('sum')` |
| `responsivePriority(int)` | Auto-hide on small screens (lower = hidden first) | `->responsivePriority(2)` |
| `internalName(string)` | Database column path or relation dot-notation | `->internalName('user.name')` |
| `relation(string)` | Relationship to eager load | `->relation('user')` |
| `belongsTo(string, string)` | Shorthand: sets both `relation` and `internalName` | `->belongsTo('category', 'title')` |
| `currency(?string)` | Set type to currency with code | `->currency('EUR')` |
| `selectOptions(array)` | Options for inline select dropdown | `->selectOptions([...])` |
| `prefix(string)` | Text before cell value | `->prefix('$')` |
| `suffix(string)` | Text after cell value | `->suffix(' kg')` |
| `tooltip(string)` | Hover tooltip (static text or column ID) | `->tooltip('description')` |
| `description(string)` | Small text below column header | `->description('Before tax')` |
| `lineClamp(int)` | CSS line-clamp to truncate long text | `->lineClamp(2)` |
| `colorMap(array)` | Value → CSS class mapping | `->colorMap(['active' => 'text-green-600'])` |
| `iconMap(array)` | Value → icon name mapping | `->iconMap(['yes' => 'check'])` |
| `stacked(array)` | Stack multiple columns vertically | `->stacked(['name', 'email'])` |
| `rowIndex()` | Auto-incrementing row number | `->rowIndex()` |
| `html()` | Render cell as sanitized HTML | `->html()` |
| `markdown()` | Render cell as Markdown | `->markdown()` |
| `bulleted()` | Display array values as bullet list | `->bulleted()` |

**Type setters:** `text()`, `number()`, `date()`, `option(?array)`, `multiOption(?array)`, `boolean()`, `image()`, `badge(?array)`, `currency(?string)`, `percentage()`, `link()`, `email()`, `phone()`, `iconColumn(array)`, `color()`, `select(array)`

#### Header Actions

Add custom action buttons to the table toolbar:

```tsx
<DataTable
  tableData={data}
  tableName="products"
  headerActions={[
    { label: "Create New", icon: Plus, onClick: () => router.visit('/products/create') },
    { label: "Sync", icon: RefreshCw, variant: "outline", onClick: handleSync },
  ]}
/>
```

#### Action Groups (Nested Submenus)

Organize row actions into nested dropdown groups:

```tsx
<DataTable
  actions={[
    { label: "Edit", onClick: (row) => router.visit(`/products/${row.id}/edit`) },
    {
      label: "Status",
      group: [
        { label: "Activate", onClick: (row) => activate(row) },
        { label: "Deactivate", onClick: (row) => deactivate(row) },
      ],
    },
    { label: "Delete", variant: "destructive", confirm: true, onClick: (row) => destroy(row) },
  ]}
/>
```

#### Forms-in-Actions (Modal Forms)

Attach a form to a row action — a modal dialog will open with the specified fields:

```tsx
<DataTable
  actions={[
    {
      label: "Change Status",
      form: [
        { name: "status", label: "New Status", type: "select", options: [
          { label: "Active", value: "active" },
          { label: "Inactive", value: "inactive" },
        ]},
        { name: "reason", label: "Reason", type: "textarea", required: true },
      ],
      onClick: (row) => {
        const formValues = (row as any)._formValues;
        updateStatus(row.id, formValues.status, formValues.reason);
      },
    },
  ]}
/>
```

#### User-Selectable Grouping

Allow users to pick which column to group rows by:

```tsx
<DataTable
  tableData={data}
  tableName="orders"
  groupByOptions={["status", "category", "customer_name"]}
  onGroupByChange={(columnId) => console.log("Grouped by:", columnId)}
/>
```

#### Range Summarizer

Show a min–max range in the summary footer:

```php
ColumnBuilder::make('price', 'Price')->currency('USD')->summary('range')->build(),
// Renders: "Range $50 – $500" in the summary row
```

### Traits

#### HasExport

XLSX/CSV/PDF export support:

```php
use Machour\DataTable\Concerns\HasExport;

class ProductDataTable extends AbstractDataTable
{
    use HasExport;

    public static function tableExportEnabled(): bool { return true; }
    public static function tableExportName(): string { return 'products'; }
    public static function tableExportFilename(): string|\Closure { return 'products-export'; }
}
```

Register the controller:

```php
DataTableExportController::register('products', ProductDataTable::class);
```

Three formats supported: XLSX, CSV, PDF. Queued exports available via config.

Dynamic filenames based on active filters:

```php
public static function tableExportFilename(): string|\Closure
{
    return fn (array $filters) => 'products-' . ($filters['status'] ?? 'all') . '-' . date('Y-m-d');
}
```

Override the export query to customize what gets exported:

```php
public static function makeExportQuery(?\Illuminate\Http\Request $request = null): \Spatie\QueryBuilder\QueryBuilder
{
    return parent::makeExportQuery($request)->where('is_active', true);
}
```

#### HasInlineEdit

Double-click-to-edit cells:

```php
use Machour\DataTable\Concerns\HasInlineEdit;

class ProductDataTable extends AbstractDataTable
{
    use HasInlineEdit;

    public static function tableInlineEditModel(): string
    {
        return \App\Models\Product::class;
    }

    // Optional: custom validation per column
    // If not overridden, rules are auto-generated from column type:
    //   number → required|numeric
    //   currency → required|numeric|min:0
    //   percentage → required|numeric|min:0|max:100
    //   date → required|date
    //   email → required|email|max:255
    //   phone → required|string|max:50
    //   link → required|url|max:2048
    //   boolean → required|boolean
    //   select → required|string|max:255
    //   default → required|string|max:65535
    public static function tableInlineEditRules(string $columnId): array
    {
        return match ($columnId) {
            'price' => ['value' => 'required|numeric|min:0'],
            default => ['value' => 'required'],
        };
    }
}
```

```php
DataTableInlineEditController::register('products', ProductDataTable::class);
```

```tsx
<DataTable<Row>
    tableData={tableData}
    tableName="products"
    onInlineEdit={async (row, columnId, value) => {
        await fetch(`/data-table/inline-edit/products/${row.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrfToken },
            body: JSON.stringify({ column: columnId, value }),
        });
        router.reload();
    }}
    options={{ undoRedo: true }}  // Enable Ctrl+Z / Ctrl+Y undo/redo
/>
```

#### HasToggle

One-click boolean toggle switch for columns:

```php
use Machour\DataTable\Concerns\HasToggle;

class ProductDataTable extends AbstractDataTable
{
    use HasToggle;

    public static function tableToggleModel(): string { return \App\Models\Product::class; }
    public static function tableToggleName(): string { return 'products'; }

    // Optional: custom toggle logic (default just updates the column)
    public static function handleToggle(\Illuminate\Database\Eloquent\Model $model, string $columnId, bool $value): void
    {
        $model->update([$columnId => $value]);
        // e.g. fire an event, clear cache, etc.
    }
}
```

Register the controller:

```php
DataTableToggleController::register('products', ProductDataTable::class);
```

Mark columns as toggleable in your column definitions:

```php
new Column(id: 'is_active', label: 'Active', type: 'boolean', toggleable: true);
// or with ColumnBuilder:
ColumnBuilder::make('is_active', 'Active')->boolean()->toggleable()->build();
```

#### HasSelectAll

"Select all X matching items" across pages:

```php
use Machour\DataTable\Concerns\HasSelectAll;

class ProductDataTable extends AbstractDataTable
{
    use HasSelectAll;

    public static function tableSelectAllName(): string { return 'products'; }

    // Optional: customize the primary key column (default: 'id')
    public static function tableSelectAllKey(): string { return 'uuid'; }
}
```

```php
DataTableSelectAllController::register('products', ProductDataTable::class);
```

#### HasReorder

Drag-and-drop row reorder:

```php
use Machour\DataTable\Concerns\HasReorder;

class ProductDataTable extends AbstractDataTable
{
    use HasReorder;

    public static function tableReorderModel(): string { return \App\Models\Product::class; }
    public static function tableReorderName(): string { return 'products'; }
    // Optional: change the order column (default: 'position')
    public static function tableReorderColumn(): string { return 'sort_order'; }
}
```

```php
DataTableReorderController::register('products', ProductDataTable::class);
```

```tsx
<DataTable<Row>
    tableData={tableData}
    tableName="products"
    options={{ rowReorder: true }}
    onReorder={async (ids, newPositions) => {
        await fetch('/data-table/reorder/products', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrfToken },
            body: JSON.stringify({ ids, positions: newPositions }),
        });
        router.reload();
    }}
/>
```

#### HasImport

CSV/Excel file import:

```php
use Machour\DataTable\Concerns\HasImport;

class ProductDataTable extends AbstractDataTable
{
    use HasImport;

    public static function tableImportName(): string { return 'products'; }

    // Optional: customize file validation rules
    public static function tableImportRules(): array
    {
        return [
            'file' => 'required|file|max:20480|mimes:csv,xlsx', // 20MB, CSV/XLSX only
        ];
    }

    // Custom import logic — receives the temp file path and extension
    public static function processImport(string $filePath, string $extension): array
    {
        $imported = 0;
        $errors = [];
        // Parse the file and create/update records...
        return ['created' => $imported, 'updated' => 0, 'errors' => $errors];
    }
}
```

```php
DataTableImportController::register('products', ProductDataTable::class);
```

#### Controller Registration Summary

Every feature that uses a controller needs to be registered. Here's the full list:

```php
use Machour\DataTable\Http\Controllers\*;

// In a service provider or routes file:
DataTableExportController::register('products', ProductDataTable::class);
DataTableInlineEditController::register('products', ProductDataTable::class);
DataTableToggleController::register('products', ProductDataTable::class);
DataTableSelectAllController::register('products', ProductDataTable::class);
DataTableReorderController::register('products', ProductDataTable::class);
DataTableImportController::register('products', ProductDataTable::class);
DataTableDetailRowController::register('products', ProductDataTable::class);
DataTableAsyncFilterController::register('products', ProductDataTable::class);
DataTableCascadingFilterController::register('products', ProductDataTable::class);
```

#### HasAuditLog

Record all data mutations to a changelog table:

```php
use Machour\DataTable\Concerns\HasAuditLog;

class ProductDataTable extends AbstractDataTable
{
    use HasAuditLog;

    public static function tableAuditLogName(): string { return 'products'; }

    // Optional: disable audit logging
    // public static function tableAuditLogEnabled(): bool { return false; }
}
```

The trait provides these logging methods:

```php
// Automatically log changes in your controllers or event listeners:
ProductDataTable::logInlineEdit($model, 'price', $oldValue, $newValue);
ProductDataTable::logToggle($model, 'is_active', false, true);
ProductDataTable::logReorder($ids, $positions);
ProductDataTable::logBulkAction('delete', $rowIds);

// Query the audit log:
$entries = ProductDataTable::getAuditLog(limit: 50);
$rowHistory = ProductDataTable::getRowAuditLog(rowId: 42);
```

Each entry records: table name, action type, row ID, column, old/new values, user ID, IP address, and timestamp.

#### Trait Method Reference

Each trait provides these public methods (most are auto-derived; override for customization):

**HasExport:**

| Method | Description |
|--------|-------------|
| `tableExportEnabled(): bool` | *Abstract.* Whether export is enabled |
| `tableExportName(): string` | *Abstract.* Table name for routing |
| `tableExportFilename(): string\|Closure` | *Abstract.* Filename (or closure receiving filters) |
| `tableExportColumns(): array` | Returns `[id, label]` pairs. Auto-filters out `image` columns. Override to customize |
| `resolveExportUrl(): string` | Full URL to export endpoint (used by `makeTable()`) |
| `resolveExportFilename(?Request): string` | Resolves and sanitizes the export filename |
| `downloadExport(string $format, ?Request): BinaryFileResponse` | Core method: builds query, resolves columns, returns download |
| `makeExportQuery(?Request): QueryBuilder` | Builds the filtered query for export |

**HasInlineEdit:**

| Method | Description |
|--------|-------------|
| `tableInlineEditModel(): string` | *Abstract.* Model class for editing |
| `tableEditableColumns(): array` | Returns editable column IDs. Auto-derived from `editable: true` columns |
| `tableInlineEditRules(string $columnId): array` | Validation rules. Auto-generated from column type (override to customize) |
| `handleInlineEdit(Request, int\|string $id): JsonResponse` | Core handler: validates, checks soft deletes, updates model |

**HasSelectAll:**

| Method | Description |
|--------|-------------|
| `tableSelectAllName(): string` | *Abstract.* Table name for routing |
| `tableSelectAllKey(): string` | Primary key column for select-all. Default: `'id'` |
| `resolveSelectAllUrl(): string` | Full URL to select-all endpoint |
| `handleSelectAll(?Request): JsonResponse` | Returns all matching IDs as JSON |

**HasReorder:**

| Method | Description |
|--------|-------------|
| `tableReorderModel(): string` | *Abstract.* Model class for reordering |
| `tableReorderName(): string` | *Abstract.* Table name for routing |
| `tableReorderColumn(): string` | Database column for sort order. Default: `'position'` |
| `resolveReorderUrl(): string` | Full URL to reorder endpoint |
| `handleReorder(Request): JsonResponse` | Receives `ids` array and bulk-updates positions |

**HasImport:**

| Method | Description |
|--------|-------------|
| `tableImportName(): string` | *Abstract.* Table name for routing |
| `tableImportEnabled(): bool` | Whether import is enabled. Default: `true` |
| `tableImportRules(): array` | File validation rules (auto-derived from config) |
| `processImport(string $filePath, string $extension): array` | Custom import logic. Override this |
| `resolveImportUrl(): string` | Full URL to import endpoint |
| `handleImport(Request): JsonResponse` | Core handler: validates upload, calls `processImport()`, returns JSON |

**HasToggle:**

| Method | Description |
|--------|-------------|
| `tableToggleModel(): string` | *Abstract.* Model class for toggle |
| `tableToggleName(): string` | *Abstract.* Table name for routing |
| `resolveToggleUrl(): string` | Full URL to toggle endpoint |
| `handleToggle(Model, string $columnId, bool $value): void` | Updates the boolean column on the model |

**HasAuditLog:**

| Method | Description |
|--------|-------------|
| `tableAuditLogName(): string` | *Abstract.* Table name for audit entries |
| `tableAuditLogTable(): string` | Database table name. Default: `'data_table_audit_log'` |
| `tableAuditLogEnabled(): bool` | Whether logging is enabled. Default: `true` |

### PHP Data Transfer Objects

**`DataTableResponse`** — The Spatie Data DTO returned by `makeTable()`:

```php
class DataTableResponse extends Data {
    public array $data;                  // Paginated row data
    public array $columns;               // Column[] definitions
    public array $quickViews;            // QuickView[] with active flags
    public DataTableMeta $meta;          // Pagination metadata
    public ?string $exportUrl;           // Export endpoint URL
    public ?array $footer;               // Per-page footer aggregations
    public ?string $selectAllUrl;        // Select-all endpoint URL
    public ?array $summary;              // Full-dataset summary aggregations
    public ?array $config;               // Frontend feature config (detail rows, soft deletes, etc.)
    public ?string $toggleUrl;           // Toggle endpoint URL
    public ?array $enumOptions;          // Enum filter options resolved from PHP BackedEnum classes
    public ?string $reorderUrl;          // Reorder endpoint URL
    public ?string $importUrl;           // Import endpoint URL
    public ?string $groupByColumn;       // Column ID to group rows by
}
```

**`DataTableMeta`** — Pagination metadata:

```php
class DataTableMeta extends Data {
    public int $currentPage;
    public int $lastPage;
    public int $perPage;
    public int $total;
    public array $sorts;                 // DataTableSort[] {id, direction}
    public array $filters;               // Active filter state
    public string $paginationType;       // 'standard', 'simple', 'cursor'
    public ?string $nextCursor;
    public ?string $prevCursor;
}
```

**`DataTableExport`** — Maatwebsite Excel export class (implements `FromQuery`, `WithHeadings`, `WithMapping`). Receives a Builder and column definitions. Override or extend for custom export formatting.

### Pagination Types

```php
// Standard (default): Full pagination with page numbers and total count
public static function tablePaginationType(): string { return 'standard'; }

// Simple: Previous/Next only, no total count (faster for large datasets)
public static function tablePaginationType(): string { return 'simple'; }

// Cursor: Most efficient for very large datasets
public static function tablePaginationType(): string { return 'cursor'; }
```

### `QuickView`

```php
new QuickView(
    id: 'recent',
    label: 'Recent',
    params: [
        'filter[created_at]' => 'after:' . now()->subDays(7)->toDateString(),
        'sort' => '-created_at',
    ],
    icon: 'calendar',         // Lucide icon name shown next to the label
    columns: ['id', 'name', 'created_at'], // Only show these columns when this view is active (null = no change)
);
```

| Property | Type | Description |
|----------|------|-------------|
| `id` | `string` | Unique identifier |
| `label` | `string` | Display label |
| `params` | `array` | URL parameters to apply (`filter[x]`, `sort`) |
| `icon` | `?string` | Lucide icon name |
| `columns` | `?string[]` | Column IDs to show (in display order). `null` = keep current visibility |

### `OperatorFilter`

Custom Spatie QueryBuilder filter supporting `operator:value` URL format:

```php
use Machour\DataTable\Filters\OperatorFilter;
use Spatie\QueryBuilder\AllowedFilter;

public static function tableAllowedFilters(): array
{
    return [
        AllowedFilter::custom('price', new OperatorFilter('number')),
        AllowedFilter::custom('name', new OperatorFilter('text')),
        AllowedFilter::custom('status', new OperatorFilter('option')),
        AllowedFilter::custom('created_at', new OperatorFilter('date')),
        AllowedFilter::custom('enabled', new OperatorFilter('boolean')),
        AllowedFilter::custom('display_name', new OperatorFilter('text', 'real_column')),
    ];
}
```

| Type | Default Operator | Available Operators |
|------|-----------------|---------------------|
| `text` | `contains` | `contains`, `eq` |
| `number` | `eq` | `eq`, `neq`, `gt`, `gte`, `lt`, `lte`, `between` |
| `date` | `eq` | `eq`, `before`, `after`, `between` |
| `option` | `in` | `in`, `not_in` |
| `boolean` | `eq` | `eq` |

All types also support `null` and `not_null`.

### Footer & Summary Aggregations

**Per-page footer** — computed from the current page's rows:

```php
public static function tableFooter(\Illuminate\Support\Collection $pageData): array
{
    return [
        'price' => '$' . number_format($pageData->sum('price'), 2),
        'name' => $pageData->count() . ' items on this page',
    ];
}
```

**Full-dataset summary** — computed across all filtered records (not just the current page):

```php
public static function tableSummary(\Spatie\QueryBuilder\QueryBuilder $query): array
{
    $builder = $query->getEloquentBuilder();
    return [
        'price' => $builder->sum('price'),
        'id' => $builder->count(),
    ];
}
```

On the frontend, use `renderFooterCell` to customize how footer values are displayed:

```tsx
<DataTable
    renderFooterCell={(columnId, value) => {
        if (columnId === 'price') return <span className="font-bold text-emerald-600">{value}</span>;
    }}
/>
```

Summary values are rendered automatically using column `summary` types (`sum`, `avg`, `min`, `max`, `count`).

### Conditional Rules (Row/Cell Styling)

```php
public static function tableRules(): array
{
    return [
        [
            'column' => 'stock',
            'operator' => 'lt',
            'value' => 5,
            'row' => ['class' => 'bg-red-50 dark:bg-red-950'],
        ],
        [
            'column' => 'status',
            'operator' => 'eq',
            'value' => 'inactive',
            'cell' => ['class' => 'text-muted-foreground line-through'],
        ],
    ];
}
```

Supported operators: `eq`, `neq`, `gt`, `gte`, `lt`, `lte`, `contains`, `starts_with`, `ends_with`, `is_null`, `is_not_null`, `is_empty`, `is_true`, `is_false`.

### Multiple Tables Per Page

Pass a `prefix` to `makeTable()` to namespace URL parameters:

```php
Route::get('/dashboard', function () {
    return Inertia::render('dashboard', [
        'productsTable' => ProductDataTable::makeTable(prefix: 'products'),
        'ordersTable' => OrderDataTable::makeTable(prefix: 'orders'),
    ]);
});
```

```tsx
<DataTable tableData={productsTable} tableName="products" prefix="products" />
<DataTable tableData={ordersTable} tableName="orders" prefix="orders" />
```

---

## Frontend API

### `<DataTable>` Props

```tsx
interface DataTableProps<TData extends object> {
    // Required
    tableData: DataTableResponse<TData>;   // Server response from makeTable()
    tableName: string;                      // Unique table identifier

    // URL & routing
    prefix?: string;                        // Query param prefix for multi-table pages
    partialReloadKey?: string;              // Inertia partial reload key

    // Row actions
    actions?: DataTableAction<TData>[];     // Per-row dropdown actions
    bulkActions?: DataTableBulkAction<TData>[]; // Bulk action buttons
    selectionMode?: "checkbox" | "radio";   // Selection UI (default: "checkbox")

    // Custom rendering
    renderCell?: (columnId: string, value: unknown, row: TData) => ReactNode | undefined;
    renderHeader?: Record<string, ReactNode>;
    renderFooterCell?: (columnId: string, value: unknown) => ReactNode | undefined;
    renderFilter?: Record<string, (value: unknown, onChange: (value: unknown) => void) => ReactNode>;
    renderDetailRow?: (row: TData) => ReactNode;
    emptyState?: ReactNode;                 // Custom empty state component
    emptyStateIllustration?: ReactNode;     // Custom SVG for empty state

    // Styling
    className?: string;
    rowClassName?: (row: TData) => string;
    rowDataAttributes?: (row: TData) => Record<string, string>;
    groupClassName?: Record<string, string>;

    // Feature toggles
    options?: Partial<DataTableOptions>;
    translations?: Partial<DataTableTranslations>;

    // Callbacks
    onRowClick?: (row: TData) => void;
    rowLink?: (row: TData) => string;
    onInlineEdit?: (row: TData, columnId: string, value: unknown) => Promise<void> | void;
    onReorder?: (ids: unknown[], newPositions: number[]) => Promise<void> | void;
    onBatchEdit?: (rows: TData[], columnId: string, value: unknown) => Promise<void> | void;

    // Real-time
    realtimeChannel?: string;               // Laravel Echo channel name
    realtimeEvent?: string;                 // Echo event name (default: '.updated')

    // Misc
    debounceMs?: number;                    // Input debounce delay (default: 300)
    slots?: {
        toolbar?: ReactNode;
        beforeTable?: ReactNode;
        afterTable?: ReactNode;
        pagination?: ReactNode;
    };

    // New: callbacks & features
    onStateChange?: (state: DataTableState) => void; // Fires on any state change
    onRowCreate?: (data: Record<string, unknown>) => Promise<void> | void; // Inline row creation
    mobileBreakpoint?: number;              // Width in px for mobile card layout (0 = disabled)
    children?: ReactNode;                   // JSX column API: <DataTable.Column ...>
    headerActions?: DataTableHeaderAction[]; // Toolbar action buttons
    groupByOptions?: string[];              // Column IDs for user-selectable grouping
    onGroupByChange?: (columnId: string | null) => void; // Grouping change callback
}
```

### Options (Feature Flags)

All options default to sensible values. Only override what you need:

```tsx
<DataTable
    tableData={tableData}
    tableName="products"
    options={{
        // View controls (default: true)
        quickViews: true,
        customQuickViews: true,
        exports: true,
        filters: true,
        columnVisibility: true,
        columnOrdering: true,

        // Disabled by default — opt in:
        columnResizing: true,        // Drag-to-resize columns
        stickyHeader: true,          // Freeze header on scroll
        globalSearch: true,          // Show global search input
        keyboardNavigation: true,    // Arrow key navigation
        printable: true,             // Print button + @media print styles
        density: true,               // Compact/comfortable/spacious toggle
        copyCell: true,              // Hover-to-copy cell values
        contextMenu: true,           // Right-click column header menu
        rowGrouping: true,           // Group rows by column value
        rowReorder: true,            // Drag-and-drop row reorder
        batchEdit: true,             // Batch edit dialog for selected rows
        searchHighlight: true,       // Highlight search matches in cells
        undoRedo: true,              // Ctrl+Z/Ctrl+Y for inline edits
        columnPinning: true,         // Pin columns left/right
        persistSelection: true,      // Remember row selection across pages
        shortcutsOverlay: true,      // ? key shows keyboard shortcuts
        exportProgress: true,        // Show spinner during export download
        emptyStateIllustration: true, // Show illustration when table is empty
        virtualScrolling: true,      // Lightweight built-in row virtualization (no external deps)

        // Enabled by default:
        loading: true,               // Skeleton during Inertia navigation
    }}
/>
```

### Keyboard Shortcuts

When `keyboardNavigation` is enabled:

| Key | Action |
|-----|--------|
| `↑` / `↓` | Navigate between rows |
| `Enter` | Navigate to focused row (if `rowLink`/`onRowClick`) or expand detail row |
| `Space` | Toggle row selection |
| `Escape` | Clear focus and selection |
| `/` | Focus the search input |
| `Ctrl+F` | Focus the search input (prevents browser find) |
| `?` | Open keyboard shortcuts overlay |
| `Ctrl+Z` | Undo last inline edit |
| `Ctrl+Y` | Redo last undone edit |

### Row Actions

```tsx
const actions: DataTableAction<Row>[] = [
    {
        label: "Edit",
        onClick: (row) => router.visit(`/products/${row.id}/edit`),
    },
    {
        label: "Delete",
        variant: "destructive",
        onClick: (row) => router.delete(`/products/${row.id}`),
        visible: (row) => row.canDelete,
        confirm: {
            title: "Delete this product?",
            description: "This action cannot be undone.",
        },
    },
];
```

### Bulk Actions

```tsx
const bulkActions: DataTableBulkAction<Row>[] = [
    {
        id: "delete",
        label: "Delete",
        icon: Trash2,
        variant: "destructive",
        disabled: (rows) => rows.length === 0,
        onClick: (rows) => router.post("/products/bulk-delete", { ids: rows.map(r => r.id) }),
        confirm: {
            title: "Delete selected products?",
            description: "This will permanently delete the selected items.",
        },
    },
];
```

### Custom Cell Rendering

Use `renderCell` to customize how any cell is rendered:

```tsx
<DataTable<Row>
    tableData={tableData}
    tableName="products"
    renderCell={(columnId, value, row) => {
        if (columnId === 'name') {
            return (
                <div className="flex items-center gap-2">
                    <img src={row.avatar} className="h-6 w-6 rounded-full" />
                    <span className="font-medium">{value}</span>
                </div>
            );
        }
        // Return undefined for default rendering
    }}
/>
```

### Translations (i18n)

Use the built-in French translations:

```tsx
import { frTranslations } from "laravel-data-table";

<DataTable translations={frTranslations} />
```

Override individual strings:

```tsx
<DataTable translations={{
    noData: "Nothing to show",
    loading: "Please wait...",
    selectAllMatching: (count) => `Select all ${count} items`,
}} />
```

Generate translation files for other languages:

```bash
# Generate a Spanish translation file
php artisan data-table:translations --lang=es

# Generate all 8 built-in languages at once
php artisan data-table:translations --all
```

Then import in your React component:

```tsx
import { esTranslations } from "./data-table/i18n-es";

<DataTable translations={esTranslations} />
```

#### All Translation Keys

The `DataTableTranslations` interface has **100+ keys** covering every UI string:

| Category | Keys | Description |
|----------|------|-------------|
| Pagination | `totalResults(count)`, `rowsPerPage`, `pageOf(current, last)` | Pagination controls |
| Table chrome | `columns`, `reorder`, `done`, `noData`, `loading`, `actions` | Core UI |
| Selection | `selectAll`, `selectRow`, `selectAllMatching(count)`, `clearSelection`, `selected(count)` | Row selection |
| Export | `export`, `exportFormat`, `exporting`, `exportReady`, `exportDownload` | Export UI |
| Filters | `filter`, `search`, `operators`, `clearAllFilters`, `noResults`, `pressEnterToFilter`, `activeFilters` | Filter panel |
| Operators | `opContains`, `opExact`, `opEquals`, `opNotEquals`, `opGreaterThan`, `opGreaterOrEqual`, `opLessThan`, `opLessOrEqual`, `opBetween`, `opIs`, `opIsNot`, `opOnDate`, `opBefore`, `opAfter` | 14 filter operators |
| Boolean | `yes`, `no` | Boolean display |
| Number | `min`, `max`, `value` | Number range inputs |
| Editing | `editSave`, `editCancel`, `editSaving`, `save`, `cancel` | Inline editing |
| Confirmation | `confirmTitle`, `confirmDescription`, `confirmAction`, `confirmCancel` | Dialogs |
| Import | `importData`, `importFile`, `importUploading`, `importSuccess`, `importError` | Import dialog |
| Views | `view`, `quickViews`, `savedViews`, `saveFilters`, `manageViews`, `viewName`, `viewNamePlaceholder`, `filtersWillBeSavedLocally`, `filtersLabel`, `none`, `sortLabel`, `columnsCount(visible, total)` | Quick/saved views |
| Grouping | `groupBy`, `ungrouped` | Row grouping |
| Date grouping | `dateGroupDay`, `dateGroupWeek`, `dateGroupMonth`, `dateGroupYear` | Date grouping labels |
| Summary | `summarySum`, `summaryAvg`, `summaryMin`, `summaryMax`, `summaryCount`, `summaryRange` | Footer aggregations |
| Toggle | `toggleOn`, `toggleOff` | Boolean toggle |
| Density | `density`, `densityCompact`, `densityComfortable`, `densitySpacious` | Density toggle |
| Copy | `copied`, `copyToClipboard` | Copy cell |
| Context menu | `sortAscending`, `sortDescending`, `hideColumn`, `pinLeft`, `pinRight`, `unpin`, `pinColumn` | Column context menu |
| Reorder | `reorderRows` | Row drag-and-drop |
| Undo/Redo | `undo`, `redo`, `editUndone`, `editRedone` | Undo/redo stack |
| Batch edit | `batchEdit`, `batchEditApply`, `batchEditColumn`, `batchEditValue` | Batch editing |
| Search | `matches(count)` | Search highlight match count |
| Keyboard | `keyboardShortcuts`, `shortcutNavigation`, `shortcutSelect`, `shortcutExpand`, `shortcutEscape`, `shortcutSearch`, `shortcutHelp`, `close` | Shortcuts overlay |
| Detail row | `expand`, `collapse` | Expandable rows |
| Soft deletes | `showTrashed`, `hideTrashed`, `replicate`, `forceDelete`, `restore` | Soft delete management |
| Polling | `autoRefresh` | Auto-refresh |
| Print | `print` | Print button |
| Row creation | `addRow` | Inline row creation |
| Empty state | `emptyTitle`, `emptyDescription` | Empty table |

### `SavedView` Model

The `SavedView` Eloquent model stores user-saved views in the `data_table_saved_views` table:

| Field | Type | Description |
|-------|------|-------------|
| `user_id` | `int` | Owner of the saved view |
| `table_name` | `string` | DataTable identifier |
| `name` | `string` | Display name |
| `filters` | `array` | Serialized filter state |
| `sort` | `?string` | Sort string |
| `columns` | `?array` | Visible column IDs |
| `column_order` | `?array` | Column display order |
| `is_default` | `bool` | Auto-apply on page load |

**Scopes:** `scopeForTable($query, string $tableName)`, `scopeForUser($query, int|string $userId)`

**Relationship:** `user()` — belongsTo the auth user model

### TypeScript Type Reference

```tsx
// Sort descriptor (used in DataTableMeta.sorts)
interface DataTableSort {
    id: string;
    direction: "asc" | "desc";
}

// Density mode
type DataTableDensity = "compact" | "comfortable" | "spacious";

// Conditional row/cell styling rule (from tableRules())
interface DataTableRule {
    column: string;
    operator: string;
    value: unknown;
    row?: { class?: string };
    cell?: { class?: string };
}

// Server-side table config (from DataTableResponse.config)
interface DataTableConfig {
    detailRowEnabled?: boolean;
    detailDisplay?: "inline" | "modal" | "drawer";
    softDeletesEnabled?: boolean;
    pollingInterval?: number;
    persistState?: boolean;
    deferLoading?: boolean;
    asyncFilterColumns?: string[];
    cascadingFilters?: Record<string, string>;
    rules?: DataTableRule[];
}

// Quick view (frontend version — includes computed `active` boolean)
interface DataTableQuickView {
    id: string;
    label: string;
    params: Record<string, unknown>;
    icon?: string | null;
    active: boolean;
    columns?: string[] | null;
}

// Confirm dialog options (used in actions and bulk actions)
interface DataTableConfirmOptions {
    title?: string;
    description?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: "default" | "destructive";
}

// Row action
interface DataTableAction<TData> {
    label: string;
    icon?: string;                        // Lucide icon name
    onClick: (row: TData) => void;
    variant?: "default" | "destructive";
    visible?: (row: TData) => boolean;
    confirm?: boolean | DataTableConfirmOptions;
    group?: DataTableAction<TData>[];     // Nested submenu
    form?: DataTableFormField[];          // Modal form fields
}

// Bulk action
interface DataTableBulkAction<TData> {
    id: string;
    label: string;
    icon?: React.ComponentType<{ className?: string }>;
    variant?: "default" | "destructive";
    disabled?: (rows: TData[]) => boolean; // Function, not simple boolean
    onClick: (rows: TData[]) => void;
    confirm?: boolean | DataTableConfirmOptions;
}

// Form field for forms-in-actions
interface DataTableFormField {
    name: string;
    label: string;
    type: "text" | "number" | "select" | "textarea" | "checkbox";
    options?: { label: string; value: string }[];
    required?: boolean;
    placeholder?: string;
    defaultValue?: unknown;
}

// Header action button in toolbar
interface DataTableHeaderAction {
    label: string;
    icon?: React.ComponentType<{ className?: string }>;
    onClick: () => void;
    variant?: "default" | "outline" | "destructive" | "ghost";
}

// Filter value (from useDataTableFilters hook)
interface FilterValue {
    operator: string;
    values: string[];
}
type ActiveFilters = Record<string, FilterValue>;
```

### Sub-Component Props

These sub-components are exported for custom layouts:

**`DataTablePagination`:**

```tsx
interface DataTablePaginationProps {
    meta: DataTableMeta;
    onPageChange: (page: number) => void;
    onPerPageChange: (perPage: number) => void;
    onCursorChange?: (cursor: string | null) => void;
    t: DataTableTranslations;
    prefix?: string;
    partialReloadKey?: string;
    prefetch?: boolean;                   // Inertia v2 prefetch on hover (default: true)
}
```

**`DataTableColumnHeader`:**

```tsx
interface DataTableColumnHeaderProps {
    label: string;
    children?: React.ReactNode;           // Custom header content
    sortable: boolean;
    sorts: DataTableSort[];
    columnId: string;
    onSort: (columnId: string, multi: boolean) => void;
    align?: "left" | "right";            // Right-align for number columns
}
```

**`DataTableRowActions`:**

```tsx
interface DataTableRowActionsProps<TData> {
    row: TData;
    actions: DataTableAction<TData>[];
    t: DataTableTranslations;
    onFormAction?: (action: DataTableAction<TData>, row: TData) => void;
}
```

**`DataTableQuickViews`:**

```tsx
interface DataTableQuickViewsProps {
    quickViews: DataTableQuickView[];
    tableName: string;
    columnVisibility: VisibilityState;
    columnOrder: ColumnOrderState;
    allColumns: DataTableColumnDef[];
    onSelect: (params: Record<string, unknown>) => void;
    onApplyCustom: (search: string) => void;
    onApplyColumns: (columnIds: string[]) => void;
    onApplyColumnOrder: (order: ColumnOrderState) => void;
    enableCustom?: boolean;               // Enable "Save filters" option
    t: DataTableTranslations;
}
```

### Row Grouping

Group rows by any column with collapsible sections:

```php
// Backend: specify which column to group by
public static function tableGroupByColumn(): ?string
{
    return 'status'; // Group rows by status column
}
```

```tsx
// Frontend: enable grouping and customize group styles
<DataTable<Row>
    tableData={tableData}
    tableName="products"
    options={{ rowGrouping: true }}
    groupClassName={{
        active: "bg-emerald-50/50 dark:bg-emerald-950/20",
        draft: "bg-amber-50/50 dark:bg-amber-950/20",
    }}
/>
```

### Detail / Expandable Rows

```php
class ProductDataTable extends AbstractDataTable
{
    public static function tableDetailRowEnabled(): bool { return true; }

    public static function tableDetailRow(\Illuminate\Database\Eloquent\Model $model): array
    {
        return [
            'description' => $model->description,
            'specifications' => $model->specifications,
            'reviews_count' => $model->reviews()->count(),
        ];
    }
}
```

```php
DataTableDetailRowController::register('products', ProductDataTable::class);
```

```tsx
<DataTable<Row>
    tableData={tableData}
    tableName="products"
    renderDetailRow={(row) => (
        <div className="p-4 grid grid-cols-2 gap-4">
            <div>
                <h4 className="font-semibold">Description</h4>
                <p className="text-muted-foreground">{row.description}</p>
            </div>
            <div>
                <h4 className="font-semibold">Reviews</h4>
                <p>{row.reviews_count} reviews</p>
            </div>
        </div>
    )}
/>
```

### Real-Time Updates (Laravel Echo)

```tsx
<DataTable<Row>
    tableData={tableData}
    tableName="products"
    realtimeChannel="products"
    realtimeEvent=".updated"
    partialReloadKey="tableData"
/>
```

Requires Laravel Echo to be configured globally (`window.Echo`).

### Layout Slots

```tsx
<DataTable
    slots={{
        beforeTable: <Alert>Data was last synced 5 minutes ago</Alert>,
        toolbar: <MyCustomToolbar />,
        pagination: <MyCustomPagination />,
        afterTable: <Footer />,
    }}
/>
```

### Empty State

Customize the empty state with an illustration:

```tsx
// Use the built-in illustration
<DataTable options={{ emptyStateIllustration: true }} />

// Use a custom illustration
<DataTable
    options={{ emptyStateIllustration: true }}
    emptyStateIllustration={<MyCustomSvg />}
/>

// Use a completely custom empty state
<DataTable
    emptyState={
        <div className="text-center p-12">
            <h3>No products yet</h3>
            <Button onClick={() => router.visit('/products/create')}>
                Add your first product
            </Button>
        </div>
    }
/>
```

### Batch Editing

Edit a column value across multiple selected rows:

```tsx
<DataTable<Row>
    tableData={tableData}
    tableName="products"
    options={{ batchEdit: true }}
    bulkActions={bulkActions}
    onBatchEdit={async (rows, columnId, value) => {
        await fetch('/api/products/batch-update', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrfToken },
            body: JSON.stringify({
                ids: rows.map(r => r.id),
                column: columnId,
                value,
            }),
        });
        router.reload();
    }}
/>
```

### Export with Progress

Instead of navigating to a download URL, show a spinner while the file is prepared:

```tsx
<DataTable options={{ exportProgress: true }} />
```

The export button will show a loading spinner, download the file as a blob, and trigger the download automatically.

---

## Artisan Commands

### `make:data-table`

Scaffold a complete DataTable class with optional traits:

```bash
php artisan make:data-table Product --all --route
```

### `data-table:types`

Generate TypeScript type definitions from your PHP DataTable classes:

```bash
php artisan data-table:types
# Output: resources/js/types/data-table.d.ts

php artisan data-table:types --output=resources/js/types/tables.d.ts
```

### `data-table:translations`

Generate frontend translation files:

```bash
php artisan data-table:translations --lang=es     # Spanish
php artisan data-table:translations --lang=de     # German
php artisan data-table:translations --lang=ar     # Arabic
php artisan data-table:translations --all          # All 8 languages
php artisan data-table:translations --lang=es --output=resources/js/i18n/es.ts  # Custom path
```

Supported languages: English, French, Spanish, German, Portuguese, Arabic, Chinese, Japanese.

---

## Relational Data

Columns can reference related model data using `internalName` and `relation`. The package automatically handles eager loading and maps column IDs to database paths.

### Column Definition

```php
public static function tableColumns(): array
{
    return [
        new Column(id: 'name', label: 'Name', sortable: true),

        // Relation column with manual setup
        new Column(
            id: 'user_name',
            label: 'Author',
            sortable: true,
            filterable: true,
            internalName: 'user.name',  // Database path for sorting/filtering
            relation: 'user',           // Eager loaded automatically
        ),

        // Using the fluent builder
        ColumnBuilder::make('category_title', 'Category')
            ->belongsTo('category', 'title')  // Sets both internalName + relation
            ->sortable()
            ->filterable()
            ->build(),

        // Nested relation
        ColumnBuilder::make('parent_category', 'Parent Category')
            ->belongsTo('category.parent', 'name')
            ->build(),
    ];
}
```

### Automatic Eager Loading

Relationships defined in column `relation` fields are automatically eager loaded via `with()`. Override `tableEagerLoad()` for additional relationships:

```php
public static function tableEagerLoad(): array
{
    return array_merge(parent::tableEagerLoad(), [
        'tags',          // Additional relation not tied to a column
        'media',
    ]);
}
```

### Data Transformation

For complex relational data, use an API Resource:

```php
public static function tableResource(): string
{
    return ProductResource::class;
}

// In ProductResource.php:
class ProductResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'user_name' => $this->user->name,
            'category_title' => $this->category?->title,
            'tags' => $this->tags->pluck('name')->join(', '),
        ];
    }
}
```

---

## Detail Row Display Modes

Detail rows support three display modes: **inline** (default), **modal**, and **drawer** (side sheet).

### Configuration (PHP)

```php
// Expandable inline row (default)
public static function tableDetailDisplay(): string
{
    return 'inline';
}

// Centered modal dialog
public static function tableDetailDisplay(): string
{
    return 'modal';
}

// Side drawer / sheet
public static function tableDetailDisplay(): string
{
    return 'drawer';
}
```

### React Usage

```tsx
<DataTable
    tableData={tableData}
    tableName="products"
    renderDetailRow={(row) => (
        <div className="space-y-4">
            <h3 className="font-semibold">{row.name}</h3>
            <p className="text-muted-foreground">{row.description}</p>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <span className="text-sm font-medium">SKU:</span>
                    <span className="ml-2">{row.sku}</span>
                </div>
                <div>
                    <span className="text-sm font-medium">Stock:</span>
                    <span className="ml-2">{row.stock}</span>
                </div>
            </div>
        </div>
    )}
/>
```

The display mode is set server-side via `tableDetailDisplay()`. The same `renderDetailRow` callback works for all three modes.

---

## Composable Hooks (Headless API)

The package exports first-class composable hooks that can be used independently of the `<DataTable>` component. This is ideal for building custom table UIs or integrating with other component libraries.

### Barrel Imports

```tsx
import {
    // Hooks
    useDataTable,
    useDataTableFilters,
    // Component
    DataTable,
    DataTableColumn,
    // Sub-components (for building custom layouts)
    DataTablePagination,
    DataTableColumnHeader,
    DataTableRowActions,
    DataTableQuickViews,
    // Types
    type DataTableProps,
    type DataTableState,
    type DataTableResponse,
    type DataTableColumnDef,
    type DataTableMeta,
    type DataTableConfig,
    type DataTableOptions,
    type DataTableAction,
    type DataTableBulkAction,
    type DataTableConfirmOptions,
    type DataTableFormField,
    type DataTableHeaderAction,
    type DataTableColumnProps,
    type UseDataTableOptions,
    type UseDataTableReturn,
    type UseDataTableFiltersOptions,
    type UseDataTableFiltersReturn,
    type DataTableSort,
    type DataTableDensity,
    type DataTableRule,
    type DataTableConfig,
    type DataTableQuickView,
    // i18n
    defaultTranslations,
    frTranslations,
    type DataTableTranslations,
} from "@/data-table";
```

### `useDataTable` Hook

**Options:**

```tsx
interface UseDataTableOptions<TData> {
    tableData: DataTableResponse<TData>;   // Server response from makeTable()
    tableName: string;                      // Unique table identifier
    columnDefs: ColumnDef<TData>[];         // TanStack column definitions
    prefix?: string;                        // Query param prefix for multi-table
    debounceMs?: number;                    // Input debounce delay (default: 0)
    partialReloadKey?: string;              // Inertia partial reload key
    columnResizing?: boolean;               // Enable column resizing
    columnSizing?: Record<string, number>;  // External column sizing state
    onColumnSizingChange?: (sizing: Record<string, number>) => void;
    onStateChange?: (state: DataTableState) => void;
}
```

**Return value:**

```tsx
interface UseDataTableReturn<TData> {
    table: Table<TData>;                    // TanStack Table instance
    meta: DataTableMeta;                    // Server pagination metadata
    columnVisibility: VisibilityState;      // Current visibility state
    columnOrder: ColumnOrderState;          // Current column order
    setColumnOrder: (order: string[]) => void;          // Directly set column order
    rowSelection: RowSelectionState;        // Current row selection
    setRowSelection: (selection: RowSelectionState) => void; // Directly set selection
    applyColumns: (columnIds: string[]) => void;        // Set visible columns programmatically
    handleSort: (columnId: string, multi: boolean) => void;
    handlePageChange: (page: number) => void;
    handlePerPageChange: (perPage: number) => void;
    handleCursorChange: (cursor: string | null) => void;
    handleGlobalSearch: (term: string) => void;
    handleApplyQuickView: (params: Record<string, unknown>) => void;
    handleApplyCustomSearch: (search: string) => void;  // Navigate with custom search string
}
```

**`DataTableState` interface:**

```tsx
interface DataTableState {
    sorting: SortingState;
    columnFilters: ColumnFiltersState;
    columnVisibility: VisibilityState;
    columnOrder: ColumnOrderState;
    rowSelection: RowSelectionState;
    globalSearch: string;
    page: number;
    perPage: number;
}
```

Use this hook to get full table control with TanStack Table integration, without rendering the `<DataTable>` component:

```tsx
function CustomProductTable({ tableData }: { tableData: DataTableResponse<Product> }) {
    const {
        table,
        meta,
        columnVisibility,
        columnOrder,
        handleSort,
        handlePageChange,
        handlePerPageChange,
        handleGlobalSearch,
    } = useDataTable({
        tableData,
        tableName: "products",
        columnDefs: buildColumnDefs(tableData.columns),
        partialReloadKey: "tableData",
        onStateChange: (state) => {
            console.log("Table state changed:", state);
            // state.sorting, state.columnVisibility, state.page, etc.
        },
    });

    return (
        <div>
            {/* Build your own UI using the table instance */}
            {table.getRowModel().rows.map((row) => (
                <div key={row.id}>{/* custom row rendering */}</div>
            ))}
            <DataTablePagination meta={meta} onPageChange={handlePageChange}
                onPerPageChange={handlePerPageChange} t={defaultTranslations} />
        </div>
    );
}
```

### `useDataTableFilters` Hook

Use this hook to manage filters programmatically without the built-in filter UI:

```tsx
function CustomFilterBar({ tableData }: { tableData: DataTableResponse<Product> }) {
    const { activeFilters, setFilter, clearFilter, clearAllFilters, hasActiveFilters, activeFilterCount } =
        useDataTableFilters({
            serverFilters: tableData.meta.filters,
            prefix: "products",
            debounceMs: 300,
            partialReloadKey: "tableData",
        });

    return (
        <div>
            <button onClick={() => setFilter("status", "in", ["active"])}>Active only</button>
            <button onClick={() => setFilter("price", "gte", ["100"])}>Price ≥ 100</button>
            {hasActiveFilters && (
                <button onClick={clearAllFilters}>Clear all ({activeFilterCount})</button>
            )}
        </div>
    );
}
```

### `onStateChange` Callback

React to any table state change (sorting, filtering, pagination, visibility, etc.):

```tsx
<DataTable
    tableData={tableData}
    tableName="products"
    onStateChange={(state) => {
        // state: { sorting, columnFilters, columnVisibility, columnOrder, rowSelection, globalSearch, page, perPage }
        analytics.track("table_state_change", { page: state.page, sorting: state.sorting });
    }}
/>
```

---

## Declarative Column API (JSX)

Define column overrides using JSX instead of render props:

```tsx
<DataTable tableData={tableData} tableName="products">
    <DataTable.Column
        id="name"
        renderCell={(value, row) => <strong>{value as string}</strong>}
    />
    <DataTable.Column
        id="price"
        renderCell={(value) => <span className="text-emerald-600">${value}</span>}
    />
    <DataTable.Column
        id="status"
        renderHeader={<span className="text-blue-500">Status</span>}
    />
</DataTable>
```

Both the prop-based (`renderCell`, `renderHeader`) and JSX-based (`<DataTable.Column>`) APIs work. Props take priority when both are specified.

---

## Mobile Card Layout

On small screens, the table automatically switches to a card-based layout. Set the breakpoint in pixels:

```tsx
<DataTable
    tableData={tableData}
    tableName="products"
    mobileBreakpoint={768}  // Switch to cards below 768px
/>
```

Each row becomes a card showing label-value pairs with optional action buttons. The layout automatically respects the current density setting.

---

## Filter Chips

Active filters are automatically displayed as removable badge chips above the table. Users can:

- Click the × on any chip to clear that specific filter
- Click "Clear all filters" to remove all filters at once

Filter chips show the column label and the current filter value, stripping the operator prefix for readability.

---

## Inline Row Creation

Enable inline row creation with the `onRowCreate` callback:

```tsx
<DataTable
    tableData={tableData}
    tableName="products"
    onRowCreate={async (data) => {
        await router.post("/products", data);
    }}
/>
```

This adds an "Add row" button that expands to an inline form with inputs for all editable columns. Users can:

- Press **Enter** to save the new row
- Press **Escape** to cancel
- Click **Save** / **Cancel** buttons

---

## Inertia v2 Integration

### Prefetching Pagination

Pagination buttons automatically prefetch the next/prev page on hover using Inertia v2's `router.prefetch()`. This makes page navigation feel instant. Works with partial reloads:

```tsx
<DataTable
    tableData={tableData}
    tableName="products"
    partialReloadKey="tableData"  // Only reload the table data prop
/>
```

### Inertia Router for Mutations

Toggle switches and file imports use `router.patch()` / `router.post()` instead of raw `fetch()`. This means:

- Automatic CSRF handling (no manual token management)
- Proper Inertia session management
- `preserveScroll` and `preserveState` are automatic
- Error handling via Inertia's `onError` callback

---

## Rate Limiting

All mutation endpoints include configurable rate limiting:

```php
// config/data-table.php
'rate_limit' => [
    'inline_edit' => 60,  // 60 requests per minute per user
    'toggle' => 60,       // 60 requests per minute per user
    'export' => 10,       // 10 exports per minute per user
    'import' => 5,        // 5 imports per minute per user
],
```

Set to `0` to disable rate limiting for a specific endpoint. Rate limiting is keyed per user (or per IP for unauthenticated requests) per table.

---

## Authorization

Override `tableAuthorize()` to gate actions per table:

```php
class ProductDataTable extends AbstractDataTable
{
    public static function tableAuthorize(string $action, \Illuminate\Http\Request $request): bool
    {
        return match ($action) {
            'export' => $request->user()?->can('export products'),
            'import' => $request->user()?->hasRole('admin'),
            'inline_edit' => $request->user()?->can('edit products'),
            'toggle' => $request->user()?->can('edit products'),
            default => true,
        };
    }
}
```

The `$action` parameter is one of: `export`, `import`, `inline_edit`, `toggle`. Return `false` to abort with a 403.

---

## HTML Sanitization

All HTML content rendered in cells (via `html: true` or `renderCell`) is sanitized to prevent XSS:

- **DOMPurify** — If `DOMPurify` is available on `window`, it's used automatically
- **Fallback** — A built-in regex strips `<script>`, `<iframe>`, `<object>`, `<embed>`, `javascript:` URIs, and inline event handlers

To use DOMPurify (recommended for production):

```bash
npm install dompurify
```

```tsx
import DOMPurify from "dompurify";
// DOMPurify is auto-detected on window — no extra config needed
```

---

## Audit Report Command

Generate audit reports from the command line:

```bash
# Default: last 7 days in table format
php artisan data-table:audit-report

# Filter by table, action, or user
php artisan data-table:audit-report --table=products --action=inline_edit --user=1

# Last 30 days in JSON format, limited to 50 entries
php artisan data-table:audit-report --days=30 --limit=50 --format=json

# Export as CSV
php artisan data-table:audit-report --format=csv > audit.csv
```

**Options:** `--table`, `--action`, `--user`, `--days` (default: 7), `--limit` (default: 100), `--format` (table/json/csv)

The report includes:
- Summary statistics: actions breakdown, tables breakdown, users breakdown
- Detailed entries with table, action, row ID, column, old/new values, user, IP, timestamp

---

## Configuration

After publishing the config (`php artisan vendor:publish --tag=data-table-config`), you can customize:

```php
// config/data-table.php
return [
    'default_per_page' => 25,
    'max_per_page' => 100,
    'default_polling_interval' => 0,       // seconds (0 = disabled)
    'storage_prefix' => 'dt-',             // localStorage key prefix
    'middleware' => ['web'],                // Route middleware
    'route_prefix' => 'data-table',        // API route prefix
    'translations' => null,                // Global translation overrides
    'export' => [
        'queue' => false,                  // Queue exports for background processing
        'disk' => null,                    // Storage disk for exports
        'max_rows' => 50000,              // Maximum rows to export
    ],
    'import' => [
        'max_file_size' => 10240,          // Max file size in KB
        'allowed_extensions' => ['csv', 'xlsx', 'xls'],
    ],
    'rate_limit' => [
        'inline_edit' => 60,               // Max inline edits per minute per user (0 = disabled)
        'toggle' => 60,                    // Max toggle requests per minute per user (0 = disabled)
        'export' => 10,                    // Max exports per minute per user (0 = disabled)
        'import' => 5,                     // Max imports per minute per user (0 = disabled)
    ],
    'audit_table' => 'data_table_audit_log', // Database table for audit log storage
];
```

---

## Auto-Registered Routes

The service provider registers these routes automatically:

| Method | URL | Description |
|--------|-----|-------------|
| GET | `/data-table/export/{table}` | Export data (XLSX/CSV/PDF) |
| GET | `/data-table/select-all/{table}` | Get all IDs matching filters |
| PATCH | `/data-table/inline-edit/{table}/{id}` | Inline edit a cell value |
| PATCH | `/data-table/toggle/{table}/{id}` | Toggle boolean column value |
| PATCH | `/data-table/reorder/{table}` | Reorder rows |
| POST | `/data-table/import/{table}` | Import CSV/Excel file |
| GET | `/data-table/detail/{table}/{id}` | Fetch detail/expandable row data |
| GET | `/data-table/filter-options/{table}/{column}` | Async filter options |
| GET | `/data-table/cascading-options/{table}/{column}` | Cascading filter options |
| GET | `/data-table/export-status` | Poll queued export completion |
| GET | `/data-table/saved-views/{tableName}` | List saved views |
| POST | `/data-table/saved-views/{tableName}` | Create saved view |
| PUT | `/data-table/saved-views/{tableName}/{id}` | Update saved view |
| DELETE | `/data-table/saved-views/{tableName}/{id}` | Delete saved view |

The route prefix and middleware are configurable via `config/data-table.php`.

---

## URL Format

All state is URL-driven and bookmarkable:

```
/products?filter[price]=gte:1000&filter[name]=contains:widget&sort=-price,name&page=2&per_page=50&search=keyword
```

- **Filters**: `filter[column]=operator:value1,value2`
- **Sort**: `sort=column` (asc) or `sort=-column` (desc), comma-separated for multi-sort
- **Pagination**: `page=N&per_page=N`
- **Global search**: `search=term`
- **Cursor pagination**: `cursor=token`

With prefix: `products_filter[price]=gte:100&products_sort=-price&products_page=2`

---

## localStorage Keys

| Key | Purpose |
|-----|---------|
| `dt-columns-{tableName}` | Column visibility state |
| `dt-column-order-{tableName}` | Column display order |
| `dt-quickviews-{tableName}` | Custom saved quick views |
| `dt-resize-{tableName}` | Column resize widths |
| `dt-density-{tableName}` | Table density preference |
| `dt-selection-{tableName}` | Persisted row selection (across pages) |
| `dt-state-{tableName}` | Persisted filters, sorts, and per-page |

---

## Testing

### Running the test suite

```bash
cd vendor/machour/laravel-data-table
composer install
./vendor/bin/pest
```

### Testing your DataTables

Use the built-in `DataTableTestHelper` for fluent assertion chains:

```php
use Machour\DataTable\Testing\DataTableTestHelper;

test('product table has correct columns', function () {
    DataTableTestHelper::for(ProductDataTable::class)
        ->assertColumnExists('id')
        ->assertColumnExists('name')
        ->assertColumnNotExists('secret')
        ->assertColumnType('price', 'currency')
        ->assertSortable('name')
        ->assertNotSortable('photo')
        ->assertFilterable('status')
        ->assertNotFilterable('id')
        ->assertEditable('price')
        ->assertVisible('name')
        ->assertHidden('internal_notes')
        ->assertHasSummary('price', 'sum')
        ->assertColumnGroup('email', 'Contact')
        ->assertColumnCount(8)
        ->assertDefaultSort('-created_at')
        ->assertExportEnabled()
        ->assertInlineEditEnabled()
        ->assertSelectAllEnabled()
        ->assertToggleEnabled()
        ->assertReorderEnabled()
        ->assertImportEnabled()
        ->assertHasQuickViews(3);
});
```

#### Full Assertion API

| Method | Description |
|--------|-------------|
| `for(string $class)` | Create helper for a DataTable class |
| `assertColumnExists(string)` | Column with ID exists |
| `assertColumnNotExists(string)` | Column does NOT exist |
| `assertColumnCount(int)` | Exact column count |
| `assertColumnType(string, string)` | Column has expected type |
| `assertSortable(string)` | Column is sortable |
| `assertNotSortable(string)` | Column is NOT sortable |
| `assertFilterable(string)` | Column is filterable |
| `assertNotFilterable(string)` | Column is NOT filterable |
| `assertEditable(string)` | Column is inline-editable |
| `assertVisible(string)` | Column is visible by default |
| `assertHidden(string)` | Column is hidden by default |
| `assertHasSummary(string, ?string)` | Column has a summary (optionally of a specific type) |
| `assertColumnGroup(string, string)` | Column belongs to a group |
| `assertDefaultSort(string)` | Default sort matches (e.g., `'-created_at'`) |
| `assertExportEnabled()` | DataTable uses `HasExport` trait |
| `assertInlineEditEnabled()` | DataTable uses `HasInlineEdit` trait |
| `assertSelectAllEnabled()` | DataTable uses `HasSelectAll` trait |
| `assertToggleEnabled()` | DataTable uses `HasToggle` trait |
| `assertReorderEnabled()` | DataTable uses `HasReorder` trait |
| `assertImportEnabled()` | DataTable uses `HasImport` trait |
| `assertHasQuickViews(int)` | At least N quick views defined |
| `getColumns()` | Returns `Column[]` for custom assertions |

---

## Full Example

Here's a comprehensive example using most features:

### Backend

```php
<?php

namespace App\DataTables;

use App\Models\Product;
use Machour\DataTable\AbstractDataTable;
use Machour\DataTable\Columns\ColumnBuilder;
use Machour\DataTable\Concerns\HasAuditLog;
use Machour\DataTable\Concerns\HasExport;
use Machour\DataTable\Concerns\HasImport;
use Machour\DataTable\Concerns\HasInlineEdit;
use Machour\DataTable\Concerns\HasReorder;
use Machour\DataTable\Concerns\HasSelectAll;
use Machour\DataTable\Concerns\HasToggle;
use Machour\DataTable\QuickView;
use Illuminate\Database\Eloquent\Builder;

class ProductDataTable extends AbstractDataTable
{
    use HasExport, HasInlineEdit, HasSelectAll, HasToggle, HasReorder, HasImport, HasAuditLog;

    public function __construct(
        public int $id,
        public string $name,
        public float $price,
        public string $status,
        public bool $is_active,
        public ?string $category,
        public ?string $created_at,
    ) {}

    public static function tableColumns(): array
    {
        return [
            ColumnBuilder::make('id', 'ID')->number()->sortable()->build(),
            ColumnBuilder::make('name', 'Name')->text()->sortable()->filterable()->editable()->build(),
            ColumnBuilder::make('price', 'Price')->currency('USD')->sortable()->filterable()->editable()->summary('sum')->build(),
            ColumnBuilder::make('status', 'Status')->badge()->options([
                ['label' => 'Active', 'value' => 'active', 'variant' => 'success'],
                ['label' => 'Draft', 'value' => 'draft', 'variant' => 'warning'],
                ['label' => 'Archived', 'value' => 'archived', 'variant' => 'secondary'],
            ])->filterable()->build(),
            ColumnBuilder::make('is_active', 'Active')->boolean()->toggleable()->build(),
            ColumnBuilder::make('category', 'Category')->text()->filterable()->responsivePriority(2)->build(),
            ColumnBuilder::make('created_at', 'Created')->date()->sortable()->responsivePriority(3)->build(),
        ];
    }

    public static function tableBaseQuery(): Builder { return Product::query(); }
    public static function tableDefaultSort(): string { return '-created_at'; }
    public static function tableSearchableColumns(): array { return ['name', 'category']; }
    public static function tableSoftDeletesEnabled(): bool { return true; }
    public static function tableDetailRowEnabled(): bool { return true; }
    public static function tableGroupByColumn(): ?string { return 'status'; }

    // Trait implementations
    public static function tableExportEnabled(): bool { return true; }
    public static function tableExportName(): string { return 'products'; }
    public static function tableInlineEditModel(): string { return Product::class; }
    public static function tableSelectAllName(): string { return 'products'; }
    public static function tableToggleModel(): string { return Product::class; }
    public static function tableToggleName(): string { return 'products'; }
    public static function tableReorderModel(): string { return Product::class; }
    public static function tableReorderName(): string { return 'products'; }
    public static function tableImportName(): string { return 'products'; }
    public static function tableAuditLogName(): string { return 'products'; }

    public static function tableQuickViews(): array
    {
        return [
            new QuickView(id: 'all', label: 'All', params: []),
            new QuickView(id: 'active', label: 'Active', params: ['filter[status]' => 'eq:active']),
            new QuickView(id: 'recent', label: 'Recent', params: [
                'filter[created_at]' => 'after:' . now()->subDays(7)->toDateString(),
                'sort' => '-created_at',
            ]),
        ];
    }

    public static function tableDetailRow(\Illuminate\Database\Eloquent\Model $model): array
    {
        return [
            'description' => $model->description,
            'stock' => $model->stock,
        ];
    }
}
```

### Frontend

```tsx
import { DataTable } from "laravel-data-table";
import type { DataTableResponse, DataTableBulkAction } from "laravel-data-table";
import { Head } from "@inertiajs/react";
import { router } from "@inertiajs/react";
import { Trash2 } from "lucide-react";

type Row = App.DataTables.ProductDataTable;

interface Props {
    tableData: DataTableResponse<Row>;
}

export default function ProductsPage({ tableData }: Props) {
    const bulkActions: DataTableBulkAction<Row>[] = [
        {
            id: "delete",
            label: "Delete",
            icon: Trash2,
            variant: "destructive",
            onClick: (rows) => router.post("/products/bulk-delete", {
                ids: rows.map(r => r.id),
            }),
            confirm: { title: "Delete selected?", description: "This cannot be undone." },
        },
    ];

    return (
        <>
            <Head title="Products" />
            <DataTable<Row>
                tableData={tableData}
                tableName="products"
                partialReloadKey="tableData"
                actions={[
                    { label: "Edit", onClick: (row) => router.visit(`/products/${row.id}/edit`) },
                    { label: "Delete", variant: "destructive", confirm: true,
                      onClick: (row) => router.delete(`/products/${row.id}`) },
                ]}
                bulkActions={bulkActions}
                options={{
                    globalSearch: true,
                    density: true,
                    copyCell: true,
                    contextMenu: true,
                    columnPinning: true,
                    searchHighlight: true,
                    undoRedo: true,
                    batchEdit: true,
                    shortcutsOverlay: true,
                    exportProgress: true,
                    emptyStateIllustration: true,
                    keyboardNavigation: true,
                    rowGrouping: true,
                    persistSelection: true,
                }}
                onInlineEdit={async (row, columnId, value) => {
                    await fetch(`/data-table/inline-edit/products/${row.id}`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json",
                            "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.content ?? "" },
                        body: JSON.stringify({ column: columnId, value }),
                    });
                    router.reload({ only: ["tableData"] });
                }}
                onBatchEdit={async (rows, columnId, value) => {
                    await fetch("/api/products/batch-update", {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json",
                            "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.content ?? "" },
                        body: JSON.stringify({ ids: rows.map(r => r.id), column: columnId, value }),
                    });
                    router.reload({ only: ["tableData"] });
                }}
                renderDetailRow={(row) => (
                    <div className="p-4 grid grid-cols-2 gap-4">
                        <div>
                            <h4 className="font-semibold mb-1">Description</h4>
                            <p className="text-muted-foreground text-sm">{row.description}</p>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-1">Stock</h4>
                            <p className="text-sm">{row.stock} units</p>
                        </div>
                    </div>
                )}
                groupClassName={{
                    active: "bg-emerald-50/50 dark:bg-emerald-950/20",
                    draft: "bg-amber-50/50 dark:bg-amber-950/20",
                }}
            />
        </>
    );
}
```

---

## License

MIT
