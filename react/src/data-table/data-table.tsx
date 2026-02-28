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
    AlignJustify,
    ArrowDown,
    ArrowUp,
    Calendar,
    Check,
    ChevronDown,
    ChevronRight,
    CircleDot,
    Clipboard,
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
    HelpCircle,
    Image as ImageIcon,
    Keyboard,
    Link as LinkIcon,
    List,
    Loader2,
    Mail,
    Pencil,
    Percent,
    Phone,
    Pin,
    PinOff,
    Printer,
    Redo2,
    RefreshCw,
    Rows3,
    Search,
    SlidersHorizontal,
    Tag,
    ToggleLeft,
    Trash2,
    Type,
    Undo2,
    Upload,
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
import type { DataTableColumnDef, DataTableConfirmOptions, DataTableDensity, DataTableOptions, DataTableProps, DataTableRule } from "./types";
import { useDataTable } from "./use-data-table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

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

// ─── Density configuration ──────────────────────────────────────────────────

const DENSITY_CLASSES: Record<DataTableDensity, { cell: string; row: string }> = {
    compact: { cell: "py-1 text-xs", row: "h-8" },
    comfortable: { cell: "py-2", row: "" },
    spacious: { cell: "py-3", row: "h-14" },
};

function loadDensity(tableName: string): DataTableDensity {
    const stored = safeGetItem(`dt-density-${tableName}`);
    if (stored === "compact" || stored === "comfortable" || stored === "spacious") return stored;
    return "comfortable";
}

function saveDensity(tableName: string, density: DataTableDensity) {
    safeSetItem(`dt-density-${tableName}`, density);
}

// ─── Search highlighting ────────────────────────────────────────────────────

function highlightText(text: string, query: string): React.ReactNode {
    if (!query || !text) return text;
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const parts = text.split(new RegExp(`(${escaped})`, "gi"));
    if (parts.length === 1) return text;
    return parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase()
            ? <mark key={i} className="bg-yellow-200 dark:bg-yellow-800 rounded-sm px-0.5">{part}</mark>
            : part
    );
}

// ─── Cell copy to clipboard ─────────────────────────────────────────────────

function CopyableCell({ value, children, enabled, t }: { value: unknown; children: React.ReactNode; enabled: boolean; t: DataTableTranslations }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = useCallback(async (e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await navigator.clipboard.writeText(String(value ?? ""));
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch { /* clipboard API may not be available */ }
    }, [value]);

    if (!enabled) return <>{children}</>;

    return (
        <div className="group/copy relative inline-flex items-center gap-1">
            {children}
            <button type="button" onClick={handleCopy}
                className="opacity-0 group-hover/copy:opacity-100 transition-opacity p-0.5 rounded hover:bg-muted"
                title={t.copyToClipboard}>
                {copied ? <Check className="h-3 w-3 text-emerald-600" /> : <Clipboard className="h-3 w-3 text-muted-foreground" />}
            </button>
        </div>
    );
}

// ─── Column header context menu ─────────────────────────────────────────────

function ColumnContextMenu({ columnId, sortable, isPinned, showPinning, onSort, onHide, onPin, t, children }: {
    columnId: string; sortable: boolean; isPinned: false | "left" | "right"; showPinning: boolean;
    onSort: (columnId: string, multi: boolean) => void;
    onHide: (columnId: string) => void;
    onPin: (columnId: string, direction: false | "left" | "right") => void;
    t: DataTableTranslations; children: React.ReactNode;
}) {
    const [open, setOpen] = useState(false);
    const [pos, setPos] = useState({ x: 0, y: 0 });

    const handleContextMenu = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        setPos({ x: e.clientX, y: e.clientY });
        setOpen(true);
    }, []);

    return (
        <div onContextMenu={handleContextMenu}>
            {children}
            {open && (
                <>
                    <div className="fixed inset-0 z-50" onClick={() => setOpen(false)} />
                    <div className="fixed z-50 min-w-[160px] rounded-md border bg-popover p-1 shadow-md"
                        style={{ left: pos.x, top: pos.y }}>
                        {sortable && (
                            <>
                                <button type="button" className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent"
                                    onClick={() => { onSort(columnId, false); setOpen(false); }}>
                                    <ArrowUp className="h-3.5 w-3.5" />{t.sortAscending}
                                </button>
                                <button type="button" className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent"
                                    onClick={() => { onSort(columnId, false); onSort(columnId, false); setOpen(false); }}>
                                    <ArrowDown className="h-3.5 w-3.5" />{t.sortDescending}
                                </button>
                                <div className="my-1 h-px bg-border" />
                            </>
                        )}
                        <button type="button" className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent"
                            onClick={() => { onHide(columnId); setOpen(false); }}>
                            <EyeOff className="h-3.5 w-3.5" />{t.hideColumn}
                        </button>
                        {showPinning && (
                            <ColumnPinMenu columnId={columnId} isPinned={isPinned}
                                onPin={(id, dir) => { onPin(id, dir); setOpen(false); }} t={t} />
                        )}
                    </div>
                </>
            )}
        </div>
    );
}

