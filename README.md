# Laravel DataTable

A reusable, server-side DataTable system for **Laravel + Inertia.js + React** (TanStack Table v8). Define your table in a single PHP class — get sorting, filtering, pagination, exports, quick views, and a full-featured React UI out of the box.

## Features

- **Single-file backend** — One PHP class per model acts as both DTO and table configuration
- **Server-side everything** — Sorting, filtering, pagination handled by Spatie QueryBuilder
- **Operator-based filters** — URL format `filter[price]=gte:1000` with 14 operators (eq, neq, gt, gte, lt, lte, between, in, not_in, contains, before, after, null, not_null)
- **Global search** — Server-side search across configurable columns with debounced input
- **Quick Views** — Server-defined filter presets + user-saved custom views (localStorage or database)
- **Column ordering** — Drag-to-reorder via GripVertical handles, persisted to localStorage
- **Column pinning** — Automatic sticky columns for checkbox (`_select`) and actions (`_actions`)
- **Column resizing** — Drag-to-resize column widths, persisted to localStorage
- **Column groups** — Group columns under shared headers with custom background colors
- **Column visibility** — Toggle columns on/off, persisted to localStorage
- **Footer aggregations** — Per-page computed values (sum, avg, etc.) with custom rendering
- **XLSX/CSV/PDF export** — Via Maatwebsite Excel with optional queued exports and DomPDF support
- **Bulk actions** — Checkbox selection with configurable action buttons and confirmation dialogs
- **Server-side selection** — "Select all X matching items" across pages with backend ID resolution
- **Row actions** — Per-row dropdown menu with visibility, variant, and confirmation dialog support
- **Inline editing** — Double-click to edit cells with server-side PATCH save
- **Rich column types** — text, number, date, option, boolean, image, badge, currency, percentage, link, email, phone
- **Row links / click handlers** — Make rows clickable with href links or custom click callbacks
- **Shift+click range selection** — Select a range of rows by holding Shift
- **Multiple tables per page** — URL parameter namespacing via `prefix` prop
- **Pagination types** — Standard, simple (no total count), and cursor-based pagination
- **i18n / Translations** — Full translation system with English and French built-in, fully customizable
- **Sticky header** — Optionally freeze table headers while scrolling
- **Partial reloads** — Inertia.js partial reload support for optimized data fetching
- **Debounced inputs** — Configurable debounce for filters and global search
- **Layout slots** — Composable slot overrides for toolbar, pagination, and surrounding content
- **Custom filter components** — Provide your own filter UI per column via `renderFilter`
- **Custom empty state** — Customizable empty state when no data is available
- **Row data attributes** — Add custom `data-*` attributes to rows for styling/testing
- **Active filter indicators** — Dot indicators on column headers when filters are active
- **API Resource support** — Transform rows through Laravel JsonResource classes
- **Loading state** — Skeleton rows and spinner during Inertia navigation
- **Keyboard navigation** — Arrow keys, Enter, Escape, Space for accessible table interaction
- **Print-friendly** — `@media print` stylesheet with print button
- **Real-time updates** — Laravel Echo integration for auto-refreshing on server events
- **Backend saved views** — Database-persisted saved views that follow users across devices
- **Detail / Expandable rows** — Click to expand nested content per row with `renderDetailRow` prop
- **Conditional rules** — Server-side declarative rules for row/cell styling (e.g. "when stock < 5, highlight red")
- **Full-dataset summaries** — Built-in sum/count/avg/min/max aggregations across the entire filtered dataset (not just current page)
- **Soft deletes toggle** — Show/hide trashed records with a single button click
- **Boolean toggle switch** — One-click switch to toggle boolean columns inline (e.g. active/inactive)
- **Enum-based filters** — Automatically resolve filter options from PHP BackedEnum classes
- **Async filter options** — Lazy-load filter options from the server with search support
- **Cascading/interdependent filters** — Filter options that depend on parent filter values (e.g. Country → City)
- **Radio button selection** — Single-select mode via `selectionMode="radio"` prop
- **Responsive column collapse** — Auto-hide columns on small screens based on priority levels
- **Auto-refresh polling** — Timer-based automatic data refresh at configurable intervals
- **Persist state** — Save filters/sort/pagination to localStorage across page reloads
- **Deferred/lazy loading** — Render table shell immediately, load data asynchronously
- **Dark mode** — Full dark mode support across all components
- **Responsive** — Mobile popover for toolbar, horizontal scroll for wide tables
- **Feature flags** — Disable any feature via frontend `options` prop

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

