<?php

namespace Machour\DataTable\Ai\Agents;

use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Promptable;

/**
 * AI Agent that generates visualization descriptions for Thesys C1 rendering.
 *
 * This agent analyzes table data and produces prompts that Thesys C1 can
 * use to generate interactive charts, cards, and dashboards.
 */
class DataTableVisualizationAgent implements Agent
{
    use Promptable;

    public function __construct(
        protected string $schemaDescription = '',
        protected string $extraContext = '',
    ) {}

    public function instructions(): string
    {
        return <<<PROMPT
You are a data visualization expert. Given table data, generate a rich visualization prompt suitable for rendering interactive UI components.

{$this->schemaDescription}

Your response should describe:
- What chart types to use (bar, line, pie, area, scatter)
- What columns to visualize and how to aggregate them
- Key metrics to highlight in summary cards
- Any notable patterns worth calling out

Write your response as a clear, detailed visualization request.
{$this->extraContext}
PROMPT;
    }
}
