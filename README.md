# Laravel DataTable

A reusable, server-side DataTable system for **Laravel + Inertia.js + React** (TanStack Table v8). Define your table in a single PHP class — get sorting, filtering, pagination, exports, inline editing, and a full-featured React UI out of the box.

## Features

### Core

- **Single-file backend** — One PHP class per model acts as both DTO and table configuration
- **Server-side everything** — Sorting, filtering, pagination handled by Spatie QueryBuilder
- **14 column types** — text, number, date, option, multiOption, boolean, image, badge, currency, percentage, link, email, phone
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

### Data Display

- **Footer aggregations** — Per-page computed values (sum, avg, etc.) with custom rendering
- **Full-dataset summaries** — Built-in sum/count/avg/min/max across the entire filtered dataset
- **Row grouping** — Group rows by any column with collapsible sections
- **Conditional rules** — Server-side declarative rules for row/cell styling
- **Cell copy to clipboard** — Hover-to-copy button on any cell
- **Density toggle** — Switch between compact, comfortable, and spacious row heights
- **Empty state illustrations** — Customizable SVG illustration for empty tables

### Selection & Actions

- **Bulk actions** — Checkbox selection with configurable action buttons and confirmation dialogs
- **Server-side selection** — "Select all X matching items" across pages with backend ID resolution
- **Row actions** — Per-row dropdown menu with visibility, variant, and confirmation support
- **Shift+click range selection** — Select a range of rows by holding Shift
- **Radio button selection** — Single-select mode via `selectionMode="radio"`
- **Row selection persistence** — Selections persist across page navigation via localStorage

### Editing

- **Inline editing** — Double-click to edit cells with server-side PATCH save
- **Batch inline editing** — Edit a column value across multiple selected rows at once
- **Undo/redo** — Stack-based undo/redo for inline edits with Ctrl+Z / Ctrl+Y
- **Boolean toggle switch** — One-click switch to toggle boolean columns inline

### Data Import/Export

- **XLSX/CSV/PDF export** — Via Maatwebsite Excel with optional queued exports and DomPDF
- **Export with progress** — Spinner and blob download instead of raw navigation
- **CSV/Excel import** — Upload dialog with file validation and error handling

### Row Features

- **Row drag-and-drop reorder** — Drag rows to reorder with server-side position persistence
- **Detail / expandable rows** — Click to expand nested content per row
- **Row links / click handlers** — Make rows clickable with href links or custom callbacks
- **Soft deletes toggle** — Show/hide trashed records with a single click
- **Row data attributes** — Add custom `data-*` attributes to rows for styling/testing

### Views

- **Quick Views** — Server-defined filter presets
- **Saved Views** — User-saved custom views (localStorage or database-persisted across devices)

### Navigation & Accessibility

- **Keyboard navigation** — Arrow keys, Enter, Escape, Space for accessible table interaction
- **Keyboard shortcuts overlay** — Press `?` to see all available shortcuts
- **ARIA attributes** — `role="grid"`, `aria-sort`, `aria-rowindex`, `aria-selected` on table elements
- **Print-friendly** — `@media print` stylesheet with print button

### Real-time & Performance

- **Real-time updates** — Laravel Echo integration for auto-refreshing on server events
- **Auto-refresh polling** — Timer-based automatic data refresh at configurable intervals
- **Deferred/lazy loading** — Render table shell immediately, load data asynchronously
- **Virtual scrolling** — Option for virtualized rendering of large datasets
- **Persist state** — Save filters/sort/pagination to localStorage across page reloads
- **Partial reloads** — Inertia.js partial reload support for optimized data fetching
- **Loading state** — Skeleton rows and spinner during Inertia navigation

### Internationalization

- **i18n / translations** — Full translation system with English and French built-in
- **8 built-in languages** — EN, FR, ES, DE, PT, AR, ZH, JA via artisan command
- **Fully customizable** — Override any translation string via the `translations` prop

### Developer Experience

- **Artisan generator** — `php artisan make:data-table Product --export --inline-edit --all`
- **TypeScript generation** — `php artisan data-table:types` generates `.d.ts` from PHP classes
- **Translation generation** — `php artisan data-table:translations --lang=es` generates i18n files
- **Testing helpers** — `DataTableTestHelper::for(Table::class)->assertColumnExists('x')->assertSortable('x')`
- **Publishable config** — `php artisan vendor:publish --tag=data-table-config`
- **Audit log** — `HasAuditLog` trait records inline edits, toggles, reorders, and bulk actions
- **Layout slots** — Composable slot overrides for toolbar, pagination, and surrounding content

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
php artisan make:data-table Product --soft-deletes      # Enable soft deletes
php artisan make:data-table Product --detail-rows       # Enable detail rows
php artisan make:data-table Product --searchable=name   # Searchable columns
php artisan make:data-table Product --pagination=cursor # Pagination type
php artisan make:data-table Product --resource          # Generate API Resource
php artisan make:data-table Product --route             # Append route to web.php
php artisan make:data-table Product --all               # Include all traits
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
| `makeTable(?Request, ?string)` | Inherited | Builds the `DataTableResponse`. Optional `$prefix` for multi-table pages |

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
    summary: 'sum',          // Aggregation: 'sum', 'count', 'avg', 'min', 'max'
    toggleable: true,        // Boolean toggle switch
    responsivePriority: 3,   // Auto-hide on small screens (lower = hidden first)
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

#### Badge Variants

| Variant | Colors |
|---------|--------|
| `default` | Primary color |
| `success` | Green |
| `warning` | Yellow |
| `danger` | Red |
| `info` | Blue |
| `secondary` | Muted gray |

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

#### HasSelectAll

"Select all X matching items" across pages:

```php
use Machour\DataTable\Concerns\HasSelectAll;

class ProductDataTable extends AbstractDataTable
{
    use HasSelectAll;

    public static function tableSelectAllName(): string { return 'products'; }
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

    // Custom import logic
    public static function processImport(array $rows): array
    {
        $imported = 0;
        foreach ($rows as $row) {
            Product::create($row);
            $imported++;
        }
        return ['imported' => $imported, 'errors' => 0];
    }
}
```

```php
DataTableImportController::register('products', ProductDataTable::class);
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
    icon: 'calendar',
    columns: ['id', 'name', 'created_at'],
);
```

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
        virtualScrolling: true,      // Virtualized rendering for large datasets

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
```

Supported languages: English, French, Spanish, German, Portuguese, Arabic, Chinese, Japanese.

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
        ->assertColumnType('price', 'currency')
        ->assertSortable('name')
        ->assertFilterable('status')
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
        ->assertReorderEnabled()
        ->assertImportEnabled()
        ->assertHasQuickViews(3);
});
```

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
use Machour\DataTable\QuickView;
use Illuminate\Database\Eloquent\Builder;

class ProductDataTable extends AbstractDataTable
{
    use HasExport, HasInlineEdit, HasSelectAll, HasReorder, HasImport, HasAuditLog;

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