// ─── Batch edit dialog ──────────────────────────────────────────────────────

function BatchEditDialog<TData>({ open, onOpenChange, selectedRows, editableColumns, onApply, t }: {
    open: boolean; onOpenChange: (open: boolean) => void;
    selectedRows: TData[]; editableColumns: DataTableColumnDef[];
    onApply: (columnId: string, value: unknown) => void; t: DataTableTranslations;
}) {
    const [selectedColumn, setSelectedColumn] = useState(editableColumns[0]?.id ?? "");
    const [editValue, setEditValue] = useState("");

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{t.batchEdit}</DialogTitle>
                    <DialogDescription>{t.selected(selectedRows.length)}</DialogDescription>
                </DialogHeader>
                <div className="grid gap-3 py-2">
                    <div className="grid gap-2">
                        <Label>{t.batchEditColumn}</Label>
                        <Select value={selectedColumn} onValueChange={setSelectedColumn}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {editableColumns.map((col) => (
                                    <SelectItem key={col.id} value={col.id}>{col.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-2">
                        <Label>{t.batchEditValue}</Label>
                        <Input value={editValue} onChange={(e) => setEditValue(e.target.value)}
                            onKeyDown={(e) => { if (e.key === "Enter") { onApply(selectedColumn, editValue); onOpenChange(false); } }} />
                    </div>
                </div>
                <DialogFoot>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>{t.cancel}</Button>
                    <Button onClick={() => { onApply(selectedColumn, editValue); onOpenChange(false); }}>{t.batchEditApply}</Button>
                </DialogFoot>
            </DialogContent>
        </Dialog>
    );
}

// ─── Row drag handle for reorder ────────────────────────────────────────────

function DragHandleCell({ rowIndex, onDragStart, onDragOver, onDragEnd }: {
    rowIndex: number;
    onDragStart: (index: number) => void;
    onDragOver: (e: React.DragEvent, index: number) => void;
    onDragEnd: () => void;
}) {
    return (
        <div className="cursor-grab active:cursor-grabbing"
            draggable
            onDragStart={(e) => { e.dataTransfer.effectAllowed = "move"; onDragStart(rowIndex); }}
            onDragOver={(e) => { e.preventDefault(); onDragOver(e, rowIndex); }}
            onDragEnd={onDragEnd}>
            <GripVertical className="h-4 w-4 text-muted-foreground/50" />
        </div>
    );
}

// ─── Import dialog ──────────────────────────────────────────────────────────

function ImportDialog({ open, onOpenChange, importUrl, t }: {
    open: boolean; onOpenChange: (open: boolean) => void;
    importUrl: string; t: DataTableTranslations;
}) {
    const [uploading, setUploading] = useState(false);
    const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
    const fileRef = useRef<HTMLInputElement>(null);

    const handleUpload = useCallback(async () => {
        const file = fileRef.current?.files?.[0];
        if (!file) return;
        setUploading(true);
        setResult(null);
        try {
            const formData = new FormData();
            formData.append("file", file);
            const response = await fetch(importUrl, {
                method: "POST",
                headers: {
                    "X-Requested-With": "XMLHttpRequest",
                    "X-CSRF-TOKEN": document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? "",
                },
                body: formData,
            });
            if (response.ok) {
                setResult({ success: true, message: t.importSuccess });
                setTimeout(() => { onOpenChange(false); router.reload(); }, 1000);
            } else {
                const data = await response.json().catch(() => ({}));
                setResult({ success: false, message: data.message ?? t.importError });
            }
        } catch {
            setResult({ success: false, message: t.importError });
        } finally {
            setUploading(false);
        }
    }, [importUrl, t, onOpenChange]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{t.importData}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-3 py-2">
                    <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" className="text-sm" />
                    {result && (
                        <p className={cn("text-sm", result.success ? "text-emerald-600" : "text-destructive")}>{result.message}</p>
                    )}
                </div>
                <DialogFoot>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>{t.cancel}</Button>
                    <Button onClick={handleUpload} disabled={uploading}>
                        {uploading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{t.importUploading}</> : t.importData}
                    </Button>
                </DialogFoot>
            </DialogContent>
        </Dialog>
    );
}

// ─── Undo/Redo stack for inline edits ───────────────────────────────────────

interface EditAction {
    rowId: unknown;
    columnId: string;
    oldValue: unknown;
    newValue: unknown;
    timestamp: number;
}

function useUndoRedo(enabled: boolean) {
    const [undoStack, setUndoStack] = useState<EditAction[]>([]);
    const [redoStack, setRedoStack] = useState<EditAction[]>([]);

    const pushEdit = useCallback((action: Omit<EditAction, "timestamp">) => {
        if (!enabled) return;
        setUndoStack((prev) => [...prev.slice(-49), { ...action, timestamp: Date.now() }]);
        setRedoStack([]);
    }, [enabled]);

    const undo = useCallback((): EditAction | null => {
        if (undoStack.length === 0) return null;
        const action = undoStack[undoStack.length - 1];
        setUndoStack((prev) => prev.slice(0, -1));
        setRedoStack((prev) => [...prev, action]);
        return action;
    }, [undoStack]);

    const redo = useCallback((): EditAction | null => {
        if (redoStack.length === 0) return null;
        const action = redoStack[redoStack.length - 1];
        setRedoStack((prev) => prev.slice(0, -1));
        setUndoStack((prev) => [...prev, action]);
        return action;
    }, [redoStack]);

    return { pushEdit, undo, redo, canUndo: undoStack.length > 0, canRedo: redoStack.length > 0 };
}

// ─── Keyboard shortcuts overlay ─────────────────────────────────────────────

function KeyboardShortcutsDialog({ open, onOpenChange, t }: {
    open: boolean; onOpenChange: (open: boolean) => void; t: DataTableTranslations;
}) {
    const shortcuts = [
        { keys: ["↑", "↓"], description: t.shortcutNavigation },
        { keys: ["Space"], description: t.shortcutSelect },
        { keys: ["Enter"], description: t.shortcutExpand },
        { keys: ["Escape"], description: t.shortcutEscape },
        { keys: ["/"], description: t.shortcutSearch },
        { keys: ["?"], description: t.shortcutHelp },
    ];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Keyboard className="h-5 w-5" />{t.keyboardShortcuts}
                    </DialogTitle>
                </DialogHeader>
                <div className="grid gap-2 py-2">
                    {shortcuts.map(({ keys, description }) => (
                        <div key={description} className="flex items-center justify-between py-1.5">
                            <span className="text-sm text-muted-foreground">{description}</span>
                            <div className="flex items-center gap-1">
                                {keys.map((key) => (
                                    <kbd key={key} className="inline-flex h-6 min-w-[24px] items-center justify-center rounded border bg-muted px-1.5 font-mono text-xs font-medium">
                                        {key}
                                    </kbd>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
                <DialogFoot>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>{t.close}</Button>
                </DialogFoot>
            </DialogContent>
        </Dialog>
    );
}

// ─── Export with progress ────────────────────────────────────────────────────

function ExportWithProgress({ exportUrl, table, t }: {
    exportUrl: string; table: TanStackTable<unknown>; t: DataTableTranslations;
}) {
    const [exporting, setExporting] = useState<string | null>(null);
    const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

    const handleExport = useCallback(async (format: string) => {
        setExporting(format);
        setDownloadUrl(null);
        const url = buildExportUrl(exportUrl, format, table.getVisibleLeafColumns().filter((c) => c.getCanHide()).map((c) => c.id));
        try {
            const response = await fetch(url, {
                headers: { "X-Requested-With": "XMLHttpRequest" },
            });
            if (response.ok) {
                const blob = await response.blob();
                const blobUrl = URL.createObjectURL(blob);
                setDownloadUrl(blobUrl);
                // Auto-download
                const a = document.createElement("a");
                a.href = blobUrl;
                a.download = `export.${format}`;
                a.click();
            }
        } catch { /* fallback to direct download */ }
        finally { setExporting(null); }
    }, [exportUrl, table]);

    const formats = [
        { id: "xlsx", label: "Excel (.xlsx)", icon: FileSpreadsheet },
        { id: "csv", label: "CSV (.csv)", icon: FileText },
        { id: "pdf", label: "PDF (.pdf)", icon: FileDown },
    ];

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-1.5">
                    {exporting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
                    <span className="hidden sm:inline">{exporting ? t.exporting : t.export}</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>{t.exportFormat}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {formats.map(({ id, label, icon: Icon }) => (
                    <DropdownMenuItem key={id} onClick={() => handleExport(id)} disabled={!!exporting}>
                        <Icon className="mr-2 h-4 w-4" />{label}
                        {exporting === id && <Loader2 className="ml-auto h-3.5 w-3.5 animate-spin" />}
                    </DropdownMenuItem>
                ))}
                {downloadUrl && (
                    <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <a href={downloadUrl} download>
                                <Check className="mr-2 h-4 w-4 text-emerald-600" />{t.exportDownload}
                            </a>
                        </DropdownMenuItem>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

// ─── Empty state illustration ───────────────────────────────────────────────

function DefaultEmptyStateIllustration() {
    return (
        <svg className="h-24 w-24 text-muted-foreground/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M3 9h18" />
            <path d="M3 15h18" />
            <path d="M9 3v18" />
            <path d="M15 3v18" />
        </svg>
    );
}

function EmptyState({ customEmpty, illustration, showIllustration, t }: {
    customEmpty?: React.ReactNode; illustration?: React.ReactNode;
    showIllustration: boolean; t: DataTableTranslations;
}) {
    if (customEmpty) return <>{customEmpty}</>;
    if (showIllustration) {
        return (
            <div className="flex flex-col items-center gap-3">
                {illustration ?? <DefaultEmptyStateIllustration />}
                <div className="text-center">
                    <p className="font-medium text-muted-foreground">{t.emptyTitle}</p>
                    <p className="text-xs text-muted-foreground/70 max-w-xs">{t.emptyDescription}</p>
                </div>
            </div>
        );
    }
    return <span className="text-muted-foreground">{t.noData}</span>;
}

// ─── Selection persistence across pages ─────────────────────────────────────

function usePersistedSelection<TData>(tableName: string, enabled: boolean) {
    const storageKey = `dt-selection-${tableName}`;

    const [persistedIds, setPersistedIds] = useState<Set<unknown>>(() => {
        if (!enabled) return new Set();
        try {
            const raw = safeGetItem(storageKey);
            return raw ? new Set(JSON.parse(raw) as unknown[]) : new Set();
        } catch { return new Set(); }
    });

    const addIds = useCallback((ids: unknown[]) => {
        setPersistedIds((prev) => {
            const next = new Set(prev);
            for (const id of ids) next.add(id);
            return next;
        });
    }, []);

    const removeIds = useCallback((ids: unknown[]) => {
        setPersistedIds((prev) => {
            const next = new Set(prev);
            for (const id of ids) next.delete(id);
            return next;
        });
    }, []);

    const clearAll = useCallback(() => setPersistedIds(new Set()), []);

    const isSelected = useCallback((id: unknown) => persistedIds.has(id), [persistedIds]);

    // Persist to localStorage
    useEffect(() => {
        if (!enabled) return;
        safeSetItem(storageKey, JSON.stringify([...persistedIds]));
    }, [enabled, storageKey, persistedIds]);

    return { persistedIds, addIds, removeIds, clearAll, isSelected, count: persistedIds.size };
}

// ─── Column pinning UI in context menu ──────────────────────────────────────

function ColumnPinMenu({ columnId, isPinned, onPin, t }: {
    columnId: string; isPinned: false | "left" | "right";
    onPin: (columnId: string, direction: false | "left" | "right") => void;
    t: DataTableTranslations;
}) {
    return (
        <>
            <div className="my-1 h-px bg-border" />
            {!isPinned ? (
                <>
                    <button type="button" className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent"
                        onClick={() => onPin(columnId, "left")}>
                        <Pin className="h-3.5 w-3.5" />{t.pinLeft}
                    </button>
                    <button type="button" className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent"
                        onClick={() => onPin(columnId, "right")}>
                        <Pin className="h-3.5 w-3.5 rotate-90" />{t.pinRight}
                    </button>
                </>
            ) : (
                <button type="button" className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent"
                    onClick={() => onPin(columnId, false)}>
                    <PinOff className="h-3.5 w-3.5" />{t.unpin}
                </button>
            )}
        </>
    );
}

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

function DensityToggle({ density, onChange, t }: {
    density: DataTableDensity; onChange: (density: DataTableDensity) => void; t: DataTableTranslations;
}) {
    const densities: { value: DataTableDensity; label: string }[] = [
        { value: "compact", label: t.densityCompact },
        { value: "comfortable", label: t.densityComfortable },
        { value: "spacious", label: t.densitySpacious },
    ];
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-1.5">
                    <Rows3 className="h-3.5 w-3.5" /><span className="hidden sm:inline">{t.density}</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {densities.map((d) => (
                    <DropdownMenuItem key={d.value} onClick={() => onChange(d.value)}
                        className={cn(density === d.value && "font-semibold")}>
                        {density === d.value && <Check className="mr-2 h-3.5 w-3.5" />}
                        <span className={density !== d.value ? "ml-6" : ""}>{d.label}</span>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

function DataTableToolbar<TData>({ tableData, table, tableName, columnVisibility, columnOrder, applyColumns, onReorderColumns, handleApplyQuickView, handleApplyCustomSearch, resolvedOptions, t, density, onDensityChange, onImportClick, onShowShortcuts, canUndo, canRedo, onUndo, onRedo }: {
    tableData: { quickViews: import("./types").DataTableQuickView[]; exportUrl?: string | null; importUrl?: string | null; columns: DataTableColumnDef[] };
    table: TanStackTable<TData>; tableName: string;
    columnVisibility: VisibilityState; columnOrder: ColumnOrderState;
    applyColumns: (columnIds: string[]) => void; onReorderColumns: (order: ColumnOrderState) => void;
    handleApplyQuickView: (params: Record<string, unknown>) => void;
    handleApplyCustomSearch: (search: string) => void;
    resolvedOptions: DataTableOptions; t: DataTableTranslations;
    density: DataTableDensity; onDensityChange: (density: DataTableDensity) => void;
    onImportClick?: () => void; onShowShortcuts?: () => void;
    canUndo?: boolean; canRedo?: boolean; onUndo?: () => void; onRedo?: () => void;
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
                resolvedOptions.exportProgress ? (
                    <ExportWithProgress exportUrl={tableData.exportUrl} table={table as TanStackTable<unknown>} t={t} />
                ) : (
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
                )
            )}
            {tableData.importUrl && onImportClick && (
                <Button variant="outline" size="sm" className="h-8 gap-1.5" onClick={onImportClick}>
                    <Upload className="h-3.5 w-3.5" /><span className="hidden sm:inline">{t.importData}</span>
                </Button>
            )}
            {resolvedOptions.undoRedo && (canUndo || canRedo) && (
                <div className="flex items-center">
                    <Button variant="ghost" size="icon" className="h-8 w-8" disabled={!canUndo} onClick={onUndo} title={t.undo}>
                        <Undo2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" disabled={!canRedo} onClick={onRedo} title={t.redo}>
                        <Redo2 className="h-3.5 w-3.5" />
                    </Button>
                </div>
            )}
            {resolvedOptions.printable && (
                <Button variant="outline" size="sm" className="h-8 gap-1.5" onClick={() => window.print()}>
                    <Printer className="h-3.5 w-3.5" /><span className="hidden sm:inline">{t.print}</span>
                </Button>
            )}
            {resolvedOptions.density && (
                <DensityToggle density={density} onChange={onDensityChange} t={t} />
            )}
            {(resolvedOptions.columnVisibility || resolvedOptions.columnOrdering) && (
                <ColumnsDropdown table={table} tableColumns={tableData.columns} columnOrder={columnOrder}
                    onReorder={onReorderColumns} showVisibility={resolvedOptions.columnVisibility}
                    showOrdering={resolvedOptions.columnOrdering} t={t} />
            )}
            {resolvedOptions.shortcutsOverlay && onShowShortcuts && (
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onShowShortcuts} title={t.keyboardShortcuts}>
                    <HelpCircle className="h-3.5 w-3.5" />
                </Button>
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
    onReorder, onBatchEdit, emptyStateIllustration,
}: DataTableProps<TData>) {
    const t = useMemo<DataTableTranslations>(() => ({ ...defaultTranslations, ...translationsOverride }), [translationsOverride]);

    const resolvedOptions = useMemo<DataTableOptions>(() => ({
        quickViews: true, customQuickViews: true, exports: true, filters: true,
        columnVisibility: true, columnOrdering: true, columnResizing: false,
        stickyHeader: false, globalSearch: false, loading: true,
        keyboardNavigation: false, printable: false, density: false,
        copyCell: false, contextMenu: false, virtualScrolling: false,
        rowGrouping: false, rowReorder: false, batchEdit: false,
        searchHighlight: false, undoRedo: false, columnPinning: false,
        persistSelection: false, shortcutsOverlay: false,
        exportProgress: false, emptyStateIllustration: false,
        ...optionsOverride,
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

    // Density toggle
    const [density, setDensity] = useState<DataTableDensity>(() => loadDensity(tableName));
    const handleDensityChange = useCallback((d: DataTableDensity) => { setDensity(d); saveDensity(tableName, d); }, [tableName]);
    const densityClasses = DENSITY_CLASSES[density];

    // Batch edit
    const [batchEditOpen, setBatchEditOpen] = useState(false);

    // Import dialog
    const [importDialogOpen, setImportDialogOpen] = useState(false);

    // Row drag reorder
    const [dragRowIndex, setDragRowIndex] = useState<number | null>(null);
    const [dragOverRowIndex, setDragOverRowIndex] = useState<number | null>(null);
    const handleRowDragStart = useCallback((index: number) => { setDragRowIndex(index); }, []);
    const handleRowDragOver = useCallback((_e: React.DragEvent, index: number) => { setDragOverRowIndex(index); }, []);
    const handleRowDragEnd = useCallback(() => {
        if (dragRowIndex !== null && dragOverRowIndex !== null && dragRowIndex !== dragOverRowIndex && onReorder) {
            const rows = tableData.data;
            const ids = rows.map((r) => (r as Record<string, unknown>).id);
            const reordered = [...ids];
            const [moved] = reordered.splice(dragRowIndex, 1);
            reordered.splice(dragOverRowIndex, 0, moved);
            onReorder(reordered, reordered.map((_, i) => i));
        }
        setDragRowIndex(null);
        setDragOverRowIndex(null);
    }, [dragRowIndex, dragOverRowIndex, tableData.data, onReorder]);

    // Collapsed row groups
    const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

    // Search term for highlighting
    const searchKeyForHighlight = prefix ? `${prefix}_search` : "search";
    const currentSearchTerm = typeof window !== "undefined" ? new URL(window.location.href).searchParams.get(searchKeyForHighlight) ?? "" : "";

    // Undo/Redo stack for inline edits
    const { pushEdit, undo: undoEdit, redo: redoEdit, canUndo, canRedo } = useUndoRedo(resolvedOptions.undoRedo);

    // Keyboard shortcuts overlay
    const [shortcutsOpen, setShortcutsOpen] = useState(false);

    // Selection persistence across pages
    const { persistedIds, addIds: addPersistedIds, removeIds: removePersistedIds, clearAll: clearPersistedSelection, count: persistedSelectionCount } = usePersistedSelection<TData>(tableName, resolvedOptions.persistSelection);

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

                    // Inline editing with undo/redo support
                    if (col.editable && onInlineEdit) {
                        return <InlineEditCell value={value} columnId={col.id} columnType={col.type}
                            onSave={(newVal) => {
                                const rowId = (row.original as Record<string, unknown>).id;
                                pushEdit({ rowId, columnId: col.id, oldValue: value, newValue: newVal });
                                return onInlineEdit(row.original, col.id, newVal);
                            }} t={t} />;
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
                    // Search highlighting for text values
                    const strValue = String(value);
                    if (resolvedOptions.searchHighlight && currentSearchTerm && col.type === "text") {
                        return highlightText(strValue, currentSearchTerm);
                    }
                    return strValue;
                },
            };
        }

        const result: ColumnDef<TData>[] = [];

        // Row reorder drag handle column
        if (resolvedOptions.rowReorder && onReorder) {
            result.push({
                id: "_reorder", header: "", enableHiding: false, enableResizing: false, size: 36,
                cell: ({ row }) => (
                    <DragHandleCell rowIndex={row.index}
                        onDragStart={handleRowDragStart} onDragOver={handleRowDragOver} onDragEnd={handleRowDragEnd} />
                ),
            });
        }

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
    }, [mergedColumns, actions, hasBulkActions, renderCell, t, onInlineEdit, resolvedOptions.columnResizing, resolvedOptions.rowReorder, resolvedOptions.searchHighlight, resolvedOptions.copyCell, columnSizing, hasDetailRows, expandedRows, tableName, selectionMode, responsiveHiddenCols, tableData.toggleUrl, onReorder, handleRowDragStart, handleRowDragOver, handleRowDragEnd, currentSearchTerm]);

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

    const editableColumns = useMemo(() => mergedColumns.filter((c) => c.editable), [mergedColumns]);

    // Undo/Redo handlers
    const handleUndo = useCallback(() => {
        const action = undoEdit();
        if (action && onInlineEdit) {
            // Find the row with matching ID and apply old value
            const row = tableData.data.find((r) => (r as Record<string, unknown>).id === action.rowId);
            if (row) onInlineEdit(row, action.columnId, action.oldValue);
        }
    }, [undoEdit, onInlineEdit, tableData.data]);

    const handleRedo = useCallback(() => {
        const action = redoEdit();
        if (action && onInlineEdit) {
            const row = tableData.data.find((r) => (r as Record<string, unknown>).id === action.rowId);
            if (row) onInlineEdit(row, action.columnId, action.newValue);
        }
    }, [redoEdit, onInlineEdit, tableData.data]);

    // Column pin handler
    const handlePinColumn = useCallback((columnId: string, direction: false | "left" | "right") => {
        const col = table.getColumn(columnId);
        if (col) col.pin(direction);
    }, [table]);

    // Keyboard shortcut: ? to show shortcuts overlay
    useEffect(() => {
        if (!resolvedOptions.shortcutsOverlay) return;
        const handler = (e: KeyboardEvent) => {
            if (e.key === "?" && !e.ctrlKey && !e.metaKey && !(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLTextAreaElement)) {
                setShortcutsOpen(true);
            }
            // Ctrl+Z / Ctrl+Y for undo/redo
            if (resolvedOptions.undoRedo && e.ctrlKey && !e.shiftKey && e.key === "z") {
                e.preventDefault(); handleUndo();
            }
            if (resolvedOptions.undoRedo && e.ctrlKey && (e.key === "y" || (e.shiftKey && e.key === "z"))) {
                e.preventDefault(); handleRedo();
            }
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [resolvedOptions.shortcutsOverlay, resolvedOptions.undoRedo, handleUndo, handleRedo]);

    // Selection persistence: sync with TanStack row selection
    useEffect(() => {
        if (!resolvedOptions.persistSelection) return;
        const selected = table.getSelectedRowModel().rows;
        const currentIds = selected.map((r) => (r.original as Record<string, unknown>).id);
        if (currentIds.length > 0) addPersistedIds(currentIds);
    }, [resolvedOptions.persistSelection, table.getSelectedRowModel().rows, addPersistedIds]);

    const toolbarProps = { tableData, table, tableName, columnVisibility, columnOrder, applyColumns,
        onReorderColumns: setColumnOrder, handleApplyQuickView, handleApplyCustomSearch, resolvedOptions, t,
        density, onDensityChange: handleDensityChange, onImportClick: tableData.importUrl ? () => setImportDialogOpen(true) : undefined,
        onShowShortcuts: () => setShortcutsOpen(true), canUndo, canRedo, onUndo: handleUndo, onRedo: handleRedo };

    const activeFilterColumnIds = useMemo(() => new Set(Object.keys(meta.filters as Record<string, unknown>)), [meta.filters]);

    const summaryLabels: Record<string, string> = useMemo(() => ({
        sum: t.summarySum, avg: t.summaryAvg, min: t.summaryMin, max: t.summaryMax, count: t.summaryCount
    }), [t.summarySum, t.summaryAvg, t.summaryMin, t.summaryMax, t.summaryCount]);

    const visibleLeafColumns = useMemo(() => [
        ...table.getLeftVisibleLeafColumns(),
        ...table.getCenterVisibleLeafColumns(),
        ...table.getRightVisibleLeafColumns(),
    ], [table.getLeftVisibleLeafColumns(), table.getCenterVisibleLeafColumns(), table.getRightVisibleLeafColumns()]);

    // Context menu: hide column handler
    const handleHideColumn = useCallback((columnId: string) => {
        const col = table.getColumn(columnId);
        if (col) col.toggleVisibility(false);
    }, [table]);

    // Row grouping: group rows by column value
    const groupByColumn = tableData.groupByColumn;
    const groupedRows = useMemo(() => {
        if (!groupByColumn || !resolvedOptions.rowGrouping) return null;
        const rows = table.getRowModel().rows;
        const groups = new Map<string, typeof rows>();
        for (const row of rows) {
            const val = String((row.original as Record<string, unknown>)[groupByColumn] ?? t.ungrouped);
            if (!groups.has(val)) groups.set(val, []);
            groups.get(val)!.push(row);
        }
        return groups;
    }, [groupByColumn, resolvedOptions.rowGrouping, table, t.ungrouped]);

    // Batch edit handler
    const handleBatchEditApply = useCallback((columnId: string, value: unknown) => {
        if (onBatchEdit) onBatchEdit(selectedRows, columnId, value);
    }, [onBatchEdit, selectedRows]);

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
                        {resolvedOptions.batchEdit && editableColumns.length > 0 && onBatchEdit && (
                            <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setBatchEditOpen(true)}>
                                <Pencil className="mr-1 h-3.5 w-3.5" />{t.batchEdit}
                            </Button>
                        )}
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
                    <div className={cn("overflow-x-auto", resolvedOptions.virtualScrolling && "max-h-[600px] overflow-y-auto")}>
                        <Table style={resolvedOptions.columnResizing ? { width: table.getCenterTotalSize() } : undefined}
                            role="grid" aria-rowcount={meta.total} aria-colcount={table.getVisibleLeafColumns().length}>
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
                                                const sortState = colDef?.sortable ? meta.sorts.find((s) => s.id === colDef.id) : undefined;
                                                const ariaSort = sortState ? (sortState.direction === "asc" ? "ascending" : "descending") as const : colDef?.sortable ? "none" as const : undefined;
                                                const headerContent = (
                                                    <>
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
                                                    </>
                                                );
                                                return (
                                                    <TableHead key={header.id} colSpan={header.colSpan}
                                                        style={{ ...pin.style, ...(resolvedOptions.columnResizing ? { width: header.getSize() } : {}) }}
                                                        className={cn("h-9", isNumber && "text-right",
                                                            leafGroup && groupClassName?.[leafGroup],
                                                            pin.className, "relative")}
                                                        aria-sort={ariaSort} role="columnheader">
                                                        {resolvedOptions.contextMenu && colDef ? (
                                                            <ColumnContextMenu columnId={colDef.id} sortable={colDef.sortable}
                                                                isPinned={header.column.getIsPinned() || false}
                                                                showPinning={resolvedOptions.columnPinning}
                                                                onSort={handleSort} onHide={handleHideColumn}
                                                                onPin={handlePinColumn} t={t}>
                                                                {headerContent}
                                                            </ColumnContextMenu>
                                                        ) : headerContent}
                                                    </TableHead>
                                                );
                                            })}
                                        </TableRow>
                                    );
                                })}
                            </TableHeader>
                            <TableBody ref={tableBodyRef} role="rowgroup">
                                {resolvedOptions.loading && isNavigating ? (
                                    <SkeletonRows count={Math.min(meta.perPage, 10)} colCount={table.getVisibleLeafColumns().length} />
                                ) : table.getRowModel().rows.length > 0 ? (
                                    (() => {
                                        const renderRow = (row: ReturnType<typeof table.getRowModel>["rows"][number], index: number) => {
                                            const dataAttrs = rowDataAttributes?.(row.original) ?? {};
                                            const rowRuleClass = getRowRuleClass(row.original);
                                            const rowId = String((row.original as Record<string, unknown>).id ?? row.index);
                                            const isExpanded = hasDetailRows && expandedRows.has(rowId);
                                            const isDragOver = dragOverRowIndex === index && dragRowIndex !== index;
                                            return (
                                                <>{/* keyed fragment */}
                                                    <TableRow key={row.id} data-state={row.getIsSelected() ? "selected" : undefined} {...dataAttrs}
                                                        role="row" aria-rowindex={(meta.currentPage - 1) * meta.perPage + index + 1}
                                                        aria-selected={row.getIsSelected() || undefined}
                                                        className={cn(
                                                            "transition-colors",
                                                            densityClasses.row,
                                                            row.getIsSelected() && "bg-primary/5",
                                                            isClickable && "cursor-pointer",
                                                            focusedRowIndex === index && "ring-2 ring-inset ring-primary",
                                                            isDragOver && "border-t-2 border-t-primary",
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
                                                            const cellContent = flexRender(cell.column.columnDef.cell, cell.getContext());
                                                            return (
                                                                <TableCell key={cell.id} role="gridcell"
                                                                    style={{ ...pin.style, ...(resolvedOptions.columnResizing ? { width: cell.column.getSize() } : {}) }}
                                                                    className={cn(
                                                                        "whitespace-nowrap",
                                                                        densityClasses.cell,
                                                                        cellMeta?.type === "number" && "text-right",
                                                                        cellMeta?.type === "currency" && "text-right",
                                                                        cellMeta?.type === "percentage" && "text-right",
                                                                        cellMeta?.group && groupClassName?.[cellMeta.group],
                                                                        pin.className, cellRuleClass)}>
                                                                    {resolvedOptions.copyCell && cell.column.id !== "_select" && cell.column.id !== "_actions" && cell.column.id !== "_expand" && cell.column.id !== "_reorder" ? (
                                                                        <CopyableCell value={cell.getValue()} enabled={true} t={t}>{cellContent}</CopyableCell>
                                                                    ) : cellContent}
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
                                        };

                                        // Row grouping mode
                                        if (groupedRows) {
                                            let rowIdx = 0;
                                            return [...groupedRows.entries()].map(([groupName, rows]) => {
                                                const isCollapsed = collapsedGroups.has(groupName);
                                                const startIdx = rowIdx;
                                                rowIdx += rows.length;
                                                return (
                                                    <>{/* group fragment */}
                                                        <TableRow key={`group-${groupName}`}
                                                            className="bg-muted/30 hover:bg-muted/40 cursor-pointer"
                                                            onClick={() => setCollapsedGroups((prev) => {
                                                                const next = new Set(prev);
                                                                if (next.has(groupName)) next.delete(groupName); else next.add(groupName);
                                                                return next;
                                                            })}>
                                                            <TableCell colSpan={table.getVisibleLeafColumns().length} className="py-2 font-medium">
                                                                <div className="flex items-center gap-2">
                                                                    {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                                                    <span>{groupName}</span>
                                                                    <span className="text-muted-foreground text-xs">({rows.length})</span>
                                                                </div>
                                                            </TableCell>
                                                        </TableRow>
                                                        {!isCollapsed && rows.map((row, i) => renderRow(row, startIdx + i))}
                                                    </>
                                                );
                                            });
                                        }

                                        // Normal (non-grouped) mode
                                        return table.getRowModel().rows.map((row, index) => renderRow(row, index));
                                    })()
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={table.getVisibleLeafColumns().length} className="h-40 text-center text-muted-foreground">
                                            <EmptyState customEmpty={emptyState} illustration={emptyStateIllustration}
                                                showIllustration={resolvedOptions.emptyStateIllustration} t={t} />
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

            {/* ── Keyboard shortcuts dialog ── */}
            {resolvedOptions.shortcutsOverlay && (
                <KeyboardShortcutsDialog open={shortcutsOpen} onOpenChange={setShortcutsOpen} t={t} />
            )}

            {/* ── Persisted selection indicator ── */}
            {resolvedOptions.persistSelection && persistedSelectionCount > 0 && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground print:hidden">
                    <span>{t.selected(persistedSelectionCount)} (across pages)</span>
                    <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={clearPersistedSelection}>
                        {t.clearSelection}
                    </Button>
                </div>
            )}

            {/* ── Batch edit dialog ── */}
            {resolvedOptions.batchEdit && editableColumns.length > 0 && onBatchEdit && (
                <BatchEditDialog open={batchEditOpen} onOpenChange={setBatchEditOpen}
                    selectedRows={selectedRows} editableColumns={editableColumns}
                    onApply={handleBatchEditApply} t={t} />
            )}

            {/* ── Import dialog ── */}
            {tableData.importUrl && (
                <ImportDialog open={importDialogOpen} onOpenChange={setImportDialogOpen}
                    importUrl={tableData.importUrl} t={t} />
            )}

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
