<?php

use Machour\DataTable\Columns\Column;
use Machour\DataTable\Columns\ColumnBuilder;

// ── Column internalName and relation properties ──────────

test('Column has internalName property', function () {
    $col = new Column(id: 'user_name', label: 'User Name', internalName: 'user.name');
    expect($col->internalName)->toBe('user.name');
});

test('Column has relation property', function () {
    $col = new Column(id: 'user_name', label: 'User Name', relation: 'user');
    expect($col->relation)->toBe('user');
});

test('Column internalName defaults to null', function () {
    $col = new Column(id: 'name', label: 'Name');
    expect($col->internalName)->toBeNull();
});

test('Column relation defaults to null', function () {
    $col = new Column(id: 'name', label: 'Name');
    expect($col->relation)->toBeNull();
});

// ── ColumnBuilder internalName and relation methods ──────

test('ColumnBuilder supports internalName', function () {
    $col = ColumnBuilder::make('user_name', 'User Name')
        ->internalName('user.name')
        ->build();

    expect($col->id)->toBe('user_name');
    expect($col->internalName)->toBe('user.name');
});

test('ColumnBuilder supports relation', function () {
    $col = ColumnBuilder::make('user_name', 'User Name')
        ->relation('user')
        ->build();

    expect($col->relation)->toBe('user');
});

test('ColumnBuilder supports belongsTo shorthand', function () {
    $col = ColumnBuilder::make('user_name', 'User Name')
        ->belongsTo('user', 'name')
        ->build();

    expect($col->internalName)->toBe('user.name');
    expect($col->relation)->toBe('user');
});

test('ColumnBuilder belongsTo works with nested relations', function () {
    $col = ColumnBuilder::make('parent_category_name', 'Parent Category')
        ->belongsTo('category.parent', 'title')
        ->build();

    expect($col->internalName)->toBe('category.parent.title');
    expect($col->relation)->toBe('category.parent');
});

// ── AbstractDataTable eager loading ──────────────────────

test('AbstractDataTable has tableEagerLoad method', function () {
    $source = file_get_contents(__DIR__ . '/../../src/AbstractDataTable.php');

    expect($source)->toContain('public static function tableEagerLoad(): array');
    expect($source)->toContain('$col->relation !== null');
});

test('AbstractDataTable buildFilteredQuery applies eager loading', function () {
    $source = file_get_contents(__DIR__ . '/../../src/AbstractDataTable.php');

    expect($source)->toContain('$eagerLoad = static::tableEagerLoad()');
    expect($source)->toContain('$baseQuery->with($eagerLoad)');
});

test('AbstractDataTable uses internalName for allowed filters', function () {
    $source = file_get_contents(__DIR__ . '/../../src/AbstractDataTable.php');

    // tableAllowedFilters should use internalName when available
    expect($source)->toContain('$col->internalName ?? $col->id');
});

// ── Detail display modes ─────────────────────────────────

test('AbstractDataTable has tableDetailDisplay method', function () {
    $source = file_get_contents(__DIR__ . '/../../src/AbstractDataTable.php');

    expect($source)->toContain("public static function tableDetailDisplay(): string");
    expect($source)->toContain("return 'inline'");
});

test('makeTable includes detailDisplay in config', function () {
    $source = file_get_contents(__DIR__ . '/../../src/AbstractDataTable.php');

    expect($source)->toContain("'detailDisplay' => static::tableDetailDisplay()");
});

// ── TypeScript types for relations and detail display ────

test('DataTableColumnDef has internalName and relation', function () {
    $source = file_get_contents(__DIR__ . '/../../react/src/data-table/types.ts');

    expect($source)->toContain('internalName?: string | null');
    expect($source)->toContain('relation?: string | null');
});

test('DataTableConfig has detailDisplay', function () {
    $source = file_get_contents(__DIR__ . '/../../react/src/data-table/types.ts');

    expect($source)->toContain('detailDisplay?: "inline" | "modal" | "drawer"');
});

// ── React: modal and drawer for detail rows ──────────────

test('DataTable supports modal detail display', function () {
    $source = file_get_contents(__DIR__ . '/../../react/src/data-table/data-table.tsx');

    expect($source)->toContain('detailDisplay === "modal"');
    expect($source)->toContain('Detail row modal');
});

test('DataTable supports drawer detail display', function () {
    $source = file_get_contents(__DIR__ . '/../../react/src/data-table/data-table.tsx');

    expect($source)->toContain('detailDisplay === "drawer"');
    expect($source)->toContain('Detail row drawer');
    expect($source)->toContain('SheetContent');
});

test('DataTable imports Sheet component', function () {
    $source = file_get_contents(__DIR__ . '/../../react/src/data-table/data-table.tsx');

    expect($source)->toContain('import {');
    expect($source)->toContain('Sheet,');
    expect($source)->toContain('SheetContent,');
    expect($source)->toContain('SheetHeader,');
    expect($source)->toContain('SheetTitle,');
});

test('DataTable has detailRow state for modal/drawer', function () {
    $source = file_get_contents(__DIR__ . '/../../react/src/data-table/data-table.tsx');

    expect($source)->toContain('detailRow, setDetailRow');
    expect($source)->toContain('detailDisplay');
});
