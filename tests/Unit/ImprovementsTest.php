<?php

use Machour\DataTable\Columns\Column;
use Machour\DataTable\Columns\ColumnBuilder;
use Machour\DataTable\DataTableMeta;
use Machour\DataTable\DataTableResponse;
use Machour\DataTable\Testing\DataTableTestHelper;
use Machour\DataTable\Tests\Stubs\StubDataTable;

// ── ColumnBuilder (Fluent API) ────────────────────────────

test('column builder creates basic column', function () {
    $col = ColumnBuilder::make('name', 'Name')->build();
    expect($col)->toBeInstanceOf(Column::class);
    expect($col->id)->toBe('name');
    expect($col->label)->toBe('Name');
    expect($col->type)->toBe('text');
    expect($col->sortable)->toBeFalse();
    expect($col->filterable)->toBeFalse();
});

test('column builder fluent chain works', function () {
    $col = ColumnBuilder::make('price', 'Price')
        ->currency('EUR')
        ->sortable()
        ->filterable()
        ->editable()
        ->summary('sum')
        ->locale('de-DE')
        ->group('Financial')
        ->responsivePriority(2)
        ->build();

    expect($col->type)->toBe('currency');
    expect($col->currency)->toBe('EUR');
    expect($col->sortable)->toBeTrue();
    expect($col->filterable)->toBeTrue();
    expect($col->editable)->toBeTrue();
    expect($col->summary)->toBe('sum');
    expect($col->locale)->toBe('de-DE');
    expect($col->group)->toBe('Financial');
    expect($col->responsivePriority)->toBe(2);
});

test('column builder supports all types', function () {
    $types = [
        'text' => fn (ColumnBuilder $b) => $b->text(),
        'number' => fn (ColumnBuilder $b) => $b->number(),
        'date' => fn (ColumnBuilder $b) => $b->date(),
        'option' => fn (ColumnBuilder $b) => $b->option(),
        'multiOption' => fn (ColumnBuilder $b) => $b->multiOption(),
        'boolean' => fn (ColumnBuilder $b) => $b->boolean(),
        'image' => fn (ColumnBuilder $b) => $b->image(),
        'badge' => fn (ColumnBuilder $b) => $b->badge(),
        'currency' => fn (ColumnBuilder $b) => $b->currency(),
        'percentage' => fn (ColumnBuilder $b) => $b->percentage(),
        'link' => fn (ColumnBuilder $b) => $b->link(),
        'email' => fn (ColumnBuilder $b) => $b->email(),
        'phone' => fn (ColumnBuilder $b) => $b->phone(),
    ];

    foreach ($types as $expectedType => $setter) {
        $builder = ColumnBuilder::make('test', 'Test');
        $col = $setter($builder)->build();
        expect($col->type)->toBe($expectedType);
    }
});

test('column builder option type accepts options array', function () {
    $options = [['label' => 'Active', 'value' => 'active'], ['label' => 'Inactive', 'value' => 'inactive']];
    $col = ColumnBuilder::make('status', 'Status')->option($options)->build();
    expect($col->options)->toBe($options);
});

test('column builder badge type accepts options array', function () {
    $options = [['label' => 'Active', 'value' => 'active', 'variant' => 'success']];
    $col = ColumnBuilder::make('status', 'Status')->badge($options)->build();
    expect($col->type)->toBe('badge');
    expect($col->options)->toBe($options);
});

test('column builder hidden shortcut works', function () {
    $col = ColumnBuilder::make('internal', 'Internal')->hidden()->build();
    expect($col->visible)->toBeFalse();
});

test('column builder range sets min and max', function () {
    $col = ColumnBuilder::make('price', 'Price')->number()->range(0, 1000)->build();
    expect($col->min)->toBe(0.0);
    expect($col->max)->toBe(1000.0);
});

test('column builder toggleable works', function () {
    $col = ColumnBuilder::make('active', 'Active')->boolean()->toggleable()->build();
    expect($col->toggleable)->toBeTrue();
});

test('column builder icon and searchThreshold work', function () {
    $col = ColumnBuilder::make('status', 'Status')
        ->option()
        ->icon('check-circle')
        ->searchThreshold(5)
        ->build();
    expect($col->icon)->toBe('check-circle');
    expect($col->searchThreshold)->toBe(5);
});

// ── DataTableResponse new fields ────────────────────────────

test('datatable response supports reorderUrl', function () {
    $response = new DataTableResponse(
        data: [],
        columns: [],
        quickViews: [],
        meta: new DataTableMeta(
            currentPage: 1, lastPage: 1, perPage: 25, total: 0, sorts: [], filters: [],
        ),
        reorderUrl: '/data-table/reorder/products',
    );

    expect($response->reorderUrl)->toBe('/data-table/reorder/products');
});

test('datatable response supports importUrl', function () {
    $response = new DataTableResponse(
        data: [],
        columns: [],
        quickViews: [],
        meta: new DataTableMeta(
            currentPage: 1, lastPage: 1, perPage: 25, total: 0, sorts: [], filters: [],
        ),
        importUrl: '/data-table/import/products',
    );

    expect($response->importUrl)->toBe('/data-table/import/products');
});

test('datatable response supports groupByColumn', function () {
    $response = new DataTableResponse(
        data: [],
        columns: [],
        quickViews: [],
        meta: new DataTableMeta(
            currentPage: 1, lastPage: 1, perPage: 25, total: 0, sorts: [], filters: [],
        ),
        groupByColumn: 'status',
    );

    expect($response->groupByColumn)->toBe('status');
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

    expect($response->reorderUrl)->toBeNull();
    expect($response->importUrl)->toBeNull();
    expect($response->groupByColumn)->toBeNull();
});

