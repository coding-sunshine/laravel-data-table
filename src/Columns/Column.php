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
    ) {}
}
