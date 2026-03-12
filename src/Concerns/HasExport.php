<?php

namespace Machour\DataTable\Concerns;

use Machour\DataTable\Columns\Column;
use Machour\DataTable\DataTableExport;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;
use Spatie\QueryBuilder\QueryBuilder;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

trait HasExport
{
    abstract public static function tableExportEnabled(): bool;

    abstract public static function tableExportName(): string;

    abstract public static function tableExportFilename(): string|\Closure;

    public static function tableExportColumns(): array
    {
        return collect(static::tableColumns())
            ->filter(fn (Column $col) => ! in_array($col->type, ['image'], true))
            ->map(fn (Column $col) => ['id' => $col->id, 'label' => $col->label])
            ->values()
            ->all();
    }

    public static function resolveExportUrl(): string
    {
        return route('data-table.export', ['table' => static::tableExportName()]);
    }

    public static function resolveExportFilename(?Request $request = null): string
    {
        $filename = static::tableExportFilename();

        if ($filename instanceof \Closure) {
            $request = $request ?? request();
            $filters = $request->get('filter', []);

            $filename = $filename($filters);
        }

        // Sanitize filename to prevent path traversal
        return preg_replace('/[^a-zA-Z0-9_\-]/', '_', basename($filename));
    }

    public static function downloadExport(string $format = 'xlsx', ?Request $request = null): BinaryFileResponse|\Illuminate\Http\Response
    {
        $request = $request ?? request();
        $query = static::makeExportQuery($request);
        $columns = static::tableExportColumns();

        $requestedColumns = $request->get('columns');
        if ($requestedColumns) {
            $allowedIds = array_flip(array_column($columns, 'id'));
            $requestedIds = array_flip(array_filter(
                explode(',', $requestedColumns),
                fn (string $id) => isset($allowedIds[$id]),
            ));
            $columns = array_values(array_filter(
                $columns,
                fn (array $col) => isset($requestedIds[$col['id']]),
            ));
        }

        $filename = static::resolveExportFilename($request);

        if ($format === 'pdf') {
            return static::downloadPdfExport($query->getEloquentBuilder(), $columns, $filename);
        }

        $writerType = match ($format) {
            'csv' => \Maatwebsite\Excel\Excel::CSV,
            default => \Maatwebsite\Excel\Excel::XLSX,
        };

        $extension = match ($format) {
            'csv' => 'csv',
            default => 'xlsx',
        };

        $export = new DataTableExport($query->getEloquentBuilder(), $columns);

        return Excel::download($export, "{$filename}.{$extension}", $writerType);
    }

    protected static function downloadPdfExport($query, array $columns, string $filename): \Illuminate\Http\Response
    {
        $rows = $query->get()->map(function ($row) use ($columns) {
            $data = [];
            foreach ($columns as $col) {
                $data[$col['id']] = data_get($row, $col['id'], '');
            }

            return $data;
        });

        $html = static::buildPdfHtml($columns, $rows, $filename);

        return \Spatie\LaravelPdf\Facades\Pdf::html($html)
            ->name("{$filename}.pdf")
            ->download();
    }

    protected static function buildPdfHtml(array $columns, $rows, string $title): string
    {
        $headerCells = implode('', array_map(
            fn (array $col) => '<th style="border:1px solid #ddd;padding:8px;background:#f5f5f5;text-align:left;">' . e($col['label']) . '</th>',
            $columns,
        ));

        $bodyRows = $rows->map(function ($row) use ($columns) {
            $cells = implode('', array_map(
                fn (array $col) => '<td style="border:1px solid #ddd;padding:8px;">' . e($row[$col['id']] ?? '') . '</td>',
                $columns,
            ));

            return "<tr>{$cells}</tr>";
        })->implode('');

        return <<<HTML
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"><title>{$title}</title></head>
        <body style="font-family:sans-serif;font-size:12px;margin:20px;">
            <h2 style="margin-bottom:16px;">{$title}</h2>
            <table style="width:100%;border-collapse:collapse;">
                <thead><tr>{$headerCells}</tr></thead>
                <tbody>{$bodyRows}</tbody>
            </table>
        </body>
        </html>
        HTML;
    }

    public static function makeExportQuery(?Request $request = null): QueryBuilder
    {
        return static::buildFilteredQuery($request);
    }
}
