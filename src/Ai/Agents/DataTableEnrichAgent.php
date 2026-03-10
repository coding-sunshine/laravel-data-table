<?php

namespace Machour\DataTable\Ai\Agents;

use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Contracts\HasStructuredOutput;
use Laravel\Ai\Promptable;

/**
 * AI Agent that enriches rows with AI-generated column values.
 *
 * Example prompts:
 * - "Classify the sentiment of the description" → positive/neutral/negative
 * - "Generate a 2-word category label" → "Electronics", "Home & Garden"
 * - "Rate the urgency from 1-5" → 1, 2, 3, 4, 5
 */
class DataTableEnrichAgent implements Agent, HasStructuredOutput
{
    use Promptable;

    public function __construct(
        protected string $columnName = '',
        protected string $extraContext = '',
    ) {}

    public function instructions(): string
    {
        return <<<PROMPT
You are a data enrichment assistant. For each row provided, generate a value for a new column called "{$this->columnName}" based on the user's prompt.

Return a JSON object mapping row ID to the generated value.

Rules:
- Generate a concise, useful value for each row
- Values should be consistent in format across rows
- Use the row's existing data to inform the generated value
{$this->extraContext}
PROMPT;
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'enrichments' => $schema->object()->required(),
        ];
    }
}
