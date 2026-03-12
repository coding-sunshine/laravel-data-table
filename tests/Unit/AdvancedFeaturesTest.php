<?php

use Machour\DataTable\Columns\Column;
use Machour\DataTable\Columns\ColumnBuilder;
use Machour\DataTable\DataTableResponse;

// ── Feature 1: Cell Flashing ──────────────────────────────────────

test('DataTable React source has cell flashing hook', function () {
    $source = file_get_contents(__DIR__ . '/../../react/src/data-table/data-table.tsx');

    expect($source)->toContain('useCellFlashing');
    expect($source)->toContain('flashingCells');
    expect($source)->toContain('animate-cell-flash');
});

test('DataTable options include cellFlashing', function () {
    $source = file_get_contents(__DIR__ . '/../../react/src/data-table/types.ts');

    expect($source)->toContain('cellFlashing: boolean');
});

test('Cell flash animation CSS is injected when enabled', function () {
    $source = file_get_contents(__DIR__ . '/../../react/src/data-table/data-table.tsx');

    expect($source)->toContain('@keyframes cell-flash');
    expect($source)->toContain('resolvedOptions.cellFlashing');
});

// ── Feature 2: Frozen/Pinned Rows ─────────────────────────────────

test('AbstractDataTable has tablePinnedTopRows method', function () {
    $reflection = new ReflectionClass(\Machour\DataTable\AbstractDataTable::class);

    expect($reflection->hasMethod('tablePinnedTopRows'))->toBeTrue();
    expect($reflection->hasMethod('tablePinnedBottomRows'))->toBeTrue();
});

test('DataTableResponse has pinned rows fields', function () {
    $response = new DataTableResponse(
        data: [],
        columns: [],
        quickViews: [],
        meta: new \Machour\DataTable\DataTableMeta(1, 1, 25, 0, [], []),
        pinnedTopRows: [['id' => 1, 'name' => 'Pinned']],
        pinnedBottomRows: [['id' => 2, 'name' => 'Bottom']],
    );

    expect($response->pinnedTopRows)->toHaveCount(1);
    expect($response->pinnedBottomRows)->toHaveCount(1);
    expect($response->pinnedTopRows[0]['name'])->toBe('Pinned');
});

test('Pinned rows render in React component', function () {
    $source = file_get_contents(__DIR__ . '/../../react/src/data-table/data-table.tsx');

    expect($source)->toContain('pinnedTopRows');
    expect($source)->toContain('pinnedBottomRows');
    expect($source)->toContain('pinned-top-');
    expect($source)->toContain('pinned-bottom-');
});

// ── Feature 3: Row Spanning ───────────────────────────────────────

test('DataTable supports row spanning via props', function () {
    $source = file_get_contents(__DIR__ . '/../../react/src/data-table/types.ts');

    expect($source)->toContain('rowSpan?: Record<string');
});

test('Row spanning is applied in cell rendering', function () {
    $source = file_get_contents(__DIR__ . '/../../react/src/data-table/data-table.tsx');

    expect($source)->toContain('rowSpanVal');
    expect($source)->toContain('rowSpan={rowSpanVal}');
});

// ── Feature 4: Drag-to-Fill ──────────────────────────────────────

test('DataTable options include dragToFill', function () {
    $source = file_get_contents(__DIR__ . '/../../react/src/data-table/types.ts');

    expect($source)->toContain('dragToFill: boolean');
    expect($source)->toContain('onDragToFill');
});

test('Drag-to-fill handle renders for editable cells', function () {
    $source = file_get_contents(__DIR__ . '/../../react/src/data-table/data-table.tsx');

    expect($source)->toContain('handleDragFillStart');
    expect($source)->toContain('handleDragFillEnd');
    expect($source)->toContain('cursor-crosshair');
    expect($source)->toContain('dragToFill');
});

test('i18n has dragToFill translation key', function () {
    $source = file_get_contents(__DIR__ . '/../../react/src/data-table/i18n.ts');

    expect($source)->toContain('dragToFill:');
    expect($source)->toContain('"Drag to fill"');
});

// ── Feature 5: Column Spanning ───────────────────────────────────

test('Column supports colSpan property', function () {
    $col = ColumnBuilder::make('summary', 'Summary')->colSpan(3)->build();

    expect($col->colSpan)->toBe(3);
});