### 3. (Optional) Publish migrations for saved views

```bash
php artisan vendor:publish --tag=data-table-migrations
php artisan migrate
```

This creates the `data_table_saved_views` table for backend-persisted saved views.

### 4. (Optional) Install export dependencies

```bash
# For XLSX/CSV export
composer require maatwebsite/excel

# For PDF export (additionally)
composer require barryvdh/laravel-dompdf
```

## Quick Start

### 1. Scaffold with the Artisan command

The fastest way to get started:

```bash
php artisan make:data-table Product
```

This generates:
- `app/DataTables/ProductDataTable.php` — your DataTable class
- `resources/js/pages/product-table.tsx` — a React page stub

Available options:

```bash
# Include export support (HasExport trait)
php artisan make:data-table Product --export

# Include inline editing (HasInlineEdit trait)
php artisan make:data-table Product --inline-edit

# Include server-side select all (HasSelectAll trait)
php artisan make:data-table Product --select-all

# Specify searchable columns for global search
php artisan make:data-table Product --searchable=name --searchable=email

# Set pagination type (standard, simple, cursor)
php artisan make:data-table Product --pagination=cursor

# Generate an API Resource class
php artisan make:data-table Product --resource

# Append route to routes/web.php
php artisan make:data-table Product --route

# Custom route file
php artisan make:data-table Product --route --route-file=routes/admin.php

# Custom page output path
php artisan make:data-table Product --page-path=resources/js/pages/admin

# Combine options
php artisan make:data-table Product --export --inline-edit --select-all --searchable=name --route
```

### 2. Or create your DataTable class manually

```php
<?php

namespace App\DataTables;

use Machour\DataTable\AbstractDataTable;
use Machour\DataTable\Columns\Column;
use App\Models\Product;
use Illuminate\Database\Eloquent\Builder;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
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

### 2. Add a route

```php
use App\DataTables\ProductDataTable;
use Inertia\Inertia;

