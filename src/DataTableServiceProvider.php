<?php

namespace Machour\DataTable;

use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;
use Machour\DataTable\Console\Commands\MakeDataTable;
use Machour\DataTable\Http\Controllers\DataTableExportController;

class DataTableServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        if ($this->app->runningInConsole()) {
            $this->commands([
                MakeDataTable::class,
            ]);
        }

        $this->registerRoutes();
    }

    public function register(): void
    {
        //
    }

    protected function registerRoutes(): void
    {
        Route::get('data-table/export/{table}', DataTableExportController::class)
            ->name('data-table.export')
            ->middleware('web');
    }
}
