# Laravel DataTable

A reusable, server-side DataTable system for **Laravel + Inertia.js + React** (TanStack Table v8). Define your table in a single PHP class — get sorting, filtering, pagination, exports, quick views, and a full-featured React UI out of the box.

## Features

- **Single-file backend** — One PHP class per model acts as both DTO and table configuration
- **Server-side everything** — Sorting, filtering, pagination handled by Spatie QueryBuilder
- **Operator-based filters** — URL format `filter[price]=gte:1000` with 14 operators (eq, neq, gt, gte, lt, lte, between, in, not_in, contains, before, after, null, not_null)
- **Global search** — Server-side search across configurable columns with debounced input
- **Quick Views** — Server-defined filter presets + user-saved custom views (localStorage)
- **Column ordering** — Drag-to-reorder via GripVertical handles, persisted to localStorage
- **Column pinning** — Automatic sticky columns for checkbox (`_select`) and actions (`_actions`)
- **Column groups** — Group columns under shared headers with custom background colors
- **Column visibility** — Toggle columns on/off, persisted to localStorage
- **Footer aggregations** — Per-page computed values (sum, avg, etc.) with custom rendering
- **XLSX/CSV/PDF export** — Via Maatwebsite Excel with optional queued exports and DomPDF support
- **Bulk actions** — Checkbox selection with configurable action buttons and confirmation dialogs
- **Row actions** — Per-row dropdown menu with visibility, variant, and confirmation dialog support
- **Image columns** — Render image thumbnails directly in table cells
- **Badge columns** — Styled status badges with variant support (success, warning, danger, info, secondary)
- **Row links / click handlers** — Make rows clickable with href links or custom click callbacks
- **Multiple tables per page** — URL parameter namespacing via `prefix` prop
- **Pagination types** — Standard, simple (no total count), and cursor-based pagination
- **i18n / Translations** — Full translation system with English and French built-in, fully customizable
- **Sticky header** — Optionally freeze table headers while scrolling
- **Partial reloads** — Inertia.js partial reload support for optimized data fetching
- **Debounced inputs** — Configurable debounce for filters and global search
- **Layout slots** — Composable slot overrides for toolbar, pagination, and surrounding content
- **Custom empty state** — Customizable empty state when no data is available
- **Row data attributes** — Add custom `data-*` attributes to rows for styling/testing
- **API Resource support** — Transform rows through Laravel JsonResource classes
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

The `shadcn add` command will automatically install all required shadcn components (button, table, checkbox, etc.) and npm dependencies (`@tanstack/react-table`, `@inertiajs/react`, `date-fns`, `lucide-react`).

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

### 3. (Optional) Install export dependencies

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

# Also append a route to routes/web.php
php artisan make:data-table Product --route

# Custom route file
php artisan make:data-table Product --route --route-file=routes/admin.php

# Custom page output path
php artisan make:data-table Product --page-path=resources/js/pages/admin
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
| `makeTable(?Request, ?string)` | Inherited | Builds the `DataTableResponse` — call this in your route. Optional `$prefix` for multi-table pages |

### `Column`

```php
new Column(
    id: 'price',             // Must match DTO property name
    label: 'Price',          // Display label
    type: 'number',          // text | number | date | option | multiOption | boolean | image | badge
    sortable: true,          // Allow sorting
    filterable: true,        // Show in filter bar
    visible: true,           // Default visibility (user can toggle)
    options: [...],          // For type=option/badge: [['label' => 'X', 'value' => 'x', 'variant' => 'success'], ...]
    min: 0,                  // For number range (optional)
    max: 100000,             // For number range (optional)
    icon: 'check',           // Lucide icon name (optional)
    searchThreshold: 5,      // Show search input in option filter if >= N options
    group: 'Details',        // Group columns under a header (optional)
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
| `image` | Image URL | 32×32 rounded thumbnail |
| `badge` | Status badge | Colored pill with variant styling |

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

This searches across all specified columns using `LIKE %term%`. On the frontend, enable the search input:

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

When configured, each row is passed through `(new ProductResource($item))->resolve()` before serialization.

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

This prefixes all URL parameters: `products_sort`, `products_page`, `products_filter[...]`, `orders_sort`, etc.

On the frontend, pass the same prefix:

```tsx
<DataTable tableData={productsTable} tableName="products" prefix="products" />
<DataTable tableData={ordersTable} tableName="orders" prefix="orders" />
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
    columns: ['id', 'name', 'created_at'],  // Optional: visible columns in display order
);
```

- **Empty `params: []`** matches when no filter and no sort in the URL
- **`columns`** defines both visibility AND display order when the view is active

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
        // Remap filter name to a different DB column:
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

The export route is **auto-registered** by the service provider at `/data-table/export/{table}`. You just need to register your table classes:

```php
use Machour\DataTable\Http\Controllers\DataTableExportController;