Route::get('/products', function () {
    return Inertia::render('products', [
        'tableData' => ProductDataTable::makeTable(),
    ]);
});
```

### 3. Create your React page

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
| `tableAllowedFilters()` | No | Auto-derived from `filterable: true` columns. Override for `OperatorFilter` or custom filters |
| `tableAllowedSorts()` | No | Auto-derived from `sortable: true` columns. Override for relation sorts |
| `tableFooter(Collection)` | No | Compute per-page footer aggregations |
| `tableDetailRowEnabled()` | No | Return `true` to enable expandable rows. Default: `false` |
| `tableDetailRow(Model)` | No | Return detail data array for the given model |
| `tableSoftDeletesEnabled()` | No | Return `true` to show soft-delete toggle. Default: `false` |
| `tableWithTrashedDefault()` | No | Default state of the trashed toggle. Default: `false` |
| `tableRules()` | No | Return conditional rule arrays for row/cell styling |
| `tablePollingInterval()` | No | Auto-refresh interval in seconds (0 = disabled). Default: `0` |
| `tablePersistState()` | No | Persist filters/sorts to localStorage. Default: `false` |
| `tableDeferLoading()` | No | Defer data loading after initial render. Default: `false` |
| `tableAsyncFilterColumns()` | No | Column IDs with lazy-loaded filter options |
| `resolveAsyncFilterOptions(column, ?search)` | No | Return filter options for an async column |
| `tableEnumFilters()` | No | Map column IDs to BackedEnum classes for auto-resolved options |
| `tableCascadingFilters()` | No | Map child → parent column IDs for interdependent filters |
| `resolveCascadingFilterOptions(column, parentValues)` | No | Return options based on parent filter values |
| `makeTable(?Request, ?string)` | Inherited | Builds the `DataTableResponse` — call this in your route. Optional `$prefix` for multi-table pages |

### `Column`

```php
new Column(
    id: 'price',             // Must match DTO property name
    label: 'Price',          // Display label
    type: 'number',          // See Column Types below
    sortable: true,          // Allow sorting
    filterable: true,        // Show in filter bar
    visible: true,           // Default visibility (user can toggle)
    options: [...],          // For type=option/badge: [['label' => 'X', 'value' => 'x', 'variant' => 'success'], ...]
    min: 0,                  // For number range (optional)
    max: 100000,             // For number range (optional)
    icon: 'check',           // Lucide icon name (optional)
    searchThreshold: 5,      // Show search input in option filter if >= N options
    group: 'Details',        // Group columns under a header (optional)
    editable: true,          // Enable inline editing for this column (optional)
    currency: 'USD',         // Currency code for type=currency (optional)
    locale: 'en-US',         // Locale for number/currency formatting (optional)
);
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

For `type: 'badge'` columns, each option can specify a `variant`:

| Variant | Colors |
|---------|--------|
| `default` | Primary color (light/dark) |
| `success` | Green |
| `warning` | Yellow |
| `danger` | Red |
| `info` | Blue |
| `secondary` | Muted gray |

```php
new Column(
    id: 'status',
    label: 'Status',
    type: 'badge',
    options: [
        ['label' => 'Active', 'value' => 'active', 'variant' => 'success'],
        ['label' => 'Pending', 'value' => 'pending', 'variant' => 'warning'],
        ['label' => 'Inactive', 'value' => 'inactive', 'variant' => 'danger'],
    ],
);
```

#### Currency Columns

```php
new Column(
    id: 'price',
    label: 'Price',
    type: 'currency',
    currency: 'EUR',
    locale: 'fr-FR',   // Renders as "1 234,56 €"
    sortable: true,
    filterable: true,   // Uses number filter operators
    summary: 'sum',     // Aggregate across full dataset: 'sum', 'count', 'avg', 'min', 'max'
    toggleable: false,  // Boolean switch column (one-click toggle)
    responsivePriority: 3, // Auto-hide on small screens (lower = hidden first, null = always visible)
);
```

#### Percentage Columns

```php
new Column(
    id: 'margin',
    label: 'Margin',
    type: 'percentage',
    locale: 'en-US',   // Renders 0.42 as "42%"
    sortable: true,
);
```

### Inline Editing (HasInlineEdit trait)

Enable double-click-to-edit on table cells:

```php
use Machour\DataTable\Concerns\HasInlineEdit;

class ProductDataTable extends AbstractDataTable
{
    use HasInlineEdit;

    public static function tableColumns(): array
    {
        return [
            new Column(id: 'id', label: 'ID', type: 'number', sortable: true),
            new Column(id: 'name', label: 'Name', type: 'text', sortable: true, editable: true),
            new Column(id: 'price', label: 'Price', type: 'number', sortable: true, editable: true),
        ];
    }

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

Register the controller and add the frontend prop:

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
/>
```

### Server-Side Selection (HasSelectAll trait)

Enable "Select all X matching items" across pages:

```php
use Machour\DataTable\Concerns\HasSelectAll;

class ProductDataTable extends AbstractDataTable
{
    use HasSelectAll;

    public static function tableSelectAllName(): string
    {
        return 'products';
    }
}
```

Register the controller:

```php
DataTableSelectAllController::register('products', ProductDataTable::class);
```

