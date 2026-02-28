<?php

namespace Machour\DataTable\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Filesystem\Filesystem;
use Illuminate\Support\Str;

class MakeDataTable extends Command
{
    protected $signature = 'make:data-table
        {model : The model class name (e.g. Product)}
        {--export : Include the HasExport trait with export methods}
        {--inline-edit : Include the HasInlineEdit trait for inline editing}
        {--select-all : Include the HasSelectAll trait for server-side selection}
        {--reorder : Include the HasReorder trait for drag-and-drop row reordering}
        {--import : Include the HasImport trait for CSV/Excel import}
        {--soft-deletes : Enable soft deletes toggle}
        {--detail-rows : Enable expandable detail rows}
        {--searchable=* : Columns searchable via global search (e.g. --searchable=name --searchable=email)}
        {--pagination=standard : Pagination type: standard, simple, or cursor}
        {--resource : Generate an API Resource class for row transformation}
        {--route : Append a route entry to a routes file}
        {--route-file=routes/web.php : The route file to append to (used with --route)}
        {--page-path=resources/js/pages : Base path for the generated React page}
        {--all : Include all traits (export, inline-edit, select-all, reorder, import)}';

    protected $description = 'Generate a DataTable class and React page stub for a model';

    public function __construct(private Filesystem $files)
    {
        parent::__construct();
    }

    public function handle(): int
    {
        $model = Str::studly($this->argument('model'));
        $kebab = Str::kebab($model);
        $all = (bool) $this->option('all');
        $withExport = $all || (bool) $this->option('export');
        $withInlineEdit = $all || (bool) $this->option('inline-edit');
        $withSelectAll = $all || (bool) $this->option('select-all');
        $withReorder = $all || (bool) $this->option('reorder');
        $withImport = $all || (bool) $this->option('import');
        $withSoftDeletes = (bool) $this->option('soft-deletes');
        $withDetailRows = (bool) $this->option('detail-rows');
        $searchable = $this->option('searchable') ?: [];
        $pagination = $this->option('pagination') ?? 'standard';
        $withResource = (bool) $this->option('resource');

        $this->generateDataTableClass($model, $kebab, $withExport, $withInlineEdit, $withSelectAll, $withReorder, $withImport, $withSoftDeletes, $withDetailRows, $searchable, $pagination, $withResource);
        $this->generatePageStub($model, $kebab);

        if ($withResource) {
            $this->generateResourceClass($model);
        }

        $pagePath = $this->option('page-path');
        $generated = [
            "DataTable: app/DataTables/{$model}DataTable.php",
            "Page: {$pagePath}/{$kebab}-table.tsx",
        ];

        if ($withResource) {
            $generated[] = "Resource: app/Http/Resources/{$model}Resource.php";
        }

        if ($this->option('route')) {
            $this->appendRoute($model, $kebab, $withExport, $withSelectAll, $withInlineEdit, $withReorder, $withImport);
            $routeFile = $this->option('route-file');
            $generated[] = "Route appended to {$routeFile}";
        }

        $this->components->info("DataTable scaffolding generated for {$model}!");
        $this->newLine();
        $this->components->bulletList($generated);
        $this->newLine();

        $reminders = [
            "Add DTO properties to {$model}DataTable constructor",
            'Customize tableColumns/tableQuickViews',
            'Run: php artisan typescript:transform',
        ];

        if (! $this->option('route')) {
            $reminders[] = "Add a route passing {$model}DataTable::makeTable()";
        }

        if ($withSelectAll || $withInlineEdit) {
            $reminders[] = "Register table controllers in route file (see generated route)";
        }

        $this->components->warn("Don't forget to:");
        $this->components->bulletList($reminders);

        return self::SUCCESS;
    }

