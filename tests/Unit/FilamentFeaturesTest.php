<?php

use Machour\DataTable\Columns\Column;
use Machour\DataTable\Columns\ColumnBuilder;

// ── 1. Column prefix/suffix ────────────────────────────────

test('Column has prefix and suffix properties', function () {
    $col = new Column(id: 'price', label: 'Price', prefix: '$', suffix: ' USD');
    expect($col->prefix)->toBe('$');
    expect($col->suffix)->toBe(' USD');
});

test('ColumnBuilder supports prefix and suffix', function () {
    $col = ColumnBuilder::make('weight', 'Weight')
        ->prefix('#')
        ->suffix(' kg')
        ->build();

    expect($col->prefix)->toBe('#');
    expect($col->suffix)->toBe(' kg');
});

// ── 2. Column tooltips ─────────────────────────────────────

test('Column has tooltip property', function () {
    $col = new Column(id: 'name', label: 'Name', tooltip: 'Full name of the user');
    expect($col->tooltip)->toBe('Full name of the user');
});

test('ColumnBuilder supports tooltip', function () {
    $col = ColumnBuilder::make('name', 'Name')
        ->tooltip('description')
        ->build();

    expect($col->tooltip)->toBe('description');
});

// ── 3. Icon column type ────────────────────────────────────

test('Column supports icon type with iconMap', function () {
    $col = new Column(id: 'status', label: 'Status', type: 'icon', iconMap: ['active' => 'check-circle']);
    expect($col->type)->toBe('icon');
    expect($col->iconMap)->toBe(['active' => 'check-circle']);
});

test('ColumnBuilder supports iconColumn', function () {
    $col = ColumnBuilder::make('status', 'Status')
        ->iconColumn(['active' => 'check-circle', 'inactive' => 'x-circle'])
        ->build();

    expect($col->type)->toBe('icon');
    expect($col->iconMap)->toBe(['active' => 'check-circle', 'inactive' => 'x-circle']);
});

// ── 4. Color column type ───────────────────────────────────

test('Column supports color type', function () {
    $col = new Column(id: 'brand_color', label: 'Brand Color', type: 'color');
    expect($col->type)->toBe('color');
});

test('ColumnBuilder supports color', function () {
    $col = ColumnBuilder::make('color', 'Color')
        ->color()
        ->build();

    expect($col->type)->toBe('color');
});

// ── 5. Select column type ──────────────────────────────────

test('Column supports select type with selectOptions', function () {
    $opts = [['label' => 'Active', 'value' => 'active'], ['label' => 'Inactive', 'value' => 'inactive']];
    $col = new Column(id: 'status', label: 'Status', type: 'select', selectOptions: $opts, editable: true);
    expect($col->type)->toBe('select');
    expect($col->selectOptions)->toBe($opts);
    expect($col->editable)->toBeTrue();
});

test('ColumnBuilder supports select', function () {
    $opts = [['label' => 'Draft', 'value' => 'draft'], ['label' => 'Published', 'value' => 'published']];
    $col = ColumnBuilder::make('status', 'Status')
        ->select($opts)
        ->build();

    expect($col->type)->toBe('select');
    expect($col->selectOptions)->toBe($opts);
    expect($col->editable)->toBeTrue();
});

// ── 6. Stacked/composite columns ───────────────────────────

test('Column supports stacked property', function () {
    $col = new Column(id: 'user', label: 'User', stacked: ['name', 'email']);
    expect($col->stacked)->toBe(['name', 'email']);
});

test('ColumnBuilder supports stacked', function () {
    $col = ColumnBuilder::make('user', 'User')
        ->stacked(['first_name', 'last_name', 'email'])
        ->build();

    expect($col->stacked)->toBe(['first_name', 'last_name', 'email']);
});

// ── 7. Header actions (frontend only — tested via TypeScript types) ──

test('TypeScript types include DataTableHeaderAction', function () {
    $source = file_get_contents(__DIR__ . '/../../react/src/data-table/types.ts');

    expect($source)->toContain('export interface DataTableHeaderAction');
    expect($source)->toContain('headerActions?: DataTableHeaderAction[]');
});

// ── 8. Row index column ────────────────────────────────────

test('Column supports rowIndex property', function () {
    $col = new Column(id: 'row_num', label: '#', rowIndex: true);
    expect($col->rowIndex)->toBeTrue();
});

