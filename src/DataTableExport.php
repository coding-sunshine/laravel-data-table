<?php

namespace Machour\DataTable;

use Illuminate\Database\Eloquent\Builder;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class DataTableExport implements FromQuery, WithHeadings, WithMapping
{
    /**
     * @param  array<int, array{id: string, label: string}>  $columns
     */
    public function __construct(
        protected Builder $builder,
        protected array $columns,
    ) {}

    public function query(): Builder
    {
        return $this->builder;
    }

    public function headings(): array
    {
        return array_map(fn (array $col) => $col['label'], $this->columns);
    }

    /**
     * @param  \Illuminate\Database\Eloquent\Model  $row
     */
    public function map($row): array
    {
        return array_map(function (array $col) use ($row) {
            $value = data_get($row, $col['id']);

            if (is_bool($value)) {
                return $value ? 'Yes' : 'No';
            }

            return $value;
        }, $this->columns);
    }
}
