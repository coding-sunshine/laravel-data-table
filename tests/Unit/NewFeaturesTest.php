<?php

use Machour\DataTable\Columns\Column;
use Machour\DataTable\DataTableMeta;
use Machour\DataTable\DataTableResponse;
use Machour\DataTable\Tests\Stubs\StubDataTable;
use Illuminate\Http\Request;

// ── Column new types & properties ────────────────────────────

test('column supports new types: image, badge, currency, percentage, link, email, phone', function () {
    foreach (['image', 'badge', 'currency', 'percentage', 'link', 'email', 'phone'] as $type) {
        $col = new Column(id: 'test', label: 'Test', type: $type);
        expect($col->type)->toBe($type);
    }
});

test('column supports editable property', function () {
    $col = new Column(id: 'name', label: 'Name', editable: true);
    expect($col->editable)->toBeTrue();

    $col2 = new Column(id: 'name', label: 'Name');
    expect($col2->editable)->toBeFalse();
});

test('column supports currency and locale properties', function () {
    $col = new Column(id: 'price', label: 'Price', type: 'currency', currency: 'EUR', locale: 'fr-FR');
    expect($col->currency)->toBe('EUR');
    expect($col->locale)->toBe('fr-FR');
});

test('column new properties default to null', function () {
    $col = new Column(id: 'test', label: 'Test');
    expect($col->editable)->toBeFalse();
    expect($col->currency)->toBeNull();
    expect($col->locale)->toBeNull();
});

test('column new properties serialize to array', function () {
    $col = new Column(id: 'price', label: 'Price', type: 'currency', editable: true, currency: 'USD', locale: 'en-US');
    $arr = $col->toArray();

    expect($arr)
        ->toHaveKey('editable', true)
        ->toHaveKey('currency', 'USD')
        ->toHaveKey('locale', 'en-US');
});

// ── Column summary property ────────────────────────────

test('column supports summary property', function () {
    foreach (['sum', 'avg', 'min', 'max', 'count'] as $summary) {
        $col = new Column(id: 'amount', label: 'Amount', summary: $summary);
        expect($col->summary)->toBe($summary);
    }
});

test('column summary defaults to null', function () {
    $col = new Column(id: 'test', label: 'Test');
    expect($col->summary)->toBeNull();
});

test('column summary serializes to array', function () {
    $col = new Column(id: 'amount', label: 'Amount', type: 'number', summary: 'sum');
    $arr = $col->toArray();
    expect($arr)->toHaveKey('summary', 'sum');
});

// ── Column toggleable property ────────────────────────────

test('column supports toggleable property', function () {
    $col = new Column(id: 'active', label: 'Active', type: 'boolean', toggleable: true);
    expect($col->toggleable)->toBeTrue();
});

test('column toggleable defaults to false', function () {
    $col = new Column(id: 'test', label: 'Test');
    expect($col->toggleable)->toBeFalse();
});

// ── Column responsivePriority property ────────────────────────────

test('column supports responsivePriority property', function () {
    $col = new Column(id: 'notes', label: 'Notes', responsivePriority: 3);
    expect($col->responsivePriority)->toBe(3);
});

test('column responsivePriority defaults to null', function () {
    $col = new Column(id: 'test', label: 'Test');
    expect($col->responsivePriority)->toBeNull();
});

// ── DataTableMeta ────────────────────────────

test('datatable meta supports paginationType', function () {
    $meta = new DataTableMeta(
        currentPage: 1,
        lastPage: 5,
        perPage: 25,
        total: 100,
        sorts: [],
        filters: [],
        paginationType: 'cursor',
        nextCursor: 'abc123',
        prevCursor: 'xyz789',
    );

    expect($meta->paginationType)->toBe('cursor');
    expect($meta->nextCursor)->toBe('abc123');
    expect($meta->prevCursor)->toBe('xyz789');
});

