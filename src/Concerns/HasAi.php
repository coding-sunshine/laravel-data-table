<?php

namespace Machour\DataTable\Concerns;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Machour\DataTable\Columns\Column;

/**
 * Add AI-powered features to a DataTable using Prism PHP or Laravel AI.
 *
 * Requires `prism-php/prism` to be installed:
 *   composer require prism-php/prism
 *
 * Features:
 * - Natural language query → filters/sort
 * - AI insights (anomaly detection, trends, patterns)
 * - AI column summaries (distribution analysis)
 * - AI smart suggestions (recommended filters)
 * - AI row enrichment (generate new column values via LLM)
 */
trait HasAi
{
    /**
     * The Prism model to use for AI features.
     * Override to use a different model (e.g., 'anthropic:claude-sonnet-4-20250514', 'openai:gpt-4o').
     */
    public static function tableAiModel(): string
    {
        return config('data-table.ai.model', 'openai:gpt-4o-mini');
    }

    /**
     * Maximum number of sample rows sent to the LLM for context.
     */
    public static function tableAiSampleSize(): int
    {
        return (int) config('data-table.ai.sample_size', 50);
    }

    /**
     * Additional system prompt context for the AI.
     * Override to add domain-specific instructions.
     */
    public static function tableAiSystemContext(): string
    {
        return '';
    }

    /**
     * Build a schema description of the table for the LLM.
     */
    protected static function buildSchemaDescription(): string
    {
        $columns = static::tableColumns();
        $lines = [];

        foreach ($columns as $col) {
            $parts = ["{$col->id} ({$col->type})"];
            if ($col->label) {
                $parts[] = "label: \"{$col->label}\"";
            }
            if ($col->filterable) {
                $parts[] = 'filterable';
            }
            if ($col->sortable) {
                $parts[] = 'sortable';
            }
            if (! empty($col->options)) {
                $opts = collect($col->options)->pluck('value')->implode(', ');
                $parts[] = "options: [{$opts}]";
            }
            if ($col->prefix) {
                $parts[] = "prefix: \"{$col->prefix}\"";
            }
            if ($col->suffix) {
                $parts[] = "suffix: \"{$col->suffix}\"";
            }
            $lines[] = '  - ' . implode(' | ', $parts);
        }

        return "Table columns:\n" . implode("\n", $lines);
    }

    /**
     * Get sample data rows for LLM context.
     *
     * @return array<int, array<string, mixed>>
     */
    protected static function getSampleData(?Request $request = null, ?int $limit = null): array
    {
        $limit = $limit ?? static::tableAiSampleSize();
        $query = static::buildFilteredQuery($request);

        return $query->getEloquentBuilder()
            ->limit($limit)
            ->get()
            ->map(fn ($row) => $row->toArray())
            ->all();
    }

    /**
     * Resolve Prism text generator. Returns null if Prism is not installed.
     */
    protected static function resolvePrism(): ?object
    {
        if (! class_exists(\PrismPHP\Prism::class)) {
            return null;
        }

        $model = static::tableAiModel();

        return \PrismPHP\Prism::text()
            ->using($model)
            ->withMaxTokens((int) config('data-table.ai.max_tokens', 1024));
    }

