<?php

namespace Machour\DataTable\Ai\Agents;

use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Contracts\HasStructuredOutput;
use Laravel\Ai\Promptable;

/**
 * AI Agent that summarizes a single column's data distribution.
 */
class DataTableColumnSummaryAgent implements Agent, HasStructuredOutput
{
    use Promptable;

    public function __construct(
        protected string $columnId = '',
        protected string $columnType = '',
        protected string $columnLabel = '',
    ) {}

    public function instructions(): string
    {
        return <<<PROMPT
You are a data analyst. Analyze the values from a single column and return a summary.

Column: {$this->columnId} (type: {$this->columnType}, label: "{$this->columnLabel}")

Return:
- "summary": 2-3 sentence plain English summary of the data distribution
- "highlights": Array of 2-4 key observations (strings)
- "suggestion": A recommended filter or action (optional string, null if none)
PROMPT;
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'summary' => $schema->string()->required(),
            'highlights' => $schema->array()->required(),
            'suggestion' => $schema->string()->nullable(),
        ];
    }
}
