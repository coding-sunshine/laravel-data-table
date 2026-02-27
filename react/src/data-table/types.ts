import type { DataTableTranslations } from "./i18n";

export interface DataTableColumnDef {
    id: string;
    label: string;
    type: "text" | "number" | "date" | "option" | "multiOption" | "boolean" | "image" | "badge";
    sortable: boolean;
    filterable: boolean;
    visible: boolean;
    options?: { label: string; value: string; variant?: string }[] | null;
    min?: number | null;
    max?: number | null;
    icon?: string | null;
    searchThreshold?: number | null;
    group?: string | null;
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

export interface DataTableOptions {
    quickViews: boolean;
    customQuickViews: boolean;
    exports: boolean;
    filters: boolean;
    columnVisibility: boolean;
    columnOrdering: boolean;
    stickyHeader: boolean;
    globalSearch: boolean;
}

export interface DataTableResponse<TData = object> {
    data: TData[];
    columns: DataTableColumnDef[];
    quickViews: DataTableQuickView[];
    meta: DataTableMeta;
    exportUrl?: string | null;
    footer?: Record<string, unknown> | null;
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
    /** Slot overrides for composability */
    slots?: {
        toolbar?: React.ReactNode;
        beforeTable?: React.ReactNode;
        afterTable?: React.ReactNode;
        pagination?: React.ReactNode;
    };
}
