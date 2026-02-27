"use no memo";

import {
    Table,
    TableBody,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter as DialogFoot,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Filters } from "../filters/filters";
import type { FilterColumn } from "../filters/types";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { type Column, type ColumnDef, type ColumnOrderState, type Table as TanStackTable, type VisibilityState, flexRender } from "@tanstack/react-table";
import {
    Calendar,
    Check,
    CircleDot,
    Download,
    EllipsisVertical,
    FileDown,
    FileSpreadsheet,
    FileText,
    GripVertical,
    Hash,
    Image as ImageIcon,
    List,
    Search,
    SlidersHorizontal,
    Tag,
    ToggleLeft,
    Type,
    X,
} from "lucide-react";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { useCallback, useMemo, useRef, useState } from "react";
import { DataTableColumnHeader } from "./data-table-column-header";
import { defaultTranslations, type DataTableTranslations } from "./i18n";
import { DataTablePagination } from "./data-table-pagination";
import { DataTableRowActions } from "./data-table-row-actions";
import { DataTableQuickViews } from "./data-table-quick-views";
import type { DataTableColumnDef, DataTableConfirmOptions, DataTableOptions, DataTableProps } from "./types";
import { useDataTable } from "./use-data-table";

function buildExportUrl(baseUrl: string, format: string, visibleColumns?: string[]): string {
    const currentParams = new URL(window.location.href).searchParams;
    const exportUrl = new URL(baseUrl, window.location.origin);
    for (const [key, value] of currentParams.entries()) {
        exportUrl.searchParams.set(key, value);
    }
    exportUrl.searchParams.set("format", format);
    if (visibleColumns?.length) {
        exportUrl.searchParams.set("columns", visibleColumns.join(","));
    }
    return exportUrl.toString();
}

function getColumnPinningProps<T>(column: Column<T, unknown>) {
    const isPinned = column.getIsPinned();
    if (!isPinned) return { style: {} as React.CSSProperties, className: "" };
    return {
        style: {
            position: "sticky" as const,
            left: isPinned === "left" ? `${column.getStart("left")}px` : undefined,
            right: isPinned === "right" ? `${column.getAfter("right")}px` : undefined,
            zIndex: 1,
        } as React.CSSProperties,
        className: cn(
            isPinned === "left" && column.getIsLastColumn("left") && "shadow-[2px_0_4px_-2px_rgba(0,0,0,0.08)] dark:shadow-[2px_0_4px_-2px_rgba(255,255,255,0.05)]",
            isPinned === "right" && column.getIsFirstColumn("right") && "shadow-[-2px_0_4px_-2px_rgba(0,0,0,0.08)] dark:shadow-[-2px_0_4px_-2px_rgba(255,255,255,0.05)]",
        ),
    };
}

/** Opaque background for pinned cells in data rows */
function getPinnedCellBg(isPinned: string | false, _isEvenRow: boolean, isSelected: boolean): React.CSSProperties {
    if (!isPinned) return {};
    const base: React.CSSProperties = {};
    if (isSelected) return { ...base, backgroundImage: "linear-gradient(oklch(from var(--color-primary) l c h / 0.05), oklch(from var(--color-primary) l c h / 0.05))" };
    return base;
}

/** Badge variant styles */
const BADGE_VARIANTS: Record<string, string> = {
    default: "bg-primary/10 text-primary dark:bg-primary/20",
    success: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    warning: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    danger: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    info: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    secondary: "bg-muted text-muted-foreground",
};

