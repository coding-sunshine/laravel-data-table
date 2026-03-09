<?php

namespace Machour\DataTable;

use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;
use Machour\DataTable\Console\Commands\AuditReport;
use Machour\DataTable\Console\Commands\GenerateTranslations;
use Machour\DataTable\Console\Commands\GenerateTypeScript;
use Machour\DataTable\Console\Commands\MakeDataTable;
use Machour\DataTable\Http\Controllers\DataTableAsyncFilterController;
use Machour\DataTable\Http\Controllers\DataTableCascadingFilterController;
use Machour\DataTable\Http\Controllers\DataTableDetailRowController;
use Machour\DataTable\Http\Controllers\DataTableExportController;
use Machour\DataTable\Http\Controllers\DataTableInlineEditController;
use Machour\DataTable\Http\Controllers\DataTableSelectAllController;
use Machour\DataTable\Http\Controllers\DataTableImportController;
use Machour\DataTable\Http\Controllers\DataTableReorderController;
use Machour\DataTable\Http\Controllers\DataTableAiController;
use Machour\DataTable\Http\Controllers\DataTableToggleController;
use Machour\DataTable\Http\Controllers\SavedViewController;

class DataTableServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        if ($this->app->runningInConsole()) {
            $this->commands([
                MakeDataTable::class,
                GenerateTypeScript::class,
                GenerateTranslations::class,
                AuditReport::class,
            ]);

            $this->publishesMigrations([
                __DIR__ . '/../database/migrations' => database_path('migrations'),
            ], 'data-table-migrations');

            $this->publishes([
                __DIR__ . '/../config/data-table.php' => config_path('data-table.php'),
            ], 'data-table-config');
        }

        $this->registerRoutes();
    }

    public function register(): void
    {
        $this->mergeConfigFrom(
            __DIR__ . '/../config/data-table.php', 'data-table'
        );
    }

    protected function registerRoutes(): void
    {
        $middleware = config('data-table.middleware', ['web']);
        $prefix = config('data-table.route_prefix', 'data-table');

        Route::middleware($middleware)->group(function () use ($prefix) {
            // Export endpoint
            Route::get($prefix . '/export/{table}', DataTableExportController::class)
                ->name('data-table.export');

            // Select all endpoint
            Route::get($prefix . '/select-all/{table}', DataTableSelectAllController::class)
                ->name('data-table.select-all');

            // Inline edit endpoint
            Route::patch($prefix . '/inline-edit/{table}/{id}', DataTableInlineEditController::class)
                ->name('data-table.inline-edit');

            // Toggle endpoint (boolean switch)
            Route::patch($prefix . '/toggle/{table}/{id}', DataTableToggleController::class)
                ->name('data-table.toggle');

            // Detail row endpoint
            Route::get($prefix . '/detail/{table}/{id}', DataTableDetailRowController::class)
                ->name('data-table.detail');

            // Async filter options endpoint
            Route::get($prefix . '/filter-options/{table}/{column}', DataTableAsyncFilterController::class)
                ->name('data-table.filter-options');

            // Cascading filter options endpoint
            Route::get($prefix . '/cascading-options/{table}/{column}', DataTableCascadingFilterController::class)
                ->name('data-table.cascading-options');

            // Row reorder endpoint
            Route::patch($prefix . '/reorder/{table}', DataTableReorderController::class)
                ->name('data-table.reorder');

            // Import endpoint
            Route::post($prefix . '/import/{table}', DataTableImportController::class)
                ->name('data-table.import');

            // Export status endpoint (for queued exports)
            Route::get($prefix . '/export-status', [DataTableExportController::class, 'status'])
                ->name('data-table.export-status');

            // AI endpoints (requires HasAi trait on the DataTable class)
            Route::post($prefix . '/ai/{table}/query', [DataTableAiController::class, 'query'])
                ->name('data-table.ai.query');
            Route::post($prefix . '/ai/{table}/insights', [DataTableAiController::class, 'insights'])
                ->name('data-table.ai.insights');
            Route::post($prefix . '/ai/{table}/column-summary', [DataTableAiController::class, 'columnSummary'])
                ->name('data-table.ai.column-summary');
            Route::post($prefix . '/ai/{table}/suggest', [DataTableAiController::class, 'suggest'])
                ->name('data-table.ai.suggest');
            Route::post($prefix . '/ai/{table}/enrich', [DataTableAiController::class, 'enrich'])
                ->name('data-table.ai.enrich');

            // Saved views API
            Route::get($prefix . '/saved-views/{tableName}', [SavedViewController::class, 'index'])
                ->name('data-table.saved-views.index');
            Route::post($prefix . '/saved-views/{tableName}', [SavedViewController::class, 'store'])
                ->name('data-table.saved-views.store');
            Route::put($prefix . '/saved-views/{tableName}/{viewId}', [SavedViewController::class, 'update'])
                ->name('data-table.saved-views.update');
            Route::delete($prefix . '/saved-views/{tableName}/{viewId}', [SavedViewController::class, 'destroy'])
                ->name('data-table.saved-views.destroy');
        });
    }
}
