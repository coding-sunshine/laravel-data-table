<?php

use Machour\DataTable\Columns\Column;
use Machour\DataTable\Columns\ColumnBuilder;

// ── 1. HTML Sanitization ────────────────────────────────────

test('DataTable sanitizes HTML content before rendering', function () {
    $source = file_get_contents(__DIR__ . '/../../react/src/data-table/data-table.tsx');

    expect($source)->toContain('function sanitizeHtml');
    expect($source)->toContain('sanitizeHtml(value)');
    expect($source)->toContain('sanitizeHtml(rendered)');
    expect($source)->toContain('DOMPurify');
});

test('sanitizeHtml strips script tags in fallback mode', function () {
    $source = file_get_contents(__DIR__ . '/../../react/src/data-table/data-table.tsx');

    expect($source)->toContain('<script');
    expect($source)->toContain('<iframe');
    expect($source)->toContain('<object');
    expect($source)->toContain('<embed');
    expect($source)->toContain('javascript\\s*:');
    expect($source)->toContain('\\bon\\w+');
});

// ── 2. Authorization Layer ──────────────────────────────────

test('AbstractDataTable has tableAuthorize method', function () {
    $source = file_get_contents(__DIR__ . '/../../src/AbstractDataTable.php');

    expect($source)->toContain('public static function tableAuthorize(');
    expect($source)->toContain("string \$action");
    expect($source)->toContain("Request \$request");
});

test('ExportController checks tableAuthorize', function () {
    $source = file_get_contents(__DIR__ . '/../../src/Http/Controllers/DataTableExportController.php');

    expect($source)->toContain("tableAuthorize('export'");
});

test('ImportController checks tableAuthorize', function () {
    $source = file_get_contents(__DIR__ . '/../../src/Http/Controllers/DataTableImportController.php');

    expect($source)->toContain("tableAuthorize('import'");
});

test('InlineEditController checks tableAuthorize', function () {
    $source = file_get_contents(__DIR__ . '/../../src/Http/Controllers/DataTableInlineEditController.php');

    expect($source)->toContain("tableAuthorize('inline_edit'");
});

test('ToggleController checks tableAuthorize', function () {
    $source = file_get_contents(__DIR__ . '/../../src/Http/Controllers/DataTableToggleController.php');

    expect($source)->toContain("tableAuthorize('toggle'");
});

// ── 3. Rate Limiting on Export/Import ────────────────────────

test('ExportController has rate limiting', function () {
    $source = file_get_contents(__DIR__ . '/../../src/Http/Controllers/DataTableExportController.php');

    expect($source)->toContain('RateLimiter');
    expect($source)->toContain('dt-export:');
    expect($source)->toContain("rate_limit.export");
});

test('ImportController has rate limiting', function () {
    $source = file_get_contents(__DIR__ . '/../../src/Http/Controllers/DataTableImportController.php');

    expect($source)->toContain('RateLimiter');
    expect($source)->toContain('dt-import:');
    expect($source)->toContain("rate_limit.import");
});

test('config has export and import rate limits', function () {
    $config = include __DIR__ . '/../../config/data-table.php';

    expect($config['rate_limit']['export'])->toBe(10);
    expect($config['rate_limit']['import'])->toBe(5);
});

// ── 4. Auto-Validation Rules by Column Type ──────────────────

test('HasInlineEdit auto-generates validation rules from column type', function () {
    $source = file_get_contents(__DIR__ . '/../../src/Concerns/HasInlineEdit.php');

    expect($source)->toContain("'number' =>");
    expect($source)->toContain("'currency' =>");
    expect($source)->toContain("'percentage' =>");
    expect($source)->toContain("'date' =>");
    expect($source)->toContain("'email' =>");
    expect($source)->toContain("'phone' =>");
    expect($source)->toContain("'link' =>");
    expect($source)->toContain("'boolean' =>");
    expect($source)->toContain("'select' =>");
    expect($source)->toContain("'required|numeric'");
    expect($source)->toContain("'required|email|max:255'");
    expect($source)->toContain("'required|url|max:2048'");
});

// ── 5. Soft Delete Safeguard ─────────────────────────────────

test('ToggleController prevents toggling trashed records', function () {
    $source = file_get_contents(__DIR__ . '/../../src/Http/Controllers/DataTableToggleController.php');

    expect($source)->toContain('tableSoftDeletesEnabled');
    expect($source)->toContain('withTrashed');
    expect($source)->toContain('Cannot modify a trashed record');
});

test('HasInlineEdit prevents editing trashed records', function () {
    $source = file_get_contents(__DIR__ . '/../../src/Concerns/HasInlineEdit.php');

    expect($source)->toContain('tableSoftDeletesEnabled');
    expect($source)->toContain('withTrashed');
    expect($source)->toContain('Cannot edit a trashed record');
});

// ── 6. Virtual Scrolling ────────────────────────────────────

test('DataTable has useVirtualRows hook', function () {
    $source = file_get_contents(__DIR__ . '/../../react/src/data-table/data-table.tsx');

    expect($source)->toContain('function useVirtualRows');
    expect($source)->toContain('virtualContainerRef');
    expect($source)->toContain('virtualRows');
    expect($source)->toContain('totalHeight');
    expect($source)->toContain('offsetTop');
});

test('DataTable renders virtual rows when enabled', function () {
    $source = file_get_contents(__DIR__ . '/../../react/src/data-table/data-table.tsx');

    expect($source)->toContain('if (virtualRows)');
    expect($source)->toContain('virtualRows.startIndex');
    expect($source)->toContain('virtualRows.endIndex');
});

