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
        /** Summary aggregation: 'sum', 'count', 'avg', 'min', 'max', or null */
        public ?string $summary = null,
        /** Whether this column is toggleable (boolean switch) */
        public bool $toggleable = false,
        /** Column priority for responsive collapse (lower = hidden first on small screens). null = always visible */
        public ?int $responsivePriority = null,
    ) {}
}
