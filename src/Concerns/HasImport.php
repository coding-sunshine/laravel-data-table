<?php

namespace Machour\DataTable\Concerns;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

trait HasImport
{
    /**
     * Return the table name for routing.
     */
    abstract public static function tableImportName(): string;

    /**
     * Whether import is enabled.
     */
    public static function tableImportEnabled(): bool
    {
        return true;
    }

    /**
     * Resolve the import endpoint URL.
     */
    public static function resolveImportUrl(): string
    {
        return route('data-table.import', ['table' => static::tableImportName()]);
    }

    /**
     * Return validation rules for the uploaded file.
     *
     * @return array<string, mixed>
     */
    public static function tableImportRules(): array
    {
        $maxSize = config('data-table.import.max_file_size', 10240);
        $extensions = implode(',', config('data-table.import.allowed_extensions', ['csv', 'xlsx', 'xls']));

        return [
            'file' => "required|file|max:{$maxSize}|mimes:{$extensions}",
        ];
    }

    /**
     * Process the uploaded import file.
     * Override this method to implement custom import logic.
     *
     * @return array{created: int, updated: int, errors: array}
     */
    public static function processImport(string $filePath, string $extension): array
    {
        return ['created' => 0, 'updated' => 0, 'errors' => []];
    }

    /**
     * Handle an import request.
     */
    public static function handleImport(Request $request): JsonResponse
    {
        $request->validate(static::tableImportRules());

        $file = $request->file('file');
        $extension = strtolower($file->getClientOriginalExtension());
        $filePath = $file->getRealPath();

        $result = static::processImport($filePath, $extension);

        if (! empty($result['errors'])) {
            return response()->json([
                'success' => false,
                'message' => 'Import completed with errors.',
                'created' => $result['created'],
                'updated' => $result['updated'],
                'errors' => array_slice($result['errors'], 0, 10),
            ], 422);
        }

        return response()->json([
            'success' => true,
            'message' => "Import completed: {$result['created']} created, {$result['updated']} updated.",
            'created' => $result['created'],
            'updated' => $result['updated'],
        ]);
    }
}
