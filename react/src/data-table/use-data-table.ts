import { router } from "@inertiajs/react";
import {
    type ColumnDef,
    type ColumnFiltersState,
    type ColumnOrderState,
    type ColumnSizingState,
    type RowSelectionState,
    type SortingState,
    type VisibilityState,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { useCallback, useEffect, useRef, useState } from "react";
import type { DataTableColumnDef, DataTableResponse } from "./types";

const STORAGE_PREFIX = "dt-columns-";
const ORDER_STORAGE_PREFIX = "dt-column-order-";

function safeGetItem(key: string): string | null {
    try { return localStorage.getItem(key); }
    catch { return null; }
}

function safeSetItem(key: string, value: string): void {
    try { localStorage.setItem(key, value); }
    catch { /* storage full or unavailable */ }
}

function loadVisibility(tableName: string, columns: DataTableColumnDef[]): VisibilityState {
    const stored = safeGetItem(STORAGE_PREFIX + tableName);
    if (stored) {
        try {
            return JSON.parse(stored) as VisibilityState;
        } catch {
            // fall through
        }
    }
    const visibility: VisibilityState = {};
    for (const col of columns) {
        visibility[col.id] = col.visible;
    }
    return visibility;
}

function saveVisibility(tableName: string, visibility: VisibilityState) {
    safeSetItem(STORAGE_PREFIX + tableName, JSON.stringify(visibility));
}

function loadColumnOrder(tableName: string, columns: DataTableColumnDef[]): ColumnOrderState {
    const stored = safeGetItem(ORDER_STORAGE_PREFIX + tableName);
    if (stored) {
        try {
            return JSON.parse(stored) as ColumnOrderState;
        } catch {
            // fall through
        }
    }
    return columns.map((col) => col.id);
}

function saveColumnOrder(tableName: string, order: ColumnOrderState) {
    safeSetItem(ORDER_STORAGE_PREFIX + tableName, JSON.stringify(order));
}

interface UseDataTableOptions<TData> {
    tableData: DataTableResponse<TData>;
    tableName: string;
    columnDefs: ColumnDef<TData>[];
    prefix?: string;
    debounceMs?: number;
    partialReloadKey?: string;
    columnResizing?: boolean;
    columnSizing?: Record<string, number>;
    onColumnSizingChange?: (sizing: Record<string, number>) => void;
}

export function useDataTable<TData>({
    tableData,
    tableName,
    columnDefs,
    prefix,
    debounceMs = 0,
    partialReloadKey,
    columnResizing = false,
    columnSizing: externalColumnSizing,
    onColumnSizingChange,
}: UseDataTableOptions<TData>) {
    const { meta } = tableData;

    // Prefixed param keys for multi-table support
    const sortKey = prefix ? `${prefix}_sort` : "sort";
    const pageKey = prefix ? `${prefix}_page` : "page";
    const perPageKey = prefix ? `${prefix}_per_page` : "per_page";
    const searchKey = prefix ? `${prefix}_search` : "search";

    const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Clean up debounce timer on unmount
    useEffect(() => {
        return () => { if (debounceTimer.current) clearTimeout(debounceTimer.current); };
    }, []);

    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(() =>
        loadVisibility(tableName, tableData.columns),
    );

    const [columnOrder, setColumnOrder] = useState<ColumnOrderState>(() =>
        loadColumnOrder(tableName, tableData.columns),
    );

    const [sorting, setSorting] = useState<SortingState>(() =>
        meta.sorts.map((s) => ({ id: s.id, desc: s.direction === "desc" })),
    );

    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
    const [internalColumnSizing, setInternalColumnSizing] = useState<ColumnSizingState>({});

    const columnSizingState = externalColumnSizing ?? internalColumnSizing;
    const handleColumnSizingChange = useCallback(
        (updater: ColumnSizingState | ((prev: ColumnSizingState) => ColumnSizingState)) => {
            const next = typeof updater === "function" ? updater(columnSizingState) : updater;
            if (onColumnSizingChange) {
                onColumnSizingChange(next);
            } else {
                setInternalColumnSizing(next);
            }
        },
        [columnSizingState, onColumnSizingChange],
    );

    const navigate = useCallback(
        (params: Record<string, unknown>) => {
            const currentUrl = new URL(window.location.href);
            const searchParams = new URLSearchParams(currentUrl.search);

            for (const [key, value] of Object.entries(params)) {
                if (value === null || value === undefined || value === "") {
                    searchParams.delete(key);
                } else {
                    searchParams.set(key, String(value));
                }
            }

            const options: Record<string, unknown> = { preserveScroll: true };
            if (partialReloadKey) {
                options.only = [partialReloadKey];
            }

            router.get(
                currentUrl.pathname + "?" + searchParams.toString(),
                {},
                options,
            );
        },
        [partialReloadKey],
    );

    const debouncedNavigate = useCallback(
        (params: Record<string, unknown>) => {
            if (debounceTimer.current) clearTimeout(debounceTimer.current);
            if (debounceMs > 0) {
                debounceTimer.current = setTimeout(() => navigate(params), debounceMs);
            } else {
                navigate(params);
            }
        },
        [navigate, debounceMs],
    );

    const handleSort = useCallback(
        (columnId: string, multi: boolean) => {
            const currentSorts = meta.sorts;

            if (multi) {
                const newSorts = [...currentSorts];
                const idx = newSorts.findIndex((s) => s.id === columnId);
                if (idx === -1) {
                    newSorts.push({ id: columnId, direction: "asc" });
                } else if (newSorts[idx].direction === "asc") {
                    newSorts[idx] = { ...newSorts[idx], direction: "desc" };
                } else {
                    newSorts.splice(idx, 1);
                }
                const param = newSorts
                    .map((s) => (s.direction === "desc" ? `-${s.id}` : s.id))
                    .join(",");
                navigate({ [sortKey]: param || null, [pageKey]: null });
            } else {
                const existing = currentSorts.find((s) => s.id === columnId);
                let newSort: string | null;
                if (existing?.direction === "asc") {
                    newSort = "-" + columnId;
                } else if (existing?.direction === "desc") {
                    newSort = null;
                } else {
                    newSort = columnId;
                }
                navigate({ [sortKey]: newSort, [pageKey]: null });
            }
        },
        [meta.sorts, navigate, sortKey, pageKey],
    );

    const handlePageChange = useCallback(
        (page: number) => {
            navigate({ [pageKey]: page > 1 ? page : null });
        },
        [navigate, pageKey],
    );

    const handlePerPageChange = useCallback(
        (perPage: number) => {
            navigate({ [perPageKey]: perPage, [pageKey]: null });
        },
        [navigate, perPageKey, pageKey],
    );

    const handleCursorChange = useCallback(
        (cursor: string | null) => {
            const cursorKey = prefix ? `${prefix}_cursor` : "cursor";
            navigate({ [cursorKey]: cursor, [pageKey]: null });
        },
        [navigate, prefix, pageKey],
    );

    const handleGlobalSearch = useCallback(
        (term: string) => {
            debouncedNavigate({ [searchKey]: term || null, [pageKey]: null });
        },
        [debouncedNavigate, searchKey, pageKey],
    );

    const handleApplyQuickView = useCallback(
        (params: Record<string, unknown>) => {
            const currentUrl = new URL(window.location.href);
            const searchParams = new URLSearchParams();

            for (const [key, value] of Object.entries(params)) {
                if (value !== null && value !== undefined && value !== "") {
                    searchParams.set(key, String(value));
                }
            }

            const perPage = currentUrl.searchParams.get(perPageKey);
            if (perPage) {
                searchParams.set(perPageKey, perPage);
            }

            const options: Record<string, unknown> = { preserveScroll: true };
            if (partialReloadKey) {
                options.only = [partialReloadKey];
            }

            router.get(
                currentUrl.pathname + "?" + searchParams.toString(),
                {},
                options,
            );
        },
        [perPageKey, partialReloadKey],
    );

    const applyColumns = useCallback(
        (columnIds: string[]) => {
            const newVisibility: VisibilityState = {};
            for (const col of tableData.columns) {
                newVisibility[col.id] = columnIds.includes(col.id);
            }
            setColumnVisibility(newVisibility);
            setColumnOrder(columnIds);
        },
        [tableData.columns],
    );

    // eslint-disable-next-line react-hooks/incompatible-library
    const table = useReactTable<TData>({
        data: tableData.data,
        columns: columnDefs,
        manualPagination: true,
        manualSorting: true,
        manualFiltering: true,
        pageCount: meta.lastPage,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        onColumnOrderChange: setColumnOrder,
        onRowSelectionChange: setRowSelection,
        enableRowSelection: true,
        enableColumnResizing: columnResizing,
        columnResizeMode: "onChange",
        onColumnSizingChange: handleColumnSizingChange,
        getCoreRowModel: getCoreRowModel(),
        initialState: {
            columnPinning: {
                left: columnDefs.some((c) => c.id === "_select") ? ["_select"] : [],
                right: columnDefs.some((c) => c.id === "_actions") ? ["_actions"] : [],
            },
        },
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            columnOrder,
            rowSelection,
            columnSizing: columnSizingState,
            pagination: {
                pageIndex: meta.currentPage - 1,
                pageSize: meta.perPage,
            },
        },
    });

    useEffect(() => {
        saveVisibility(tableName, columnVisibility);
    }, [tableName, columnVisibility]);

    useEffect(() => {
        saveColumnOrder(tableName, columnOrder);
    }, [tableName, columnOrder]);

    const handleApplyCustomSearch = useCallback(
        (search: string) => {
            const currentUrl = new URL(window.location.href);

            const options: Record<string, unknown> = { preserveScroll: true };
            if (partialReloadKey) {
                options.only = [partialReloadKey];
            }

            router.get(
                currentUrl.pathname + search,
                {},
                options,
            );
        },
        [partialReloadKey],
    );

    return {
        table,
        meta,
        columnVisibility,
        columnOrder,
        setColumnOrder,
        rowSelection,
        setRowSelection,
        applyColumns,
        handleSort,
        handlePageChange,
        handlePerPageChange,
        handleCursorChange,
        handleGlobalSearch,
        handleApplyQuickView,
        handleApplyCustomSearch,
    };
}