function DataTableToolbar<TData>({ tableData, table, tableName, columnVisibility, columnOrder, applyColumns, onReorderColumns, handleApplyQuickView, handleApplyCustomSearch, resolvedOptions, t }: {
    tableData: { quickViews: import("./types").DataTableQuickView[]; exportUrl?: string | null; columns: DataTableColumnDef[] };
    table: TanStackTable<TData>;
    tableName: string;
    columnVisibility: VisibilityState;
    columnOrder: ColumnOrderState;
    applyColumns: (columnIds: string[]) => void;
    onReorderColumns: (order: ColumnOrderState) => void;
    handleApplyQuickView: (params: Record<string, unknown>) => void;
    handleApplyCustomSearch: (search: string) => void;
    resolvedOptions: DataTableOptions;
    t: DataTableTranslations;
}) {
    return (
        <div className="flex gap-3 px-4">
            {(resolvedOptions.quickViews || resolvedOptions.customQuickViews) && (
                <DataTableQuickViews
                    quickViews={resolvedOptions.quickViews ? tableData.quickViews : []}
                    tableName={tableName}
                    columnVisibility={columnVisibility}
                    columnOrder={columnOrder}
                    allColumns={tableData.columns}
                    onSelect={handleApplyQuickView}
                    onApplyCustom={handleApplyCustomSearch}
                    onApplyColumns={applyColumns}
                    onApplyColumnOrder={onReorderColumns}
                    enableCustom={resolvedOptions.customQuickViews}
                    t={t}
                />
            )}
            {resolvedOptions.exports && tableData.exportUrl && (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="h-8">
                            <Download className="h-4 w-4" />
                            {t.export}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>{t.exportFormat}</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <a href={buildExportUrl(
                                tableData.exportUrl,
                                "xlsx",
                                table.getVisibleLeafColumns()
                                    .filter((c) => c.getCanHide())
                                    .map((c) => c.id),
                            )}>
                                <FileSpreadsheet className="mr-2 h-4 w-4" />
                                Excel (.xlsx)
                            </a>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <a href={buildExportUrl(
                                tableData.exportUrl,
                                "csv",
                                table.getVisibleLeafColumns()
                                    .filter((c) => c.getCanHide())
                                    .map((c) => c.id),
                            )}>
                                <FileText className="mr-2 h-4 w-4" />
                                CSV (.csv)
                            </a>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <a href={buildExportUrl(
                                tableData.exportUrl,
                                "pdf",
                                table.getVisibleLeafColumns()
                                    .filter((c) => c.getCanHide())
                                    .map((c) => c.id),
                            )}>
                                <FileDown className="mr-2 h-4 w-4" />
                                PDF (.pdf)
                            </a>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )}
            {(resolvedOptions.columnVisibility || resolvedOptions.columnOrdering) && (
                <ColumnsDropdown
                    table={table}
                    tableColumns={tableData.columns}
                    columnOrder={columnOrder}
                    onReorder={onReorderColumns}
                    showVisibility={resolvedOptions.columnVisibility}
                    showOrdering={resolvedOptions.columnOrdering}
                    t={t}
                />
            )}
        </div>
    );
}

