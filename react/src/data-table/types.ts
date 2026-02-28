import type { DataTableTranslations } from "./i18n";

export interface DataTableColumnDef {
    id: string;
    label: string;
    type: "text" | "number" | "date" | "option" | "multiOption" | "boolean" | "image" | "badge" | "currency" | "percentage" | "link" | "email" | "phone";
    sortable: boolean;
    filterable: boolean;
    visible: boolean;
    options?: { label: string; value: string; variant?: string }[] | null;
    min?: number | null;
    max?: number | null;
    icon?: string | null;
    searchThreshold?: number | null;
    group?: string | null;
    editable?: boolean;
    currency?: string | null;
    locale?: string | null;
    /** Summary aggregation type: 'sum' | 'count' | 'avg' | 'min' | 'max' */
    summary?: string | null;
    /** Whether this column supports boolean toggle switch */
    toggleable?: boolean;
    /** Responsive priority (lower = hidden first on small screens). null = always visible */
    responsivePriority?: number | null;
}

export interface DataTableQuickView {
    id: string;
    label: string;
    params: Record<string, unknown>;
    icon?: string | null;
    active: boolean;
    columns?: string[] | null;
}

export interface DataTableSort {
    id: string;
    direction: 'asc' | 'desc';
}

export interface DataTableMeta {
    currentPage: number;
    lastPage: number;
    perPage: number;
    total: number;
    sorts: DataTableSort[];
    filters: Record<string, unknown>;
    paginationType?: "standard" | "simple" | "cursor";
    nextCursor?: string | null;
    prevCursor?: string | null;
}

/** Server-side table configuration passed from backend */
export interface DataTableConfig {
    detailRowEnabled?: boolean;
    softDeletesEnabled?: boolean;
    pollingInterval?: number;
    persistState?: boolean;
    deferLoading?: boolean;
    asyncFilterColumns?: string[];
    cascadingFilters?: Record<string, string>;
    rules?: DataTableRule[];
}

/** Conditional row/cell styling rule */
export interface DataTableRule {
    column: string;
    operator: string;
    value: unknown;
    row?: { class?: string };
    cell?: { class?: string };
}

export type DataTableDensity = "compact" | "comfortable" | "spacious";

export interface DataTableOptions {
    quickViews: boolean;
    customQuickViews: boolean;
    exports: boolean;
    filters: boolean;
    columnVisibility: boolean;
    columnOrdering: boolean;
    columnResizing: boolean;
    stickyHeader: boolean;
    globalSearch: boolean;
    loading: boolean;
    keyboardNavigation: boolean;
    printable: boolean;
    density: boolean;
    copyCell: boolean;
    contextMenu: boolean;
    virtualScrolling: boolean;
    rowGrouping: boolean;
    rowReorder: boolean;
    batchEdit: boolean;
    searchHighlight: boolean;
    undoRedo: boolean;
    columnPinning: boolean;
    persistSelection: boolean;
    shortcutsOverlay: boolean;
    exportProgress: boolean;
    emptyStateIllustration: boolean;
}

export interface DataTableResponse<TData = object> {
    data: TData[];
    columns: DataTableColumnDef[];
    quickViews: DataTableQuickView[];
    meta: DataTableMeta;
    exportUrl?: string | null;
    footer?: Record<string, unknown> | null;
    /** URL for fetching all row IDs matching current filters (server-side selection) */
    selectAllUrl?: string | null;
    /** Full-dataset summary aggregations */
    summary?: Record<string, unknown> | null;
    /** Server-side table configuration */
    config?: DataTableConfig | null;
    /** URL for boolean toggle updates */
    toggleUrl?: string | null;
    /** Enum filter options resolved from PHP enums */
    enumOptions?: Record<string, { label: string; value: string }[]> | null;
    /** URL for row reorder PATCH requests */
    reorderUrl?: string | null;
    /** URL for data import POST requests */
    importUrl?: string | null;
    /** Column ID to group rows by */
    groupByColumn?: string | null;
}

export interface DataTableConfirmOptions {
    title?: string;
    description?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: "default" | "destructive";
}

export interface DataTableAction<TData> {
    label: string;
    icon?: string;
    onClick: (row: TData) => void;
    variant?: "default" | "destructive";
    visible?: (row: TData) => boolean;
    confirm?: boolean | DataTableConfirmOptions;
}

export interface DataTableBulkAction<TData> {
    id: string;
    label: string;
    icon?: React.ComponentType<{ className?: string }>;
    variant?: "default" | "destructive";
    disabled?: (rows: TData[]) => boolean;
    onClick: (rows: TData[]) => void;
    confirm?: boolean | DataTableConfirmOptions;
}

export interface DataTableProps<TData extends object> {
    className?: string;
    tableData: DataTableResponse<TData>;
    tableName: string;
    /** Prefix for URL query params — enables multiple tables per page */
    prefix?: string;
    actions?: DataTableAction<TData>[];
    bulkActions?: DataTableBulkAction<TData>[];
    renderCell?: (columnId: string, value: unknown, row: TData) => React.ReactNode | undefined;
    renderHeader?: Record<string, React.ReactNode>;
    renderFooterCell?: (columnId: string, value: unknown) => React.ReactNode | undefined;
    /** Custom filter component per column */
    renderFilter?: Record<string, (value: unknown, onChange: (value: unknown) => void) => React.ReactNode>;
    rowClassName?: (row: TData) => string;
    /** Add custom data-* attributes to each row */
    rowDataAttributes?: (row: TData) => Record<string, string>;
    groupClassName?: Record<string, string>;
    options?: Partial<DataTableOptions>;
    translations?: Partial<DataTableTranslations>;
    /** Called when a row is clicked (non-link navigation) */
    onRowClick?: (row: TData) => void;
    /** Returns an href for each row, making rows clickable links */
    rowLink?: (row: TData) => string;
    /** Custom empty state when table has no data */
    emptyState?: React.ReactNode;
    /** Debounce delay in ms for filter/search inputs (default: 300) */
    debounceMs?: number;
    /** Inertia partial reload key for optimized data fetching */
    partialReloadKey?: string;
    /** Called when a cell is edited inline — return a promise to save */
    onInlineEdit?: (row: TData, columnId: string, value: unknown) => Promise<void> | void;
    /** Laravel Echo channel name for real-time updates */
    realtimeChannel?: string;
    /** Laravel Echo event name to listen for (default: '.updated') */
    realtimeEvent?: string;
    /** Render function for detail/expandable row content */
    renderDetailRow?: (row: TData) => React.ReactNode;
    /** Selection mode: 'checkbox' (default) or 'radio' (single select) */
    selectionMode?: "checkbox" | "radio";
    /** Called when rows are reordered via drag and drop */
    onReorder?: (ids: unknown[], newPositions: number[]) => Promise<void> | void;
    /** Called when a batch edit is applied to multiple rows */
    onBatchEdit?: (rows: TData[], columnId: string, value: unknown) => Promise<void> | void;
    /** Custom SVG/component for the empty state illustration */
    emptyStateIllustration?: React.ReactNode;
    /** Slot overrides for composability */
    slots?: {
        toolbar?: React.ReactNode;
        beforeTable?: React.ReactNode;
        afterTable?: React.ReactNode;
        pagination?: React.ReactNode;
    };
}
