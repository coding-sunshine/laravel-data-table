<?php

namespace Machour\DataTable\Http\Controllers;

use Machour\DataTable\AbstractDataTable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DataTableDetailRowController
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

        if (! $class::tableDetailRowEnabled()) {
            return response()->json(['error' => 'Detail rows are not enabled for this table.'], 422);
        }

        $model = $class::tableBaseQuery()->findOrFail($id);
        $detail = $class::tableDetailRow($model);

        return response()->json(['detail' => $detail]);
    }
}
