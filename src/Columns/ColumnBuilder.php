<?php

namespace Machour\DataTable\Columns;

/**
 * Fluent builder for Column definitions.
 *
 * Usage:
 *   ColumnBuilder::make('price', 'Price')->currency('EUR')->sortable()->summary('sum')->build()
 */
class ColumnBuilder
{
    private string $id;

    private string $label;

    private string $type = 'text';

    private bool $sortable = false;

    private bool $filterable = false;

    private bool $visible = true;

    private ?array $options = null;

    private ?float $min = null;

    private ?float $max = null;

    private ?string $icon = null;

    private ?int $searchThreshold = null;

    private ?string $group = null;

    private bool $editable = false;

    private ?string $currencyCode = null;

    private ?string $locale = null;

    private ?string $summaryType = null;

    private bool $toggleable = false;

    private ?int $responsivePriority = null;

    private function __construct(string $id, string $label)
    {
        $this->id = $id;
        $this->label = $label;
    }

    /**
     * Create a new column builder.
     */
    public static function make(string $id, string $label): self
    {
        return new self($id, $label);
    }

    /**
     * Set the column type to 'text'.
     */
    public function text(): self
    {
        $this->type = 'text';

        return $this;
    }

    /**
     * Set the column type to 'number'.
     */
    public function number(): self
    {
        $this->type = 'number';

        return $this;
    }

    /**
     * Set the column type to 'date'.
     */
    public function date(): self
    {
        $this->type = 'date';

        return $this;
    }

    /**
     * Set the column type to 'option' with optional options list.
     */
    public function option(?array $options = null): self
    {
        $this->type = 'option';
        if ($options !== null) {
            $this->options = $options;
        }

        return $this;
    }

    /**
     * Set the column type to 'multiOption' with optional options list.
     */
    public function multiOption(?array $options = null): self
    {
        $this->type = 'multiOption';
        if ($options !== null) {
            $this->options = $options;
        }

        return $this;
    }

    /**
     * Set the column type to 'boolean'.
     */
    public function boolean(): self
    {
        $this->type = 'boolean';

        return $this;
    }

    /**
     * Set the column type to 'image'.
     */
    public function image(): self
    {
        $this->type = 'image';

        return $this;
    }

    /**
     * Set the column type to 'badge' with optional options.
     */
    public function badge(?array $options = null): self
    {
        $this->type = 'badge';
        if ($options !== null) {
            $this->options = $options;
        }

        return $this;
    }

    /**
     * Set the column type to 'currency' with an optional currency code.
     */
    public function currency(?string $code = null): self
    {
        $this->type = 'currency';
        if ($code !== null) {
            $this->currencyCode = $code;
        }

        return $this;
    }

    /**
     * Set the column type to 'percentage'.
     */
    public function percentage(): self
    {
        $this->type = 'percentage';

        return $this;
    }

    /**
     * Set the column type to 'link'.
     */
    public function link(): self
    {
        $this->type = 'link';

        return $this;
    }

    /**
     * Set the column type to 'email'.
     */
    public function email(): self
    {
        $this->type = 'email';

        return $this;
    }

    /**
     * Set the column type to 'phone'.
     */
    public function phone(): self
    {
        $this->type = 'phone';

        return $this;
    }

    /**
     * Mark the column as sortable.
     */
    public function sortable(bool $sortable = true): self
    {
        $this->sortable = $sortable;

        return $this;
    }

    /**
     * Mark the column as filterable.
     */
    public function filterable(bool $filterable = true): self
    {
        $this->filterable = $filterable;

        return $this;
    }

    /**
     * Set the column visibility.
     */
    public function visible(bool $visible = true): self
    {
        $this->visible = $visible;

        return $this;
    }

    /**
     * Hide the column by default.
     */
    public function hidden(): self
    {
        $this->visible = false;

        return $this;
    }

    /**
     * Set filter/select options.
     */
    public function options(array $options): self
    {
        $this->options = $options;

        return $this;
    }

    /**
     * Set min/max range for number filters.
     */
    public function range(?float $min = null, ?float $max = null): self
    {
        $this->min = $min;
        $this->max = $max;

        return $this;
    }

    /**
     * Set an icon for the column.
     */
    public function icon(string $icon): self
    {
        $this->icon = $icon;

        return $this;
    }

    /**
     * Set the search threshold for option filters.
     */
    public function searchThreshold(int $threshold): self
    {
        $this->searchThreshold = $threshold;

        return $this;
    }

    /**
     * Assign the column to a group.
     */
    public function group(string $group): self
    {
        $this->group = $group;

        return $this;
    }

    /**
     * Mark the column as inline editable.
     */
    public function editable(bool $editable = true): self
    {
        $this->editable = $editable;

        return $this;
    }

    /**
     * Set the locale for number/currency formatting.
     */
    public function locale(string $locale): self
    {
        $this->locale = $locale;

        return $this;
    }

    /**
     * Set a summary aggregation type: 'sum', 'count', 'avg', 'min', 'max'.
     */
    public function summary(string $type): self
    {
        $this->summaryType = $type;

        return $this;
    }

    /**
     * Mark as a toggleable boolean column.
     */
    public function toggleable(bool $toggleable = true): self
    {
        $this->toggleable = $toggleable;

        return $this;
    }

    /**
     * Set the responsive priority (lower = hidden first on small screens).
     */
    public function responsivePriority(int $priority): self
    {
        $this->responsivePriority = $priority;

        return $this;
    }

    /**
     * Build the Column instance.
     */
    public function build(): Column
    {
        return new Column(
            id: $this->id,
            label: $this->label,
            type: $this->type,
            sortable: $this->sortable,
            filterable: $this->filterable,
            visible: $this->visible,
            options: $this->options,
            min: $this->min,
            max: $this->max,
            icon: $this->icon,
            searchThreshold: $this->searchThreshold,
            group: $this->group,
            editable: $this->editable,
            currency: $this->currencyCode,
            locale: $this->locale,
            summary: $this->summaryType,
            toggleable: $this->toggleable,
            responsivePriority: $this->responsivePriority,
        );
    }
}
