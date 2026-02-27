<?php

namespace Machour\DataTable\Http\Controllers;

use Machour\DataTable\AbstractDataTable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DataTableCascadingFilterController
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

        $cascading = $class::tableCascadingFilters();

        if (! isset($cascading[$column])) {
            return response()->json(['error' => 'Column does not have cascading filters.'], 422);
        }

        $parentValue = $request->get('parent_value');
        $options = $class::resolveCascadingFilterOptions($column, $parentValue);

        return response()->json(['options' => $options]);
    }
}