test('ColumnBuilder supports rowIndex', function () {
    $col = ColumnBuilder::make('row_num', '#')
        ->rowIndex()
        ->build();

    expect($col->rowIndex)->toBeTrue();
});

// ── 9. Line clamping ───────────────────────────────────────

test('Column supports lineClamp property', function () {
    $col = new Column(id: 'description', label: 'Description', lineClamp: 3);
    expect($col->lineClamp)->toBe(3);
});

test('ColumnBuilder supports lineClamp', function () {
    $col = ColumnBuilder::make('bio', 'Bio')
        ->lineClamp(2)
        ->build();

    expect($col->lineClamp)->toBe(2);
});

// ── 10. Conditional cell colors ─────────────────────────────

test('Column supports colorMap property', function () {
    $col = new Column(id: 'status', label: 'Status', colorMap: ['active' => 'text-green-600', 'expired' => 'text-red-600']);
    expect($col->colorMap)->toBe(['active' => 'text-green-600', 'expired' => 'text-red-600']);
});

test('ColumnBuilder supports colorMap', function () {
    $col = ColumnBuilder::make('priority', 'Priority')
        ->colorMap(['high' => 'text-red-600', 'low' => 'text-blue-600'])
        ->build();

    expect($col->colorMap)->toBe(['high' => 'text-red-600', 'low' => 'text-blue-600']);
});

// ── 11. Column descriptions ─────────────────────────────────

test('Column supports description property', function () {
    $col = new Column(id: 'price', label: 'Price', description: 'Before tax');
    expect($col->description)->toBe('Before tax');
});

test('ColumnBuilder supports description', function () {
    $col = ColumnBuilder::make('total', 'Total')
        ->description('Including VAT')
        ->build();

    expect($col->description)->toBe('Including VAT');
});

// ── 12. User-selectable grouping (frontend only) ───────────

test('TypeScript types include groupByOptions prop', function () {
    $source = file_get_contents(__DIR__ . '/../../react/src/data-table/types.ts');

    expect($source)->toContain('groupByOptions?: string[]');
    expect($source)->toContain('onGroupByChange?: (columnId: string | null) => void');
});

test('DataTable has GroupBySelector component', function () {
    $source = file_get_contents(__DIR__ . '/../../react/src/data-table/data-table.tsx');

    expect($source)->toContain('function GroupBySelector');
    expect($source)->toContain('groupByOptions');
});

// ── 13. Markdown/HTML cell rendering ────────────────────────

test('Column supports html property', function () {
    $col = new Column(id: 'content', label: 'Content', html: true);
    expect($col->html)->toBeTrue();
});

test('Column supports markdown property', function () {
    $col = new Column(id: 'notes', label: 'Notes', markdown: true);
    expect($col->markdown)->toBeTrue();
});

test('ColumnBuilder supports html and markdown', function () {
    $col = ColumnBuilder::make('content', 'Content')
        ->html()
        ->build();
    expect($col->html)->toBeTrue();

    $col2 = ColumnBuilder::make('notes', 'Notes')
        ->markdown()
        ->build();
    expect($col2->markdown)->toBeTrue();
});

// ── 14. Bulleted list display ───────────────────────────────

test('Column supports bulleted property', function () {
    $col = new Column(id: 'tags', label: 'Tags', bulleted: true);
    expect($col->bulleted)->toBeTrue();
});

test('ColumnBuilder supports bulleted', function () {
    $col = ColumnBuilder::make('features', 'Features')
        ->bulleted()
        ->build();

    expect($col->bulleted)->toBeTrue();
});

// ── 15. Action groups (frontend only) ───────────────────────

test('DataTableAction type supports group property', function () {
    $source = file_get_contents(__DIR__ . '/../../react/src/data-table/types.ts');

    expect($source)->toContain('group?: DataTableAction<TData>[]');
});

test('DataTableRowActions renders action groups', function () {
    $source = file_get_contents(__DIR__ . '/../../react/src/data-table/data-table-row-actions.tsx');

    expect($source)->toContain('action.group');
    expect($source)->toContain('DropdownMenuSub');
    expect($source)->toContain('DropdownMenuSubTrigger');
    expect($source)->toContain('DropdownMenuSubContent');
});

// ── 16. Forms-in-actions ────────────────────────────────────

test('DataTableAction type supports form property', function () {
    $source = file_get_contents(__DIR__ . '/../../react/src/data-table/types.ts');

    expect($source)->toContain('form?: DataTableFormField[]');
    expect($source)->toContain('export interface DataTableFormField');
});

