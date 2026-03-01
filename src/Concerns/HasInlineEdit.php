<?php

namespace Machour\DataTable\Concerns;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Machour\DataTable\Columns\Column;

trait HasInlineEdit
{
    /**
     * Return the model class for inline editing.
     *
     * @return class-string<Model>
     */
    abstract public static function tableInlineEditModel(): string;

    /**
     * Return the editable column IDs.
     * By default, derives from columns with editable=true.
     *
     * @return array<string>
     */
    public static function tableEditableColumns(): array
    {
        return collect(static::tableColumns())
            ->filter(fn ($col) => $col->editable)
            ->map(fn ($col) => $col->id)
            ->values()
            ->all();
    }

    /**
     * Auto-generate validation rules from column type.
     * Override to customize validation per column.
     *
     * @return array<string, mixed>
     */
    public static function tableInlineEditRules(string $columnId): array
    {
        $column = collect(static::tableColumns())->first(fn (Column $col) => $col->id === $columnId);

        if (! $column) {
            return ['value' => 'required'];
        }

        return match ($column->type) {
            'number' => ['value' => 'required|numeric'],
            'currency' => ['value' => 'required|numeric|min:0'],
            'percentage' => ['value' => 'required|numeric|min:0|max:100'],
            'date' => ['value' => 'required|date'],
            'email' => ['value' => 'required|email|max:255'],
            'phone' => ['value' => 'required|string|max:50'],
            'link' => ['value' => 'required|url|max:2048'],
            'boolean' => ['value' => 'required|boolean'],
            'select' => ['value' => 'required|string|max:255'],
            default => ['value' => 'required|string|max:65535'],
        };
    }

    /**
     * Handle an inline edit request.
     */
    public static function handleInlineEdit(Request $request, int|string $id): JsonResponse
    {
        $columnId = $request->input('column');
        $value = $request->input('value');

        $editableColumns = static::tableEditableColumns();

        if (! in_array($columnId, $editableColumns, true)) {
            return response()->json(['error' => 'Column is not editable.'], 422);
        }

        $request->validate(static::tableInlineEditRules($columnId));

        $modelClass = static::tableInlineEditModel();

        // Soft delete safeguard: prevent editing trashed records
        if (static::tableSoftDeletesEnabled() && method_exists($modelClass, 'trashed')) {
            $model = $modelClass::withTrashed()->findOrFail($id);
            if ($model->trashed()) {
                return response()->json(['error' => 'Cannot edit a trashed record.'], 422);
            }
        } else {
            $model = $modelClass::findOrFail($id);
        }

        $model->update([$columnId => $value]);

        return response()->json(['success' => true, 'value' => $model->{$columnId}]);
    }
}
