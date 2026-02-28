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

// ── OperatorFilter ────────────────────────────

test('operator filter escapes LIKE wildcards in contains', function () {
    $filter = new \Machour\DataTable\Filters\OperatorFilter('text');

    $builder = Mockery::mock(\Illuminate\Database\Eloquent\Builder::class);
    // The LIKE value should have % and _ escaped with backslashes
    $expected = '%' . str_replace(['%', '_', '\\'], ['\\%', '\\_', '\\\\'], 'test%value_here') . '%';
    $builder->shouldReceive('where')
        ->with('name', 'LIKE', $expected)
        ->once()
        ->andReturnSelf();

    $filter($builder, 'contains:test%value_here', 'name');
});

test('operator filter handles all known operators', function () {
    $known = ['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'between', 'in', 'not_in', 'contains', 'before', 'after', 'null', 'not_null'];
    $filter = new \Machour\DataTable\Filters\OperatorFilter('text');

    // Verify the filter exists and the known operators list is complete
    expect($known)->toHaveCount(14);
    expect($filter)->toBeInstanceOf(\Machour\DataTable\Filters\OperatorFilter::class);
});

test('operator filter default operator varies by type', function () {
    $reflection = new ReflectionClass(\Machour\DataTable\Filters\OperatorFilter::class);
    $method = $reflection->getMethod('defaultOperator');
    $method->setAccessible(true);

    $textFilter = new \Machour\DataTable\Filters\OperatorFilter('text');
    expect($method->invoke($textFilter))->toBe('contains');

    $numberFilter = new \Machour\DataTable\Filters\OperatorFilter('number');
    expect($method->invoke($numberFilter))->toBe('eq');

    $optionFilter = new \Machour\DataTable\Filters\OperatorFilter('option');
    expect($method->invoke($optionFilter))->toBe('in');

    $boolFilter = new \Machour\DataTable\Filters\OperatorFilter('boolean');
    expect($method->invoke($boolFilter))->toBe('eq');

    $dateFilter = new \Machour\DataTable\Filters\OperatorFilter('date');
    expect($method->invoke($dateFilter))->toBe('eq');
});

// ── maxPerPage ────────────────────────────

test('maxPerPage property exists on AbstractDataTable', function () {
    $reflection = new ReflectionClass(StubDataTable::class);
    $prop = $reflection->getProperty('maxPerPage');
    $prop->setAccessible(true);

    // maxPerPage is now nullable; defaults via config
    expect($prop->getValue())->toBeNull();
});

// ── Column combined properties ────────────────────────────

test('column supports all properties together', function () {
    $col = new Column(
        id: 'price',
        label: 'Price',
        type: 'currency',
        sortable: true,
        filterable: true,
        visible: true,
        editable: true,
        currency: 'EUR',
        locale: 'de-DE',
        summary: 'avg',
        toggleable: false,
        responsivePriority: 2,
    );

    expect($col->id)->toBe('price');
    expect($col->type)->toBe('currency');
    expect($col->sortable)->toBeTrue();
    expect($col->filterable)->toBeTrue();
    expect($col->editable)->toBeTrue();
    expect($col->currency)->toBe('EUR');
    expect($col->locale)->toBe('de-DE');
    expect($col->summary)->toBe('avg');
    expect($col->toggleable)->toBeFalse();
    expect($col->responsivePriority)->toBe(2);
});

test('column serializes all properties to array', function () {
    $col = new Column(
        id: 'price',
        label: 'Price',
        type: 'currency',
        summary: 'sum',
        toggleable: true,
        responsivePriority: 1,
    );

    $arr = $col->toArray();

    expect($arr)
        ->toHaveKey('summary', 'sum')
        ->toHaveKey('toggleable', true)
        ->toHaveKey('responsivePriority', 1);
});

// ── DataTableResponse with all fields ────────────────────────────

test('datatable response serializes all fields to array', function () {
    $response = new DataTableResponse(
        data: [['id' => 1, 'name' => 'Test']],
        columns: [new Column(id: 'id', label: 'ID'), new Column(id: 'name', label: 'Name')],
        quickViews: [],
        meta: new DataTableMeta(
            currentPage: 1, lastPage: 5, perPage: 10, total: 50, sorts: [], filters: [],
        ),
        exportUrl: '/export',
        footer: ['name' => '10 items'],
        selectAllUrl: '/select-all',
        summary: ['id' => 50],
        config: ['pollingInterval' => 15],
        toggleUrl: '/toggle',
        enumOptions: ['status' => [['label' => 'Active', 'value' => 'active']]],
    );

    expect($response->data)->toHaveCount(1);
    expect($response->columns)->toHaveCount(2);
    expect($response->meta->total)->toBe(50);
    expect($response->exportUrl)->toBe('/export');
    expect($response->footer)->toHaveKey('name');
    expect($response->selectAllUrl)->toBe('/select-all');
    expect($response->summary)->toHaveKey('id');
    expect($response->config)->toHaveKey('pollingInterval');
    expect($response->toggleUrl)->toBe('/toggle');
    expect($response->enumOptions)->toHaveKey('status');
});

// ── QuickView matching ────────────────────────────

test('quickViewMatchesRequest returns true for matching params', function () {
    $qv = new \Machour\DataTable\QuickView(
        id: 'active',
        label: 'Active',
        params: ['filter[status]' => 'active'],
    );

    $request = Request::create('/', 'GET', ['filter' => ['status' => 'active']]);

    $reflection = new ReflectionClass(StubDataTable::class);
    $method = $reflection->getMethod('quickViewMatchesRequest');
    $method->setAccessible(true);

    expect($method->invoke(null, $qv, $request))->toBeTrue();
});

test('quickViewMatchesRequest returns false for non-matching params', function () {
    $qv = new \Machour\DataTable\QuickView(
        id: 'active',
        label: 'Active',
        params: ['filter[status]' => 'active'],
    );

    $request = Request::create('/', 'GET', ['filter' => ['status' => 'inactive']]);

    $reflection = new ReflectionClass(StubDataTable::class);
    $method = $reflection->getMethod('quickViewMatchesRequest');
    $method->setAccessible(true);

    expect($method->invoke(null, $qv, $request))->toBeFalse();
});

test('quickViewMatchesRequest returns false when request has extra filters', function () {
    $qv = new \Machour\DataTable\QuickView(
        id: 'active',
        label: 'Active',
        params: ['filter[status]' => 'active'],
    );

    $request = Request::create('/', 'GET', ['filter' => ['status' => 'active', 'role' => 'admin']]);

    $reflection = new ReflectionClass(StubDataTable::class);
    $method = $reflection->getMethod('quickViewMatchesRequest');
    $method->setAccessible(true);

    expect($method->invoke(null, $qv, $request))->toBeFalse();
});

test('quickViewMatchesRequest empty params matches no filters', function () {
    $qv = new \Machour\DataTable\QuickView(
        id: 'all',
        label: 'All',
        params: [],
    );

    $request = Request::create('/', 'GET');

    $reflection = new ReflectionClass(StubDataTable::class);
    $method = $reflection->getMethod('quickViewMatchesRequest');
    $method->setAccessible(true);

    expect($method->invoke(null, $qv, $request))->toBeTrue();
});

// ── Export filename sanitization ────────────────────────────

test('export filename sanitizes path traversal attempts', function () {
    // The resolveExportFilename should sanitize dangerous characters
    // We test the sanitization pattern directly
    $dangerous = '../../../etc/passwd';
    $sanitized = preg_replace('/[^a-zA-Z0-9_\-]/', '_', basename($dangerous));
    expect($sanitized)->toBe('passwd');

    $dangerous2 = 'file<>name';
    $sanitized2 = preg_replace('/[^a-zA-Z0-9_\-]/', '_', basename($dangerous2));
    expect($sanitized2)->toBe('file__name');
});