// ── AbstractDataTable: groupByColumn ────────────────────────────

test('tableGroupByColumn defaults to null', function () {
    expect(StubDataTable::tableGroupByColumn())->toBeNull();
});

// ── AbstractDataTable: config resolution ────────────────────────────

test('resolveDefaultPerPage returns configured value', function () {
    $reflection = new ReflectionClass(StubDataTable::class);
    $method = $reflection->getMethod('resolveDefaultPerPage');
    $method->setAccessible(true);

    $result = $method->invoke(null);
    expect($result)->toBeInt();
    expect($result)->toBeGreaterThan(0);
});

test('resolveMaxPerPage returns configured value', function () {
    $reflection = new ReflectionClass(StubDataTable::class);
    $method = $reflection->getMethod('resolveMaxPerPage');
    $method->setAccessible(true);

    $result = $method->invoke(null);
    expect($result)->toBeInt();
    expect($result)->toBeGreaterThanOrEqual(25);
});

// ── DataTableTestHelper ────────────────────────────

test('test helper asserts column exists', function () {
    DataTableTestHelper::for(StubDataTable::class)
        ->assertColumnExists('id')
        ->assertColumnExists('name');
});

test('test helper asserts column not exists', function () {
    DataTableTestHelper::for(StubDataTable::class)
        ->assertColumnNotExists('nonexistent');
});

test('test helper asserts column count', function () {
    $cols = StubDataTable::tableColumns();
    DataTableTestHelper::for(StubDataTable::class)
        ->assertColumnCount(count($cols));
});

test('test helper asserts sortable', function () {
    DataTableTestHelper::for(StubDataTable::class)
        ->assertSortable('id');
});

test('test helper asserts filterable', function () {
    DataTableTestHelper::for(StubDataTable::class)
        ->assertFilterable('status');
});

test('test helper asserts column type', function () {
    DataTableTestHelper::for(StubDataTable::class)
        ->assertColumnType('id', 'number');
});

test('test helper asserts visible', function () {
    DataTableTestHelper::for(StubDataTable::class)
        ->assertVisible('id');
});

test('test helper asserts has quick views', function () {
    // StubDataTable has no quick views defined, so 0 is valid
    DataTableTestHelper::for(StubDataTable::class)
        ->assertHasQuickViews(0);
});

test('test helper asserts default sort', function () {
    DataTableTestHelper::for(StubDataTable::class)
        ->assertDefaultSort('-id');
});

test('test helper get columns returns all columns', function () {
    $helper = DataTableTestHelper::for(StubDataTable::class);
    $columns = $helper->getColumns();
    expect($columns)->toBeArray();
    expect(count($columns))->toBeGreaterThan(0);
});

// ── Config file ────────────────────────────

test('config file exists and has expected keys', function () {
    $configPath = realpath(__DIR__ . '/../../config/data-table.php');
    expect($configPath)->not->toBeFalse();

    $config = require $configPath;
    expect($config)->toBeArray();
    expect($config)->toHaveKey('default_per_page');
    expect($config)->toHaveKey('max_per_page');
    expect($config)->toHaveKey('default_polling_interval');
    expect($config)->toHaveKey('storage_prefix');
    expect($config)->toHaveKey('middleware');
    expect($config)->toHaveKey('route_prefix');
    expect($config)->toHaveKey('export');
    expect($config)->toHaveKey('import');
});

test('config default values are sensible', function () {
    $config = require realpath(__DIR__ . '/../../config/data-table.php');

    expect($config['default_per_page'])->toBe(25);
    expect($config['max_per_page'])->toBe(100);
    expect($config['default_polling_interval'])->toBe(0);
    expect($config['storage_prefix'])->toBe('dt-');
    expect($config['route_prefix'])->toBe('data-table');
    expect($config['export']['queue'])->toBeFalse();
    expect($config['import']['max_file_size'])->toBe(10240);
});

// ── HasImport trait ────────────────────────────

test('HasImport trait provides import rules', function () {
    // Create an anonymous class that uses HasImport
    $class = new class {
        use \Machour\DataTable\Concerns\HasImport;

        public static function tableImportName(): string
        {
            return 'test-import';
        }
    };

    $rules = $class::tableImportRules();
    expect($rules)->toHaveKey('file');
    expect($rules['file'])->toContain('required');
});

test('HasImport default processImport returns zero counts', function () {
    $class = new class {
        use \Machour\DataTable\Concerns\HasImport;

        public static function tableImportName(): string
        {
            return 'test';
        }
    };

    $result = $class::processImport('/tmp/test.csv', 'csv');
    expect($result['created'])->toBe(0);
    expect($result['updated'])->toBe(0);
    expect($result['errors'])->toBe([]);
});

// ── HasReorder trait ────────────────────────────

test('HasReorder default order column is position', function () {
    $class = new class {
        use \Machour\DataTable\Concerns\HasReorder;

        public static function tableReorderModel(): string
        {
            return 'App\\Models\\Product';
        }

        public static function tableReorderName(): string
        {
            return 'products';
        }
    };

    expect($class::tableReorderColumn())->toBe('position');
});

// ── ColumnBuilder serialization ────────────────────────────

test('column builder produces identical output to Column constructor', function () {
    $fromConstructor = new Column(
        id: 'price',
        label: 'Price',
        type: 'currency',
        sortable: true,
        filterable: true,
        editable: true,
        currency: 'EUR',
        locale: 'de-DE',
        summary: 'sum',
    );

    $fromBuilder = ColumnBuilder::make('price', 'Price')
        ->currency('EUR')
        ->sortable()
        ->filterable()
        ->editable()
        ->summary('sum')
        ->locale('de-DE')
        ->build();

    expect($fromBuilder->toArray())->toBe($fromConstructor->toArray());
});
