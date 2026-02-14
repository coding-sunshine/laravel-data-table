<?php

namespace Machour\DataTable;

use Illuminate\Support\ServiceProvider;
use Machour\DataTable\Console\Commands\MakeDataTable;

class DataTableServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        if ($this->app->runningInConsole()) {
            $this->commands([
                MakeDataTable::class,
            ]);
        }
    }

    public function register(): void
    {
        //
    }
}
