<?php

namespace Machour\DataTable\Concerns;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Spatie\QueryBuilder\QueryBuilder;

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

        $query = QueryBuilder::for(static::tableBaseQuery(), $request)
            ->allowedFilters(static::tableAllowedFilters())
            ->allowedSorts(static::tableAllowedSorts())
            ->defaultSort(static::tableDefaultSort());

        // Apply global search if applicable
        $searchTerm = $request->get('search', '');
        $searchableColumns = static::tableSearchableColumns();
        if ($searchTerm && ! empty($searchableColumns)) {
            $escaped = str_replace(['%', '_', '\\'], ['\\%', '\\_', '\\\\'], $searchTerm);
            $query->where(function ($q) use ($escaped, $searchableColumns) {
                foreach ($searchableColumns as $column) {
                    $q->orWhere($column, 'LIKE', '%' . $escaped . '%');
                }
            });
        }

        $key = static::tableSelectAllKey();
        $ids = $query->pluck($key)->all();

        return response()->json(['ids' => $ids, 'count' => count($ids)]);
    }
}
