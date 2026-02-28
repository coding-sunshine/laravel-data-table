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
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Filters } from "../filters/filters";
import type { FilterColumn } from "../filters/types";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { type Column, type ColumnDef, type ColumnOrderState, type Table as TanStackTable, type VisibilityState, flexRender } from "@tanstack/react-table";
import {
    Calendar,
    Check,
    ChevronDown,
    ChevronRight,
    CircleDot,
    DollarSign,
    Download,
    EllipsisVertical,
    ExternalLink,
    EyeOff,
    FileDown,
    FileSpreadsheet,
    FileText,
    GripVertical,
    Hash,
    Image as ImageIcon,
    Link as LinkIcon,
    List,
    Loader2,
    Mail,
    Percent,
    Phone,
    Printer,
    RefreshCw,
    Search,
    SlidersHorizontal,
    Tag,
    ToggleLeft,
    Trash2,
    Type,
    X,
} from "lucide-react";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Component, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { router } from "@inertiajs/react";
import { DataTableColumnHeader } from "./data-table-column-header";
import { defaultTranslations, type DataTableTranslations } from "./i18n";
import { DataTablePagination } from "./data-table-pagination";
import { DataTableRowActions } from "./data-table-row-actions";
import { DataTableQuickViews } from "./data-table-quick-views";
import type { DataTableColumnDef, DataTableConfirmOptions, DataTableOptions, DataTableProps, DataTableRule } from "./types";
import { useDataTable } from "./use-data-table";

// ─── Safe localStorage helpers ──────────────────────────────────────────────

function safeGetItem(key: string): string | null {
    try { return localStorage.getItem(key); }
    catch { return null; }
}

function safeSetItem(key: string, value: string): void {
    try { localStorage.setItem(key, value); }
    catch { /* storage full or unavailable */ }
}

// ─── Column meta type ───────────────────────────────────────────────────────

interface ColumnMeta {
    type?: string;
    group?: string | null;
    editable?: boolean;
    currency?: string;
    locale?: string;
    toggleable?: boolean;
}

// ─── Error Boundary ─────────────────────────────────────────────────────────

interface ErrorBoundaryProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error?: Error;
}

class DataTableErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    render() {
        if (this.state.hasError) {
            return this.props.fallback ?? (
                <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 p-8 text-center">
                    <p className="text-sm font-medium text-destructive">Something went wrong rendering the table.</p>
                    <p className="text-xs text-muted-foreground">{this.state.error?.message}</p>
                    <Button variant="outline" size="sm" onClick={() => this.setState({ hasError: false })}>
                        Try again
                    </Button>
                </div>
            );
        }
        return this.props.children;
    }
}

// ─── Utility functions ──────────────────────────────────────────────────────

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
            "bg-background",
            isPinned === "left" && column.getIsLastColumn("left") && "shadow-[2px_0_4px_-2px_rgba(0,0,0,0.06)]",
            isPinned === "right" && column.getIsFirstColumn("right") && "shadow-[-2px_0_4px_-2px_rgba(0,0,0,0.06)]",
        ),
    };
}

const BADGE_VARIANTS: Record<string, string> = {
    default: "bg-primary/10 text-primary dark:bg-primary/20",
    success: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    warning: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    danger: "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    info: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    secondary: "bg-muted text-muted-foreground",
};

/** Evaluate a conditional rule against a row value */
function evaluateRule(rule: DataTableRule, rowValue: unknown): boolean {
    const v = rowValue;
    const target = rule.value;
    switch (rule.operator) {
        case "eq": return v === target || String(v) === String(target);
        case "neq": return v !== target && String(v) !== String(target);
        case "gt": return Number(v) > Number(target);
        case "gte": return Number(v) >= Number(target);
        case "lt": return Number(v) < Number(target);
        case "lte": return Number(v) <= Number(target);
        case "contains": return String(v).toLowerCase().includes(String(target).toLowerCase());
        case "starts_with": return String(v).toLowerCase().startsWith(String(target).toLowerCase());
        case "ends_with": return String(v).toLowerCase().endsWith(String(target).toLowerCase());
        case "is_null": return v === null || v === undefined;
        case "is_not_null": return v !== null && v !== undefined;
        case "is_empty": return v === "" || v === null || v === undefined;
        case "is_true": return v === true || v === 1 || v === "1";
        case "is_false": return v === false || v === 0 || v === "0";
        default: return false;
    }
}

// ─── Sub-components ─────────────────────────────────────────────────────────

/** Inline editable cell component */
function InlineEditCell({ value: initialValue, columnId, columnType, onSave, t }: {
    value: unknown; columnId: string; columnType: string;
    onSave: (value: unknown) => Promise<void> | void; t: DataTableTranslations;
}) {
    const [editing, setEditing] = useState(false);
    const [editValue, setEditValue] = useState(String(initialValue ?? ""));
    const [saving, setSaving] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => { if (editing) inputRef.current?.focus(); }, [editing]);

    const handleSave = useCallback(async () => {
        setSaving(true);
        try {
            const parsed = columnType === "number" || columnType === "currency" || columnType === "percentage"
                ? Number(editValue) : editValue;
            await onSave(parsed);
            setEditing(false);
        } finally { setSaving(false); }
    }, [editValue, columnType, onSave]);

    if (!editing) {
        return (
            <span className="cursor-pointer rounded px-1 -mx-1 hover:bg-muted/80 transition-colors"
                onDoubleClick={() => { setEditValue(String(initialValue ?? "")); setEditing(true); }}
                title="Double-click to edit">
                {initialValue === null || initialValue === undefined
                    ? <span className="text-muted-foreground italic text-xs">empty</span> : String(initialValue)}
            </span>
        );
    }

    return (
        <div className="flex items-center gap-1">
            <Input ref={inputRef}
                type={columnType === "number" || columnType === "currency" || columnType === "percentage" ? "number" : "text"}
                value={editValue} onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleSave(); if (e.key === "Escape") setEditing(false); }}
                className="h-7 w-auto min-w-[80px] text-sm" disabled={saving} />
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
        </div>
    );
}

