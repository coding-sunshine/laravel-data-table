<?php

namespace Machour\DataTable\Concerns;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

trait HasReorder
{
    /**
     * Return the model class for reordering.
     *
     * @return class-string<Model>
     */
    abstract public static function tableReorderModel(): string;

    /**
     * Return the table name for routing.
     */
    abstract public static function tableReorderName(): string;

    /**
     * The column used for ordering (e.g. 'position', 'sort_order').
     */
    public static function tableReorderColumn(): string
    {
        return 'position';
    }

    /**
     * Resolve the reorder endpoint URL.
     */
    public static function resolveReorderUrl(): string
    {
        return route('data-table.reorder', ['table' => static::tableReorderName()]);
    }

    /**
     * Handle a reorder request.
     * If the model implements Spatie\EloquentSortable\Sortable, delegates to setNewOrder()
     * which preserves gap-closing and fires model events.
     */
    public static function handleReorder(Request $request): JsonResponse
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'required',
        ]);

        $modelClass = static::tableReorderModel();
        $column = static::tableReorderColumn();
        $ids = $request->input('ids');

        if (is_a($modelClass, \Spatie\EloquentSortable\Sortable::class, true)) {
            $modelClass::setNewOrder($ids);
        } else {
            foreach ($ids as $position => $id) {
                $modelClass::where('id', $id)->update([$column => $position]);
            }
        }

        return response()->json(['success' => true]);
    }
}
