<?php

namespace Machour\DataTable\Concerns;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

trait HasSelectAll
{
    /**
     * The primary key column to use for select all.
     */
    public static function tableSelectAllKey(): string
    {
        return 'id';
    }

    /**
     * Return the table name for routing.
     */
    abstract public static function tableSelectAllName(): string;

    /**
     * Resolve the select-all endpoint URL.
     */
    public static function resolveSelectAllUrl(): string
    {
        return route('data-table.select-all', ['table' => static::tableSelectAllName()]);
    }

    /**
     * Handle a select-all request: returns all IDs matching current filters.
     */
    public static function handleSelectAll(?Request $request = null): JsonResponse
    {
        $request = $request ?? request();

        $query = static::buildFilteredQuery($request);
        $key = static::tableSelectAllKey();
        $ids = $query->pluck($key)->all();

        return response()->json(['ids' => $ids, 'count' => count($ids)]);
    }
}
