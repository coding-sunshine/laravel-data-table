<?php

namespace Machour\DataTable\Concerns;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

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
     * Validate the incoming value for an inline edit.
     * Override to add custom validation rules per column.
     *
     * @return array<string, mixed>
     */
    public static function tableInlineEditRules(string $columnId): array
    {
        return ['value' => 'required'];
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
        $model = $modelClass::findOrFail($id);
        $model->update([$columnId => $value]);

        return response()->json(['success' => true, 'value' => $model->{$columnId}]);
    }
}