The frontend automatically shows a "Select all X matching items" banner when all rows on the current page are selected. The backend returns all matching IDs.

### Pagination Types

Override `tablePaginationType()` to change pagination strategy:

```php
// Standard (default): Full pagination with page numbers and total count
public static function tablePaginationType(): string
{
    return 'standard';
}

// Simple: Previous/Next only, no total count (faster for large datasets)
public static function tablePaginationType(): string
{
    return 'simple';
}

// Cursor: Cursor-based pagination (most efficient for very large datasets)
public static function tablePaginationType(): string
{
    return 'cursor';
}
```

### Global Search

Enable server-side global search by specifying searchable columns:

```php
public static function tableSearchableColumns(): array
{
    return ['name', 'email', 'phone'];
}
```

Search terms are sanitized against LIKE wildcard injection (`%` and `_` are escaped). On the frontend:

```tsx
<DataTable
    tableData={tableData}
    tableName="products"
    options={{ globalSearch: true }}
/>
```

### API Resource Transformation

Transform rows through a Laravel JsonResource before sending to the frontend:

```php
use App\Http\Resources\ProductResource;

public static function tableResource(): ?string
{
    return ProductResource::class;
}
```

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

### Backend Saved Views

Publish the migration and use the REST API to persist views per user:

```bash
php artisan vendor:publish --tag=data-table-migrations
php artisan migrate
```

**API Endpoints** (auto-registered):

| Method | URL | Description |
|--------|-----|-------------|
| GET | `/data-table/saved-views/{tableName}` | List user's saved views |
| POST | `/data-table/saved-views/{tableName}` | Create a saved view |
| PUT | `/data-table/saved-views/{tableName}/{id}` | Update a saved view |
| DELETE | `/data-table/saved-views/{tableName}/{id}` | Delete a saved view |

