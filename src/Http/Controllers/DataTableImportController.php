<?php

namespace Machour\DataTable\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;

class DataTableImportController
{
    protected static array $registry = [];

    public static function register(string $name, string $dataTableClass): void
    {
        static::$registry[$name] = $dataTableClass;
    }

    public function __invoke(Request $request, string $table): JsonResponse
    {
        $class = static::$registry[$table] ?? null;

        if (! $class || ! method_exists($class, 'handleImport')) {
            abort(404);
        }

        // Authorization check
        if (method_exists($class, 'tableAuthorize')) {
            abort_unless($class::tableAuthorize('import', $request), 403, 'You are not authorized to import to this table.');
        }

        // Rate limiting
        $maxAttempts = config('data-table.rate_limit.import', 5);
        if ($maxAttempts > 0) {
            $key = 'dt-import:' . ($request->user()?->id ?? $request->ip()) . ':' . $table;
            if (RateLimiter::tooManyAttempts($key, $maxAttempts)) {
                $retryAfter = RateLimiter::availableIn($key);

                return response()->json([
                    'error' => 'Too many import requests. Please try again later.',
                    'retry_after' => $retryAfter,
                ], 429);
            }
            RateLimiter::hit($key, 60);
        }

        return $class::handleImport($request);
    }
}
