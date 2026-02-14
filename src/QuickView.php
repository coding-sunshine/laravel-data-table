<?php

namespace Machour\DataTable;

use Spatie\LaravelData\Data;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
class QuickView extends Data
{
    public function __construct(
        public string $id,
        public string $label,
        public array $params = [],
        public ?string $icon = null,
        public bool $active = false,
        /** @var string[]|null Column IDs to show (in display order) when this view is active. null = no change. */
        public ?array $columns = null,
    ) {}
}
