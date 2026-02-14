<?php

namespace Machour\DataTable\Http\Controllers;

use Machour\DataTable\AbstractDataTable;
use Illuminate\Http\Request;
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

    public function __invoke(string $table, Request $request): BinaryFileResponse
    {
        $class = static::$registry[$table] ?? null;

        abort_unless((bool) $class, 404, "Unknown table: {$table}");
        abort_unless($class::tableExportEnabled(), 403, 'Export is not enabled for this table.');

        $format = $request->get('format', 'xlsx');
        abort_unless(in_array($format, ['xlsx', 'csv'], true), 422, 'Invalid format.');

        return $class::downloadExport($format, $request);
    }
}