test('Column spanning is applied in cell rendering', function () {
    $source = file_get_contents(__DIR__ . '/../../react/src/data-table/data-table.tsx');

    expect($source)->toContain('colSpanVal');
    expect($source)->toContain('colSpan={colSpanVal}');
});

test('DataTable props include columnSpan', function () {
    $source = file_get_contents(__DIR__ . '/../../react/src/data-table/types.ts');

    expect($source)->toContain('columnSpan?: Record<string');
});

// ── Feature 6: Server-Persisted Saved Filters ─────────────────────

test('SavedViewController exists and has CRUD methods', function () {
    $reflection = new ReflectionClass(\Machour\DataTable\Http\Controllers\SavedViewController::class);

    expect($reflection->hasMethod('index'))->toBeTrue();
    expect($reflection->hasMethod('store'))->toBeTrue();
    expect($reflection->hasMethod('update'))->toBeTrue();
    expect($reflection->hasMethod('destroy'))->toBeTrue();
});

test('SavedView model has correct fillable fields', function () {
    $model = new \Machour\DataTable\SavedView();

    expect($model->getFillable())->toContain('name');
    expect($model->getFillable())->toContain('filters');
    expect($model->getFillable())->toContain('sort');
    expect($model->getFillable())->toContain('columns');
    expect($model->getFillable())->toContain('is_default');
});

test('i18n has saved filters translation keys', function () {
    $source = file_get_contents(__DIR__ . '/../../react/src/data-table/i18n.ts');

    expect($source)->toContain('savedFilters:');
    expect($source)->toContain('saveCurrentFilters:');
    expect($source)->toContain('filterName:');
});

// ── Feature 7: PDF Export ─────────────────────────────────────────

test('HasExport trait supports PDF format via spatie/laravel-pdf', function () {
    $source = file_get_contents(__DIR__ . '/../../src/Concerns/HasExport.php');

    expect($source)->toContain("'pdf'");
    expect($source)->toContain('Spatie\LaravelPdf');
});

test('React export dropdown includes PDF option', function () {
    $source = file_get_contents(__DIR__ . '/../../react/src/data-table/data-table.tsx');

    expect($source)->toContain('PDF (.pdf)');
    expect($source)->toContain('"pdf"');
});

// ── Feature 8: Server-Driven Conditional Row Actions ──────────────

test('AbstractDataTable has tableActionRules method', function () {
    $reflection = new ReflectionClass(\Machour\DataTable\AbstractDataTable::class);

    expect($reflection->hasMethod('tableActionRules'))->toBeTrue();
});

test('DataTableResponse has actionRules field', function () {
    $response = new DataTableResponse(
        data: [],
        columns: [],
        quickViews: [],
        meta: new \Machour\DataTable\DataTableMeta(1, 1, 25, 0, [], []),
        actionRules: ['Delete' => ['column' => 'status', 'operator' => 'neq', 'value' => 'archived']],
    );

    expect($response->actionRules)->toHaveKey('Delete');
    expect($response->actionRules['Delete']['operator'])->toBe('neq');
});

test('React component applies action rules', function () {
    $source = file_get_contents(__DIR__ . '/../../react/src/data-table/data-table.tsx');

    expect($source)->toContain('checkActionRule');
    expect($source)->toContain('actionRules');
    expect($source)->toContain('filteredActions');
});

test('Action rule supports multiple operators', function () {
    $source = file_get_contents(__DIR__ . '/../../react/src/data-table/data-table.tsx');

    expect($source)->toContain('"eq"');
    expect($source)->toContain('"neq"');
    expect($source)->toContain('"gt"');
    expect($source)->toContain('"gte"');
    expect($source)->toContain('"lt"');
    expect($source)->toContain('"lte"');
    expect($source)->toContain('"in"');
    expect($source)->toContain('"notIn"');
});

// ── Feature 9: Status Bar ────────────────────────────────────────

test('DataTable options include statusBar', function () {
    $source = file_get_contents(__DIR__ . '/../../react/src/data-table/types.ts');

    expect($source)->toContain('statusBar: boolean');
});

test('Status bar computes aggregates', function () {
    $source = file_get_contents(__DIR__ . '/../../react/src/data-table/data-table.tsx');

    expect($source)->toContain('computeStatusBarAggregates');
    expect($source)->toContain('statusBarSum');
    expect($source)->toContain('statusBarAvg');
    expect($source)->toContain('statusBarCount');
    expect($source)->toContain('statusBarMin');
    expect($source)->toContain('statusBarMax');
});

