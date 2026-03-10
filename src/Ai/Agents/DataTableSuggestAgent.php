<?php

namespace Machour\DataTable\Ai\Agents;

use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Contracts\HasStructuredOutput;
use Laravel\Ai\Promptable;

/**
 * AI Agent that generates smart filter/sort suggestions based on the current data.
 */
class DataTableSuggestAgent implements Agent, HasStructuredOutput
{
    use Promptable;

    public function __construct(
        protected string $schemaDescription = '',
        protected string $filtersContext = '',
        protected string $extraContext = '',
    ) {}

    public function instructions(): string
    {
        return <<<PROMPT
You are a data assistant. Based on the table schema, sample data, and current filters, suggest useful filter/sort actions.

{$this->schemaDescription}
{$this->filtersContext}

Each suggestion should have:
- "label": Short human-readable label (e.g., "Show high-value orders")
- "description": Brief explanation of what this does
- "action": {"filters": {...}, "sort": "..."} to apply
- "icon": One of: "trending-up", "alert-triangle", "filter", "sort-desc", "eye"

Return 3-5 suggestions.
{$this->extraContext}
PROMPT;
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'suggestions' => $schema->array()->required(),
        ];
    }
}