    private function generateDataTableClass(
        string $model,
        string $kebab,
        bool $withExport,
        bool $withInlineEdit,
        bool $withSelectAll,
        bool $withReorder,
        bool $withImport,
        bool $withSoftDeletes,
        bool $withDetailRows,
        array $searchable,
        string $pagination,
        bool $withResource,
    ): void {
        $path = app_path("DataTables/{$model}DataTable.php");

        if ($this->files->exists($path)) {
            $this->components->warn("DataTable class already exists: {$path}");

            return;
        }

        // Build use statements
        $uses = [
            'use Machour\DataTable\AbstractDataTable;',
            'use Machour\DataTable\Columns\Column;',
            'use Machour\DataTable\QuickView;',
        ];

        $traits = [];

        if ($withExport) {
            $uses[] = 'use Machour\DataTable\Concerns\HasExport;';
            $traits[] = 'HasExport';
        }

        if ($withInlineEdit) {
            $uses[] = 'use Machour\DataTable\Concerns\HasInlineEdit;';
            $traits[] = 'HasInlineEdit';
        }

        if ($withSelectAll) {
            $uses[] = 'use Machour\DataTable\Concerns\HasSelectAll;';
            $traits[] = 'HasSelectAll';
        }

        if ($withReorder) {
            $uses[] = 'use Machour\DataTable\Concerns\HasReorder;';
            $traits[] = 'HasReorder';
        }

        if ($withImport) {
            $uses[] = 'use Machour\DataTable\Concerns\HasImport;';
            $traits[] = 'HasImport';
        }

        $uses[] = "use App\\Models\\{$model};";
        $uses[] = 'use Illuminate\Database\Eloquent\Builder;';
        $uses[] = 'use Spatie\TypeScriptTransformer\Attributes\TypeScript;';

        sort($uses);
        $useBlock = implode("\n", $uses);

        $traitBlock = '';
        if (! empty($traits)) {
            $traitBlock = "\n    use " . implode(', ', $traits) . ";\n";
        }

        // Export methods
        $exportMethods = $withExport ? <<<PHP


    public static function tableExportEnabled(): bool
    {
        return true;
    }

    public static function tableExportName(): string
    {
        return '{$kebab}s';
    }

    public static function tableExportFilename(): string|\Closure
    {
        return '{$kebab}s';
    }
PHP : '';

        // Inline edit method
        $inlineEditMethods = $withInlineEdit ? <<<PHP


    public static function tableInlineEditModel(): string
    {
        return {$model}::class;
    }
PHP : '';

        // Select all method
        $selectAllMethods = $withSelectAll ? <<<PHP


    public static function tableSelectAllName(): string
    {
        return '{$kebab}s';
    }
PHP : '';

        // Reorder methods
        $reorderMethods = $withReorder ? <<<PHP


    public static function tableReorderModel(): string
    {
        return {$model}::class;
    }

    public static function tableReorderName(): string
    {
        return '{$kebab}s';
    }
PHP : '';

        // Import methods
        $importMethods = $withImport ? <<<PHP


    public static function tableImportName(): string
    {
        return '{$kebab}s';
    }

    public static function processImport(string \$filePath, string \$extension): array
    {
        // TODO: Implement your import logic
        return ['created' => 0, 'updated' => 0, 'errors' => []];
    }
PHP : '';

        // Soft deletes
        $softDeleteMethods = $withSoftDeletes ? <<<PHP


    public static function tableSoftDeletesEnabled(): bool
    {
        return true;
    }
PHP : '';

        // Detail rows
        $detailRowMethods = $withDetailRows ? <<<PHP


    public static function tableDetailRow(\$model): ?array
    {
        return [
            'content' => 'Detail for: ' . (\$model->name ?? \$model->id),
        ];
    }
PHP : '';

        // Searchable columns
        $searchableMethods = '';
        if (! empty($searchable)) {
            $searchableList = implode("', '", $searchable);
            $searchableMethods = <<<PHP


    public static function tableSearchableColumns(): array
    {
        return ['{$searchableList}'];
    }
PHP;
        }

        // Pagination type
        $paginationMethod = '';
        if ($pagination !== 'standard') {
            $paginationMethod = <<<PHP


    public static function tablePaginationType(): string
    {
        return '{$pagination}';
    }
PHP;
        }

        // Resource method
        $resourceMethod = '';
        if ($withResource) {
            $resourceMethod = <<<PHP


    public static function tableResource(): ?string
    {
        return \App\Http\Resources\\{$model}Resource::class;
    }
PHP;
        }

        $stub = <<<PHP
<?php

namespace App\DataTables;

{$useBlock}

#[TypeScript]
class {$model}DataTable extends AbstractDataTable
{{$traitBlock}
    public function __construct(
        public int \$id,
        // TODO: Add DTO properties matching your model
        public ?string \$created_at,
    ) {}

    public static function fromModel({$model} \$model): self
    {
        return new self(
            id: \$model->id,
            created_at: \$model->created_at?->format('Y-m-d H:i'),
        );
    }

    public static function tableColumns(): array
    {
        return [
            new Column(id: 'id', label: 'ID', type: 'number', sortable: true),
            // TODO: Add columns matching your DTO properties
            new Column(id: 'created_at', label: 'Created at', type: 'date', sortable: true),
        ];
    }

    public static function tableQuickViews(): array
    {
        return [
            new QuickView(
                id: 'all',
                label: 'All',
                params: [],
            ),
            // TODO: Add quick views for common filters
        ];
    }

    public static function tableBaseQuery(): Builder
    {
        return {$model}::query();
    }

    public static function tableDefaultSort(): string
    {
        return '-id';
    }{$exportMethods}{$inlineEditMethods}{$selectAllMethods}{$reorderMethods}{$importMethods}{$softDeleteMethods}{$detailRowMethods}{$searchableMethods}{$paginationMethod}{$resourceMethod}
}
PHP;

        $this->files->ensureDirectoryExists(dirname($path));
        $this->files->put($path, $stub);
        $this->components->info("Created: {$path}");
    }

