<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Default Per Page
    |--------------------------------------------------------------------------
    |
    | The default number of rows displayed per page when the user hasn't
    | explicitly chosen a page size.
    |
    */
    'default_per_page' => 25,

    /*
    |--------------------------------------------------------------------------
    | Maximum Per Page
    |--------------------------------------------------------------------------
    |
    | The maximum number of rows a user can select to display per page.
    | This prevents excessive server load from large page sizes.
    |
    */
    'max_per_page' => 100,

    /*
    |--------------------------------------------------------------------------
    | Default Polling Interval
    |--------------------------------------------------------------------------
    |
    | The default auto-refresh interval in seconds. Set to 0 to disable
    | polling by default. Individual tables can override this value.
    |
    */
    'default_polling_interval' => 0,

    /*
    |--------------------------------------------------------------------------
    | LocalStorage Key Prefix
    |--------------------------------------------------------------------------
    |
    | The prefix used for localStorage keys when persisting table state
    | like column visibility, column order, density, etc.
    |
    */
    'storage_prefix' => 'dt-',

    /*
    |--------------------------------------------------------------------------
    | Route Middleware
    |--------------------------------------------------------------------------
    |
    | Middleware applied to all data table routes (export, inline-edit,
    | toggle, detail-row, etc).
    |
    */
    'middleware' => ['web'],

    /*
    |--------------------------------------------------------------------------
    | Route Prefix
    |--------------------------------------------------------------------------
    |
    | The URL prefix for all data table API routes.
    |
    */
    'route_prefix' => 'data-table',

    /*
    |--------------------------------------------------------------------------
    | Default Translations
    |--------------------------------------------------------------------------
    |
    | Override default English translation strings. These are passed to
    | the frontend via the config. Set to null to use built-in defaults.
    |
    */
    'translations' => null,

    /*
    |--------------------------------------------------------------------------
    | Export Settings
    |--------------------------------------------------------------------------
    |
    | Configure defaults for data table exports.
    |
    */
    'export' => [
        'queue' => false,
        'disk' => null,
        'max_rows' => 50000,
    ],

    /*
    |--------------------------------------------------------------------------
    | Import Settings
    |--------------------------------------------------------------------------
    |
    | Configure defaults for data table imports.
    |
    */
    'import' => [
        'max_file_size' => 10240, // KB
        'allowed_extensions' => ['csv', 'xlsx', 'xls'],
    ],

    /*
    |--------------------------------------------------------------------------
    | Rate Limiting
    |--------------------------------------------------------------------------
    |
    | Maximum number of requests per minute for mutation endpoints.
    | Set to 0 to disable rate limiting for a specific endpoint.
    |
    */
    'rate_limit' => [
        'inline_edit' => 60,
        'toggle' => 60,
        'export' => 10,
        'import' => 5,
        'ai' => 30,
    ],

    /*
    |--------------------------------------------------------------------------
    | Audit Log Table
    |--------------------------------------------------------------------------
    |
    | The database table name used for storing audit log entries.
    | Used by the HasAuditLog trait and the data-table:audit-report command.
    |
    */
    'audit_table' => 'data_table_audit_log',

    /*
    |--------------------------------------------------------------------------
    | AI Features (Laravel AI SDK or Prism PHP)
    |--------------------------------------------------------------------------
    |
    | Configure AI-powered features for data tables.
    |
    | Preferred: composer require laravel/ai
    | Fallback:  composer require prism-php/prism
    |
    | Supported models: 'openai:gpt-4o-mini', 'openai:gpt-4o',
    | 'anthropic:claude-sonnet-4-20250514', 'anthropic:claude-haiku-4-5-20251001', 'ollama:llama3', etc.
    |
    | For Thesys C1 generative UI, set DATA_TABLE_THESYS_API_KEY in .env.
    | Get an API key at https://www.thesys.dev
    |
    */
    'ai' => [
        'model' => env('DATA_TABLE_AI_MODEL', 'openai:gpt-4o-mini'),
        'max_tokens' => 1024,
        'sample_size' => 50,
        'thesys_api_key' => env('DATA_TABLE_THESYS_API_KEY'),
        'thesys_model' => env('DATA_TABLE_THESYS_MODEL', 'c1-nightly'),
    ],

];
