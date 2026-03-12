<?php

namespace Machour\DataTable\Http\Controllers;

use Machour\DataTable\AbstractDataTable;
use Machour\DataTable\DataTableExport;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class DataTableExportController
{
    /**
     * Map of table names to their DataTable classes.
     *
     * @var array<string, class-string<AbstractDataTable>>
     */
    protected static array $registry = [];

    public static function register(string $tableName, string $dataTableClass): void
    {
        static::$registry[$tableName] = $dataTableClass;
    }

    public function __invoke(string $table, Request $request): BinaryFileResponse|\Illuminate\Http\JsonResponse|\Illuminate\Http\Response
    {
        $class = static::$registry[$table] ?? null;

        abort_unless((bool) $class, 404, "Unknown table: {$table}");
        abort_unless($class::tableExportEnabled(), 403, 'Export is not enabled for this table.');

        // Authorization check
        if (method_exists($class, 'tableAuthorize')) {
            abort_unless($class::tableAuthorize('export', $request), 403, 'You are not authorized to export this table.');
        }

        // Rate limiting
        $maxAttempts = config('data-table.rate_limit.export', 10);
        if ($maxAttempts > 0) {
            $key = 'dt-export:' . ($request->user()?->id ?? $request->ip()) . ':' . $table;
            if (RateLimiter::tooManyAttempts($key, $maxAttempts)) {
                $retryAfter = RateLimiter::availableIn($key);

                return response()->json([
                    'error' => 'Too many export requests. Please try again later.',
                    'retry_after' => $retryAfter,
                ], 429);
            }
            RateLimiter::hit($key, 60);
        }

        $format = $request->get('format', 'xlsx');
        abort_unless(in_array($format, ['xlsx', 'csv', 'pdf'], true), 422, 'Invalid format.');

        // Queued export support (PDF uses spatie/laravel-pdf which handles its own response)
        if ($format !== 'pdf' && $request->boolean('queued') && class_exists(\Maatwebsite\Excel\Facades\Excel::class)) {
            return $this->queuedExport($class, $format, $request);
        }

        return $class::downloadExport($format, $request);
    }

    protected function queuedExport(string $class, string $format, Request $request): \Illuminate\Http\JsonResponse
    {
        $filename = $class::resolveExportFilename($request);
        $extension = match ($format) {
            'csv' => 'csv',
            'pdf' => 'pdf',
            default => 'xlsx',
        };

        $writerType = match ($format) {
            'csv' => \Maatwebsite\Excel\Excel::CSV,
            default => \Maatwebsite\Excel\Excel::XLSX,
        };

        $path = "exports/{$filename}_{$format}_" . now()->timestamp . ".{$extension}";

        $query = $class::makeExportQuery($request);
        $columns = $class::tableExportColumns();

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

        $export = new DataTableExport($query->getEloquentBuilder(), $columns);

        \Maatwebsite\Excel\Facades\Excel::queue($export, $path, 'local', $writerType);

        return response()->json([
            'queued' => true,
            'path' => $path,
            'message' => 'Export is being processed. You will be notified when it is ready.',
        ]);
    }

    /**
     * Check the status of a queued export.
     */
    public function status(Request $request): \Illuminate\Http\JsonResponse
    {
        $path = $request->get('path');
        abort_unless($path, 422, 'Missing export path.');

        $disk = \Illuminate\Support\Facades\Storage::disk(config('data-table.export.disk', 'local'));

        if ($disk->exists($path)) {
            return response()->json([
                'ready' => true,
                'url' => $disk->url($path),
                'size' => $disk->size($path),
            ]);
        }

        return response()->json(['ready' => false]);
    }
}
