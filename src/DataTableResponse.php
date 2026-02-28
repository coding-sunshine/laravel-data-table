<?php

namespace Machour\DataTable;

use Machour\DataTable\Columns\Column;
use Spatie\LaravelData\Data;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
class DataTableResponse extends Data
{
    public function __construct(
        public array $data,
        public array $columns,
        public array $quickViews,
        public DataTableMeta $meta,
        public ?string $exportUrl = null,
        public ?array $footer = null,
        public ?string $selectAllUrl = null,
        /** Full-dataset summary aggregations (sum/avg/min/max/count) */
        public ?array $summary = null,
        /** Table configuration for frontend features */
        public ?array $config = null,
        /** URL for boolean toggle updates */
        public ?string $toggleUrl = null,
        /** Enum filter options resolved from PHP enums */
        public ?array $enumOptions = null,
        /** URL for row reorder PATCH requests */
        public ?string $reorderUrl = null,
        /** URL for data import POST requests */
        public ?string $importUrl = null,
        /** Column ID to group rows by on frontend */
        public ?string $groupByColumn = null,
    ) {}
}
