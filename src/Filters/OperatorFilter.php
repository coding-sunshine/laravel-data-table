<?php

namespace Machour\DataTable\Filters;

use Illuminate\Database\Eloquent\Builder;
use Spatie\QueryBuilder\Filters\Filter;

class OperatorFilter implements Filter
{
    public function __construct(
        protected string $type = 'text',
        protected ?string $internalName = null,
    ) {}

    public function __invoke(Builder $query, $value, string $property): void
    {
        $column = $this->internalName ?? $property;
        $raw = is_array($value) ? implode(',', $value) : (string) $value;

        $operator = $this->defaultOperator();
        $rawValue = $raw;

        if (preg_match('/^([a-z_]+):(.+)$/i', $raw, $matches)) {
            $known = ['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'between', 'in', 'not_in', 'contains', 'before', 'after', 'null', 'not_null'];
            if (in_array($matches[1], $known, true)) {
                $operator = $matches[1];
                $rawValue = $matches[2];
            }
        } elseif (in_array($raw, ['null', 'not_null'], true)) {
            $operator = $raw;
            $rawValue = '';
        }

        $values = explode(',', $rawValue);

        match ($operator) {
            'eq' => $query->where($column, $values[0]),
            'neq' => $query->where($column, '!=', $values[0]),
            'gt' => $query->where($column, '>', $values[0]),
            'gte' => $query->where($column, '>=', $values[0]),
            'lt' => $query->where($column, '<', $values[0]),
            'lte' => $query->where($column, '<=', $values[0]),
            'between' => count($values) >= 2
                ? $query->whereBetween($column, [$values[0], $values[1]])
                : $query->where($column, $values[0]),
            'in' => $query->whereIn($column, $values),
            'not_in' => $query->whereNotIn($column, $values),
            'contains' => $query->where($column, 'LIKE', '%' . str_replace(['%', '_', '\\'], ['\\%', '\\_', '\\\\'], $values[0]) . '%'),
            'before' => $query->where($column, '<', $values[0]),
            'after' => $query->where($column, '>', $values[0]),
            'null' => $query->whereNull($column),
            'not_null' => $query->whereNotNull($column),
            default => $query->where($column, $values[0]),
        };
    }

    private function defaultOperator(): string
    {
        return match ($this->type) {
            'option' => 'in',
            'boolean' => 'eq',
            'text' => 'contains',
            'number' => 'eq',
            'date' => 'eq',
            default => 'eq',
        };
    }
}