/** Boolean toggle switch cell */
function ToggleCell({ value, row, columnId, toggleUrl }: {
    value: boolean; row: Record<string, unknown>; columnId: string; toggleUrl: string;
}) {
    const [checked, setChecked] = useState(!!value);
    const [saving, setSaving] = useState(false);

    const handleToggle = useCallback(async (newValue: boolean) => {
        setSaving(true);
        setChecked(newValue);
        try {
            const rowId = row.id ?? "";
            const url = `${toggleUrl}/${rowId}`;
            await fetch(url, {
                method: "PATCH",
                headers: { "Content-Type": "application/json", "X-Requested-With": "XMLHttpRequest",
                    "X-CSRF-TOKEN": document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? "" },
                body: JSON.stringify({ column: columnId, value: newValue }),
            });
        } catch { setChecked(!newValue); }
        finally { setSaving(false); }
    }, [row.id, toggleUrl, columnId]);

    return <Switch checked={checked} onCheckedChange={handleToggle} disabled={saving} className="data-[state=checked]:bg-emerald-600" />;
}

function DataTableToolbar<TData>({ tableData, table, tableName, columnVisibility, columnOrder, applyColumns, onReorderColumns, handleApplyQuickView, handleApplyCustomSearch, resolvedOptions, t }: {
    tableData: { quickViews: import("./types").DataTableQuickView[]; exportUrl?: string | null; columns: DataTableColumnDef[] };
    table: TanStackTable<TData>; tableName: string;
    columnVisibility: VisibilityState; columnOrder: ColumnOrderState;
    applyColumns: (columnIds: string[]) => void; onReorderColumns: (order: ColumnOrderState) => void;
    handleApplyQuickView: (params: Record<string, unknown>) => void;
    handleApplyCustomSearch: (search: string) => void;
    resolvedOptions: DataTableOptions; t: DataTableTranslations;
}) {
    return (
        <div className="flex items-center gap-2">
            {(resolvedOptions.quickViews || resolvedOptions.customQuickViews) && (
                <DataTableQuickViews quickViews={resolvedOptions.quickViews ? tableData.quickViews : []}
                    tableName={tableName} columnVisibility={columnVisibility} columnOrder={columnOrder}
                    allColumns={tableData.columns} onSelect={handleApplyQuickView}
                    onApplyCustom={handleApplyCustomSearch} onApplyColumns={applyColumns}
                    onApplyColumnOrder={onReorderColumns} enableCustom={resolvedOptions.customQuickViews} t={t} />
            )}
            {resolvedOptions.exports && tableData.exportUrl && (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="h-8 gap-1.5"><Download className="h-3.5 w-3.5" /><span className="hidden sm:inline">{t.export}</span></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>{t.exportFormat}</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <a href={buildExportUrl(tableData.exportUrl, "xlsx", table.getVisibleLeafColumns().filter((c) => c.getCanHide()).map((c) => c.id))}>
                                <FileSpreadsheet className="mr-2 h-4 w-4" />Excel (.xlsx)</a>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <a href={buildExportUrl(tableData.exportUrl, "csv", table.getVisibleLeafColumns().filter((c) => c.getCanHide()).map((c) => c.id))}>
                                <FileText className="mr-2 h-4 w-4" />CSV (.csv)</a>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <a href={buildExportUrl(tableData.exportUrl, "pdf", table.getVisibleLeafColumns().filter((c) => c.getCanHide()).map((c) => c.id))}>
                                <FileDown className="mr-2 h-4 w-4" />PDF (.pdf)</a>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )}
            {resolvedOptions.printable && (
                <Button variant="outline" size="sm" className="h-8 gap-1.5" onClick={() => window.print()}>
                    <Printer className="h-3.5 w-3.5" /><span className="hidden sm:inline">{t.print}</span>
                </Button>
            )}
            {(resolvedOptions.columnVisibility || resolvedOptions.columnOrdering) && (
                <ColumnsDropdown table={table} tableColumns={tableData.columns} columnOrder={columnOrder}
                    onReorder={onReorderColumns} showVisibility={resolvedOptions.columnVisibility}
                    showOrdering={resolvedOptions.columnOrdering} t={t} />
            )}
        </div>
    );
}

