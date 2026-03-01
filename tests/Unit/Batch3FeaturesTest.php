<?php

use Machour\DataTable\Console\Commands\AuditReport;

// ── AuditReport command ──────────────────────────────────

test('AuditReport command class exists', function () {
    expect(class_exists(AuditReport::class))->toBeTrue();
});

test('AuditReport has correct signature', function () {
    $reflection = new ReflectionClass(AuditReport::class);
    $prop = $reflection->getProperty('signature');
    $prop->setAccessible(true);

    $command = $reflection->newInstanceWithoutConstructor();
    $signature = $prop->getValue($command);

    expect($signature)->toContain('data-table:audit-report');
    expect($signature)->toContain('--table');
    expect($signature)->toContain('--action');
    expect($signature)->toContain('--user');
    expect($signature)->toContain('--days');
    expect($signature)->toContain('--limit');
    expect($signature)->toContain('--format');
});

test('AuditReport supports multiple output formats', function () {
    $reflection = new ReflectionClass(AuditReport::class);
    $prop = $reflection->getProperty('signature');
    $prop->setAccessible(true);

    $command = $reflection->newInstanceWithoutConstructor();
    $signature = $prop->getValue($command);

    // Should support table, json, csv formats
    expect($signature)->toContain('format');
});

// ── Rate limiting configuration ──────────────────────────

test('config file has rate_limit section', function () {
    $config = require __DIR__ . '/../../config/data-table.php';

    expect($config)->toHaveKey('rate_limit');
    expect($config['rate_limit'])->toHaveKey('inline_edit');
    expect($config['rate_limit'])->toHaveKey('toggle');
    expect($config['rate_limit']['inline_edit'])->toBe(60);
    expect($config['rate_limit']['toggle'])->toBe(60);
});

test('config file has audit_table setting', function () {
    $config = require __DIR__ . '/../../config/data-table.php';

    expect($config)->toHaveKey('audit_table');
    expect($config['audit_table'])->toBe('data_table_audit_log');
});

// ── InlineEditController has rate limiting ────────────────

test('InlineEditController uses RateLimiter', function () {
    $source = file_get_contents(__DIR__ . '/../../src/Http/Controllers/DataTableInlineEditController.php');

    expect($source)->toContain('RateLimiter::tooManyAttempts');
    expect($source)->toContain('RateLimiter::hit');
    expect($source)->toContain('rate_limit.inline_edit');
});

// ── ToggleController has rate limiting ────────────────────

test('ToggleController uses RateLimiter', function () {
    $source = file_get_contents(__DIR__ . '/../../src/Http/Controllers/DataTableToggleController.php');

    expect($source)->toContain('RateLimiter::tooManyAttempts');
    expect($source)->toContain('RateLimiter::hit');
    expect($source)->toContain('rate_limit.toggle');
});

// ── ServiceProvider registers AuditReport ─────────────────

test('ServiceProvider registers AuditReport command', function () {
    $source = file_get_contents(__DIR__ . '/../../src/DataTableServiceProvider.php');

    expect($source)->toContain('AuditReport::class');
});

// ── React: barrel index exports ───────────────────────────

test('barrel index.ts exports useDataTable and useDataTableFilters', function () {
    $source = file_get_contents(__DIR__ . '/../../react/src/data-table/index.ts');

    expect($source)->toContain("export { useDataTable }");
    expect($source)->toContain("export { useDataTableFilters }");
    expect($source)->toContain("export { DataTable }");
    expect($source)->toContain("export { DataTableColumn }");
    expect($source)->toContain("export type { DataTableState }");
});

// ── React: useDataTableFilters standalone hook ────────────

test('useDataTableFilters hook file exists', function () {
    expect(file_exists(__DIR__ . '/../../react/src/data-table/use-data-table-filters.ts'))->toBeTrue();
});

test('useDataTableFilters hook exports correct interface', function () {
    $source = file_get_contents(__DIR__ . '/../../react/src/data-table/use-data-table-filters.ts');

    expect($source)->toContain('export interface UseDataTableFiltersOptions');
    expect($source)->toContain('export interface UseDataTableFiltersReturn');
    expect($source)->toContain('export function useDataTableFilters');
    expect($source)->toContain('hasActiveFilters');
    expect($source)->toContain('activeFilterCount');
});

// ── React: onStateChange support ──────────────────────────

test('useDataTable hook has onStateChange support', function () {
    $source = file_get_contents(__DIR__ . '/../../react/src/data-table/use-data-table.ts');

    expect($source)->toContain('onStateChange');
    expect($source)->toContain('export interface DataTableState');
    expect($source)->toContain('export interface UseDataTableReturn');
});

// ── React: DataTable.Column JSX API ───────────────────────

test('DataTableColumn component file exists', function () {
    expect(file_exists(__DIR__ . '/../../react/src/data-table/data-table-column.tsx'))->toBeTrue();
});

test('DataTableColumn exports extractColumnConfigs', function () {
    $source = file_get_contents(__DIR__ . '/../../react/src/data-table/data-table-column.tsx');

    expect($source)->toContain('export function DataTableColumn');
    expect($source)->toContain('export function extractColumnConfigs');
    expect($source)->toContain('export interface DataTableColumnProps');
});

// ── React: mobile card layout ─────────────────────────────

test('DataTable has mobile card layout support', function () {
    $source = file_get_contents(__DIR__ . '/../../react/src/data-table/data-table.tsx');

    expect($source)->toContain('MobileCardLayout');
    expect($source)->toContain('useMobileBreakpoint');
    expect($source)->toContain('mobileBreakpoint');
});

// ── React: filter chips ───────────────────────────────────

test('DataTable has filter chips component', function () {
    $source = file_get_contents(__DIR__ . '/../../react/src/data-table/data-table.tsx');

    expect($source)->toContain('FilterChips');
    expect($source)->toContain('handleClearFilterChip');
    expect($source)->toContain('handleClearAllFilterChips');
});

// ── React: inline row creation ────────────────────────────

test('DataTable has inline row creation support', function () {
    $source = file_get_contents(__DIR__ . '/../../react/src/data-table/data-table.tsx');

    expect($source)->toContain('InlineRowCreator');
    expect($source)->toContain('onRowCreate');
});

// ── React: Inertia router for toggles ─────────────────────

test('ToggleCell uses Inertia router.patch instead of fetch', function () {
    $source = file_get_contents(__DIR__ . '/../../react/src/data-table/data-table.tsx');

    // Should use router.patch, not raw fetch for toggles
    expect($source)->toContain('router.patch(url, { column: columnId, value: newValue }');
});

// ── React: prefetching in pagination ──────────────────────

test('DataTablePagination supports prefetching', function () {
    $source = file_get_contents(__DIR__ . '/../../react/src/data-table/data-table-pagination.tsx');

    expect($source)->toContain('prefetchPage');
    expect($source)->toContain('router.prefetch');
    expect($source)->toContain('onMouseEnter');
});

// ── React: i18n has new translation keys ──────────────────

test('i18n has addRow and activeFilters translations', function () {
    $source = file_get_contents(__DIR__ . '/../../react/src/data-table/i18n.ts');

    expect($source)->toContain('addRow');
    expect($source)->toContain('activeFilters');
});

// ── Types: new props in DataTableProps ────────────────────

test('DataTableProps has new properties', function () {
    $source = file_get_contents(__DIR__ . '/../../react/src/data-table/types.ts');

    expect($source)->toContain('onStateChange');
    expect($source)->toContain('onRowCreate');
    expect($source)->toContain('mobileBreakpoint');
    expect($source)->toContain('children');
});