// In a service provider or route file:
DataTableExportController::register('products', ProductDataTable::class);
```

#### Export Formats

Three formats are supported:

| Format | Requires |
|--------|----------|
| XLSX | `maatwebsite/excel` |
| CSV | `maatwebsite/excel` |
| PDF | `maatwebsite/excel` + `barryvdh/laravel-dompdf` |

Image columns are automatically excluded from exports.

#### Queued Exports

For large datasets, trigger a queued export by adding `?queued=true` to the export URL:

```
GET /data-table/export/products?format=xlsx&queued=true
```

Returns a JSON response:
```json
{
    "queued": true,
    "path": "exports/products-export_xlsx_1234567890.xlsx",
    "message": "Export is being processed. You will be notified when it is ready."
}
```

The file is stored in the `local` disk under the returned path.

## Frontend API

### `<DataTable>` Props

```tsx
interface DataTableProps<TData extends object> {
    tableData: DataTableResponse<TData>;  // Server response from makeTable()
    tableName: string;                     // Unique name for localStorage keys
    prefix?: string;                       // URL param prefix for multiple tables per page
    actions?: DataTableAction<TData>[];    // Row actions dropdown
    bulkActions?: DataTableBulkAction<TData>[]; // Bulk actions with checkbox selection
    renderCell?: (columnId: string, value: unknown, row: TData) => ReactNode | undefined;
    renderHeader?: Record<string, ReactNode>;
    renderFooterCell?: (columnId: string, value: unknown) => ReactNode | undefined;
    rowClassName?: (row: TData) => string;
    rowDataAttributes?: (row: TData) => Record<string, string>;  // Custom data-* attributes per row
    groupClassName?: Record<string, string>;
    options?: Partial<DataTableOptions>;   // Feature flags
    translations?: Partial<DataTableTranslations>;  // i18n overrides
    onRowClick?: (row: TData) => void;     // Row click callback
    rowLink?: (row: TData) => string;      // Row href for link navigation
    emptyState?: ReactNode;                // Custom empty state
    debounceMs?: number;                   // Debounce delay for filters/search (default: 300)
    partialReloadKey?: string;             // Inertia partial reload key
    slots?: {                              // Layout slot overrides
        toolbar?: ReactNode;
        beforeTable?: ReactNode;
        afterTable?: ReactNode;
        pagination?: ReactNode;
    };
}
```

### Options (Feature Flags)

All default to `true` except `stickyHeader` and `globalSearch` which default to `false`:

```tsx
<DataTable
    tableData={tableData}
    tableName="products"
    options={{
        quickViews: false,
        customQuickViews: false,
        exports: false,
        filters: false,
        columnVisibility: false,
        columnOrdering: false,
        stickyHeader: true,     // Enable sticky header (default: false)
        globalSearch: true,     // Enable global search input (default: false)
    }}
/>
```

### Translations (i18n)

The component ships with English (default) and French translations. Override any string:

```tsx
import { frTranslations } from "laravel-data-table";

// Use French
<DataTable
    tableData={tableData}
    tableName="products"
    translations={frTranslations}
/>

// Or override individual strings
<DataTable
    tableData={tableData}
    tableName="products"
    translations={{
        noData: "Nothing to show",
        rowsPerPage: "Items per page",
        filter: "Filter results",
        confirmTitle: "Please confirm",
        totalResults: (count) => `${count} item${count !== 1 ? "s" : ""} found`,
    }}
/>
```

All translatable strings are defined in the `DataTableTranslations` interface. The full list includes:

- **Pagination**: `totalResults`, `rowsPerPage`, `pageOf`
- **Columns**: `columns`, `reorder`, `done`
- **Export**: `export`, `exportFormat`
- **Filters**: `filter`, `search`, `operators`, `clearAllFilters`, `noResults`, `pressEnterToFilter`
- **Filter operators**: `opContains`, `opExact`, `opEquals`, `opNotEquals`, `opGreaterThan`, `opGreaterOrEqual`, `opLessThan`, `opLessOrEqual`, `opBetween`, `opIs`, `opIsNot`, `opOnDate`, `opBefore`, `opAfter`
- **Boolean**: `yes`, `no`
- **Bulk actions**: `selected`
- **Selection**: `selectAll`, `selectRow`
- **Quick views**: `view`, `quickViews`, `savedViews`, `saveFilters`, `manageViews`, `viewName`, `viewNamePlaceholder`, `filtersWillBeSavedLocally`, `filtersLabel`, `none`, `sortLabel`, `columnsCount`, `cancel`, `save`
- **Numbers**: `min`, `max`, `value`
- **Empty state**: `noData`
- **Row actions**: `actions`
- **Confirmation**: `confirmTitle`, `confirmDescription`, `confirmAction`, `confirmCancel`

### Custom Cell Rendering

```tsx
<DataTable<Row>
    tableData={tableData}
    tableName="products"
    renderCell={(columnId, value, row) => {
        if (columnId === "price") return <span className="font-bold">{value} DT</span>;
        return undefined; // Fall back to default
    }}
