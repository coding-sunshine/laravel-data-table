<?php

namespace Machour\DataTable\Concerns;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Machour\DataTable\Ai\Agents\DataTableColumnSummaryAgent;
use Machour\DataTable\Ai\Agents\DataTableEnrichAgent;
use Machour\DataTable\Ai\Agents\DataTableInsightsAgent;
use Machour\DataTable\Ai\Agents\DataTableQueryAgent;
use Machour\DataTable\Ai\Agents\DataTableSuggestAgent;
use Machour\DataTable\Columns\Column;

/**
 * Add AI-powered features to a DataTable.
 *
 * Supports two backends (auto-detected):
 *   1. Laravel AI SDK (preferred): composer require laravel/ai
 *   2. Prism PHP (fallback):       composer require prism-php/prism
 *
 * Optionally integrates with Thesys C1 for generative UI visualizations.
 *
 * Features:
 * - Natural language query → filters/sort
 * - AI insights (anomaly detection, trends, patterns)
 * - AI column summaries (distribution analysis)
 * - AI smart suggestions (recommended filters)
 * - AI row enrichment (generate new column values via LLM)
 * - AI visualization (Thesys C1 generative UI)
 */
trait HasAi
{
    /**
     * The AI model to use (provider:model string for Prism).
     *
     * When using Laravel AI SDK, this is ignored — the SDK uses whatever
     * model the parent application has configured in its ai.php config.
     *
     * When using Prism, this defaults to the parent app's prism.php
     * config, then falls back to data-table.ai.model if set.
     *
     * Override in your DataTable class to use a specific model.
     */
    public static function tableAiModel(): ?string
    {
        // Explicit override in data-table config takes priority
        $override = config('data-table.ai.model');
        if ($override !== null) {
            return $override;
        }

        // Fall back to parent app's Prism default model
        $prismModel = config('prism.default_model');
        if ($prismModel) {
            return $prismModel;
        }

        return null;
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
     * Detect which AI backend is available.
     *
     * @return 'laravel-ai'|'prism'|null
     */
    protected static function detectAiBackend(): ?string
    {
        // Laravel AI SDK (preferred)
        if (class_exists(\Laravel\Ai\Contracts\Agent::class)) {
            return 'laravel-ai';
        }

        // Prism PHP (fallback)
        if (class_exists(\PrismPHP\Prism::class)) {
            return 'prism';
        }

        return null;
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

    // ──────────────────────────────────────────────────────────────────────
    // Laravel AI SDK helpers
    // ──────────────────────────────────────────────────────────────────────

    /**
     * Prompt a Laravel AI SDK Agent and return the structured response.
     *
     * @param  object  $agent  An Agent implementing HasStructuredOutput
     * @param  string  $prompt  The user prompt
     * @return array  Structured response
     */
    protected static function promptAgent(object $agent, string $prompt): array
    {
        $response = $agent->prompt($prompt);

        // HasStructuredOutput returns array-accessible responses
        return is_array($response) ? $response : (array) $response;
    }

    // ──────────────────────────────────────────────────────────────────────
    // Prism PHP helpers
    // ──────────────────────────────────────────────────────────────────────

    /**
     * Resolve Prism text generator. Returns null if Prism is not installed.
     *
     * Uses the model from tableAiModel() which respects the parent app's
     * prism.php configuration. Max tokens defaults to the parent app's
     * Prism config, then data-table config.
     */
    protected static function resolvePrism(): ?object
    {
        if (! class_exists(\PrismPHP\Prism::class)) {
            return null;
        }

        $model = static::tableAiModel();
        if (! $model) {
            throw new \RuntimeException(
                'No AI model configured. Set a default model in config/prism.php or config/data-table.php (ai.model).'
            );
        }

        $maxTokens = config('data-table.ai.max_tokens')
            ?? config('prism.max_tokens')
            ?? 1024;

        return \PrismPHP\Prism::text()
            ->using($model)
            ->withMaxTokens((int) $maxTokens);
    }

    /**
     * Send a prompt to Prism and parse the JSON response.
     */
    protected static function prismPrompt(string $systemPrompt, string $userPrompt): array
    {
        $prism = static::resolvePrism();

        $response = $prism
            ->withSystemPrompt($systemPrompt)
            ->withPrompt($userPrompt)
            ->generate();

        $text = trim($response->text);
        $text = preg_replace('/^```(?:json)?\s*/i', '', $text);
        $text = preg_replace('/\s*```$/i', '', $text);

        $result = json_decode($text, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new \RuntimeException('AI returned invalid JSON: ' . $text);
        }

        return $result;
    }

    // ──────────────────────────────────────────────────────────────────────
    // Handlers (auto-detect Laravel AI SDK vs Prism)
    // ──────────────────────────────────────────────────────────────────────

    /**
     * Handle natural language query → filters/sort.
     */
    public static function handleAiQuery(string $query, Request $request): JsonResponse
    {
        $backend = static::detectAiBackend();

        if (! $backend) {
            return response()->json(['error' => 'No AI backend found. Install laravel/ai or prism-php/prism.'], 500);
        }

        try {
            if ($backend === 'laravel-ai') {
                $agent = new DataTableQueryAgent(
                    schemaDescription: static::buildSchemaDescription(),
                    extraContext: static::tableAiSystemContext(),
                );
                $result = static::promptAgent($agent, "User query: \"{$query}\"");
            } else {
                $schema = static::buildSchemaDescription();
                $filterOperators = 'is, not, contains, gt, gte, lt, lte, between (val1,val2), before, after, null, not_null';
                $extra = static::tableAiSystemContext();

                $result = static::prismPrompt(
                    "You are a data table filter assistant.\n\n{$schema}\n\nAvailable filter operators: {$filterOperators}\nReturn JSON: {\"filters\": {...}, \"sort\": \"...\"}. Only use columns from the schema. Return ONLY valid JSON.\n{$extra}",
                    "User query: \"{$query}\""
                );
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
        $backend = static::detectAiBackend();

        if (! $backend) {
            return response()->json(['error' => 'No AI backend found.'], 500);
        }

        $sample = static::getSampleData($request, 30);
        $sampleJson = json_encode(array_slice($sample, 0, 15), JSON_PRETTY_PRINT);

        try {
            if ($backend === 'laravel-ai') {
                $agent = new DataTableInsightsAgent(
                    schemaDescription: static::buildSchemaDescription(),
                    extraContext: static::tableAiSystemContext(),
                );
                $result = static::promptAgent($agent, "Sample data (first 15 rows):\n{$sampleJson}");
                $insights = $result['insights'] ?? [];
            } else {
                $schema = static::buildSchemaDescription();
                $extra = static::tableAiSystemContext();
                $raw = static::prismPrompt(
                    "You are a data analyst.\n\n{$schema}\n\nReturn a JSON object with \"insights\" array. Each insight: {type, title, description, severity, column, action}. Types: anomaly|trend|pattern|recommendation. Return 3-5 insights.\n{$extra}",
                    "Sample data:\n{$sampleJson}"
                );
                $insights = $raw['insights'] ?? $raw;
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
        $backend = static::detectAiBackend();

        if (! $backend) {
            return response()->json(['error' => 'No AI backend found.'], 500);
        }

        $column = collect(static::tableColumns())->first(fn (Column $col) => $col->id === $columnId);

        if (! $column) {
            return response()->json(['error' => 'Column not found.'], 404);
        }

        $sample = static::getSampleData($request, 100);
        $values = collect($sample)->pluck($columnId)->filter()->values()->all();
        $valuesJson = json_encode(array_slice($values, 0, 50));

        try {
            if ($backend === 'laravel-ai') {
                $agent = new DataTableColumnSummaryAgent(
                    columnId: $column->id,
                    columnType: $column->type,
                    columnLabel: $column->label ?? $column->id,
                );
                $result = static::promptAgent($agent, "Column values (sample of up to 50):\n{$valuesJson}");
            } else {
                $result = static::prismPrompt(
                    "You are a data analyst. Column: {$column->id} ({$column->type}, \"{$column->label}\"). Return JSON: {summary, highlights[], suggestion?}. Return ONLY valid JSON.",
                    "Column values:\n{$valuesJson}"
                );
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
        $backend = static::detectAiBackend();

        if (! $backend) {
            return response()->json(['error' => 'No AI backend found.'], 500);
        }

        $sample = static::getSampleData($request, 20);
        $sampleJson = json_encode(array_slice($sample, 0, 10), JSON_PRETTY_PRINT);
        $currentFilters = $request->get('current_filters', []);
        $filtersContext = ! empty($currentFilters) ? "\nCurrently active filters: " . json_encode($currentFilters) : '';

        try {
            if ($backend === 'laravel-ai') {
                $agent = new DataTableSuggestAgent(
                    schemaDescription: static::buildSchemaDescription(),
                    filtersContext: $filtersContext,
                    extraContext: static::tableAiSystemContext(),
                );
                $result = static::promptAgent($agent, "Sample data:\n{$sampleJson}");
                $suggestions = $result['suggestions'] ?? [];
            } else {
                $schema = static::buildSchemaDescription();
                $extra = static::tableAiSystemContext();
                $raw = static::prismPrompt(
                    "You are a data assistant.\n\n{$schema}{$filtersContext}\n\nReturn JSON: {\"suggestions\": [{label, description, action: {filters, sort}, icon}]}. 3-5 suggestions.\n{$extra}",
                    "Sample data:\n{$sampleJson}"
                );
                $suggestions = $raw['suggestions'] ?? $raw;
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
        $backend = static::detectAiBackend();

        if (! $backend) {
            return response()->json(['error' => 'No AI backend found.'], 500);
        }

        $query = static::tableBaseQuery();
        $rows = $query->whereIn('id', $rowIds)->limit(50)->get();

        if ($rows->isEmpty()) {
            return response()->json(['error' => 'No rows found.'], 404);
        }

        $rowsJson = json_encode($rows->map(fn ($row) => $row->toArray())->all(), JSON_PRETTY_PRINT);

        try {
            if ($backend === 'laravel-ai') {
                $agent = new DataTableEnrichAgent(
                    columnName: $columnName,
                    extraContext: static::tableAiSystemContext(),
                );
                $result = static::promptAgent($agent, "Generate \"{$columnName}\" values using: \"{$prompt}\"\n\nRows:\n{$rowsJson}");
                $enrichments = $result['enrichments'] ?? $result;
            } else {
                $extra = static::tableAiSystemContext();
                $result = static::prismPrompt(
                    "You are a data enrichment assistant. For each row, generate a value for \"{$columnName}\". Return JSON: {\"enrichments\": {\"row_id\": \"value\", ...}}. Return ONLY valid JSON.\n{$extra}",
                    "Prompt: \"{$prompt}\"\n\nRows:\n{$rowsJson}"
                );
                $enrichments = $result['enrichments'] ?? $result;
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

    /**
     * Handle Thesys C1 generative UI visualization.
     *
     * Sends table data + a visualization prompt to Thesys C1,
     * which returns interactive UI components (charts, cards, tables).
     */
    public static function handleAiVisualize(Request $request): JsonResponse
    {
        $thesysApiKey = config('data-table.ai.thesys_api_key');

        if (! $thesysApiKey) {
            return response()->json(['error' => 'Thesys API key not configured. Set DATA_TABLE_THESYS_API_KEY in .env.'], 500);
        }

        $request->validate([
            'prompt' => 'nullable|string|max:500',
        ]);

        $sample = static::getSampleData($request, 30);
        $schema = static::buildSchemaDescription();
        $userPrompt = $request->input('prompt', 'Create an insightful dashboard with charts and key metrics from this data');

        $messages = [
            [
                'role' => 'system',
                'content' => "You are a data visualization expert. Given table data, create interactive visualizations.\n\n{$schema}\n\n" . static::tableAiSystemContext(),
            ],
            [
                'role' => 'user',
                'content' => "{$userPrompt}\n\nData (sample):\n" . json_encode(array_slice($sample, 0, 20), JSON_PRETTY_PRINT),
            ],
        ];

        try {
            $response = Http::withToken($thesysApiKey)
                ->timeout(30)
                ->post('https://api.thesys.dev/v1/embed', [
                    'model' => config('data-table.ai.thesys_model', 'c1-nightly'),
                    'messages' => $messages,
                    'stream' => false,
                ]);

            if (! $response->successful()) {
                return response()->json(['error' => 'Thesys API error: ' . $response->body()], $response->status());
            }

            $data = $response->json();
            $content = $data['choices'][0]['message']['content']
                ?? $data['content']
                ?? null;

            if ($content === null) {
                return response()->json(['error' => 'Thesys API returned an unexpected response format.'], 502);
            }

            return response()->json([
                'html' => $content,
                'model' => $data['model'] ?? 'c1-nightly',
            ]);
        } catch (\Throwable $e) {
            Log::error('DataTable Thesys visualization failed', ['error' => $e->getMessage()]);

            return response()->json(['error' => 'Visualization failed: ' . $e->getMessage()], 500);
        }
    }
}
