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
        {--route : Append a route entry to a routes file}
        {--route-file=routes/web.php : The route file to append to (used with --route)}
        {--page-path=resources/js/pages : Base path for the generated React page}';

    protected $description = 'Generate a DataTable class and React page stub for a model';

    public function __construct(private Filesystem $files)
    {
        parent::__construct();
    }

    public function handle(): int
    {
        $model = Str::studly($this->argument('model'));
        $kebab = Str::kebab($model);
        $withExport = (bool) $this->option('export');

        $this->generateDataTableClass($model, $kebab, $withExport);
        $this->generatePageStub($model, $kebab);

        $pagePath = $this->option('page-path');
        $generated = [
            "DataTable: app/DataTables/{$model}DataTable.php",
            "Page: {$pagePath}/{$kebab}-table.tsx",
        ];

        if ($this->option('route')) {
            $this->appendRoute($model, $kebab, $withExport);
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

        $this->components->warn("Don't forget to:");
        $this->components->bulletList($reminders);

        return self::SUCCESS;
    }

    private function generateDataTableClass(string $model, string $kebab, bool $withExport): void
    {
        $path = app_path("DataTables/{$model}DataTable.php");

        if ($this->files->exists($path)) {
            $this->components->warn("DataTable class already exists: {$path}");

            return;
        }

        $exportUse = $withExport ? "\nuse Machour\\DataTable\\Concerns\\HasExport;" : '';
        $exportTrait = $withExport ? "\n    use HasExport;\n" : '';
        $exportMethods = $withExport ? <<<'PHP'


    public static function tableExportEnabled(): bool
    {
        return true;
    }

    public static function tableExportName(): string
    {
        return '___KEBAB___s';
    }

    public static function tableExportFilename(): string|\Closure
    {
        return '___KEBAB___s';
    }
PHP : '';

        $exportMethods = str_replace('___KEBAB___', $kebab, $exportMethods);

        $stub = <<<PHP
<?php

namespace App\DataTables;

use Machour\DataTable\AbstractDataTable;
use Machour\DataTable\Columns\Column;
use Machour\DataTable\QuickView;{$exportUse}
use App\Models\\{$model};
use Illuminate\Database\Eloquent\Builder;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
class {$model}DataTable extends AbstractDataTable
{{$exportTrait}
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
    }{$exportMethods}
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

    private function appendRoute(string $model, string $kebab, bool $withExport): void
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

        $content = $this->files->get($routesPath);
        $content .= implode("\n", $lines)."\n";
        $this->files->put($routesPath, $content);

        $this->components->info("Route appended to: {$routesPath}");
    }
}
