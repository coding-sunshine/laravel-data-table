<?php

namespace Machour\DataTable\Columns;

use Spatie\LaravelData\Data;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
class Column extends Data
{
    public function __construct(
        public string $id,
        public string $label,
        public string $type = 'text',
        public bool $sortable = false,
        public bool $filterable = false,
        public bool $visible = true,
        public ?array $options = null,
        public ?float $min = null,
        public ?float $max = null,
        public ?string $icon = null,
        public ?int $searchThreshold = null,
        public ?string $group = null,
        /** Inline editable — allows the cell to be edited inline */
        public bool $editable = false,
        /** Currency code for type=currency (e.g., 'USD', 'EUR') */
        public ?string $currency = null,
        /** Locale for number/currency formatting (e.g., 'en-US') */
        public ?string $locale = null,
        /** Summary aggregation: 'sum', 'count', 'avg', 'min', 'max', 'range', or null */
        public ?string $summary = null,
        /** Whether this column is toggleable (boolean switch) */
        public bool $toggleable = false,
        /** Column priority for responsive collapse (lower = hidden first on small screens). null = always visible */
        public ?int $responsivePriority = null,
        /** Internal database column name or dot-notation relation path (e.g., 'user.name', 'category.title'). If null, uses $id. */
        public ?string $internalName = null,
        /** Relationship to eager load for this column (e.g., 'user', 'category.parent'). Used for automatic eager loading. */
        public ?string $relation = null,
        /** Text to display before the cell value (e.g., '$', '€') */
        public ?string $prefix = null,
        /** Text to display after the cell value (e.g., 'kg', '%', ' items') */
        public ?string $suffix = null,
        /** Tooltip text shown on hover. Can be a static string or a column ID to read from the row. */
        public ?string $tooltip = null,
        /** Description text displayed below the column header label */
        public ?string $description = null,
        /** CSS line-clamp value to truncate long text (e.g., 2 = max 2 lines) */
        public ?int $lineClamp = null,
        /** Map of values to icon names for icon columns (e.g., ['active' => 'check-circle', 'inactive' => 'x-circle']) */
        public ?array $iconMap = null,
        /** Map of values to color classes for conditional cell coloring (e.g., ['active' => 'text-emerald-600', 'overdue' => 'text-red-600']) */
        public ?array $colorMap = null,
        /** Options for inline select dropdown editing (e.g., [['label' => 'Active', 'value' => 'active'], ...]) */
        public ?array $selectOptions = null,
        /** Whether to render the cell value as HTML (sanitized) */
        public bool $html = false,
        /** Whether to render the cell value as Markdown */
        public bool $markdown = false,
        /** Display array values as a bulleted list */
        public bool $bulleted = false,
        /** Show stacked content: array of column IDs to display vertically in this cell */
        public ?array $stacked = null,
        /** Whether this is a row index column (auto-incrementing row number) */
        public bool $rowIndex = false,
        /** Column ID that holds the avatar/image URL for composite avatar+text display */
        public ?string $avatarColumn = null,
        /** Whether this column has a dynamic (closure-based) suffix resolved server-side */
        public bool $hasDynamicSuffix = false,
        /** Computed column expression: array of column IDs used in the computation (frontend resolves) */
        public ?array $computedFrom = null,
        /** Number of columns this cell should span (column spanning) */
        public ?int $colSpan = null,
        /** Whether this column should auto-size row heights based on content */
        public bool $autoHeight = false,
        /** valueGetter expression: column ID or dot-path to derive the value for sorting/filtering */
        public ?string $valueGetter = null,
        /** valueFormatter expression: format string for display (e.g., '{value} USD') */
        public ?string $valueFormatter = null,
        /** Whether this column supports header filter (inline filter in column header) */
        public bool $headerFilter = false,
        /** Sparkline chart type for this column: 'line', 'bar', or null */
        public ?string $sparkline = null,
        /** Tree data: column ID used as the tree path parent reference */
        public ?string $treeParent = null,
    ) {}
}
