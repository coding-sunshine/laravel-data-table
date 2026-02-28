<?php

namespace Machour\DataTable\Http\Controllers;

use Machour\DataTable\AbstractDataTable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DataTableAsyncFilterController
{
    /**
     * @var array<string, class-string<AbstractDataTable>>
     */
    protected static array $registry = [];

    public static function register(string $tableName, string $dataTableClass): void
    {
        static::$registry[$tableName] = $dataTableClass;
    }

    public function __invoke(string $table, string $column, Request $request): JsonResponse
    {
        $class = static::$registry[$table] ?? null;

        abort_unless((bool) $class, 404, "Unknown table: {$table}");

        $asyncColumns = $class::tableAsyncFilterColumns();

        if (! in_array($column, $asyncColumns, true)) {
            return response()->json(['error' => 'Column does not support async filters.'], 422);
        }

        $request->validate([
            'search' => 'nullable|string|max:255',
        ]);

        $search = $request->input('search');
        $options = $class::resolveAsyncFilterOptions($column, $search);

        return response()->json(['options' => $options]);
    }
}
