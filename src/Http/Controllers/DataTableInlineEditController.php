<?php

namespace Machour\DataTable\Http\Controllers;

use Machour\DataTable\AbstractDataTable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;

class DataTableInlineEditController
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

    public function __invoke(string $table, string $id, Request $request): JsonResponse
    {
        $class = static::$registry[$table] ?? null;

        abort_unless((bool) $class, 404, "Unknown table: {$table}");

        if (! method_exists($class, 'handleInlineEdit')) {
            abort(404, 'Inline editing is not enabled for this table.');
        }

        // Rate limiting: configurable via data-table.rate_limit.inline_edit (default: 60 per minute)
        $maxAttempts = config('data-table.rate_limit.inline_edit', 60);
        if ($maxAttempts > 0) {
            $key = 'dt-inline-edit:' . ($request->user()?->id ?? $request->ip()) . ':' . $table;
            if (RateLimiter::tooManyAttempts($key, $maxAttempts)) {
                $retryAfter = RateLimiter::availableIn($key);

                return response()->json([
                    'error' => 'Too many edit requests. Please try again later.',
                    'retry_after' => $retryAfter,
                ], 429);
            }
            RateLimiter::hit($key, 60);
        }

        return $class::handleInlineEdit($request, $id);
    }
}