/>
```

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
        confirm: true,  // Shows default confirmation dialog
    },
];
```

#### Confirmation Dialogs

Both row actions and bulk actions support confirmation dialogs:

```tsx
// Simple confirmation (uses default title/description)
{
    label: "Delete",
    onClick: (row) => router.delete(`/products/${row.id}`),
    confirm: true,
}

// Custom confirmation
{
    label: "Archive",
    onClick: (row) => router.post(`/products/${row.id}/archive`),
    confirm: {
        title: "Archive this product?",
        description: "The product will be hidden from the storefront.",
        confirmLabel: "Yes, archive it",
        cancelLabel: "Keep it",
        variant: "destructive",
    },
}
```

### Bulk Actions

```tsx
import type { DataTableBulkAction } from "laravel-data-table";
import { Trash2 } from "lucide-react";

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

### Row Links and Click Handlers

Make rows clickable with either href links or callbacks:

```tsx
// Link-based navigation (supports Cmd/Ctrl+click for new tab)
<DataTable<Row>
    tableData={tableData}
    tableName="products"
    rowLink={(row) => `/products/${row.id}`}
/>

// Callback-based
<DataTable<Row>
    tableData={tableData}
    tableName="products"
    onRowClick={(row) => router.visit(`/products/${row.id}`)}
/>
```

Clicks on interactive elements (buttons, checkboxes, links) within the row are automatically ignored.

### Row Data Attributes

Add custom `data-*` attributes to rows for CSS styling or test selectors:

```tsx
<DataTable<Row>
    tableData={tableData}
    tableName="products"
    rowDataAttributes={(row) => ({
        "data-product-id": String(row.id),
        "data-status": row.status,
    })}
/>
```

### Empty State

Customize what's shown when the table has no data:

```tsx
<DataTable<Row>
    tableData={tableData}
    tableName="products"
    emptyState={
        <div className="flex flex-col items-center gap-2 py-8">
            <p className="text-lg font-medium">No products yet</p>
            <Button onClick={() => router.visit('/products/create')}>
                Create your first product
            </Button>
        </div>
    }
/>
```

### Layout Slots

Override specific sections of the DataTable layout:

```tsx
<DataTable<Row>
    tableData={tableData}
    tableName="products"
    slots={{
        beforeTable: <div className="px-4 py-2 bg-blue-50">Custom banner above table</div>,
        toolbar: <MyCustomToolbar />,          // Replaces the default toolbar
        pagination: <MyCustomPagination />,    // Replaces the default pagination
        afterTable: <div className="p-4">Footer content below table</div>,
    }}
/>
```

### Debounced Input

Configure debounce for filter and search inputs to reduce server requests:

```tsx
<DataTable<Row>
    tableData={tableData}
    tableName="products"
    debounceMs={500}  // Wait 500ms after last keystroke before navigating
/>
```

### Partial Reloads

Use Inertia.js partial reloads to only refresh the table data:

```tsx
// Controller
Route::get('/dashboard', function () {
    return Inertia::render('dashboard', [
        'tableData' => Inertia::lazy(fn () => ProductDataTable::makeTable()),
    ]);
});

// Frontend
<DataTable<Row>
    tableData={tableData}
    tableName="products"
    partialReloadKey="tableData"
/>
```

### Sticky Header

Enable sticky table headers that freeze while scrolling:

```tsx
<DataTable<Row>
    tableData={tableData}
    tableName="products"
    options={{ stickyHeader: true }}
/>
```

### Footer Aggregations

Backend:
```php
public static function tableFooter(\Illuminate\Support\Collection $items): array
{
    return [
        'price' => $items->sum('price'),
    ];
}
```

Frontend (custom rendering):
```tsx
<DataTable<Row>
    tableData={tableData}
    tableName="products"
    renderFooterCell={(columnId, value) => {
        if (columnId === "price") return <span className="text-emerald-600">{value} DT</span>;
        return undefined;
    }}
/>
```

### Column Group Styling

```tsx
<DataTable<Row>
    tableData={tableData}
    tableName="products"
    groupClassName={{
        Details: "bg-emerald-50/60 dark:bg-emerald-950/20",
        Specs: "bg-violet-50/60 dark:bg-violet-950/5",
    }}
/>
```

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

### With prefix (multiple tables)

```
/dashboard?products_filter[price]=gte:100&products_sort=-price&products_page=2&orders_sort=-created_at&orders_page=1
```

## localStorage Keys

The component persists user preferences under these keys:

| Key | Purpose |
|-----|---------|
| `dt-columns-{tableName}` | Column visibility state |
| `dt-column-order-{tableName}` | Column display order |
| `dt-quickviews-{tableName}` | Custom saved quick views |

## Testing

```bash
cd vendor/machour/laravel-data-table
composer install
./vendor/bin/pest
```

## License

MIT