**Request body** (POST/PUT):
```json
{
    "name": "Active products",
    "filters": {"status": "eq:active"},
    "sort": "-created_at",
    "columns": ["id", "name", "status"],
    "column_order": ["id", "name", "status", "created_at"],
    "is_default": false
}
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

### Export (HasExport trait)

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

Three formats supported: XLSX, CSV, PDF. Queued exports available via `?queued=true`.

### Detail / Expandable Rows

Show nested content when a row is expanded:

```php
class ProductDataTable extends AbstractDataTable
{
    public static function tableDetailRowEnabled(): bool
    {
        return true;
    }

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

Register the controller and pass the `renderDetailRow` prop:

```php
DataTableDetailRowController::register('products', ProductDataTable::class);
```

```tsx
<DataTable<Row>
    tableData={tableData}
    tableName="products"
    renderDetailRow={(row) => (
        <div className="p-4">
            <p>{row.description}</p>
        </div>
    )}
/>
```

### Conditional Rules (Row/Cell Styling)

Define server-side rules for dynamic row or cell styling:

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

### Full-Dataset Summaries

Add aggregation summaries across the **entire** filtered dataset (not just the current page):

```php
public static function tableColumns(): array
{
    return [
        new Column(id: 'quantity', label: 'Quantity', type: 'number', summary: 'sum'),
        new Column(id: 'price', label: 'Price', type: 'currency', summary: 'avg'),
        new Column(id: 'id', label: 'ID', type: 'number', summary: 'count'),
    ];
}
```

The summary row appears at the bottom of the table. Supported aggregations: `sum`, `count`, `avg`, `min`, `max`.

### Soft Deletes Toggle

Show/hide soft-deleted records with a toggle button:

```php
class ProductDataTable extends AbstractDataTable
{
    public static function tableSoftDeletesEnabled(): bool
    {
        return true;
    }

    // Show trashed by default (optional, default: false)
    public static function tableWithTrashedDefault(): bool
    {
        return false;
    }
}
```

The frontend automatically shows a "Show trashed" / "Hide trashed" button. The toggle appends `?with_trashed=1` to the URL.

### Boolean Toggle Switch

One-click switch to toggle boolean columns inline:

```php
public static function tableColumns(): array
{
    return [
        new Column(id: 'is_active', label: 'Active', type: 'boolean', toggleable: true),
    ];
}

// Handle the toggle (called by the controller)
public static function handleToggle(\Illuminate\Database\Eloquent\Model $model, string $column, bool $value): void
{
    $model->update([$column => $value]);
}
```

Register the controller:

```php
DataTableToggleController::register('products', ProductDataTable::class);
```

The frontend renders a `<Switch>` component that sends a PATCH request to `/data-table/toggle/{table}/{id}`.

### Enum-Based Filters

Automatically resolve filter options from PHP BackedEnum classes:

```php
enum ProductStatus: string
{
    case Active = 'active';
    case Inactive = 'inactive';
    case Draft = 'draft';
}

class ProductDataTable extends AbstractDataTable
{
    public static function tableEnumFilters(): array
    {
        return [
            'status' => ProductStatus::class,
        ];
    }
}
```

The column's filter options are automatically populated from the enum's cases, using the enum value as both `label` and `value`.

### Async Filter Options

Lazy-load filter options from the server (useful for large option sets):

```php
class ProductDataTable extends AbstractDataTable
{
    public static function tableAsyncFilterColumns(): array
    {
        return ['category_id', 'vendor_id'];
    }

    public static function resolveAsyncFilterOptions(string $column, ?string $search = null): array
    {
        return match ($column) {
            'category_id' => Category::query()
                ->when($search, fn ($q) => $q->where('name', 'like', "%{$search}%"))
                ->pluck('name', 'id')
                ->map(fn ($name, $id) => ['label' => $name, 'value' => (string) $id])
                ->values()
                ->toArray(),
            default => [],
        };
    }
}
```

Register the controller:

```php
DataTableAsyncFilterController::register('products', ProductDataTable::class);
```

### Cascading / Interdependent Filters

Filter options that depend on parent filter values (e.g., Country → City):

```php
class ProductDataTable extends AbstractDataTable
{
    public static function tableCascadingFilters(): array
    {
        return [
            'city' => 'country',  // city depends on country
        ];
    }

    public static function resolveCascadingFilterOptions(string $column, array $parentValues): array
    {
        return match ($column) {
            'city' => City::query()
                ->whereIn('country_id', $parentValues)
                ->pluck('name', 'id')
                ->map(fn ($name, $id) => ['label' => $name, 'value' => (string) $id])
                ->values()
                ->toArray(),
            default => [],
        };
    }
}
```

Register the controller:

```php
DataTableCascadingFilterController::register('products', ProductDataTable::class);
```

### Auto-Refresh Polling

Automatically refresh table data at a configurable interval:

```php
public static function tablePollingInterval(): int
{
    return 30; // Refresh every 30 seconds (0 = disabled)
}
```

The frontend uses `setInterval` with `router.reload()` for seamless partial reloads.

### Persist State

Save filters, sort, and per-page settings to localStorage so they persist across page reloads:

```php
public static function tablePersistState(): bool
{
    return true;
}
```

### Deferred / Lazy Loading

Render the table shell immediately and load data asynchronously:

```php
public static function tableDeferLoading(): bool
{
    return true;
}
```

The frontend shows a skeleton loading state, then triggers `router.reload()` on mount to fetch the actual data.

### Responsive Column Collapse

Auto-hide columns on small screens based on priority levels:

```php
public static function tableColumns(): array
{
    return [
        new Column(id: 'name', label: 'Name'),                              // Always visible
        new Column(id: 'email', label: 'Email', responsivePriority: 1),     // Hidden below 640px
        new Column(id: 'phone', label: 'Phone', responsivePriority: 2),     // Hidden below 768px
        new Column(id: 'created_at', label: 'Created', responsivePriority: 3), // Hidden below 896px
    ];
}
```

Columns with `responsivePriority: null` (default) are always visible. Lower priority numbers are hidden first. The threshold formula is `640 + (priority - 1) * 128` pixels.

### Radio Button Selection

Single-select mode using radio buttons instead of checkboxes:

```tsx
<DataTable<Row>
    tableData={tableData}
    tableName="products"
    selectionMode="radio"
    bulkActions={[
        {
            id: "view",
            label: "View Details",
            onClick: (rows) => router.visit(`/products/${rows[0].id}`),
        },
    ]}
/>
```

## Frontend API

### `<DataTable>` Props

```tsx
interface DataTableProps<TData extends object> {
    tableData: DataTableResponse<TData>;
    tableName: string;
    prefix?: string;
    actions?: DataTableAction<TData>[];
    bulkActions?: DataTableBulkAction<TData>[];
    renderCell?: (columnId: string, value: unknown, row: TData) => ReactNode | undefined;
    renderHeader?: Record<string, ReactNode>;
    renderFooterCell?: (columnId: string, value: unknown) => ReactNode | undefined;
    renderFilter?: Record<string, (value: unknown, onChange: (value: unknown) => void) => ReactNode>;
    rowClassName?: (row: TData) => string;
    rowDataAttributes?: (row: TData) => Record<string, string>;
    groupClassName?: Record<string, string>;
    options?: Partial<DataTableOptions>;
    translations?: Partial<DataTableTranslations>;
    onRowClick?: (row: TData) => void;
    rowLink?: (row: TData) => string;
    emptyState?: ReactNode;
    debounceMs?: number;
    partialReloadKey?: string;
    onInlineEdit?: (row: TData, columnId: string, value: unknown) => Promise<void> | void;
    realtimeChannel?: string;
    realtimeEvent?: string;       // default: '.updated'
    renderDetailRow?: (row: TData) => ReactNode;
    selectionMode?: "checkbox" | "radio";  // default: "checkbox"
    slots?: {
        toolbar?: ReactNode;
        beforeTable?: ReactNode;
        afterTable?: ReactNode;
        pagination?: ReactNode;
    };
}
```

### Options (Feature Flags)

```tsx
<DataTable
    tableData={tableData}
    tableName="products"
    options={{
        quickViews: true,           // Show quick view selector (default: true)
        customQuickViews: true,     // Allow saving custom views (default: true)
        exports: true,              // Show export button (default: true)
        filters: true,              // Show filter bar (default: true)
        columnVisibility: true,     // Show column toggle (default: true)
        columnOrdering: true,       // Allow drag-to-reorder (default: true)
        columnResizing: false,      // Enable column resizing (default: false)
        stickyHeader: false,        // Sticky table header (default: false)
        globalSearch: false,        // Show global search input (default: false)
        loading: true,              // Show skeleton during navigation (default: true)
        keyboardNavigation: false,  // Enable keyboard nav (default: false)
        printable: false,           // Show print button + styles (default: false)
    }}
/>
```

### Custom Filter Components

Provide custom filter UI for specific columns:

```tsx
<DataTable<Row>
    tableData={tableData}
    tableName="products"
    renderFilter={{
        location: (value, onChange) => (
            <MapPicker value={value} onChange={onChange} />
        ),
        color: (value, onChange) => (
            <ColorSwatchPicker value={value} onChange={onChange} />
        ),
    }}
/>
```

### Column Resizing

Enable drag-to-resize columns with widths persisted to localStorage:

```tsx
<DataTable<Row>
    tableData={tableData}
    tableName="products"
    options={{ columnResizing: true }}
/>
```

### Keyboard Navigation

Enable accessible keyboard navigation:

```tsx
<DataTable<Row>
    tableData={tableData}
    tableName="products"
    options={{ keyboardNavigation: true }}
/>
```

| Key | Action |
|-----|--------|
| Arrow Up/Down | Move focus between rows |
| Enter | Navigate to focused row (if `rowLink` or `onRowClick`) |
| Space | Toggle row selection (if bulk actions enabled) |
| Escape | Clear focus and selection |

### Loading State

Skeleton rows are shown automatically during Inertia navigation. Disable with:

```tsx
<DataTable options={{ loading: false }} />
```

### Print

Enable the print button and `@media print` styles:

```tsx
<DataTable<Row>
    tableData={tableData}
    tableName="products"
    options={{ printable: true }}
/>
```

### Shift+Click Range Selection

When bulk actions are enabled, hold Shift and click to select a range of rows between the last selected and current row.

### Active Filter Indicators

Column headers automatically show a small dot indicator when a filter is active on that column. No configuration needed.

### Real-Time Updates (Laravel Echo)

Auto-refresh the table when server events are broadcast:

```tsx
<DataTable<Row>
    tableData={tableData}
    tableName="products"
    realtimeChannel="products"
    realtimeEvent=".updated"
    partialReloadKey="tableData"
/>
```

Requires Laravel Echo to be configured globally (`window.Echo`). The table will call `router.reload()` when the event is received.

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
        confirm: true,
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

### Translations (i18n)

```tsx
import { frTranslations } from "laravel-data-table";

<DataTable translations={frTranslations} />

// Or override individual strings
<DataTable translations={{
    noData: "Nothing to show",
    loading: "Please wait...",
    print: "Print table",
    selectAllMatching: (count) => `Select all ${count} items`,
}} />
```

### Row Links and Click Handlers

```tsx
// Link-based (Cmd/Ctrl+click for new tab)
<DataTable rowLink={(row) => `/products/${row.id}`} />

// Callback-based
<DataTable onRowClick={(row) => router.visit(`/products/${row.id}`)} />
```

### Layout Slots

```tsx
<DataTable
    slots={{
        beforeTable: <Banner />,
        toolbar: <MyToolbar />,
        pagination: <MyPagination />,
        afterTable: <Footer />,
    }}
/>
```

### Footer Aggregations

```php
public static function tableFooter(\Illuminate\Support\Collection $items): array
{
    return ['price' => $items->sum('price')];
}
```

```tsx
<DataTable renderFooterCell={(columnId, value) => {
    if (columnId === "price") return <span className="text-emerald-600">{value} DT</span>;
}} />
```

## Auto-Registered Routes

The service provider registers these routes automatically:

| Method | URL | Description |
|--------|-----|-------------|
| GET | `/data-table/export/{table}` | Export data (XLSX/CSV/PDF) |
| GET | `/data-table/select-all/{table}` | Get all IDs matching filters |
| PATCH | `/data-table/inline-edit/{table}/{id}` | Inline edit a cell value |
| PATCH | `/data-table/toggle/{table}/{id}` | Toggle boolean column value |
| GET | `/data-table/detail/{table}/{id}` | Fetch detail/expandable row data |
| GET | `/data-table/filter-options/{table}/{column}` | Async filter options |
| GET | `/data-table/cascading-options/{table}/{column}` | Cascading filter options |
| GET | `/data-table/saved-views/{tableName}` | List saved views |
| POST | `/data-table/saved-views/{tableName}` | Create saved view |
| PUT | `/data-table/saved-views/{tableName}/{id}` | Update saved view |
| DELETE | `/data-table/saved-views/{tableName}/{id}` | Delete saved view |

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

## localStorage Keys

| Key | Purpose |
|-----|---------|
| `dt-columns-{tableName}` | Column visibility state |
| `dt-column-order-{tableName}` | Column display order |
| `dt-quickviews-{tableName}` | Custom saved quick views |
| `dt-resize-{tableName}` | Column resize widths |
| `dt-state-{tableName}` | Persisted filters, sorts, and per-page (when `persistState` is enabled) |

## Testing

```bash
cd vendor/machour/laravel-data-table
composer install
./vendor/bin/pest
```

## License

MIT