test('DataTable has FormActionDialog component', function () {
    $source = file_get_contents(__DIR__ . '/../../react/src/data-table/data-table.tsx');

    expect($source)->toContain('function FormActionDialog');
    expect($source)->toContain('formAction');
});

// ── 17. Replicate row action (i18n label) ──────────────────

test('i18n includes replicate translation', function () {
    $source = file_get_contents(__DIR__ . '/../../react/src/data-table/i18n.ts');

    expect($source)->toContain('replicate:');
    expect($source)->toContain('"Duplicate"');
});

// ── 18. Force-delete/Restore actions (i18n labels) ─────────

test('i18n includes forceDelete and restore translations', function () {
    $source = file_get_contents(__DIR__ . '/../../react/src/data-table/i18n.ts');

    expect($source)->toContain('forceDelete:');
    expect($source)->toContain('restore:');
    expect($source)->toContain('"Permanently delete"');
    expect($source)->toContain('"Restore"');
});

// ── 19. Date grouping (i18n labels) ─────────────────────────

test('i18n includes date grouping translations', function () {
    $source = file_get_contents(__DIR__ . '/../../react/src/data-table/i18n.ts');

    expect($source)->toContain('dateGroupDay:');
    expect($source)->toContain('dateGroupWeek:');
    expect($source)->toContain('dateGroupMonth:');
    expect($source)->toContain('dateGroupYear:');
});

// ── 20. Range summarizer ────────────────────────────────────

test('AbstractDataTable tableSummary supports range type', function () {
    $source = file_get_contents(__DIR__ . '/../../src/AbstractDataTable.php');

    expect($source)->toContain("'range'");
    expect($source)->toContain('summary_{$col->id}_min');
    expect($source)->toContain('summary_{$col->id}_max');
});

test('i18n includes summaryRange translation', function () {
    $source = file_get_contents(__DIR__ . '/../../react/src/data-table/i18n.ts');

    expect($source)->toContain('summaryRange:');
    expect($source)->toContain('"Range"');
});

// ── Barrel exports include new types ────────────────────────

test('index.ts exports DataTableFormField and DataTableHeaderAction', function () {
    $source = file_get_contents(__DIR__ . '/../../react/src/data-table/index.ts');

    expect($source)->toContain('DataTableFormField');
    expect($source)->toContain('DataTableHeaderAction');
});

// ── ColumnBuilder builds all 33 properties ──────────────────

test('ColumnBuilder builds all properties correctly', function () {
    $col = ColumnBuilder::make('price', 'Price')
        ->currency('EUR')
        ->sortable()
        ->filterable()
        ->editable()
        ->prefix('€')
        ->suffix(' total')
        ->tooltip('Total price with tax')
        ->description('Includes VAT')
        ->lineClamp(2)
        ->colorMap(['high' => 'text-red-600'])
        ->summary('sum')
        ->toggleable()
        ->responsivePriority(1)
        ->group('Financial')
        ->build();

    expect($col->id)->toBe('price');
    expect($col->label)->toBe('Price');
    expect($col->type)->toBe('currency');
    expect($col->currency)->toBe('EUR');
    expect($col->sortable)->toBeTrue();
    expect($col->filterable)->toBeTrue();
    expect($col->editable)->toBeTrue();
    expect($col->prefix)->toBe('€');
    expect($col->suffix)->toBe(' total');
    expect($col->tooltip)->toBe('Total price with tax');
    expect($col->description)->toBe('Includes VAT');
    expect($col->lineClamp)->toBe(2);
    expect($col->colorMap)->toBe(['high' => 'text-red-600']);
    expect($col->summary)->toBe('sum');
    expect($col->toggleable)->toBeTrue();
    expect($col->responsivePriority)->toBe(1);
    expect($col->group)->toBe('Financial');
});

// ── Column defaults ──────────────────────────────────────────

test('Column new properties default to null/false', function () {
    $col = new Column(id: 'test', label: 'Test');

    expect($col->prefix)->toBeNull();
    expect($col->suffix)->toBeNull();
    expect($col->tooltip)->toBeNull();
    expect($col->description)->toBeNull();
    expect($col->lineClamp)->toBeNull();
    expect($col->iconMap)->toBeNull();
    expect($col->colorMap)->toBeNull();
    expect($col->selectOptions)->toBeNull();
    expect($col->html)->toBeFalse();
    expect($col->markdown)->toBeFalse();
    expect($col->bulleted)->toBeFalse();
    expect($col->stacked)->toBeNull();
    expect($col->rowIndex)->toBeFalse();
});