test('datatable meta paginationType defaults to standard', function () {
    $meta = new DataTableMeta(
        currentPage: 1,
        lastPage: 1,
        perPage: 25,
        total: 0,
        sorts: [],
        filters: [],
    );

    expect($meta->paginationType)->toBe('standard');
    expect($meta->nextCursor)->toBeNull();
    expect($meta->prevCursor)->toBeNull();
});

// ── DataTableResponse ────────────────────────────

test('datatable response supports selectAllUrl', function () {
    $response = new DataTableResponse(
        data: [],
        columns: [],
        quickViews: [],
        meta: new DataTableMeta(
            currentPage: 1, lastPage: 1, perPage: 25, total: 0, sorts: [], filters: [],
        ),
        selectAllUrl: '/data-table/select-all/products',
    );

    expect($response->selectAllUrl)->toBe('/data-table/select-all/products');
});

test('datatable response selectAllUrl defaults to null', function () {
    $response = new DataTableResponse(
        data: [],
        columns: [],
        quickViews: [],
        meta: new DataTableMeta(
            currentPage: 1, lastPage: 1, perPage: 25, total: 0, sorts: [], filters: [],
        ),
    );

    expect($response->selectAllUrl)->toBeNull();
});

test('datatable response supports summary', function () {
    $response = new DataTableResponse(
        data: [],
        columns: [],
        quickViews: [],
        meta: new DataTableMeta(
            currentPage: 1, lastPage: 1, perPage: 25, total: 0, sorts: [], filters: [],
        ),
        summary: ['amount' => 12345.67, 'count' => 42],
    );

    expect($response->summary)->toBe(['amount' => 12345.67, 'count' => 42]);
});

test('datatable response supports config', function () {
    $config = [
        'detailRowEnabled' => true,
        'softDeletesEnabled' => false,
        'pollingInterval' => 30,
        'persistState' => true,
        'deferLoading' => false,
        'asyncFilterColumns' => ['city'],
        'cascadingFilters' => ['city' => 'country'],
        'rules' => [],
    ];

    $response = new DataTableResponse(
        data: [],
        columns: [],
        quickViews: [],
        meta: new DataTableMeta(
            currentPage: 1, lastPage: 1, perPage: 25, total: 0, sorts: [], filters: [],
        ),
        config: $config,
    );

    expect($response->config)->toBe($config);
    expect($response->config['detailRowEnabled'])->toBeTrue();
    expect($response->config['pollingInterval'])->toBe(30);
});

test('datatable response supports toggleUrl', function () {
    $response = new DataTableResponse(
        data: [],
        columns: [],
        quickViews: [],
        meta: new DataTableMeta(
            currentPage: 1, lastPage: 1, perPage: 25, total: 0, sorts: [], filters: [],
        ),
        toggleUrl: '/data-table/toggle/products',
    );

    expect($response->toggleUrl)->toBe('/data-table/toggle/products');
});

test('datatable response supports enumOptions', function () {
    $response = new DataTableResponse(
        data: [],
        columns: [],
        quickViews: [],
        meta: new DataTableMeta(
            currentPage: 1, lastPage: 1, perPage: 25, total: 0, sorts: [], filters: [],
        ),
        enumOptions: ['status' => [['label' => 'Active', 'value' => 'active'], ['label' => 'Inactive', 'value' => 'inactive']]],
    );

    expect($response->enumOptions)->toHaveKey('status');
    expect($response->enumOptions['status'])->toHaveCount(2);
});

test('datatable response new fields default to null', function () {
    $response = new DataTableResponse(
        data: [],
        columns: [],
        quickViews: [],
        meta: new DataTableMeta(
            currentPage: 1, lastPage: 1, perPage: 25, total: 0, sorts: [], filters: [],
        ),
    );

    expect($response->summary)->toBeNull();
    expect($response->config)->toBeNull();
    expect($response->toggleUrl)->toBeNull();
    expect($response->enumOptions)->toBeNull();
});

// ── AbstractDataTable defaults ────────────────────────────