function ColumnsDropdown<TData>({ table, tableColumns, columnOrder, onReorder, showVisibility, showOrdering, t }: {
    table: TanStackTable<TData>; tableColumns: DataTableColumnDef[];
    columnOrder: ColumnOrderState; onReorder: (order: ColumnOrderState) => void;
    showVisibility: boolean; showOrdering: boolean; t: DataTableTranslations;
}) {
    const dragItem = useRef<string | null>(null);
    const dragOverRef = useRef<string | null>(null);
    const [dragging, setDragging] = useState<string | null>(null);
    const [dragOverId, setDragOverId] = useState<string | null>(null);
    const [reordering, setReordering] = useState(false);
    const isReorderActive = reordering && showOrdering;

    const handleDragStart = useCallback((columnId: string) => { dragItem.current = columnId; setDragging(columnId); }, []);
    const handleDragEnd = useCallback(() => {
        const from = dragItem.current; const to = dragOverRef.current;
        if (from && to && from !== to) {
            const newOrder = [...columnOrder]; const fromIdx = newOrder.indexOf(from);
            newOrder.splice(fromIdx, 1); const toIdx = newOrder.indexOf(to);
            if (toIdx !== -1) { newOrder.splice(toIdx, 0, from); onReorder(newOrder); }
        }
        dragItem.current = null; dragOverRef.current = null; setDragging(null); setDragOverId(null);
    }, [columnOrder, onReorder]);

    const hideable = table.getAllLeafColumns().filter((c) => c.getCanHide());
    const colDefMap = new Map(tableColumns.map((c) => [c.id, c]));
    const orderedHideable = useMemo(() => {
        if (!showOrdering) return hideable;
        return [...hideable].sort((a, b) => {
            const ai = columnOrder.indexOf(a.id); const bi = columnOrder.indexOf(b.id);
            return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
        });
    }, [hideable, columnOrder, showOrdering]);

    const ungrouped = orderedHideable.filter((c) => !colDefMap.get(c.id)?.group);
    const groups = new Map<string, typeof hideable>();
    for (const col of orderedHideable) {
        const g = colDefMap.get(col.id)?.group;
        if (g) { if (!groups.has(g)) groups.set(g, []); groups.get(g)!.push(col); }
    }

    function renderItem(column: ReturnType<TanStackTable<TData>["getAllLeafColumns"]>[number]) {
        const isOver = dragOverId === column.id && dragging !== column.id;
        return (
            <div key={column.id} className={cn("flex items-center gap-1 rounded-sm px-2 py-1.5 text-sm",
                dragging === column.id && "opacity-40", isOver && "border-t-2 border-t-primary")}
                draggable={isReorderActive}
                onDragStart={() => handleDragStart(column.id)}
                onDragOver={(e) => { e.preventDefault(); dragOverRef.current = column.id; setDragOverId(column.id); }}
                onDragEnd={handleDragEnd}>
                {isReorderActive && <GripVertical className="h-3.5 w-3.5 shrink-0 cursor-grab text-muted-foreground/50" />}
                {showVisibility ? (
                    <label className="flex flex-1 cursor-pointer items-center gap-2">
                        <Checkbox checked={column.getIsVisible()} onCheckedChange={(value) => column.toggleVisibility(!!value)} />
                        <span className="select-none">{column.columnDef.header as string}</span>
                    </label>
                ) : <span className="flex-1 select-none">{column.columnDef.header as string}</span>}
            </div>
        );
    }

    return (
        <DropdownMenu onOpenChange={(open) => { if (!open) { setReordering(false); setDragging(null); setDragOverId(null); } }}>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-1.5"><SlidersHorizontal className="h-3.5 w-3.5" /><span className="hidden sm:inline">{t.columns}</span></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="max-h-[400px] w-60 overflow-y-auto">
                <div className="flex items-center justify-between px-2 py-1.5">
                    <span className="text-sm font-semibold">{t.columns}</span>
                    {showOrdering && (
                        <Button variant="ghost" size="sm" className="h-6 px-2 text-xs"
                            onPointerDown={(e) => e.stopPropagation()}
                            onClick={(e) => { e.preventDefault(); setReordering((r) => !r); }}>
                            {reordering ? t.done : t.reorder}
                        </Button>
                    )}
                </div>
                <DropdownMenuSeparator />
                {ungrouped.map((column) => renderItem(column))}
                {[...groups.entries()].map(([group, cols]) => (
                    <DropdownMenuSub key={group}>
                        <DropdownMenuSubTrigger className="flex-row-reverse gap-2 justify-end [&_svg]:ml-0 [&_svg]:rotate-180">{group}</DropdownMenuSubTrigger>
                        <DropdownMenuSubContent>{cols.map((column) => renderItem(column))}</DropdownMenuSubContent>
                    </DropdownMenuSub>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

const TYPE_ICON_MAP: Record<string, FilterColumn["icon"]> = {
    text: Type, number: Hash, date: Calendar, option: CircleDot, multiOption: List,
    boolean: ToggleLeft, image: ImageIcon, badge: Tag, currency: DollarSign,
    percentage: Percent, link: LinkIcon, email: Mail, phone: Phone,
};

function buildFilterColumns(columns: DataTableColumnDef[]): FilterColumn[] {
    return columns.filter((col) => col.filterable).map((col) => {
        const type = col.type === "multiOption" ? "option" as const
            : (col.type === "currency" || col.type === "percentage") ? "number" as const
            : (col.type === "link" || col.type === "email" || col.type === "phone") ? "text" as const
            : col.type as FilterColumn["type"];
        return {
            id: col.id, label: col.label, type, icon: TYPE_ICON_MAP[col.type],
            ...(col.options ? { options: col.options } : {}),
            ...(col.searchThreshold != null ? { searchThreshold: col.searchThreshold } : {}),
        };
    });
}

function SkeletonRows({ count, colCount }: { count: number; colCount: number }) {
    return (<>{Array.from({ length: count }).map((_, i) => (
        <TableRow key={`skeleton-${i}`}>{Array.from({ length: colCount }).map((_, j) => (
            <TableCell key={`skeleton-${i}-${j}`} className="py-2.5"><Skeleton className="h-4 w-full rounded" /></TableCell>
        ))}</TableRow>
    ))}</>);
}

/** Hook for responsive column collapse based on viewport width */
function useResponsiveColumns(columns: DataTableColumnDef[]): Set<string> {
    const [hiddenCols, setHiddenCols] = useState<Set<string>>(new Set());
    useEffect(() => {
        const priorityCols = columns.filter((c) => c.responsivePriority != null);
        if (priorityCols.length === 0) return;
        function update() {
            const width = window.innerWidth;
            const hidden = new Set<string>();
            for (const col of priorityCols) {
                const threshold = 640 + ((col.responsivePriority ?? 0) - 1) * 128;
                if (width < threshold) hidden.add(col.id);
            }
            setHiddenCols(hidden);
        }
        update();
        window.addEventListener("resize", update);
        return () => window.removeEventListener("resize", update);
    }, [columns]);
    return hiddenCols;
}

// ─── Main DataTable component ───────────────────────────────────────────────

function DataTableInner<TData extends object>({
    className, tableData, tableName, prefix, actions, bulkActions,
    renderCell, renderHeader, renderFooterCell, renderFilter,
    rowClassName, rowDataAttributes, groupClassName,
    options: optionsOverride, translations: translationsOverride,
    onRowClick, rowLink, emptyState, debounceMs, partialReloadKey,
    onInlineEdit, realtimeChannel, realtimeEvent = ".updated",
    renderDetailRow, selectionMode = "checkbox", slots,
}: DataTableProps<TData>) {
    const t = useMemo<DataTableTranslations>(() => ({ ...defaultTranslations, ...translationsOverride }), [translationsOverride]);

    const resolvedOptions = useMemo<DataTableOptions>(() => ({
        quickViews: true, customQuickViews: true, exports: true, filters: true,
        columnVisibility: true, columnOrdering: true, columnResizing: false,
        stickyHeader: false, globalSearch: false, loading: true,
        keyboardNavigation: false, printable: false, ...optionsOverride,
    }), [optionsOverride]);

    const config = tableData.config;
    const hasBulkActions = bulkActions && bulkActions.length > 0;
    const isClickable = !!onRowClick || !!rowLink;
    const hasDetailRows = !!renderDetailRow && (config?.detailRowEnabled ?? false);

    // Responsive column collapse
    const responsiveHiddenCols = useResponsiveColumns(tableData.columns);

    // Inertia loading state
    const [isNavigating, setIsNavigating] = useState(false);
    useEffect(() => {
        if (!resolvedOptions.loading) return;
        const startHandler = () => setIsNavigating(true);
        const finishHandler = () => setIsNavigating(false);
        router.on("start", startHandler);
        router.on("finish", finishHandler);
        return () => {
            router.off("start", startHandler);
            router.off("finish", finishHandler);
        };
    }, [resolvedOptions.loading]);

    // Real-time updates via Laravel Echo
    useEffect(() => {
        if (!realtimeChannel) return;
        const Echo = (window as unknown as { Echo?: { channel: (name: string) => { listen: (event: string, cb: () => void) => { stopListening: (event: string) => void } } } }).Echo;
        if (!Echo) return;
        const channel = Echo.channel(realtimeChannel);
        const handler = () => { router.reload({ only: partialReloadKey ? [partialReloadKey] : undefined }); };
        channel.listen(realtimeEvent, handler);
        return () => { channel.stopListening(realtimeEvent); };
    }, [realtimeChannel, realtimeEvent, partialReloadKey]);

    // Auto-refresh polling
    useEffect(() => {
        const interval = config?.pollingInterval ?? 0;
        if (interval <= 0) return;
        const timer = setInterval(() => {
            router.reload({ only: partialReloadKey ? [partialReloadKey] : undefined });
        }, interval * 1000);
        return () => clearInterval(timer);
    }, [config?.pollingInterval, partialReloadKey]);

    // Deferred loading
    const [deferLoaded, setDeferLoaded] = useState(!config?.deferLoading);
    useEffect(() => {
        if (config?.deferLoading && !deferLoaded) {
            router.reload({ only: partialReloadKey ? [partialReloadKey] : undefined,
                onSuccess: () => setDeferLoaded(true) });
        }
    }, [config?.deferLoading, deferLoaded, partialReloadKey]);

    const [bulkConfirm, setBulkConfirm] = useState<{ action: (typeof bulkActions extends (infer U)[] ? U : never); opts: DataTableConfirmOptions; rows: TData[] } | null>(null);
    const [serverSelectAll, setServerSelectAll] = useState(false);
    const [serverSelectedIds, setServerSelectedIds] = useState<unknown[]>([]);
    const lastSelectedIndex = useRef<number | null>(null);
    const [focusedRowIndex, setFocusedRowIndex] = useState<number | null>(null);
    const tableBodyRef = useRef<HTMLTableSectionElement>(null);
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
    const [showTrashed, setShowTrashed] = useState(false);

    const RESIZE_KEY = `dt-resize-${tableName}`;
    const [columnSizing, setColumnSizing] = useState<Record<string, number>>(() => {
        if (!resolvedOptions.columnResizing) return {};
        const stored = safeGetItem(RESIZE_KEY);
        if (stored) { try { return JSON.parse(stored); } catch { /* fall through */ } }
        return {};
    });

    useEffect(() => {
        if (resolvedOptions.columnResizing && Object.keys(columnSizing).length > 0)
            safeSetItem(RESIZE_KEY, JSON.stringify(columnSizing));
    }, [columnSizing, resolvedOptions.columnResizing, RESIZE_KEY]);

    // Persist state to localStorage
    const STATE_KEY = `dt-state-${tableName}`;
    useEffect(() => {
        if (!config?.persistState) return;
        safeSetItem(STATE_KEY, JSON.stringify({
            filters: tableData.meta.filters, sorts: tableData.meta.sorts, perPage: tableData.meta.perPage,
        }));
    }, [config?.persistState, tableData.meta.filters, tableData.meta.sorts, tableData.meta.perPage, STATE_KEY]);

    // Merge enum options into columns
    const mergedColumns = useMemo(() => {
        if (!tableData.enumOptions) return tableData.columns;
        return tableData.columns.map((col) =>
            tableData.enumOptions?.[col.id] ? { ...col, options: tableData.enumOptions[col.id] } : col);
    }, [tableData.columns, tableData.enumOptions]);

    const columnDefs = useMemo<ColumnDef<TData>[]>(() => {
        function makeLeafCol(col: DataTableColumnDef): ColumnDef<TData> {
            return {
                id: col.id, accessorKey: col.id, header: col.label, enableHiding: true,
                enableResizing: resolvedOptions.columnResizing, size: columnSizing[col.id] || undefined,
                meta: { type: col.type, group: col.group ?? null, editable: col.editable, currency: col.currency, locale: col.locale, toggleable: col.toggleable } satisfies ColumnMeta,
                cell: ({ row }) => {
                    const value = row.getValue(col.id);

                    // Boolean toggle switch
                    if (col.toggleable && tableData.toggleUrl) {
                        return <ToggleCell value={!!value} row={row.original as Record<string, unknown>}
                            columnId={col.id} toggleUrl={tableData.toggleUrl} />;
                    }

                    // Inline editing
                    if (col.editable && onInlineEdit) {
                        return <InlineEditCell value={value} columnId={col.id} columnType={col.type}
                            onSave={(newVal) => onInlineEdit(row.original, col.id, newVal)} t={t} />;
                    }

                    if (renderCell) { const custom = renderCell(col.id, value, row.original); if (custom !== undefined) return custom; }
                    if (value === null || value === undefined) return <span className="text-muted-foreground">—</span>;

                    if (col.type === "image" && typeof value === "string") {
                        return <img src={value} alt={col.label} className="h-8 w-8 rounded-md object-cover" />;
                    }
                    if (col.type === "badge") {
                        const strValue = String(value);
                        const opt = col.options?.find((o) => o.value === strValue);
                        return <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                            BADGE_VARIANTS[opt?.variant ?? "default"] ?? BADGE_VARIANTS.default)}>{opt?.label ?? strValue}</span>;
                    }
                    if (col.type === "currency" && (typeof value === "number" || typeof value === "string")) {
                        const numValue = typeof value === "string" ? parseFloat(value) : value;
                        if (!isNaN(numValue)) {
                            try { return <span className="tabular-nums">{numValue.toLocaleString(col.locale ?? undefined, { style: "currency", currency: col.currency ?? "USD" })}</span>; }
                            catch { return <span className="tabular-nums">{numValue.toLocaleString()}</span>; }
                        }
                    }
                    if (col.type === "percentage" && (typeof value === "number" || typeof value === "string")) {
                        const numValue = typeof value === "string" ? parseFloat(value) : value;
                        if (!isNaN(numValue)) return <span className="tabular-nums">{numValue.toLocaleString(col.locale ?? undefined, { style: "percent", minimumFractionDigits: 0, maximumFractionDigits: 2 })}</span>;
                    }
                    if (col.type === "link" && typeof value === "string") {
                        return <a href={value} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline" onClick={(e) => e.stopPropagation()}>
                            <span className="max-w-[200px] truncate">{value.replace(/^https?:\/\//, "")}</span><ExternalLink className="h-3 w-3 shrink-0" /></a>;
                    }
                    if (col.type === "email" && typeof value === "string") {
                        return <a href={`mailto:${value}`} className="text-primary hover:underline" onClick={(e) => e.stopPropagation()}>{value}</a>;
                    }
                    if (col.type === "phone" && typeof value === "string") {
                        return <a href={`tel:${value}`} className="text-primary hover:underline" onClick={(e) => e.stopPropagation()}>{value}</a>;
                    }
                    if (typeof value === "boolean") {
                        return value ? <Check className="h-4 w-4 text-emerald-600" />
                            : <X className="h-4 w-4 text-muted-foreground/40" />;
                    }
                    if (col.type === "number" && typeof value === "number") return <span className="tabular-nums">{value.toLocaleString()}</span>;
                    return String(value);
                },
            };
        }

        const result: ColumnDef<TData>[] = [];

        // Detail row expand column
        if (hasDetailRows) {
            result.push({
                id: "_expand", header: "", enableHiding: false, enableResizing: false, size: 36,
                cell: ({ row }) => {
                    const rowId = String((row.original as Record<string, unknown>).id ?? row.index);
                    const isExpanded = expandedRows.has(rowId);
                    return (
                        <Button variant="ghost" size="icon" className="h-6 w-6"
                            onClick={(e) => { e.stopPropagation(); setExpandedRows((prev) => {
                                const next = new Set(prev); if (next.has(rowId)) next.delete(rowId); else next.add(rowId); return next;
                            }); }} aria-label={isExpanded ? t.collapse : t.expand}>
                            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        </Button>
                    );
                },
            });
        }

        // Selection column (checkbox or radio)
        if (hasBulkActions || selectionMode === "radio") {
            if (selectionMode === "radio") {
                result.push({
                    id: "_select", header: "", enableHiding: false, enableResizing: false, size: 40,
                    cell: ({ row, table: tbl }) => (
                        <input type="radio" name={`dt-radio-${tableName}`} checked={row.getIsSelected()}
                            onChange={() => { tbl.toggleAllRowsSelected(false); row.toggleSelected(true); }}
                            className="h-4 w-4 accent-primary" aria-label={t.selectRow} />
                    ),
                });
            } else {
                result.push({
                    id: "_select", enableHiding: false, enableResizing: false, size: 40,
                    header: ({ table: tbl }) => (
                        <Checkbox checked={tbl.getIsAllPageRowsSelected() || (tbl.getIsSomePageRowsSelected() && "indeterminate")}
                            onCheckedChange={(value) => tbl.toggleAllPageRowsSelected(!!value)} aria-label={t.selectAll} />
                    ),
                    cell: ({ row }) => (
                        <Checkbox checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(!!value)} aria-label={t.selectRow} />
                    ),
                });
            }
        }

        const processedGroups = new Set<string>();
        for (const col of mergedColumns) {
            if (responsiveHiddenCols.has(col.id)) continue;
            if (!col.group) { result.push(makeLeafCol(col)); }
            else if (!processedGroups.has(col.group)) {
                processedGroups.add(col.group);
                const groupCols = mergedColumns.filter((c) => c.group === col.group && !responsiveHiddenCols.has(c.id));
                result.push({ id: `_group_${col.group}`, header: col.group, columns: groupCols.map(makeLeafCol) });
            }
        }

        if (actions && actions.length > 0) {
            result.push({ id: "_actions", header: "", enableHiding: false, enableResizing: false, size: 48,
                cell: ({ row }) => <DataTableRowActions row={row.original} actions={actions} t={t} /> });
        }

        return result;
    }, [mergedColumns, actions, hasBulkActions, renderCell, t, onInlineEdit, resolvedOptions.columnResizing, columnSizing, hasDetailRows, expandedRows, tableName, selectionMode, responsiveHiddenCols, tableData.toggleUrl]);

    const { table, meta, columnVisibility, columnOrder, setColumnOrder, rowSelection, setRowSelection,
        applyColumns, handleSort, handlePageChange, handlePerPageChange, handleCursorChange,
        handleGlobalSearch, handleApplyQuickView, handleApplyCustomSearch,
    } = useDataTable<TData>({ tableData, tableName, columnDefs, prefix, debounceMs, partialReloadKey,
        columnResizing: resolvedOptions.columnResizing, columnSizing, onColumnSizingChange: setColumnSizing });

    const filterColumns = useMemo(() => buildFilterColumns(mergedColumns), [mergedColumns]);
    const selectedRows = useMemo(() => table.getFilteredSelectedRowModel().rows.map((r) => r.original),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [rowSelection, tableData.data]);

    const searchKey = prefix ? `${prefix}_search` : "search";
    const initialSearch = typeof window !== "undefined" ? new URL(window.location.href).searchParams.get(searchKey) ?? "" : "";
    const [globalSearchValue, setGlobalSearchValue] = useState(initialSearch);

    const handleGlobalSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setGlobalSearchValue(e.target.value); handleGlobalSearch(e.target.value);
    }, [handleGlobalSearch]);

    const handleBulkClick = useCallback((action: NonNullable<typeof bulkActions>[number]) => {
        if (action.confirm) {
            const opts: DataTableConfirmOptions = typeof action.confirm === "object" ? action.confirm : {};
            setBulkConfirm({ action, opts, rows: serverSelectAll ? serverSelectedIds as TData[] : selectedRows });
        } else { action.onClick(serverSelectAll ? serverSelectedIds as TData[] : selectedRows); }
    }, [serverSelectAll, serverSelectedIds, selectedRows]);

    const handleRowInteraction = useCallback((row: TData, e: React.MouseEvent) => {
        if (rowLink) { const href = rowLink(row); if (e.metaKey || e.ctrlKey) window.open(href, "_blank"); else window.location.href = href; }
        else if (onRowClick) onRowClick(row);
    }, [rowLink, onRowClick]);

    const handleRowCheckboxClick = useCallback((rowIndex: number, e: React.MouseEvent) => {
        if (e.shiftKey && lastSelectedIndex.current !== null && lastSelectedIndex.current !== rowIndex) {
            const start = Math.min(lastSelectedIndex.current, rowIndex);
            const end = Math.max(lastSelectedIndex.current, rowIndex);
            const newSelection: Record<string, boolean> = { ...rowSelection };
            for (let i = start; i <= end; i++) newSelection[String(i)] = true;
            setRowSelection(newSelection);
        }
        lastSelectedIndex.current = rowIndex;
    }, [rowSelection, setRowSelection]);

    const handleSelectAllMatching = useCallback(async () => {
        if (!tableData.selectAllUrl) return;
        try {
            const currentParams = new URL(window.location.href).searchParams;
            const url = new URL(tableData.selectAllUrl, window.location.origin);
            for (const [key, value] of currentParams.entries()) url.searchParams.set(key, value);
            const response = await fetch(url.toString());
            const data = await response.json();
            setServerSelectAll(true); setServerSelectedIds(data.ids ?? []);
            const allSelection: Record<string, boolean> = {};
            table.getRowModel().rows.forEach((_, i) => { allSelection[String(i)] = true; });
            setRowSelection(allSelection);
        } catch { /* silently fail */ }
    }, [tableData.selectAllUrl, table, setRowSelection]);

    const clearServerSelectAll = useCallback(() => { setServerSelectAll(false); setServerSelectedIds([]); setRowSelection({}); }, [setRowSelection]);

    const handleTableKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (!resolvedOptions.keyboardNavigation) return;
        const rows = table.getRowModel().rows;
        if (rows.length === 0) return;
        if (e.key === "ArrowDown") { e.preventDefault(); setFocusedRowIndex((prev) => prev === null ? 0 : Math.min(prev + 1, rows.length - 1)); }
        else if (e.key === "ArrowUp") { e.preventDefault(); setFocusedRowIndex((prev) => prev === null ? 0 : Math.max(prev - 1, 0)); }
        else if (e.key === "Enter" && focusedRowIndex !== null) { e.preventDefault(); const row = rows[focusedRowIndex]; if (row) handleRowInteraction(row.original, e as unknown as React.MouseEvent); }
        else if (e.key === "Escape") { setFocusedRowIndex(null); setRowSelection({}); }
        else if (e.key === " " && focusedRowIndex !== null && hasBulkActions) { e.preventDefault(); const row = rows[focusedRowIndex]; if (row) row.toggleSelected(!row.getIsSelected()); }
    }, [resolvedOptions.keyboardNavigation, table, focusedRowIndex, handleRowInteraction, setRowSelection, hasBulkActions]);

    useEffect(() => {
        if (focusedRowIndex === null || !tableBodyRef.current) return;
        tableBodyRef.current.querySelectorAll("tr")[focusedRowIndex]?.scrollIntoView({ block: "nearest" });
    }, [focusedRowIndex]);

    // Soft deletes toggle handler
    const handleTrashedToggle = useCallback(() => {
        const newValue = !showTrashed;
        setShowTrashed(newValue);
        const p = prefix ? `${prefix}_` : "";
        const currentUrl = new URL(window.location.href);
        if (newValue) currentUrl.searchParams.set(`${p}with_trashed`, "1");
        else currentUrl.searchParams.delete(`${p}with_trashed`);
        router.get(currentUrl.pathname + "?" + currentUrl.searchParams.toString(), {}, { preserveScroll: true });
    }, [showTrashed, prefix]);

    // Conditional rules
    const rules = config?.rules ?? [];

    const getRowRuleClass = useCallback((row: TData): string => {
        if (rules.length === 0) return "";
        return rules.filter((rule) => {
            const value = (row as Record<string, unknown>)[rule.column];
            return evaluateRule(rule, value) && rule.row?.class;
        }).map((r) => r.row!.class!).join(" ");
    }, [rules]);

    const getCellRuleClass = useCallback((row: TData, columnId: string): string => {
        if (rules.length === 0) return "";
        return rules.filter((rule) => {
            if (rule.column !== columnId) return false;
            const value = (row as Record<string, unknown>)[rule.column];
            return evaluateRule(rule, value) && rule.cell?.class;
        }).map((r) => r.cell!.class!).join(" ");
    }, [rules]);

    const toolbarProps = { tableData, table, tableName, columnVisibility, columnOrder, applyColumns,
        onReorderColumns: setColumnOrder, handleApplyQuickView, handleApplyCustomSearch, resolvedOptions, t };

    const activeFilterColumnIds = useMemo(() => new Set(Object.keys(meta.filters as Record<string, unknown>)), [meta.filters]);

    const summaryLabels: Record<string, string> = useMemo(() => ({
        sum: t.summarySum, avg: t.summaryAvg, min: t.summaryMin, max: t.summaryMax, count: t.summaryCount
    }), [t.summarySum, t.summaryAvg, t.summaryMin, t.summaryMax, t.summaryCount]);

    const visibleLeafColumns = useMemo(() => [
        ...table.getLeftVisibleLeafColumns(),
        ...table.getCenterVisibleLeafColumns(),
        ...table.getRightVisibleLeafColumns(),
    ], [table.getLeftVisibleLeafColumns(), table.getCenterVisibleLeafColumns(), table.getRightVisibleLeafColumns()]);

    return (
        <div className="space-y-3 dt-root">
            {slots?.beforeTable}

            {/* ── Toolbar ── */}
            <div className="flex items-center justify-between gap-3 print:hidden">
                <div className="flex flex-1 items-center gap-2">
                    {resolvedOptions.globalSearch && (
                        <div className="relative w-56 lg:w-64">
                            <Search className="absolute left-2.5 top-2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder={t.search} value={globalSearchValue} onChange={handleGlobalSearchChange} className="h-8 pl-8 text-sm" />
                        </div>
                    )}
                    {resolvedOptions.filters && (
                        <Filters columns={filterColumns} serverFilters={meta.filters as Record<string, unknown>} t={t}
                            prefix={prefix} debounceMs={debounceMs} partialReloadKey={partialReloadKey} renderFilter={renderFilter} />
                    )}
                    {config?.softDeletesEnabled && (
                        <Button variant={showTrashed ? "secondary" : "outline"} size="sm" className="h-8 gap-1.5" onClick={handleTrashedToggle}>
                            {showTrashed ? <EyeOff className="h-3.5 w-3.5" /> : <Trash2 className="h-3.5 w-3.5" />}
                            <span className="hidden sm:inline">{showTrashed ? t.hideTrashed : t.showTrashed}</span>
                        </Button>
                    )}
                </div>
                {slots?.toolbar ?? (
                    <>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 md:hidden"><EllipsisVertical className="h-4 w-4" /></Button>
                            </PopoverTrigger>
                            <PopoverContent align="end" className="flex w-auto flex-col gap-2 p-2"><DataTableToolbar {...toolbarProps} /></PopoverContent>
                        </Popover>
                        <div className="hidden items-center gap-2 md:flex"><DataTableToolbar {...toolbarProps} /></div>
                    </>
                )}
            </div>

            {/* ── Bulk actions bar ── */}
            {hasBulkActions && selectedRows.length > 0 && (
                <div className="flex items-center gap-2 rounded-lg border bg-muted/40 px-3 py-2 text-sm print:hidden">
                    <span className="font-medium tabular-nums">{serverSelectAll ? t.selected(serverSelectedIds.length) : t.selected(selectedRows.length)}</span>
                    {!serverSelectAll && tableData.selectAllUrl && meta.total > tableData.data.length && table.getIsAllPageRowsSelected() && (
                        <Button variant="link" size="sm" className="h-auto p-0 text-xs" onClick={handleSelectAllMatching}>{t.selectAllMatching(meta.total)}</Button>
                    )}
                    {serverSelectAll && (
                        <Button variant="link" size="sm" className="h-auto p-0 text-xs" onClick={clearServerSelectAll}>{t.clearSelection}</Button>
                    )}
                    <div className="ml-auto flex items-center gap-1.5">
                        {bulkActions.map((action) => {
                            const Icon = action.icon;
                            return (
                                <Button key={action.id} variant={action.variant === "destructive" ? "destructive" : "outline"}
                                    size="sm" className="h-7 text-xs" disabled={action.disabled?.(selectedRows) ?? false}
                                    onClick={() => handleBulkClick(action)}>
                                    {Icon && <Icon className="mr-1 h-3.5 w-3.5" />}{action.label}
                                </Button>
                            );
                        })}
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={clearServerSelectAll}><X className="h-3.5 w-3.5" /></Button>
                    </div>
                </div>
            )}

            {/* ── Loading indicator ── */}
            {resolvedOptions.loading && isNavigating && (
                <div className="flex items-center justify-center gap-2 py-1 text-xs text-muted-foreground print:hidden">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />{t.loading}
                </div>
            )}

            {/* ── Deferred loading placeholder ── */}
            {config?.deferLoading && !deferLoaded && (
                <div className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin" />{t.loading}
                </div>
            )}

            {/* ── Table ── */}
            {(!config?.deferLoading || deferLoaded) && (
                <div className={cn("rounded-lg border overflow-hidden", className)}
                    tabIndex={resolvedOptions.keyboardNavigation ? 0 : undefined}
                    onKeyDown={resolvedOptions.keyboardNavigation ? handleTableKeyDown : undefined}>
                    <div className="overflow-x-auto">
                        <Table style={resolvedOptions.columnResizing ? { width: table.getCenterTotalSize() } : undefined}>
                            <TableHeader className={cn(resolvedOptions.stickyHeader && "sticky top-0 z-10 bg-background")}>
                                {table.getHeaderGroups().map((headerGroup, groupIdx) => {
                                    const isGroupRow = groupIdx < table.getHeaderGroups().length - 1;
                                    return (
                                        <TableRow key={headerGroup.id} className={cn(isGroupRow && "border-b-0")}>
                                            {headerGroup.headers.map((header) => {
                                                if (isGroupRow) {
                                                    const pin = getColumnPinningProps(header.column);
                                                    const isActualGroup = !header.isPlaceholder && header.colSpan > 1;
                                                    return (
                                                        <TableHead key={header.id} colSpan={header.colSpan} style={pin.style}
                                                            className={cn("h-8",
                                                                isActualGroup && "text-center text-[11px] font-semibold uppercase tracking-wider text-muted-foreground bg-muted/30 border-b",
                                                                isActualGroup && groupClassName?.[header.column.columnDef.header as string],
                                                                pin.className)}>
                                                            {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                                        </TableHead>
                                                    );
                                                }
                                                const colDef = mergedColumns.find((c) => c.id === header.column.id);
                                                const isNumber = colDef?.type === "number" || colDef?.type === "currency" || colDef?.type === "percentage";
                                                const leafGroup = colDef?.group;
                                                const pin = getColumnPinningProps(header.column);
                                                const hasActiveFilter = colDef ? activeFilterColumnIds.has(colDef.id) : false;
                                                return (
                                                    <TableHead key={header.id} colSpan={header.colSpan}
                                                        style={{ ...pin.style, ...(resolvedOptions.columnResizing ? { width: header.getSize() } : {}) }}
                                                        className={cn("h-9", isNumber && "text-right",
                                                            leafGroup && groupClassName?.[leafGroup],
                                                            pin.className, "relative")}>
                                                        {header.isPlaceholder ? null : colDef?.sortable ? (
                                                            <div className="flex items-center gap-1">
                                                                <DataTableColumnHeader label={colDef.label} sortable={colDef.sortable} sorts={meta.sorts}
                                                                    columnId={colDef.id} onSort={handleSort} align={isNumber ? "right" : "left"}>
                                                                    {renderHeader?.[colDef.id]}
                                                                </DataTableColumnHeader>
                                                                {hasActiveFilter && <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />}
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center gap-1">
                                                                {renderHeader?.[header.column.id] ?? flexRender(header.column.columnDef.header, header.getContext())}
                                                                {hasActiveFilter && <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />}
                                                            </div>
                                                        )}
                                                        {resolvedOptions.columnResizing && header.column.getCanResize() && (
                                                            <div onMouseDown={header.getResizeHandler()} onTouchStart={header.getResizeHandler()}
                                                                className={cn("absolute right-0 top-0 h-full w-1 cursor-col-resize select-none touch-none",
                                                                    header.column.getIsResizing() ? "bg-primary" : "hover:bg-border")} />
                                                        )}
                                                    </TableHead>
                                                );
                                            })}
                                        </TableRow>
                                    );
                                })}
                            </TableHeader>
                            <TableBody ref={tableBodyRef}>
                                {resolvedOptions.loading && isNavigating ? (
                                    <SkeletonRows count={Math.min(meta.perPage, 10)} colCount={table.getVisibleLeafColumns().length} />
                                ) : table.getRowModel().rows.length > 0 ? (
                                    table.getRowModel().rows.map((row, index) => {
                                        const dataAttrs = rowDataAttributes?.(row.original) ?? {};
                                        const rowRuleClass = getRowRuleClass(row.original);
                                        const rowId = String((row.original as Record<string, unknown>).id ?? row.index);
                                        const isExpanded = hasDetailRows && expandedRows.has(rowId);
                                        return (
                                            <>{/* keyed fragment */}
                                                <TableRow key={row.id} data-state={row.getIsSelected() ? "selected" : undefined} {...dataAttrs}
                                                    className={cn(
                                                        "transition-colors",
                                                        row.getIsSelected() && "bg-primary/5",
                                                        isClickable && "cursor-pointer",
                                                        focusedRowIndex === index && "ring-2 ring-inset ring-primary",
                                                        rowRuleClass, rowClassName?.(row.original))}
                                                    onClick={(e) => {
                                                        if (hasBulkActions && e.shiftKey) { handleRowCheckboxClick(index, e); return; }
                                                        if (isClickable) {
                                                            const target = e.target as HTMLElement;
                                                            if (target.closest("button, a, input, [role='checkbox'], [role='switch'], [data-slot='clear']")) return;
                                                            handleRowInteraction(row.original, e);
                                                        }
                                                    }}>
                                                    {row.getVisibleCells().map((cell) => {
                                                        const pin = getColumnPinningProps(cell.column);
                                                        const cellMeta = cell.column.columnDef.meta as ColumnMeta | undefined;
                                                        const cellRuleClass = getCellRuleClass(row.original, cell.column.id);
                                                        return (
                                                            <TableCell key={cell.id}
                                                                style={{ ...pin.style, ...(resolvedOptions.columnResizing ? { width: cell.column.getSize() } : {}) }}
                                                                className={cn(
                                                                    "py-2 whitespace-nowrap",
                                                                    cellMeta?.type === "number" && "text-right",
                                                                    cellMeta?.type === "currency" && "text-right",
                                                                    cellMeta?.type === "percentage" && "text-right",
                                                                    cellMeta?.group && groupClassName?.[cellMeta.group],
                                                                    pin.className, cellRuleClass)}>
                                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                            </TableCell>
                                                        );
                                                    })}
                                                </TableRow>
                                                {isExpanded && renderDetailRow && (
                                                    <TableRow key={`${row.id}-detail`} className="bg-muted/20 hover:bg-muted/30">
                                                        <TableCell colSpan={table.getVisibleLeafColumns().length} className="p-4">
                                                            {renderDetailRow(row.original)}
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </>
                                        );
                                    })
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={table.getVisibleLeafColumns().length} className="h-32 text-center text-muted-foreground">
                                            {emptyState ?? t.noData}
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>

                            {/* Per-page footer */}
                            {tableData.footer && (
                                <TableFooter>
                                    <TableRow className="bg-muted/20 font-medium">
                                        {visibleLeafColumns.map((col) => {
                                            const footerValue = tableData.footer?.[col.id];
                                            const colMeta = col.columnDef.meta as ColumnMeta | undefined;
                                            const isNumber = colMeta?.type === "number" || colMeta?.type === "currency" || colMeta?.type === "percentage";
                                            const group = colMeta?.group;
                                            const pin = getColumnPinningProps(col);
                                            let content: React.ReactNode = null;
                                            if (footerValue !== undefined && footerValue !== null) {
                                                if (renderFooterCell) {
                                                    const custom = renderFooterCell(col.id, footerValue);
                                                    content = custom !== undefined ? custom : (isNumber && typeof footerValue === "number" ? footerValue.toLocaleString() : String(footerValue));
                                                } else { content = isNumber && typeof footerValue === "number" ? footerValue.toLocaleString() : String(footerValue); }
                                            }
                                            return (
                                                <TableCell key={col.id} style={pin.style}
                                                    className={cn("whitespace-nowrap py-2 font-semibold", isNumber && "text-right tabular-nums",
                                                        group && groupClassName?.[group], pin.className)}>
                                                    {content}
                                                </TableCell>
                                            );
                                        })}
                                    </TableRow>
                                </TableFooter>
                            )}

                            {/* Full-dataset summary row */}
                            {tableData.summary && (
                                <TableFooter>
                                    <TableRow className="bg-muted/10 border-t-2">
                                        {visibleLeafColumns.map((col) => {
                                            const summaryValue = tableData.summary?.[col.id];
                                            const colDef = mergedColumns.find((c) => c.id === col.id);
                                            const colMeta = col.columnDef.meta as ColumnMeta | undefined;
                                            const isNumber = colMeta?.type === "number" || colMeta?.type === "currency" || colMeta?.type === "percentage";
                                            const pin = getColumnPinningProps(col);
                                            let content: React.ReactNode = null;
                                            if (summaryValue !== undefined && summaryValue !== null) {
                                                const label = summaryLabels[colDef?.summary ?? ""] ?? "";
                                                const formatted = isNumber && typeof summaryValue === "number" ? summaryValue.toLocaleString() : String(summaryValue);
                                                content = (
                                                    <span className="text-xs">
                                                        <span className="text-muted-foreground">{label} </span>
                                                        <span className="font-semibold tabular-nums">{formatted}</span>
                                                    </span>
                                                );
                                            }
                                            return (
                                                <TableCell key={col.id} style={pin.style}
                                                    className={cn("whitespace-nowrap py-1.5", isNumber && "text-right", pin.className)}>
                                                    {content}
                                                </TableCell>
                                            );
                                        })}
                                    </TableRow>
                                </TableFooter>
                            )}
                        </Table>
                    </div>
                </div>
            )}

            {/* ── Pagination + Auto-refresh ── */}
            <div className="flex items-center justify-between print:hidden">
                <div className="flex-1">
                    {(config?.pollingInterval ?? 0) > 0 && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <RefreshCw className="h-3 w-3 animate-spin" style={{ animationDuration: "3s" }} />
                            {t.autoRefresh} ({config!.pollingInterval}s)
                        </div>
                    )}
                </div>
                <div className="flex-1">
                    {slots?.pagination ?? (
                        <DataTablePagination meta={meta} onPageChange={handlePageChange} onPerPageChange={handlePerPageChange} onCursorChange={handleCursorChange} t={t} />
                    )}
                </div>
            </div>

            {slots?.afterTable}

            {/* ── Bulk action confirmation dialog ── */}
            <Dialog open={!!bulkConfirm} onOpenChange={(open) => { if (!open) setBulkConfirm(null); }}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{bulkConfirm?.opts.title ?? t.confirmTitle}</DialogTitle>
                        <DialogDescription>{bulkConfirm?.opts.description ?? t.confirmDescription}</DialogDescription>
                    </DialogHeader>
                    <DialogFoot>
                        <Button variant="outline" onClick={() => setBulkConfirm(null)}>{bulkConfirm?.opts.cancelLabel ?? t.confirmCancel}</Button>
                        <Button variant={bulkConfirm?.opts.variant ?? bulkConfirm?.action.variant ?? "default"}
                            onClick={() => { if (bulkConfirm) { bulkConfirm.action.onClick(bulkConfirm.rows); setBulkConfirm(null); } }}>
                            {bulkConfirm?.opts.confirmLabel ?? t.confirmAction}
                        </Button>
                    </DialogFoot>
                </DialogContent>
            </Dialog>

            {resolvedOptions.printable && (
                <style>{`@media print { body * { visibility: hidden; } .dt-root, .dt-root * { visibility: visible; } .dt-root { position: absolute; left: 0; top: 0; width: 100%; } .print\\:hidden { display: none !important; } table { border-collapse: collapse; width: 100%; } th, td { border: 1px solid #ddd; padding: 8px; text-align: left; } th { background-color: #f5f5f5; font-weight: bold; } }`}</style>
            )}
        </div>
    );
}

// ─── Exported component with Error Boundary ─────────────────────────────────

export function DataTable<TData extends object>(props: DataTableProps<TData>) {
    return (
        <DataTableErrorBoundary>
            <DataTableInner {...props} />
        </DataTableErrorBoundary>
    );
}
