import { router } from "@inertiajs/react";
import { useCallback, useMemo, useRef } from "react";
import type { FilterValue, ActiveFilters } from "../filters/types";

export type { FilterValue, ActiveFilters };

export interface UseDataTableFiltersOptions {
    /** Server-provided filters (from DataTableResponse.meta.filters) */
    serverFilters: Record<string, unknown>;
    /** Prefix for multi-table support */
    prefix?: string;
    /** Debounce delay in ms for filter changes */
    debounceMs?: number;
    /** Inertia partial reload key for optimized data fetching */
    partialReloadKey?: string;
}

export interface UseDataTableFiltersReturn {
    /** Currently active filters parsed from server state */
    activeFilters: ActiveFilters;
    /** Set a filter on a column with operator and values */
    setFilter: (columnId: string, operator: string, values: string[]) => void;
    /** Clear a specific column filter */
    clearFilter: (columnId: string) => void;
    /** Clear all active filters */
    clearAllFilters: () => void;
    /** Check if any filters are active */
    hasActiveFilters: boolean;
    /** Get the number of active filters */
    activeFilterCount: number;
}

function parseFilterParam(raw: string): FilterValue {
    const match = raw.match(/^([a-z_]+):(.+)$/i);
    if (match) {
        return { operator: match[1], values: match[2].split(",") };
    }
    return { operator: "", values: raw.split(",") };
}

function navigate(params: Record<string, unknown>, partialReloadKey?: string) {
    const url = new URL(window.location.href);
    const sp = new URLSearchParams(url.search);

    for (const [k, v] of Object.entries(params)) {
        if (v === null || v === undefined || v === "") sp.delete(k);
        else sp.set(k, String(v));
    }

    const options: Record<string, unknown> = { preserveScroll: true };
    if (partialReloadKey) {
        options.only = [partialReloadKey];
    }

    router.get(url.pathname + "?" + sp.toString(), {}, options);
}

/**
 * Standalone hook for managing DataTable filters independently of the <DataTable> component.
 *
 * Use this when building custom filter UIs or when you need programmatic filter control.
 *
 * @example
 * ```tsx
 * const { activeFilters, setFilter, clearFilter, clearAllFilters } = useDataTableFilters({
 *     serverFilters: tableData.meta.filters,
 *     prefix: "products",
 *     debounceMs: 300,
 *     partialReloadKey: "tableData",
 * });
 *
 * // Set a text filter
 * setFilter("name", "contains", ["widget"]);
 *
 * // Set a date range filter
 * setFilter("created_at", "between", ["2024-01-01", "2024-12-31"]);
 *
 * // Clear a specific filter
 * clearFilter("name");
 *
 * // Clear all filters
 * clearAllFilters();
 * ```
 */
export function useDataTableFilters({
    serverFilters,
    prefix,
    debounceMs = 0,
    partialReloadKey,
}: UseDataTableFiltersOptions): UseDataTableFiltersReturn {
    const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const activeFilters = useMemo<ActiveFilters>(() => {
        const result: ActiveFilters = {};
        for (const [key, raw] of Object.entries(serverFilters)) {
            if (raw !== null && raw !== undefined && raw !== "") {
                result[key] = parseFilterParam(String(raw));
            }
        }
        return result;
    }, [serverFilters]);

    const filterKey = prefix ? `${prefix}_filter` : "filter";
    const pageKey = prefix ? `${prefix}_page` : "page";

    const debouncedNavigate = useCallback(
        (params: Record<string, unknown>) => {
            if (debounceTimer.current) clearTimeout(debounceTimer.current);
            if (debounceMs > 0) {
                debounceTimer.current = setTimeout(() => {
                    navigate(params, partialReloadKey);
                }, debounceMs);
            } else {
                navigate(params, partialReloadKey);
            }
        },
        [debounceMs, partialReloadKey],
    );

    const setFilter = useCallback(
        (columnId: string, operator: string, values: string[]) => {
            if (values.length === 0) {
                debouncedNavigate({ [`${filterKey}[${columnId}]`]: null, [pageKey]: null });
                return;
            }
            debouncedNavigate({
                [`${filterKey}[${columnId}]`]: `${operator}:${values.join(",")}`,
                [pageKey]: null,
            });
        },
        [filterKey, pageKey, debouncedNavigate],
    );

    const clearFilter = useCallback((columnId: string) => {
        navigate({ [`${filterKey}[${columnId}]`]: null, [pageKey]: null }, partialReloadKey);
    }, [filterKey, pageKey, partialReloadKey]);

    const clearAllFilters = useCallback(() => {
        const params: Record<string, unknown> = { [pageKey]: null };
        const url = new URL(window.location.href);
        for (const k of url.searchParams.keys()) {
            if (k.startsWith(`${filterKey}[`)) params[k] = null;
        }
        navigate(params, partialReloadKey);
    }, [filterKey, pageKey, partialReloadKey]);

    const hasActiveFilters = Object.keys(activeFilters).length > 0;
    const activeFilterCount = Object.keys(activeFilters).length;

    return { activeFilters, setFilter, clearFilter, clearAllFilters, hasActiveFilters, activeFilterCount };
}
