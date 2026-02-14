<?php

namespace Machour\DataTable\Tests\Stubs;

use Machour\DataTable\AbstractDataTable;
use Machour\DataTable\Columns\Column;
use Machour\DataTable\QuickView;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

class StubDataTable extends AbstractDataTable
{
    public function __construct(
        public int $id = 0,
        public ?string $name = null,
    ) {}

    public static function tableColumns(): array
    {
        return [
            new Column(id: 'id', label: 'ID', type: 'number', sortable: true, filterable: false),
            new Column(id: 'name', label: 'Name', type: 'text', sortable: true, filterable: true),
            new Column(id: 'status', label: 'Status', type: 'option', sortable: false, filterable: true),
            new Column(id: 'created_at', label: 'Created', type: 'date', sortable: true, filterable: false),
        ];
    }

    public static function tableBaseQuery(): Builder
    {
        // Not used in unit tests — only in integration/feature tests
        return \Illuminate\Database\Eloquent\Model::query();
    }

    /**
     * Expose the protected quickViewMatchesRequest for testing.
     */
    public static function testQuickViewMatchesRequest(QuickView $qv, Request $request): bool
    {
        return static::quickViewMatchesRequest($qv, $request);
    }
}
