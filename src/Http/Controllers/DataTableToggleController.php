<?php

namespace Machour\DataTable\Http\Controllers;

use Machour\DataTable\AbstractDataTable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;

class DataTableToggleController
{
    /**
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

        $request->validate([
            'column' => 'required|string|max:255',
            'value' => 'required',
        ]);

        // Rate limiting: configurable via data-table.rate_limit.toggle (default: 60 per minute)
        $maxAttempts = config('data-table.rate_limit.toggle', 60);
        if ($maxAttempts > 0) {
            $key = 'dt-toggle:' . ($request->user()?->id ?? $request->ip()) . ':' . $table;
            if (RateLimiter::tooManyAttempts($key, $maxAttempts)) {
                $retryAfter = RateLimiter::availableIn($key);

                return response()->json([
                    'error' => 'Too many toggle requests. Please try again later.',
                    'retry_after' => $retryAfter,
                ], 429);
            }
            RateLimiter::hit($key, 60);
        }

        $columnId = $request->input('column');
        $value = $request->boolean('value');

        $editableColumns = collect($class::tableColumns())
            ->filter(fn ($col) => $col->toggleable)
            ->map(fn ($col) => $col->id)
            ->values()
            ->all();

        if (! in_array($columnId, $editableColumns, true)) {
            return response()->json(['error' => 'Column is not toggleable.'], 422);
        }

        $model = $class::tableBaseQuery()->findOrFail($id);
        $class::handleToggle($model, $columnId, $value);

        return response()->json(['success' => true, 'value' => $value]);
    }
}