    /**
     * Handle natural language query → filters/sort.
     */
    public static function handleAiQuery(string $query, Request $request): JsonResponse
    {
        $prism = static::resolvePrism();

        if (! $prism) {
            return response()->json(['error' => 'Prism PHP is not installed. Run: composer require prism-php/prism'], 500);
        }

        $schema = static::buildSchemaDescription();
        $filterOperators = 'is, not, contains, gt, gte, lt, lte, between (val1,val2), before, after, null, not_null';
        $extraContext = static::tableAiSystemContext();

        $systemPrompt = <<<PROMPT
You are a data table filter assistant. Given a table schema and a natural language query, return a JSON object with filters and/or sort to apply.

{$schema}

Available filter operators: {$filterOperators}
Filter format: {"filters": {"column_id": "operator:value"}, "sort": "-column_id"}
Sort format: "column_id" for ASC, "-column_id" for DESC. Multiple: "col1,-col2"

Rules:
- Only use columns that exist in the schema above
- Only use operators appropriate for the column type
- For option columns, only use values from the options list
- Return ONLY valid JSON, no markdown, no explanation
{$extraContext}
PROMPT;

        try {
            $response = $prism
                ->withSystemPrompt($systemPrompt)
                ->withPrompt("User query: \"{$query}\"")
                ->generate();

            $text = trim($response->text);

            // Strip markdown fences if present
            $text = preg_replace('/^```(?:json)?\s*/i', '', $text);
            $text = preg_replace('/\s*```$/i', '', $text);

            $result = json_decode($text, true);

            if (json_last_error() !== JSON_ERROR_NONE) {
                return response()->json(['error' => 'AI returned invalid JSON', 'raw' => $text], 422);
            }

            return response()->json([
                'filters' => $result['filters'] ?? null,
                'sort' => $result['sort'] ?? null,
            ]);
        } catch (\Throwable $e) {
            Log::error('DataTable AI query failed', ['error' => $e->getMessage(), 'query' => $query]);

            return response()->json(['error' => 'AI query failed: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Handle AI insights generation.
     */
    public static function handleAiInsights(Request $request): JsonResponse
    {
        $prism = static::resolvePrism();

        if (! $prism) {
            return response()->json(['error' => 'Prism PHP is not installed.'], 500);
        }

        $schema = static::buildSchemaDescription();
        $sample = static::getSampleData($request, 30);
        $sampleJson = json_encode(array_slice($sample, 0, 15), JSON_PRETTY_PRINT);
        $extraContext = static::tableAiSystemContext();

        $systemPrompt = <<<PROMPT
You are a data analyst. Analyze the table schema and sample data, then return insights as a JSON array.

{$schema}

Each insight should be an object with:
- "type": "anomaly" | "trend" | "pattern" | "recommendation"
- "title": Short headline (max 60 chars)
- "description": 1-2 sentence explanation
- "severity": "info" | "warning" | "critical" (for anomalies)
- "column": Related column ID (optional)
- "action": Suggested filter/sort to apply (optional, same format as query endpoint)

Return 3-5 most interesting insights. Return ONLY valid JSON array, no markdown.
{$extraContext}
PROMPT;

        try {
            $response = $prism
                ->withSystemPrompt($systemPrompt)
                ->withPrompt("Sample data (first 15 rows):\n{$sampleJson}")
                ->generate();

            $text = trim($response->text);
            $text = preg_replace('/^```(?:json)?\s*/i', '', $text);
            $text = preg_replace('/\s*```$/i', '', $text);

            $insights = json_decode($text, true);

            if (json_last_error() !== JSON_ERROR_NONE) {
                return response()->json(['error' => 'AI returned invalid response'], 422);
            }

            return response()->json(['insights' => $insights]);
        } catch (\Throwable $e) {
            Log::error('DataTable AI insights failed', ['error' => $e->getMessage()]);

            return response()->json(['error' => 'AI insights failed: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Handle AI column summary.
     */
    public static function handleAiColumnSummary(string $columnId, Request $request): JsonResponse
    {
        $prism = static::resolvePrism();

        if (! $prism) {
            return response()->json(['error' => 'Prism PHP is not installed.'], 500);
        }

        $column = collect(static::tableColumns())->first(fn (Column $col) => $col->id === $columnId);

        if (! $column) {
            return response()->json(['error' => 'Column not found.'], 404);
        }

        // Get column values from sample data
        $sample = static::getSampleData($request, 100);
        $values = collect($sample)->pluck($columnId)->filter()->values()->all();
        $valuesJson = json_encode(array_slice($values, 0, 50));

        $systemPrompt = <<<PROMPT
You are a data analyst. Analyze the values from a single column and return a JSON summary.

Column: {$column->id} (type: {$column->type}, label: "{$column->label}")

Return a JSON object with:
- "summary": 2-3 sentence plain English summary of the data distribution
- "highlights": Array of 2-4 key observations (strings)
- "suggestion": A recommended filter or action (optional string)

Return ONLY valid JSON, no markdown.
PROMPT;

        try {
            $response = $prism
                ->withSystemPrompt($systemPrompt)
                ->withPrompt("Column values (sample of up to 50):\n{$valuesJson}")
                ->generate();

            $text = trim($response->text);
            $text = preg_replace('/^```(?:json)?\s*/i', '', $text);
            $text = preg_replace('/\s*```$/i', '', $text);

            $result = json_decode($text, true);

            if (json_last_error() !== JSON_ERROR_NONE) {
                return response()->json(['error' => 'AI returned invalid response'], 422);
            }

            return response()->json($result);
        } catch (\Throwable $e) {
            Log::error('DataTable AI column summary failed', ['error' => $e->getMessage()]);

            return response()->json(['error' => 'AI column summary failed: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Handle AI smart suggestions.
     */
    public static function handleAiSuggest(Request $request): JsonResponse
    {
        $prism = static::resolvePrism();

        if (! $prism) {
            return response()->json(['error' => 'Prism PHP is not installed.'], 500);
        }

        $schema = static::buildSchemaDescription();
        $sample = static::getSampleData($request, 20);
        $sampleJson = json_encode(array_slice($sample, 0, 10), JSON_PRETTY_PRINT);

        // Include current filters context
        $currentFilters = $request->get('current_filters', []);
        $filtersContext = ! empty($currentFilters) ? "\nCurrently active filters: " . json_encode($currentFilters) : '';
        $extraContext = static::tableAiSystemContext();

        $systemPrompt = <<<PROMPT
You are a data assistant. Based on the table schema, sample data, and current filters, suggest useful filter/sort actions the user might want to apply.

{$schema}
{$filtersContext}

Return a JSON array of 3-5 suggestions, each with:
- "label": Short human-readable label (e.g., "Show high-value orders")
- "description": Brief explanation of what this does
- "action": {"filters": {...}, "sort": "..."} to apply (same format as query endpoint)
- "icon": One of: "trending-up", "alert-triangle", "filter", "sort-desc", "eye"

Return ONLY valid JSON array, no markdown.
{$extraContext}
PROMPT;

        try {
            $response = $prism
                ->withSystemPrompt($systemPrompt)
                ->withPrompt("Sample data:\n{$sampleJson}")
                ->generate();

            $text = trim($response->text);
            $text = preg_replace('/^```(?:json)?\s*/i', '', $text);
            $text = preg_replace('/\s*```$/i', '', $text);

            $suggestions = json_decode($text, true);

            if (json_last_error() !== JSON_ERROR_NONE) {
                return response()->json(['error' => 'AI returned invalid response'], 422);
            }

            return response()->json(['suggestions' => $suggestions]);
        } catch (\Throwable $e) {
            Log::error('DataTable AI suggest failed', ['error' => $e->getMessage()]);

            return response()->json(['error' => 'AI suggestions failed: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Handle AI row enrichment — generate new column values via LLM.
     */
    public static function handleAiEnrich(string $prompt, string $columnName, array $rowIds, Request $request): JsonResponse
    {
        $prism = static::resolvePrism();

        if (! $prism) {
            return response()->json(['error' => 'Prism PHP is not installed.'], 500);
        }

        // Get the actual rows
        $query = static::tableBaseQuery();
        $rows = $query->whereIn('id', $rowIds)->limit(50)->get();

        if ($rows->isEmpty()) {
            return response()->json(['error' => 'No rows found.'], 404);
        }

        $rowsData = $rows->map(fn ($row) => $row->toArray())->all();
        $rowsJson = json_encode($rowsData, JSON_PRETTY_PRINT);
        $extraContext = static::tableAiSystemContext();

        $systemPrompt = <<<PROMPT
You are a data enrichment assistant. For each row provided, generate a value for a new column based on the user's prompt.

Return a JSON object mapping row ID to the generated value:
{"row_id_1": "generated value", "row_id_2": "generated value", ...}

Rules:
- Generate a concise, useful value for each row
- Values should be consistent in format across rows
- Return ONLY valid JSON, no markdown
{$extraContext}
PROMPT;

        try {
            $response = $prism
                ->withSystemPrompt($systemPrompt)
                ->withPrompt("Generate \"{$columnName}\" column values using this prompt: \"{$prompt}\"\n\nRows:\n{$rowsJson}")
                ->generate();

            $text = trim($response->text);
            $text = preg_replace('/^```(?:json)?\s*/i', '', $text);
            $text = preg_replace('/\s*```$/i', '', $text);

            $enrichments = json_decode($text, true);

            if (json_last_error() !== JSON_ERROR_NONE) {
                return response()->json(['error' => 'AI returned invalid response'], 422);
            }

            return response()->json([
                'column_name' => $columnName,
                'enrichments' => $enrichments,
            ]);
        } catch (\Throwable $e) {
            Log::error('DataTable AI enrich failed', ['error' => $e->getMessage()]);

            return response()->json(['error' => 'AI enrichment failed: ' . $e->getMessage()], 500);
        }
    }
}
