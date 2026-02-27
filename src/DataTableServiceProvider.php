<?php

namespace Machour\DataTable;

use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;
use Machour\DataTable\Console\Commands\MakeDataTable;
use Machour\DataTable\Http\Controllers\DataTableExportController;
use Machour\DataTable\Http\Controllers\DataTableInlineEditController;
use Machour\DataTable\Http\Controllers\DataTableSelectAllController;
use Machour\DataTable\Http\Controllers\SavedViewController;

class DataTableServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        if ($this->app->runningInConsole()) {
            $this->commands([
                MakeDataTable::class,
            ]);

            $this->publishesMigrations([
                __DIR__ . '/../database/migrations' => database_path('migrations'),
            ], 'data-table-migrations');
        }

        $this->registerRoutes();
    }

    public function register(): void
    {
        //
    }

    protected function registerRoutes(): void
    {
        Route::middleware('web')->group(function () {
            // Export endpoint
            Route::get('data-table/export/{table}', DataTableExportController::class)
                ->name('data-table.export');

            // Select all endpoint
            Route::get('data-table/select-all/{table}', DataTableSelectAllController::class)
                ->name('data-table.select-all');

            // Inline edit endpoint
            Route::patch('data-table/inline-edit/{table}/{id}', DataTableInlineEditController::class)
                ->name('data-table.inline-edit');

            // Saved views API
            Route::get('data-table/saved-views/{tableName}', [SavedViewController::class, 'index'])
                ->name('data-table.saved-views.index');
            Route::post('data-table/saved-views/{tableName}', [SavedViewController::class, 'store'])
                ->name('data-table.saved-views.store');
            Route::put('data-table/saved-views/{tableName}/{viewId}', [SavedViewController::class, 'update'])
                ->name('data-table.saved-views.update');
            Route::delete('data-table/saved-views/{tableName}/{viewId}', [SavedViewController::class, 'destroy'])
                ->name('data-table.saved-views.destroy');
        });
    }
}
