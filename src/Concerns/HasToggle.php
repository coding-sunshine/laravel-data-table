<?php

namespace Machour\DataTable\Concerns;

use Illuminate\Database\Eloquent\Model;

trait HasToggle
{
    /**
     * Return the model class for toggle operations.
     *
     * @return class-string<Model>
     */
    abstract public static function tableToggleModel(): string;

    /**
     * Return the table name for routing.
     */
    abstract public static function tableToggleName(): string;

    /**
     * Resolve the toggle endpoint URL.
     */
    public static function resolveToggleUrl(): string
    {
        return route('data-table.toggle', ['table' => static::tableToggleName()]);
    }

    /**
     * Handle a toggle request — update the boolean column on the model.
     */
    public static function handleToggle(Model $model, string $columnId, bool $value): void
    {
        $model->update([$columnId => $value]);
    }
}