    private function generatePageStub(string $model, string $kebab): void
    {
        $basePath = $this->option('page-path');
        $path = base_path("{$basePath}/{$kebab}-table.tsx");

        if ($this->files->exists($path)) {
            $this->components->warn("Page already exists: {$path}");

            return;
        }

        $stub = <<<TSX
import { DataTable } from "laravel-data-table";
import type { DataTableResponse } from "laravel-data-table";
import { Head } from "@inertiajs/react";

// After running php artisan typescript:transform, use:
// App.DataTables.{$model}DataTable as the generic type

interface Props {
    tableData: DataTableResponse<App.DataTables.{$model}DataTable>;
}

export default function {$model}TablePage({ tableData }: Props) {
    return (
        <>
            <Head title="{$model}" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">{$model}</h1>
                    <p className="text-muted-foreground">
                        {tableData.meta.total} results
                    </p>
                </div>
                <DataTable<App.DataTables.{$model}DataTable>
                    tableData={tableData}
                    tableName="{$kebab}"
                />
            </div>
        </>
    );
}
TSX;

        $this->files->ensureDirectoryExists(dirname($path));
        $this->files->put($path, $stub);
        $this->components->info("Created: {$path}");
    }

    private function generateResourceClass(string $model): void
    {
        $path = app_path("Http/Resources/{$model}Resource.php");

        if ($this->files->exists($path)) {
            $this->components->warn("Resource already exists: {$path}");

            return;
        }

        $stub = <<<PHP
<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class {$model}Resource extends JsonResource
{
    public function toArray(Request \$request): array
    {
        return [
            'id' => \$this->id,
            // TODO: Add fields matching your DataTable DTO
            'created_at' => \$this->created_at?->format('Y-m-d H:i'),
        ];
    }
}
PHP;

        $this->files->ensureDirectoryExists(dirname($path));
        $this->files->put($path, $stub);
        $this->components->info("Created: {$path}");
    }

    private function appendRoute(string $model, string $kebab, bool $withExport, bool $withSelectAll, bool $withInlineEdit, bool $withReorder = false, bool $withImport = false): void
    {
        $routeFile = $this->option('route-file');
        $routesPath = base_path($routeFile);

        if (! $this->files->exists($routesPath)) {
            $this->components->error("{$routeFile} not found");

            return;
        }

        $lines = [
            '',
            "Route::get('/{$kebab}-table', function () {",
            "    return \\Inertia\\Inertia::render('{$kebab}-table', [",
            "        'tableData' => \\App\\DataTables\\{$model}DataTable::makeTable(),",
            '    ]);',
            "})->name('{$kebab}-table');",
        ];

        if ($withExport) {
            $lines[] = '';
            $lines[] = "\\Machour\\DataTable\\Http\\Controllers\\DataTableExportController::register('{$kebab}s', \\App\\DataTables\\{$model}DataTable::class);";
        }

        if ($withSelectAll) {
            $lines[] = '';
            $lines[] = "\\Machour\\DataTable\\Http\\Controllers\\DataTableSelectAllController::register('{$kebab}s', \\App\\DataTables\\{$model}DataTable::class);";
        }

        if ($withInlineEdit) {
            $lines[] = '';
            $lines[] = "\\Machour\\DataTable\\Http\\Controllers\\DataTableInlineEditController::register('{$kebab}s', \\App\\DataTables\\{$model}DataTable::class);";
        }

        if ($withReorder) {
            $lines[] = '';
            $lines[] = "\\Machour\\DataTable\\Http\\Controllers\\DataTableReorderController::register('{$kebab}s', \\App\\DataTables\\{$model}DataTable::class);";
        }

        if ($withImport) {
            $lines[] = '';
            $lines[] = "\\Machour\\DataTable\\Http\\Controllers\\DataTableImportController::register('{$kebab}s', \\App\\DataTables\\{$model}DataTable::class);";
        }

        $content = $this->files->get($routesPath);
        $content .= implode("\n", $lines) . "\n";
        $this->files->put($routesPath, $content);

        $this->components->info("Route appended to: {$routesPath}");
    }
}