// ── Frontend: new column types in TypeScript ─────────────────

test('TypeScript DataTableColumnDef includes new column types', function () {
    $source = file_get_contents(__DIR__ . '/../../react/src/data-table/types.ts');

    expect($source)->toContain('"icon"');
    expect($source)->toContain('"color"');
    expect($source)->toContain('"select"');
    expect($source)->toContain('prefix?: string | null');
    expect($source)->toContain('suffix?: string | null');
    expect($source)->toContain('tooltip?: string | null');
    expect($source)->toContain('description?: string | null');
    expect($source)->toContain('lineClamp?: number | null');
    expect($source)->toContain('iconMap?: Record<string, string> | null');
    expect($source)->toContain('colorMap?: Record<string, string> | null');
    expect($source)->toContain('selectOptions?:');
    expect($source)->toContain('html?: boolean');
    expect($source)->toContain('markdown?: boolean');
    expect($source)->toContain('bulleted?: boolean');
    expect($source)->toContain('stacked?: string[] | null');
    expect($source)->toContain('rowIndex?: boolean');
});

// ── Frontend: cell rendering for new types ───────────────────

test('DataTable renders icon column type', function () {
    $source = file_get_contents(__DIR__ . '/../../react/src/data-table/data-table.tsx');

    expect($source)->toContain('col.type === "icon"');
    expect($source)->toContain('col.iconMap');
});

test('DataTable renders color column type', function () {
    $source = file_get_contents(__DIR__ . '/../../react/src/data-table/data-table.tsx');

    expect($source)->toContain('col.type === "color"');
    expect($source)->toContain('backgroundColor: value');
});

test('DataTable renders select column type', function () {
    $source = file_get_contents(__DIR__ . '/../../react/src/data-table/data-table.tsx');

    expect($source)->toContain('col.type === "select"');
    expect($source)->toContain('function SelectCell');
});

test('DataTable renders stacked columns', function () {
    $source = file_get_contents(__DIR__ . '/../../react/src/data-table/data-table.tsx');

    expect($source)->toContain('col.stacked');
    expect($source)->toContain('stackedId');
});

test('DataTable renders row index', function () {
    $source = file_get_contents(__DIR__ . '/../../react/src/data-table/data-table.tsx');

    expect($source)->toContain('col.rowIndex');
    expect($source)->toContain('pageOffset + row.index + 1');
});

test('DataTable renders markdown content', function () {
    $source = file_get_contents(__DIR__ . '/../../react/src/data-table/data-table.tsx');

    expect($source)->toContain('col.markdown');
    expect($source)->toContain('dangerouslySetInnerHTML');
});

test('DataTable renders bulleted lists', function () {
    $source = file_get_contents(__DIR__ . '/../../react/src/data-table/data-table.tsx');

    expect($source)->toContain('col.bulleted');
    expect($source)->toContain('list-disc');
});

test('DataTable applies prefix and suffix', function () {
    $source = file_get_contents(__DIR__ . '/../../react/src/data-table/data-table.tsx');

    expect($source)->toContain('col.prefix');
    expect($source)->toContain('col.suffix');
    expect($source)->toContain('wrapCell');
});

test('DataTable applies line clamping', function () {
    $source = file_get_contents(__DIR__ . '/../../react/src/data-table/data-table.tsx');

    expect($source)->toContain('col.lineClamp');
    expect($source)->toContain('WebkitLineClamp');
});

test('DataTable applies color map', function () {
    $source = file_get_contents(__DIR__ . '/../../react/src/data-table/data-table.tsx');

    expect($source)->toContain('col.colorMap');
    expect($source)->toContain('colorClass');
});

test('DataTable renders column descriptions in header', function () {
    $source = file_get_contents(__DIR__ . '/../../react/src/data-table/data-table.tsx');

    expect($source)->toContain('colDef.description');
    expect($source)->toContain('colDef?.description');
});

// ── French translations ──────────────────────────────────────

test('French translations include new keys', function () {
    $source = file_get_contents(__DIR__ . '/../../react/src/data-table/i18n.ts');

    expect($source)->toContain('"Dupliquer"');
    expect($source)->toContain('"Supprimer définitivement"');
    expect($source)->toContain('"Restaurer"');
    expect($source)->toContain('"Plage"');
});
