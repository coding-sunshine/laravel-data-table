<?php

namespace Machour\DataTable\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Machour\DataTable\SavedView;

class SavedViewController
{
    /**
     * List saved views for a table.
     */
    public function index(string $tableName, Request $request): JsonResponse
    {
        $user = $request->user();

        if (! $user) {
            return response()->json(['error' => 'Unauthenticated.'], 401);
        }

        $views = SavedView::forTable($tableName)
            ->forUser($user->id)
            ->orderBy('name')
            ->get();

        return response()->json(['views' => $views]);
    }

    /**
     * Create a new saved view.
     */
    public function store(string $tableName, Request $request): JsonResponse
    {
        $user = $request->user();

        if (! $user) {
            return response()->json(['error' => 'Unauthenticated.'], 401);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'filters' => 'nullable|array',
            'sort' => 'nullable|string',
            'columns' => 'nullable|array',
            'column_order' => 'nullable|array',
            'is_default' => 'boolean',
        ]);

        // If marking as default, unset other defaults
        if ($validated['is_default'] ?? false) {
            SavedView::forTable($tableName)
                ->forUser($user->id)
                ->update(['is_default' => false]);
        }

        $view = SavedView::create([
            'user_id' => $user->id,
            'table_name' => $tableName,
            ...$validated,
        ]);

        return response()->json(['view' => $view], 201);
    }

    /**
     * Update a saved view.
     */
    public function update(string $tableName, int $viewId, Request $request): JsonResponse
    {
        $user = $request->user();

        if (! $user) {
            return response()->json(['error' => 'Unauthenticated.'], 401);
        }

        $view = SavedView::forTable($tableName)
            ->forUser($user->id)
            ->findOrFail($viewId);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'filters' => 'nullable|array',
            'sort' => 'nullable|string',
            'columns' => 'nullable|array',
            'column_order' => 'nullable|array',
            'is_default' => 'boolean',
        ]);

        if ($validated['is_default'] ?? false) {
            SavedView::forTable($tableName)
                ->forUser($user->id)
                ->where('id', '!=', $viewId)
                ->update(['is_default' => false]);
        }

        $view->update($validated);

        return response()->json(['view' => $view]);
    }

    /**
     * Delete a saved view.
     */
    public function destroy(string $tableName, int $viewId, Request $request): JsonResponse
    {
        $user = $request->user();

        if (! $user) {
            return response()->json(['error' => 'Unauthenticated.'], 401);
        }

        $view = SavedView::forTable($tableName)
            ->forUser($user->id)
            ->findOrFail($viewId);

        $view->delete();

        return response()->json(['deleted' => true]);
    }
}
