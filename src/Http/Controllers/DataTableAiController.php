<?php

namespace Machour\DataTable\Http\Controllers;

use Machour\DataTable\AbstractDataTable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;

class DataTableAiController
{
    /**
     * Map of table names to their DataTable classes.
     *
     * @var array<string, class-string<AbstractDataTable>>
     */
    protected static array $registry = [];

    public static function register(string $tableName, string $dataTableClass): void
    {
        static::$registry[$tableName] = $dataTableClass;
    }

    /**
     * POST /data-table/ai/{table}/query
     *
     * Natural language query → filters/sort via LLM.
     */
    public function query(string $table, Request $request): JsonResponse
    {
        $class = $this->resolve($table, 'ai_query', $request);

        $request->validate(['query' => 'required|string|max:500']);

        if (! method_exists($class, 'handleAiQuery')) {
            abort(404, 'AI query is not enabled for this table.');
        }

        return $class::handleAiQuery($request->input('query'), $request);
    }

    /**
     * POST /data-table/ai/{table}/insights
     *
     * Generate AI-driven insights for the current dataset.
     */
    public function insights(string $table, Request $request): JsonResponse
    {
        $class = $this->resolve($table, 'ai_insights', $request);

        if (! method_exists($class, 'handleAiInsights')) {
            abort(404, 'AI insights are not enabled for this table.');
        }

        return $class::handleAiInsights($request);
    }

    /**
     * POST /data-table/ai/{table}/column-summary
     *
     * Generate AI summary for a specific column.
     */
    public function columnSummary(string $table, Request $request): JsonResponse
    {
        $class = $this->resolve($table, 'ai_column_summary', $request);

        $request->validate(['column' => 'required|string']);

        if (! method_exists($class, 'handleAiColumnSummary')) {
            abort(404, 'AI column summary is not enabled for this table.');
        }

        return $class::handleAiColumnSummary($request->input('column'), $request);
    }

    /**
     * POST /data-table/ai/{table}/suggest
     *
     * Get AI-powered smart filter/sort suggestions.
     */
    public function suggest(string $table, Request $request): JsonResponse
    {
        $class = $this->resolve($table, 'ai_suggest', $request);

        if (! method_exists($class, 'handleAiSuggest')) {
            abort(404, 'AI suggestions are not enabled for this table.');
        }

        return $class::handleAiSuggest($request);
    }

    /**
     * POST /data-table/ai/{table}/enrich
     *
     * Enrich rows with AI-computed columns.
     */
    public function enrich(string $table, Request $request): JsonResponse
    {
        $class = $this->resolve($table, 'ai_enrich', $request);

        $request->validate([
            'prompt' => 'required|string|max:500',
            'column_name' => 'required|string|max:100',
            'row_ids' => 'required|array|max:50',
        ]);

        if (! method_exists($class, 'handleAiEnrich')) {
            abort(404, 'AI enrichment is not enabled for this table.');
        }

        return $class::handleAiEnrich(
            $request->input('prompt'),
            $request->input('column_name'),
            $request->input('row_ids'),
            $request,
        );
    }

    /**
     * Resolve and authorize the DataTable class.
     *
     * @return class-string<AbstractDataTable>
     */
    protected function resolve(string $table, string $action, Request $request): string
    {
        $class = static::$registry[$table] ?? null;

        abort_unless((bool) $class, 404, "Unknown table: {$table}");

        // Authorization check
        if (method_exists($class, 'tableAuthorize')) {
            abort_unless($class::tableAuthorize($action, $request), 403, 'You are not authorized for this AI action.');
        }

        // Rate limiting
        $maxAttempts = config('data-table.rate_limit.ai', 30);
        if ($maxAttempts > 0) {
            $key = 'dt-ai:' . ($request->user()?->id ?? $request->ip()) . ':' . $table;
            if (RateLimiter::tooManyAttempts($key, $maxAttempts)) {
                $retryAfter = RateLimiter::availableIn($key);

                abort(429, "Too many AI requests. Retry in {$retryAfter}s.");
            }
            RateLimiter::hit($key, 60);
        }

        return $class;
    }
}