test('Status bar renders when rows are selected', function () {
    $source = file_get_contents(__DIR__ . '/../../react/src/data-table/data-table.tsx');

    expect($source)->toContain('resolvedOptions.statusBar && selectedRows.length > 0');
});

test('Status bar i18n keys exist', function () {
    $source = file_get_contents(__DIR__ . '/../../react/src/data-table/i18n.ts');

    expect($source)->toContain('statusBarSum:');
    expect($source)->toContain('statusBarAvg:');
    expect($source)->toContain('statusBarCount:');
});

// ── Feature 10: Computed Columns ──────────────────────────────────

test('ColumnBuilder supports computed columns', function () {
    $col = ColumnBuilder::make('total', 'Total')
        ->computed(['price', 'qty'], fn ($row) => ($row['price'] ?? 0) * ($row['qty'] ?? 0))
        ->build();

    expect($col->computedFrom)->toBe(['price', 'qty']);
});

test('Computed resolvers are registered in ColumnBuilder', function () {
    ColumnBuilder::clearComputedResolvers();

    ColumnBuilder::make('total', 'Total')
        ->computed(['price', 'qty'], fn ($row) => $row['price'] * $row['qty'])
        ->build();

    $resolvers = ColumnBuilder::getComputedResolvers();

    expect($resolvers)->toHaveKey('total');
    expect($resolvers['total'](['price' => 10, 'qty' => 5]))->toBe(50);

    ColumnBuilder::clearComputedResolvers();
});

test('Column type includes computedFrom property', function () {
    $col = new Column(id: 'total', label: 'Total', computedFrom: ['price', 'qty']);

    expect($col->computedFrom)->toBe(['price', 'qty']);
});

// ── Feature 11: Multi-Row Clipboard Paste ─────────────────────────

test('DataTable options include clipboardPaste', function () {
    $source = file_get_contents(__DIR__ . '/../../react/src/data-table/types.ts');

    expect($source)->toContain('clipboardPaste: boolean');
    expect($source)->toContain('onClipboardPaste');
});

test('Clipboard paste handler is registered', function () {
    $source = file_get_contents(__DIR__ . '/../../react/src/data-table/data-table.tsx');

    expect($source)->toContain('handlePaste');
    expect($source)->toContain('clipboardData');
    expect($source)->toContain('text/plain');
    expect($source)->toContain('pasteSuccess');
    expect($source)->toContain('pasteError');
});

test('i18n has paste translation keys', function () {
    $source = file_get_contents(__DIR__ . '/../../react/src/data-table/i18n.ts');

    expect($source)->toContain('pasteSuccess:');
    expect($source)->toContain('pasteError:');
});

// ── Feature 12: Dynamic Row Height ───────────────────────────────

test('Column supports autoHeight property', function () {
    $col = ColumnBuilder::make('description', 'Description')->autoHeight()->build();

    expect($col->autoHeight)->toBeTrue();
});

test('autoHeight switches whitespace-nowrap to whitespace-normal', function () {
    $source = file_get_contents(__DIR__ . '/../../react/src/data-table/data-table.tsx');

    expect($source)->toContain('isAutoHeight');
    expect($source)->toContain('whitespace-normal');
});

test('DataTableColumnDef type includes autoHeight', function () {
    $source = file_get_contents(__DIR__ . '/../../react/src/data-table/types.ts');

    expect($source)->toContain('autoHeight?: boolean');
});

// ── Cross-feature integration ─────────────────────────────────────

test('All new option flags default to false', function () {
    $source = file_get_contents(__DIR__ . '/../../react/src/data-table/data-table.tsx');

    expect($source)->toContain('cellFlashing: false');
    expect($source)->toContain('statusBar: false');
    expect($source)->toContain('clipboardPaste: false');
    expect($source)->toContain('dragToFill: false');
});

test('TypeScript types include all new response fields', function () {
    $source = file_get_contents(__DIR__ . '/../../react/src/data-table/types.ts');

    expect($source)->toContain('pinnedTopRows');
    expect($source)->toContain('pinnedBottomRows');
    expect($source)->toContain('actionRules');
});

test('French translations exist for all new keys', function () {
    $source = file_get_contents(__DIR__ . '/../../react/src/data-table/i18n.ts');

    // French translations
    expect($source)->toContain('"Somme"');
    expect($source)->toContain('"Collé avec succès"');
    expect($source)->toContain('"Glisser pour remplir"');
    expect($source)->toContain('"Filtres sauvegardés"');
});
