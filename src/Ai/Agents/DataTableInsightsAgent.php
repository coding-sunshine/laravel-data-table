<?php

namespace Machour\DataTable\Ai\Agents;

use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Contracts\HasStructuredOutput;
use Laravel\Ai\Promptable;

/**
 * AI Agent that analyzes table data and returns structured insights.
 *
 * Detects anomalies, trends, patterns, and makes recommendations.
 */
class DataTableInsightsAgent implements Agent, HasStructuredOutput
{
    use Promptable;

    public function __construct(
        protected string $schemaDescription = '',
        protected string $extraContext = '',
    ) {}

    public function instructions(): string
    {
        return <<<PROMPT
You are a data analyst. Analyze the table schema and sample data, then return insights.

{$this->schemaDescription}

Each insight should have:
- "type": "anomaly" | "trend" | "pattern" | "recommendation"
- "title": Short headline (max 60 chars)
- "description": 1-2 sentence explanation
- "severity": "info" | "warning" | "critical" (for anomalies)
- "column": Related column ID (optional, null if not applicable)
- "action": Suggested filter/sort to apply (optional, null if not applicable)

Return 3-5 most interesting insights.
{$this->extraContext}
PROMPT;
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'insights' => $schema->array()->required(),
        ];
    }
}
