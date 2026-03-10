<?php

namespace Machour\DataTable\Ai\Agents;

use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Contracts\HasStructuredOutput;
use Laravel\Ai\Promptable;

/**
 * AI Agent that converts natural language queries into DataTable filter/sort config.
 *
 * Uses Laravel AI SDK structured output to guarantee valid JSON responses.
 *
 * Example: "Show me active products over $50 sorted by price" →
 *   { "filters": {"status": "is:active", "price": "gt:50"}, "sort": "-price" }
 */
class DataTableQueryAgent implements Agent, HasStructuredOutput
{
    use Promptable;

    public function __construct(
        protected string $schemaDescription = '',
        protected string $extraContext = '',
    ) {}

    public function instructions(): string
    {
        $filterOperators = 'is, not, contains, gt, gte, lt, lte, between (val1,val2), before, after, null, not_null';

        return <<<PROMPT
You are a data table filter assistant. Given a table schema and a natural language query, return filters and/or sort to apply.

{$this->schemaDescription}

Available filter operators: {$filterOperators}
Filter format: {"column_id": "operator:value"}
Sort format: "column_id" for ASC, "-column_id" for DESC. Multiple: "col1,-col2"

Rules:
- Only use columns that exist in the schema above
- Only use operators appropriate for the column type
- For option columns, only use values from the options list
- If the query doesn't map to any filter/sort, return empty objects
{$this->extraContext}
PROMPT;
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'filters' => $schema->object()->nullable(),
            'sort' => $schema->string()->nullable(),
        ];
    }
}
