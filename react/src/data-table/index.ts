// ─── First-class composable API ──────────────────────────────────────────────
// Use these hooks independently of the <DataTable> component for full control.

export { useDataTable } from "./use-data-table";
export type { UseDataTableOptions, UseDataTableReturn } from "./use-data-table";

export { useDataTableFilters } from "./use-data-table-filters";
export type { UseDataTableFiltersOptions, UseDataTableFiltersReturn } from "./use-data-table-filters";

export type { DataTableState } from "./use-data-table";

// ─── Component API ──────────────────────────────────────────────────────────
export { DataTable } from "./data-table";
export { DataTableColumn } from "./data-table-column";
export type { DataTableColumnProps } from "./data-table-column";

// ─── Sub-components (for custom layouts) ─────────────────────────────────────
export { DataTablePagination } from "./data-table-pagination";
export { DataTableColumnHeader } from "./data-table-column-header";
export { DataTableRowActions } from "./data-table-row-actions";
export { DataTableQuickViews } from "./data-table-quick-views";

// ─── Types ──────────────────────────────────────────────────────────────────
export type {
    DataTableColumnDef,
    DataTableQuickView,
    DataTableSort,
    DataTableMeta,
    DataTableConfig,
    DataTableRule,
    DataTableDensity,
    DataTableLayoutMode,
    DataTableOptions,
    DataTableResponse,
    DataTableConfirmOptions,
    DataTableAction,
    DataTableBulkAction,
    DataTableProps,
    DataTableFormField,
    DataTableHeaderAction,
    DataTableAnalytic,
    DataTableApiRef,
    DataTableConditionalFormatRule,
    DataTablePresenceUser,
    DataTableFacetedOption,
    DataTableColumnStats,
} from "./types";

// ─── i18n ───────────────────────────────────────────────────────────────────
export { defaultTranslations, frTranslations } from "./i18n";
export type { DataTableTranslations } from "./i18n";