function ColumnsDropdown<TData>({ table, tableColumns, columnOrder, onReorder, showVisibility, showOrdering, t }: {
    table: TanStackTable<TData>;
    tableColumns: DataTableColumnDef[];
    columnOrder: ColumnOrderState;
    onReorder: (order: ColumnOrderState) => void;
    showVisibility: boolean;
    showOrdering: boolean;
    t: DataTableTranslations;
}) {
    const dragItem = useRef<string | null>(null);
    const dragOverRef = useRef<string | null>(null);
    const [dragging, setDragging] = useState<string | null>(null);
    const [dragOverId, setDragOverId] = useState<string | null>(null);
    const [reordering, setReordering] = useState(false);

    const isReorderActive = reordering && showOrdering;

    const handleDragStart = useCallback((columnId: string) => {
        dragItem.current = columnId;
        setDragging(columnId);
    }, []);

    const handleDragEnd = useCallback(() => {
        const from = dragItem.current;
        const to = dragOverRef.current;
        if (from && to && from !== to) {
            const newOrder = [...columnOrder];
            const fromIdx = newOrder.indexOf(from);
            newOrder.splice(fromIdx, 1);
            const toIdx = newOrder.indexOf(to);
            if (toIdx !== -1) {
                newOrder.splice(toIdx, 0, from);
                onReorder(newOrder);
            }
        }
        dragItem.current = null;
        dragOverRef.current = null;
        setDragging(null);
        setDragOverId(null);
    }, [columnOrder, onReorder]);

    const hideable = table.getAllLeafColumns().filter((c) => c.getCanHide());
    const colDefMap = new Map(tableColumns.map((c) => [c.id, c]));

    const orderedHideable = useMemo(() => {
        if (!showOrdering) return hideable;
        return [...hideable].sort((a, b) => {
            const ai = columnOrder.indexOf(a.id);
            const bi = columnOrder.indexOf(b.id);
            return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
        });
    }, [hideable, columnOrder, showOrdering]);

    const ungrouped = orderedHideable.filter((c) => !colDefMap.get(c.id)?.group);
    const groups = new Map<string, typeof hideable>();
    for (const col of orderedHideable) {
        const g = colDefMap.get(col.id)?.group;
        if (g) {
            if (!groups.has(g)) groups.set(g, []);
            groups.get(g)!.push(col);
        }
    }

    function renderItem(column: ReturnType<TanStackTable<TData>["getAllLeafColumns"]>[number]) {
        const isOver = dragOverId === column.id && dragging !== column.id;
        return (
            <div
                key={column.id}
                className={cn(
                    "flex items-center gap-1 rounded-sm px-2 py-1.5 text-sm",
                    dragging === column.id && "opacity-40",
                    isOver && "border-t-2 border-t-primary",
                )}
                draggable={isReorderActive}
                onDragStart={() => handleDragStart(column.id)}
                onDragOver={(e) => {
                    e.preventDefault();
                    dragOverRef.current = column.id;
                    setDragOverId(column.id);
                }}
                onDragEnd={handleDragEnd}
            >
                {isReorderActive && (
                    <GripVertical className="h-3.5 w-3.5 shrink-0 cursor-grab text-muted-foreground/50" />
                )}
                {showVisibility ? (
                    <label className="flex flex-1 cursor-pointer items-center gap-2">
                        <Checkbox
                            checked={column.getIsVisible()}
                            onCheckedChange={(value) => column.toggleVisibility(!!value)}
                        />
                        <span className="select-none">{column.columnDef.header as string}</span>
                    </label>
                ) : (
                    <span className="flex-1 select-none">{column.columnDef.header as string}</span>
                )}
            </div>
        );
    }

    return (
        <DropdownMenu onOpenChange={(open) => { if (!open) { setReordering(false); setDragging(null); setDragOverId(null); } }}>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8">
                    <SlidersHorizontal className="h-4 w-4" />
                    {t.columns}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="max-h-[400px] w-60 overflow-y-auto">
                <div className="flex items-center justify-between px-2 py-1.5">
                    <span className="text-sm font-semibold">{t.columns}</span>
                    {showOrdering && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs"
                            onPointerDown={(e) => e.stopPropagation()}
                            onClick={(e) => {
                                e.preventDefault();
                                setReordering((r) => !r);
                            }}
                        >
                            {reordering ? t.done : t.reorder}
                        </Button>
                    )}
                </div>
                <DropdownMenuSeparator />
                {ungrouped.map((column) => renderItem(column))}
                {[...groups.entries()].map(([group, cols]) => (
                    <DropdownMenuSub key={group}>
                        <DropdownMenuSubTrigger
                            className={"flex-row-reverse gap-2 justify-end [&_svg]:ml-0 [&_svg]:rotate-180"}
                        >
                            {group}
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent>
                            {cols.map((column) => renderItem(column))}
                        </DropdownMenuSubContent>
                    </DropdownMenuSub>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

const TYPE_ICON_MAP: Record<string, FilterColumn["icon"]> = {
    text: Type,
    number: Hash,
    date: Calendar,
    option: CircleDot,
    multiOption: List,
    boolean: ToggleLeft,
    image: ImageIcon,
    badge: Tag,
};

function buildFilterColumns(columns: DataTableColumnDef[]): FilterColumn[] {
    return columns
        .filter((col) => col.filterable)
        .map((col) => {
            const type = col.type === "multiOption" ? "option" as const : col.type as FilterColumn["type"];
            return {
                id: col.id,
                label: col.label,
                type,
                icon: TYPE_ICON_MAP[col.type],
                ...(col.options ? { options: col.options } : {}),
                ...(col.searchThreshold != null ? { searchThreshold: col.searchThreshold } : {}),
            };
        });
}

export function DataTable<TData extends object>({
    className,
    tableData,
    tableName,
    prefix,
    actions,
    bulkActions,
    renderCell,
    renderHeader,
    renderFooterCell,
    rowClassName,
    rowDataAttributes,
    groupClassName,
    options: optionsOverride,
    translations: translationsOverride,
    onRowClick,
    rowLink,
    emptyState,
    debounceMs,
    partialReloadKey,
    slots,
}: DataTableProps<TData>) {
    const t = useMemo<DataTableTranslations>(
        () => ({ ...defaultTranslations, ...translationsOverride }),
        [translationsOverride],
    );

    const resolvedOptions = useMemo<DataTableOptions>(() => ({
        quickViews: true,
        customQuickViews: true,
        exports: true,
        filters: true,
        columnVisibility: true,
        columnOrdering: true,
        stickyHeader: false,
        globalSearch: false,
        ...optionsOverride,
    }), [optionsOverride]);

    const hasBulkActions = bulkActions && bulkActions.length > 0;
    const isClickable = !!onRowClick || !!rowLink;

    // Bulk action confirmation dialog state
    const [bulkConfirm, setBulkConfirm] = useState<{ action: (typeof bulkActions extends (infer U)[] ? U : never); opts: DataTableConfirmOptions; rows: TData[] } | null>(null);

    const columnDefs = useMemo<ColumnDef<TData>[]>(() => {
        function makeLeafCol(col: DataTableColumnDef): ColumnDef<TData> {
            return {
                id: col.id,
                accessorKey: col.id,
                header: col.label,
                enableHiding: true,
                meta: { type: col.type, group: col.group ?? null },
                cell: ({ row }) => {
                    const value = row.getValue(col.id);
                    if (renderCell) {
                        const custom = renderCell(col.id, value, row.original);
                        if (custom !== undefined) return custom;
                    }
                    if (value === null || value === undefined) {
                        return <span className="text-muted-foreground">—</span>;
                    }
                    // Image column type
                    if (col.type === "image" && typeof value === "string") {
                        return (
                            <img
                                src={value}
                                alt=""
                                className="h-8 w-8 rounded-md object-cover"
                            />
                        );
                    }
                    // Badge column type
                    if (col.type === "badge") {
                        const strValue = String(value);
                        const opt = col.options?.find((o) => o.value === strValue);
                        const variant = opt?.variant ?? "default";
                        const badgeLabel = opt?.label ?? strValue;
                        return (
                            <span className={cn(
                                "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                                BADGE_VARIANTS[variant] ?? BADGE_VARIANTS.default,
                            )}>
                                {badgeLabel}
                            </span>
                        );
                    }
                    if (typeof value === "boolean") {
                        return value ? (
                            <Check className="inline-flex h-4 items-center rounded-full font-medium text-green-800 dark:text-green-400" />
                        ) : (
                            <X className="inline-flex h-4 items-center rounded-full font-medium text-red-800 dark:text-red-400" />
                        );
                    }
                    if (col.type === "number" && typeof value === "number") {
                        return (
                            <span className="tabular-nums">
                                {value.toLocaleString()}
                            </span>
                        );
                    }
                    return String(value);
                },
            };
        }

        const result: ColumnDef<TData>[] = [];

        if (hasBulkActions) {
            result.push({
                id: "_select",
                header: ({ table: tbl }) => (
                    <Checkbox
                        checked={tbl.getIsAllPageRowsSelected() || (tbl.getIsSomePageRowsSelected() && "indeterminate")}
                        onCheckedChange={(value) => tbl.toggleAllPageRowsSelected(!!value)}
                        aria-label={t.selectAll}
                    />
                ),
                cell: ({ row }) => (
                    <Checkbox
                        checked={row.getIsSelected()}
                        onCheckedChange={(value) => row.toggleSelected(!!value)}
                        aria-label={t.selectRow}
                    />
                ),
                enableHiding: false,
            });
        }

        const processedGroups = new Set<string>();

        for (const col of tableData.columns) {
            if (!col.group) {
                result.push(makeLeafCol(col));
            } else if (!processedGroups.has(col.group)) {
                processedGroups.add(col.group);
                const groupCols = tableData.columns.filter((c) => c.group === col.group);
                result.push({
                    id: `_group_${col.group}`,
                    header: col.group,
                    columns: groupCols.map(makeLeafCol),
                });
            }
        }

        if (actions && actions.length > 0) {
            result.push({
                id: "_actions",
                header: "",
                enableHiding: false,
                cell: ({ row }) => (
                    <DataTableRowActions row={row.original} actions={actions} t={t} />
                ),
            });
        }

        return result;
    }, [tableData.columns, actions, hasBulkActions, renderCell, t]);

    const {
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
    } = useDataTable<TData>({
        tableData,
        tableName,
        columnDefs,
        prefix,
        debounceMs,
        partialReloadKey,
    });

    const filterColumns = useMemo(
        () => buildFilterColumns(tableData.columns),
        [tableData.columns],
    );

    const selectedRows = useMemo(
        () => table.getFilteredSelectedRowModel().rows.map((r) => r.original),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [rowSelection, tableData.data],
    );

    // Global search state
    const searchKey = prefix ? `${prefix}_search` : "search";
    const initialSearch = typeof window !== "undefined"
        ? new URL(window.location.href).searchParams.get(searchKey) ?? ""
        : "";
    const [globalSearchValue, setGlobalSearchValue] = useState(initialSearch);

    function handleGlobalSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
        setGlobalSearchValue(e.target.value);
        handleGlobalSearch(e.target.value);
    }

    function handleBulkClick(action: NonNullable<typeof bulkActions>[number]) {
        if (action.confirm) {
            const opts: DataTableConfirmOptions = typeof action.confirm === "object" ? action.confirm : {};
            setBulkConfirm({ action, opts, rows: selectedRows });
        } else {
            action.onClick(selectedRows);
        }
    }

    function handleRowInteraction(row: TData, e: React.MouseEvent) {
        if (rowLink) {
            const href = rowLink(row);
            if (e.metaKey || e.ctrlKey) {
                window.open(href, "_blank");
            } else {
                window.location.href = href;
            }
        } else if (onRowClick) {
            onRowClick(row);
        }
    }

    const toolbarProps = {
        tableData,
        table,
        tableName,
        columnVisibility,
        columnOrder,
        applyColumns,
        onReorderColumns: setColumnOrder,
        handleApplyQuickView,
        handleApplyCustomSearch,
        resolvedOptions,
        t,
    };

    return (
        <div className="space-y-2">
            {slots?.beforeTable}
            <div className="flex items-center justify-between gap-2 py-1">
                <div className="flex flex-1 items-center gap-2 pl-6">
                    {resolvedOptions.globalSearch && (
                        <div className="relative w-64">
                            <Search className="absolute left-2.5 top-2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder={t.search}
                                value={globalSearchValue}
                                onChange={handleGlobalSearchChange}
                                className="h-8 pl-8 text-sm"
                            />
                        </div>
                    )}
                    {resolvedOptions.filters && (
                        <Filters
                            columns={filterColumns}
                            serverFilters={meta.filters as Record<string, unknown>}
                            t={t}
                            prefix={prefix}
                            debounceMs={debounceMs}
                            partialReloadKey={partialReloadKey}
                        />
                    )}
                </div>
                {slots?.toolbar ?? (
                    <>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 md:hidden">
                                    <EllipsisVertical className="h-4 w-4" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent align="end" className="flex w-auto flex-col gap-2 p-2">
                                <DataTableToolbar {...toolbarProps} />
                            </PopoverContent>
                        </Popover>
                        <div className="hidden items-center gap-2 md:flex">
                            <DataTableToolbar {...toolbarProps} />
                        </div>
                    </>
                )}
            </div>
            {hasBulkActions && selectedRows.length > 0 && (
                <div className="flex items-center gap-2 rounded-lg border bg-muted/50 px-3 py-2">
                    <span className="text-sm font-medium tabular-nums">
                        {t.selected(selectedRows.length)}
                    </span>
                    <div className="flex items-center gap-1">
                        {bulkActions.map((action) => {
                            const Icon = action.icon;
                            const isDisabled = action.disabled?.(selectedRows) ?? false;
                            return (
                                <Button
                                    key={action.id}
                                    variant={action.variant === "destructive" ? "destructive" : "outline"}
                                    size="sm"
                                    className="h-7 text-xs"
                                    disabled={isDisabled}
                                    onClick={() => handleBulkClick(action)}
                                >
                                    {Icon && <Icon className="mr-1 h-3.5 w-3.5" />}
                                    {action.label}
                                </Button>
                            );
                        })}
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="ml-auto h-7 w-7"
                        onClick={() => setRowSelection({})}
                    >
                        <X className="h-3.5 w-3.5" />
                    </Button>
                </div>
            )}
            <div className={cn("rounded-md border border-x-0 overflow-x-auto", className)}>
                <Table>
                    <TableHeader className={cn(resolvedOptions.stickyHeader && "sticky top-0 z-10 bg-background")}>
                        {table.getHeaderGroups().map((headerGroup, groupIdx) => {
                            const isGroupRow = groupIdx < table.getHeaderGroups().length - 1;
                            return (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => {
                                        if (isGroupRow) {
                                            const pin = getColumnPinningProps(header.column);
                                            return (
                                                <TableHead
                                                    key={header.id}
                                                    colSpan={header.colSpan}
                                                    style={pin.style}
                                                    className={cn(
                                                        "h-8",
                                                        !header.isPlaceholder && header.colSpan > 1 &&
                                                            "text-center text-xs font-semibold text-muted-foreground border-b",
                                                        !header.isPlaceholder && header.colSpan > 1 &&
                                                            groupClassName?.[header.column.columnDef.header as string],
                                                        pin.className,
                                                    )}
                                                >
                                                    {header.isPlaceholder
                                                        ? null
                                                        : flexRender(
                                                              header.column.columnDef.header,
                                                              header.getContext(),
                                                          )}
                                                </TableHead>
                                            );
                                        }

                                        const colDef = tableData.columns.find(
                                            (c) => c.id === header.column.id,
                                        );
                                        const isNumber = colDef?.type === "number";
                                        const leafGroup = colDef?.group;
                                        const pin = getColumnPinningProps(header.column);
                                        return (
                                            <TableHead
                                                key={header.id}
                                                colSpan={header.colSpan}
                                                style={pin.style}
                                                className={cn(
                                                    isNumber && "text-right",
                                                    leafGroup && groupClassName?.[leafGroup],
                                                    pin.className,
                                                )}
                                            >
                                                {header.isPlaceholder ? null : colDef?.sortable ? (
                                                    <DataTableColumnHeader
                                                        label={colDef.label}
                                                        sortable={colDef.sortable}
                                                        sorts={meta.sorts}
                                                        columnId={colDef.id}
                                                        onSort={handleSort}
                                                        align={isNumber ? "right" : "left"}
                                                    >
                                                        {renderHeader?.[colDef.id]}
                                                    </DataTableColumnHeader>
                                                ) : (
                                                    renderHeader?.[header.column.id] ??
                                                    flexRender(
                                                        header.column.columnDef.header,
                                                        header.getContext(),
                                                    )
                                                )}
                                            </TableHead>
                                        );
                                    })}
                                </TableRow>
                            );
                        })}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows.length > 0 ? (
                            table.getRowModel().rows.map((row, index) => {
                                const dataAttrs = rowDataAttributes?.(row.original) ?? {};
                                return (
                                    <TableRow
                                        key={row.id}
                                        data-state={row.getIsSelected() ? "selected" : undefined}
                                        {...dataAttrs}
                                        className={cn(
                                            index % 2 === 1 && "bg-muted/40",
                                            row.getIsSelected() && "bg-primary/5",
                                            isClickable && "cursor-pointer hover:bg-muted/60",
                                            rowClassName?.(row.original),
                                        )}
                                        onClick={isClickable ? (e) => {
                                            const target = e.target as HTMLElement;
                                            if (target.closest("button, a, input, [role='checkbox'], [data-slot='clear']")) return;
                                            handleRowInteraction(row.original, e);
                                        } : undefined}
                                    >
                                        {row.getVisibleCells().map((cell) => {
                                            const pin = getColumnPinningProps(cell.column);
                                            const pinnedBg = getPinnedCellBg(cell.column.getIsPinned(), index % 2 === 1, row.getIsSelected());
                                            return (
                                                <TableCell
                                                    key={cell.id}
                                                    style={{ ...pin.style, ...pinnedBg }}
                                                    className={cn(
                                                        index % 2 === 1 && "bg-muted/40",
                                                        "whitespace-nowrap py-2",
                                                        (cell.column.columnDef.meta as { type?: string })?.type === "number" && "text-right",
                                                        (cell.column.columnDef.meta as { group?: string | null })?.group &&
                                                            groupClassName?.[(cell.column.columnDef.meta as { group: string }).group],
                                                        pin.className,
                                                    )}
                                                >
                                                    {flexRender(
                                                        cell.column.columnDef.cell,
                                                        cell.getContext(),
                                                    )}
                                                </TableCell>
                                            );
                                        })}
                                    </TableRow>
                                );
                            })
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={table.getVisibleLeafColumns().length}
                                    className="h-24 text-center"
                                >
                                    {emptyState ?? t.noData}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                    {tableData.footer && (
                        <TableFooter>
                            <TableRow>
                                {[...table.getLeftVisibleLeafColumns(), ...table.getCenterVisibleLeafColumns(), ...table.getRightVisibleLeafColumns()].map((col) => {
                                    const footerValue = tableData.footer?.[col.id];
                                    const colMeta = col.columnDef.meta as { type?: string; group?: string | null } | undefined;
                                    const isNumber = colMeta?.type === "number";
                                    const group = colMeta?.group;
                                    const pin = getColumnPinningProps(col);
                                    let content: React.ReactNode = null;
                                    if (footerValue !== undefined && footerValue !== null) {
                                        if (renderFooterCell) {
                                            const custom = renderFooterCell(col.id, footerValue);
                                            if (custom !== undefined) {
                                                content = custom;
                                            } else {
                                                content = isNumber && typeof footerValue === "number"
                                                    ? footerValue.toLocaleString()
                                                    : String(footerValue);
                                            }
                                        } else {
                                            content = isNumber && typeof footerValue === "number"
                                                ? footerValue.toLocaleString()
                                                : String(footerValue);
                                        }
                                    }
                                    const footerPinnedBg = col.getIsPinned() ? { backgroundColor: "var(--color-background)" } : {};
                                    return (
                                        <TableCell
                                            key={col.id}
                                            style={{ ...pin.style, ...footerPinnedBg }}
                                            className={cn(
                                                "whitespace-nowrap py-2 font-semibold",
                                                isNumber && "text-right tabular-nums",
                                                group && groupClassName?.[group],
                                                pin.className,
                                            )}
                                        >
                                            {content}
                                        </TableCell>
                                    );
                                })}
                            </TableRow>
                        </TableFooter>
                    )}
                </Table>
            </div>
            {slots?.pagination ?? (
                <DataTablePagination
                    meta={meta}
                    onPageChange={handlePageChange}
                    onPerPageChange={handlePerPageChange}
                    onCursorChange={handleCursorChange}
                    t={t}
                />
            )}
            {slots?.afterTable}

            {/* Bulk action confirmation dialog */}
            <Dialog open={!!bulkConfirm} onOpenChange={(open) => { if (!open) setBulkConfirm(null); }}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            {bulkConfirm?.opts.title ?? t.confirmTitle}
                        </DialogTitle>
                        <DialogDescription>
                            {bulkConfirm?.opts.description ?? t.confirmDescription}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFoot>
                        <Button variant="outline" onClick={() => setBulkConfirm(null)}>
                            {bulkConfirm?.opts.cancelLabel ?? t.confirmCancel}
                        </Button>
                        <Button
                            variant={bulkConfirm?.opts.variant ?? bulkConfirm?.action.variant ?? "default"}
                            onClick={() => {
                                if (bulkConfirm) {
                                    bulkConfirm.action.onClick(bulkConfirm.rows);
                                    setBulkConfirm(null);
                                }
                            }}
                        >
                            {bulkConfirm?.opts.confirmLabel ?? t.confirmAction}
                        </Button>
                    </DialogFoot>
                </DialogContent>
            </Dialog>
        </div>
    );
}
