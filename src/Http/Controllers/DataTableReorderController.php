<?php

namespace Machour\DataTable\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DataTableReorderController
{
    protected static array $registry = [];

    public static function register(string $name, string $dataTableClass): void
    {
        static::$registry[$name] = $dataTableClass;
    }

    public function __invoke(Request $request, string $table): JsonResponse
    {
        $class = static::$registry[$table] ?? null;

        if (! $class || ! method_exists($class, 'handleReorder')) {
            abort(404);
        }

        return $class::handleReorder($request);
    }
}