test('tablePaginationType defaults to standard', function () {
    expect(StubDataTable::tablePaginationType())->toBe('standard');
});

test('tableSearchableColumns returns empty array by default', function () {
    expect(StubDataTable::tableSearchableColumns())->toBe([]);
});

test('tableResource returns null by default', function () {
    expect(StubDataTable::tableResource())->toBeNull();
});

test('tableDetailRowEnabled defaults to false', function () {
    expect(StubDataTable::tableDetailRowEnabled())->toBeFalse();
});

test('tableDetailRow defaults to null', function () {
    expect(StubDataTable::tableDetailRow(null))->toBeNull();
});

test('tableSoftDeletesEnabled defaults to false', function () {
    expect(StubDataTable::tableSoftDeletesEnabled())->toBeFalse();
});

test('tableWithTrashedDefault defaults to false', function () {
    expect(StubDataTable::tableWithTrashedDefault())->toBeFalse();
});

test('tableRules defaults to empty array', function () {
    expect(StubDataTable::tableRules())->toBe([]);
});

test('tablePollingInterval defaults to 0', function () {
    expect(StubDataTable::tablePollingInterval())->toBe(0);
});

test('tablePersistState defaults to false', function () {
    expect(StubDataTable::tablePersistState())->toBeFalse();
});

test('tableDeferLoading defaults to false', function () {
    expect(StubDataTable::tableDeferLoading())->toBeFalse();
});

test('tableAsyncFilterColumns defaults to empty array', function () {
    expect(StubDataTable::tableAsyncFilterColumns())->toBe([]);
});

test('resolveAsyncFilterOptions defaults to empty array', function () {
    expect(StubDataTable::resolveAsyncFilterOptions('test'))->toBe([]);
});

test('tableEnumFilters defaults to empty array', function () {
    expect(StubDataTable::tableEnumFilters())->toBe([]);
});

test('tableCascadingFilters defaults to empty array', function () {
    expect(StubDataTable::tableCascadingFilters())->toBe([]);
});

test('resolveCascadingFilterOptions defaults to empty array', function () {
    expect(StubDataTable::resolveCascadingFilterOptions('test', null))->toBe([]);
});

// ── parseSorts helper ────────────────────────────

test('parseSorts handles empty string', function () {
    $reflection = new ReflectionClass(StubDataTable::class);
    $method = $reflection->getMethod('parseSorts');
    $method->setAccessible(true);

    $result = $method->invoke(null, '');
    expect($result)->toBe([]);
});

test('parseSorts handles single ascending sort', function () {
    $reflection = new ReflectionClass(StubDataTable::class);
    $method = $reflection->getMethod('parseSorts');
    $method->setAccessible(true);

    $result = $method->invoke(null, 'name');
    expect($result)->toBe([['id' => 'name', 'direction' => 'asc']]);
});

test('parseSorts handles single descending sort', function () {
    $reflection = new ReflectionClass(StubDataTable::class);
    $method = $reflection->getMethod('parseSorts');
    $method->setAccessible(true);

    $result = $method->invoke(null, '-created_at');
    expect($result)->toBe([['id' => 'created_at', 'direction' => 'desc']]);
});

test('parseSorts handles multi-sort', function () {
    $reflection = new ReflectionClass(StubDataTable::class);
    $method = $reflection->getMethod('parseSorts');
    $method->setAccessible(true);

    $result = $method->invoke(null, 'name,-price,id');
    expect($result)->toHaveCount(3);
    expect($result[0])->toBe(['id' => 'name', 'direction' => 'asc']);
    expect($result[1])->toBe(['id' => 'price', 'direction' => 'desc']);
    expect($result[2])->toBe(['id' => 'id', 'direction' => 'asc']);
});

test('parseSorts ignores empty segments', function () {
    $reflection = new ReflectionClass(StubDataTable::class);
    $method = $reflection->getMethod('parseSorts');
    $method->setAccessible(true);

    $result = $method->invoke(null, 'name,,price,');
    expect($result)->toHaveCount(2);
});