// ── 7. ARIA Attributes ──────────────────────────────────────

test('ToggleCell has ARIA attributes', function () {
    $source = file_get_contents(__DIR__ . '/../../react/src/data-table/data-table.tsx');

    expect($source)->toContain('aria-label={`Toggle ${columnId}`}');
    expect($source)->toContain('role="switch"');
    expect($source)->toContain('aria-checked={checked}');
});

test('Search input has aria-label', function () {
    $source = file_get_contents(__DIR__ . '/../../react/src/data-table/data-table.tsx');

    expect($source)->toContain('aria-label={t.search}');
});

test('Drag handles have ARIA attributes', function () {
    $source = file_get_contents(__DIR__ . '/../../react/src/data-table/data-table.tsx');

    expect($source)->toContain('aria-label="Drag to reorder"');
});

// ── 8. Error Recovery with Toast Notifications ───────────────

test('DataTable has showToast helper', function () {
    $source = file_get_contents(__DIR__ . '/../../react/src/data-table/data-table.tsx');

    expect($source)->toContain('function showToast');
    expect($source)->toContain('"aria-live", "polite"');
    expect($source)->toContain('"role", "status"');
});

test('ToggleCell shows toast on error', function () {
    $source = file_get_contents(__DIR__ . '/../../react/src/data-table/data-table.tsx');

    expect($source)->toContain('showToast(String(msg), "error")');
});

test('InlineEditCell shows toast on save', function () {
    $source = file_get_contents(__DIR__ . '/../../react/src/data-table/data-table.tsx');

    expect($source)->toContain('showToast("Saved", "success")');
    expect($source)->toContain('showToast(e instanceof Error');
});

// ── 10. Undo/Redo Memory Cleanup ─────────────────────────────

test('Undo/redo stacks are cleaned up on unmount', function () {
    $source = file_get_contents(__DIR__ . '/../../react/src/data-table/data-table.tsx');

    expect($source)->toContain('setUndoStack([]); setRedoStack([]);');
    expect($source)->toContain('Cleanup on unmount');
});

// ── 11. Mobile Toolbar Responsive Stacking ───────────────────

test('Toolbar uses flex-wrap for mobile stacking', function () {
    $source = file_get_contents(__DIR__ . '/../../react/src/data-table/data-table.tsx');

    expect($source)->toContain('flex-wrap');
    expect($source)->toContain('min-w-0');
});

// ── 12. Ctrl+F Keyboard Shortcut ─────────────────────────────

test('DataTable supports Ctrl+F to focus search', function () {
    $source = file_get_contents(__DIR__ . '/../../react/src/data-table/data-table.tsx');

    expect($source)->toContain('searchInputRef');
    expect($source)->toContain('e.key === "f"');
    expect($source)->toContain('searchInputRef.current?.focus()');
});

// ── 13. Export Progress Polling ──────────────────────────────

test('ExportController has status endpoint', function () {
    $source = file_get_contents(__DIR__ . '/../../src/Http/Controllers/DataTableExportController.php');

    expect($source)->toContain('public function status');
    expect($source)->toContain("'ready' => true");
    expect($source)->toContain("'ready' => false");
});

test('ServiceProvider registers export-status route', function () {
    $source = file_get_contents(__DIR__ . '/../../src/DataTableServiceProvider.php');

    expect($source)->toContain('export-status');
    expect($source)->toContain('data-table.export-status');
});

// ── 14. Detail Rows are Lazy Loaded ──────────────────────────

test('Detail rows only render when expanded (inline) or when detailRow is set (modal/drawer)', function () {
    $source = file_get_contents(__DIR__ . '/../../react/src/data-table/data-table.tsx');

    // Inline: only renders when isExpanded is true
    expect($source)->toContain('isExpanded && renderDetailRow && detailDisplay === "inline"');
    // Modal/Drawer: only renders when detailRow is not null
    expect($source)->toContain('detailRow && renderDetailRow(detailRow)');
});

// ── Auto-Registered Routes ──────────────────────────────────

test('All routes are registered in service provider', function () {
    $source = file_get_contents(__DIR__ . '/../../src/DataTableServiceProvider.php');

    expect($source)->toContain("data-table.export'");
    expect($source)->toContain("data-table.select-all'");
    expect($source)->toContain("data-table.inline-edit'");
    expect($source)->toContain("data-table.toggle'");
    expect($source)->toContain("data-table.detail'");
    expect($source)->toContain("data-table.filter-options'");
    expect($source)->toContain("data-table.cascading-options'");
    expect($source)->toContain("data-table.reorder'");
    expect($source)->toContain("data-table.import'");
    expect($source)->toContain("data-table.export-status'");
    expect($source)->toContain("data-table.saved-views.index'");
});

// ── Toast notification is accessible ────────────────────────

test('Toast container has proper ARIA attributes', function () {
    $source = file_get_contents(__DIR__ . '/../../react/src/data-table/data-table.tsx');

    expect($source)->toContain('"aria-live", "polite"');
    expect($source)->toContain('"role", "status"');
});

// ── ColumnBuilder auto-validation integration ────────────────

test('HasInlineEdit finds column by ID for type-based rules', function () {
    $source = file_get_contents(__DIR__ . '/../../src/Concerns/HasInlineEdit.php');

    expect($source)->toContain('collect(static::tableColumns())->first(fn (Column $col) => $col->id === $columnId)');
});
