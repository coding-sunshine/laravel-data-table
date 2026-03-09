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
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
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
    Expand,
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
    PanelRight,
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
import { Component, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { router } from "@inertiajs/react";
import { DataTableColumnHeader } from "./data-table-column-header";
import { defaultTranslations, type DataTableTranslations } from "./i18n";
import { DataTablePagination } from "./data-table-pagination";
import { DataTableRowActions } from "./data-table-row-actions";
import { DataTableQuickViews } from "./data-table-quick-views";
import type { DataTableColumnDef, DataTableConfirmOptions, DataTableDensity, DataTableFormField, DataTableHeaderAction, DataTableOptions, DataTableProps, DataTableRule } from "./types";
import { useDataTable } from "./use-data-table";
import { DataTableColumn, extractColumnConfigs } from "./data-table-column";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

// ─── HTML sanitization ──────────────────────────────────────────────────────

/** Strip dangerous HTML tags/attributes. Uses DOMPurify if available, falls back to tag stripping. */
function sanitizeHtml(html: string): string {
    // Use DOMPurify if available (recommended: npm install dompurify)
    if (typeof window !== "undefined" && (window as unknown as Record<string, unknown>).DOMPurify) {
        return ((window as unknown as Record<string, { sanitize: (html: string) => string }>).DOMPurify).sanitize(html);
    }
    // Fallback: strip <script>, <iframe>, <object>, <embed>, on* attributes
    return html
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
        .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
        .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, "")
        .replace(/<embed\b[^>]*\/?>/gi, "")
        .replace(/\bon\w+\s*=\s*"[^"]*"/gi, "")
        .replace(/\bon\w+\s*=\s*'[^']*'/gi, "")
        .replace(/javascript\s*:/gi, "");
}

// ─── Toast notification helper ──────────────────────────────────────────────

let toastContainer: HTMLDivElement | null = null;

function showToast(message: string, variant: "success" | "error" | "info" = "info") {
    if (typeof document === "undefined") return;
    if (!toastContainer) {
        toastContainer = document.createElement("div");
        toastContainer.className = "fixed bottom-4 right-4 z-[9999] flex flex-col gap-2";
        toastContainer.setAttribute("aria-live", "polite");
        toastContainer.setAttribute("role", "status");
        document.body.appendChild(toastContainer);
    }
    const toast = document.createElement("div");
    const bgClass = variant === "error" ? "bg-destructive text-destructive-foreground" : variant === "success" ? "bg-emerald-600 text-white" : "bg-primary text-primary-foreground";
    toast.className = `${bgClass} px-4 py-2 rounded-lg shadow-lg text-sm animate-in slide-in-from-bottom-2 max-w-sm`;
    toast.textContent = message;
    toastContainer.appendChild(toast);
    setTimeout(() => { toast.classList.add("opacity-0", "transition-opacity"); setTimeout(() => toast.remove(), 300); }, 3000);
}

// ─── Lightweight row virtualization ──────────────────────────────────────────

function useVirtualRows(enabled: boolean, containerRef: React.RefObject<HTMLElement | null>, rowCount: number, estimateRowHeight = 40) {
    const [scrollTop, setScrollTop] = useState(0);
    const [containerHeight, setContainerHeight] = useState(600);

    useEffect(() => {
        if (!enabled || !containerRef.current) return;
        const el = containerRef.current;
        setContainerHeight(el.clientHeight);
        const handleScroll = () => setScrollTop(el.scrollTop);
        const handleResize = () => setContainerHeight(el.clientHeight);
        el.addEventListener("scroll", handleScroll, { passive: true });
        const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(handleResize) : null;
        ro?.observe(el);
        return () => { el.removeEventListener("scroll", handleScroll); ro?.disconnect(); };
    }, [enabled, containerRef]);

    if (!enabled) return { virtualRows: null, totalHeight: 0, offsetTop: 0 };

    const overscan = 5;
    const totalHeight = rowCount * estimateRowHeight;
    const startIndex = Math.max(0, Math.floor(scrollTop / estimateRowHeight) - overscan);
    const endIndex = Math.min(rowCount, Math.ceil((scrollTop + containerHeight) / estimateRowHeight) + overscan);
    const virtualRows = { startIndex, endIndex };
    const offsetTop = startIndex * estimateRowHeight;

    return { virtualRows, totalHeight, offsetTop };
}

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
    prefix?: string | null;
    suffix?: string | null;
    tooltip?: string | null;
    description?: string | null;
    lineClamp?: number | null;
    iconMap?: Record<string, string> | null;
    colorMap?: Record<string, string> | null;
    selectOptions?: { label: string; value: string }[] | null;
    html?: boolean;
    markdown?: boolean;
    bulleted?: boolean;
    stacked?: string[] | null;
    rowIndex?: boolean;
    avatarColumn?: string | null;
    hasDynamicSuffix?: boolean;
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
                <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center shadow-sm">
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
    default: "bg-primary/10 text-primary ring-1 ring-inset ring-primary/20 dark:bg-primary/20",
    success: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20",
    warning: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/20",
    danger: "bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20 dark:bg-red-500/10 dark:text-red-400 dark:ring-red-500/20",
    info: "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20 dark:bg-blue-500/10 dark:text-blue-400 dark:ring-blue-500/20",
    secondary: "bg-muted text-muted-foreground ring-1 ring-inset ring-border",
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
                    <div className="fixed z-50 min-w-[160px] rounded-lg border bg-popover p-1 shadow-lg animate-in fade-in-0 zoom-in-95"
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

    const handleUpload = useCallback(() => {
        const file = fileRef.current?.files?.[0];
        if (!file) return;
        setUploading(true);
        setResult(null);
        router.post(importUrl, { file } as Record<string, unknown>, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setResult({ success: true, message: t.importSuccess });
                setTimeout(() => { onOpenChange(false); router.reload(); }, 1000);
            },
            onError: (errors) => {
                const msg = typeof errors === "object" && errors !== null
                    ? Object.values(errors).flat().join(", ") : t.importError;
                setResult({ success: false, message: msg || t.importError });
            },
            onFinish: () => setUploading(false),
        });
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

    // Cleanup on unmount to prevent memory leaks
    useEffect(() => {
        return () => { setUndoStack([]); setRedoStack([]); };
    }, []);

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
            showToast("Saved", "success");
        } catch (e) {
            showToast(e instanceof Error ? e.message : "Save failed", "error");
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

/** Boolean toggle switch cell — uses Inertia router.patch for proper session/CSRF handling */
function ToggleCell({ value, row, columnId, toggleUrl }: {
    value: boolean; row: Record<string, unknown>; columnId: string; toggleUrl: string;
}) {
    const [checked, setChecked] = useState(!!value);
    const [saving, setSaving] = useState(false);

    const handleToggle = useCallback((newValue: boolean) => {
        setSaving(true);
        setChecked(newValue);
        const rowId = row.id ?? "";
        const url = `${toggleUrl}/${rowId}`;
        router.patch(url, { column: columnId, value: newValue } as Record<string, unknown>, {
            preserveScroll: true,
            preserveState: true,
            onError: (errors) => {
                setChecked(!newValue);
                const msg = typeof errors === "object" && errors !== null ? Object.values(errors)[0] : "Toggle failed";
                showToast(String(msg), "error");
            },
            onFinish: () => setSaving(false),
        });
    }, [row.id, toggleUrl, columnId]);

    return <Switch checked={checked} onCheckedChange={handleToggle} disabled={saving}
        className="data-[state=checked]:bg-emerald-500 data-[state=unchecked]:bg-muted-foreground/20"
        aria-label={`Toggle ${columnId}`} role="switch" aria-checked={checked} />;
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
                    <Button variant="ghost" size="icon" className="h-8 w-8" disabled={!canUndo} onClick={onUndo} title={t.undo} aria-label={t.undo}>
                        <Undo2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" disabled={!canRedo} onClick={onRedo} title={t.redo} aria-label={t.redo}>
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
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onShowShortcuts} title={t.keyboardShortcuts} aria-label={t.keyboardShortcuts}>
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
                {isReorderActive && <GripVertical className="h-3.5 w-3.5 shrink-0 cursor-grab text-muted-foreground/50" aria-label="Drag to reorder" role="img" />}
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

// ─── Mobile card layout ──────────────────────────────────────────────────────

function useMobileBreakpoint(breakpoint: number): boolean {
    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => {
        if (breakpoint <= 0) return;
        function check() { setIsMobile(window.innerWidth < breakpoint); }
        check();
        window.addEventListener("resize", check);
        return () => window.removeEventListener("resize", check);
    }, [breakpoint]);
    return isMobile;
}

function MobileCardLayout<TData>({ rows, columns, renderCell, actions, onRowClick, rowLink, t, density }: {
    rows: TData[]; columns: DataTableColumnDef[];
    renderCell?: (columnId: string, value: unknown, row: TData) => React.ReactNode | undefined;
    actions?: import("./types").DataTableAction<TData>[];
    onRowClick?: (row: TData) => void;
    rowLink?: (row: TData) => string;
    t: DataTableTranslations;
    density: DataTableDensity;
}) {
    const visibleCols = columns.filter((c) => c.visible !== false);
    return (
        <div className="grid gap-3 md:hidden">
            {rows.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">{t.noData}</div>
            ) : rows.map((row, idx) => {
                const rowData = row as Record<string, unknown>;
                const handleClick = () => {
                    if (rowLink) window.location.href = rowLink(row);
                    else if (onRowClick) onRowClick(row);
                };
                const isClickable = !!onRowClick || !!rowLink;
                return (
                    <div key={rowData.id != null ? String(rowData.id) : idx}
                        className={cn("rounded-lg border bg-card p-4 space-y-2",
                            isClickable && "cursor-pointer hover:bg-accent/50 hover:shadow-md transition-all",
                            density === "compact" && "p-2.5 space-y-1",
                            density === "spacious" && "p-5 space-y-3")}
                        onClick={isClickable ? handleClick : undefined}>
                        {visibleCols.map((col) => {
                            const value = rowData[col.id];
                            const custom = renderCell?.(col.id, value, row);
                            return (
                                <div key={col.id} className="flex items-start justify-between gap-2">
                                    <span className="text-xs font-medium text-muted-foreground shrink-0">{col.label}</span>
                                    <span className="text-sm text-right">
                                        {custom !== undefined ? custom : value === null || value === undefined ? "—" : String(value)}
                                    </span>
                                </div>
                            );
                        })}
                        {actions && actions.length > 0 && (
                            <div className="flex justify-end gap-1 pt-1 border-t">
                                <DataTableRowActions row={row} actions={actions} t={t} />
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

// ─── Active filter chips ─────────────────────────────────────────────────────

function FilterChips({ filters, columns, onClear, onClearAll, t }: {
    filters: Record<string, unknown>;
    columns: DataTableColumnDef[];
    onClear: (columnId: string) => void;
    onClearAll: () => void;
    t: DataTableTranslations;
}) {
    const colMap = useMemo(() => new Map(columns.map((c) => [c.id, c])), [columns]);
    const entries = Object.entries(filters).filter(([, v]) => v !== null && v !== undefined && v !== "");
    if (entries.length === 0) return null;

    return (
        <div className="flex flex-wrap items-center gap-1.5 print:hidden">
            {entries.map(([key, value]) => {
                const col = colMap.get(key);
                const label = col?.label ?? key;
                const displayValue = String(value).replace(/^[a-z_]+:/i, "").replace(/,/g, ", ");
                return (
                    <span key={key} className="inline-flex items-center gap-1 rounded-full bg-primary/10 ring-1 ring-inset ring-primary/20 px-2.5 py-0.5 text-xs font-medium text-primary">
                        <span className="text-primary/60">{label}:</span> {displayValue}
                        <button type="button" onClick={() => onClear(key)}
                            className="ml-0.5 rounded-full p-0.5 hover:bg-primary/20 transition-colors">
                            <X className="h-3 w-3" />
                        </button>
                    </span>
                );
            })}
            {entries.length > 1 && (
                <button type="button" onClick={onClearAll}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors underline-offset-2 hover:underline">
                    {t.clearAllFilters}
                </button>
            )}
        </div>
    );
}

// ─── Inline row creation ─────────────────────────────────────────────────────

function InlineRowCreator({ columns, onRowCreate, t }: {
    columns: DataTableColumnDef[];
    onRowCreate: (data: Record<string, unknown>) => Promise<void> | void;
    t: DataTableTranslations;
}) {
    const [isCreating, setIsCreating] = useState(false);
    const [values, setValues] = useState<Record<string, string>>({});
    const [saving, setSaving] = useState(false);

    const editableCols = useMemo(
        () => columns.filter((c) => c.editable && c.type !== "image"),
        [columns],
    );

    const handleSave = useCallback(async () => {
        setSaving(true);
        try {
            const parsed: Record<string, unknown> = {};
            for (const col of editableCols) {
                const raw = values[col.id] ?? "";
                if (col.type === "number" || col.type === "currency" || col.type === "percentage") {
                    parsed[col.id] = raw ? Number(raw) : null;
                } else if (col.type === "boolean") {
                    parsed[col.id] = raw === "true" || raw === "1";
                } else {
                    parsed[col.id] = raw || null;
                }
            }
            await onRowCreate(parsed);
            setValues({});
            setIsCreating(false);
        } finally { setSaving(false); }
    }, [editableCols, values, onRowCreate]);

    if (!isCreating) {
        return (
            <Button variant="outline" size="sm" className="h-8 gap-1.5" onClick={() => setIsCreating(true)}>
                <span className="text-lg leading-none">+</span>
                <span>{t.addRow ?? "Add row"}</span>
            </Button>
        );
    }

    return (
        <div className="flex items-end gap-2 rounded-lg border bg-muted/20 p-3 print:hidden">
            {editableCols.map((col) => (
                <div key={col.id} className="grid gap-1">
                    <Label className="text-xs">{col.label}</Label>
                    <Input
                        type={col.type === "number" || col.type === "currency" || col.type === "percentage" ? "number" : "text"}
                        value={values[col.id] ?? ""}
                        onChange={(e) => setValues((prev) => ({ ...prev, [col.id]: e.target.value }))}
                        onKeyDown={(e) => { if (e.key === "Enter") handleSave(); if (e.key === "Escape") setIsCreating(false); }}
                        className="h-8 w-32 text-sm"
                        placeholder={col.label}
                    />
                </div>
            ))}
            <div className="flex items-center gap-1">
                <Button size="sm" className="h-8" onClick={handleSave} disabled={saving}>
                    {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : t.save}
                </Button>
                <Button variant="ghost" size="sm" className="h-8" onClick={() => { setIsCreating(false); setValues({}); }}>
                    {t.cancel}
                </Button>
            </div>
        </div>
    );
}

// ─── Inline select cell ──────────────────────────────────────────────────────

function SelectCell({ value, options, onSave }: {
    value: string; options: { label: string; value: string }[];
    onSave: (value: string) => Promise<void> | void;
}) {
    const [saving, setSaving] = useState(false);
    const handleChange = useCallback(async (newVal: string) => {
        setSaving(true);
        try { await onSave(newVal); } finally { setSaving(false); }
    }, [onSave]);
    return (
        <Select value={value} onValueChange={handleChange} disabled={saving}>
            <SelectTrigger className="h-7 w-auto min-w-[100px] text-sm">
                <SelectValue />
            </SelectTrigger>
            <SelectContent>
                {options.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}

// ─── Form action dialog ──────────────────────────────────────────────────────

function FormActionDialog<TData>({ open, onOpenChange, action, row, t }: {
    open: boolean; onOpenChange: (open: boolean) => void;
    action: { label: string; form?: DataTableFormField[]; onClick: (row: TData) => void };
    row: TData; t: DataTableTranslations;
}) {
    const fields = action.form ?? [];
    const [values, setValues] = useState<Record<string, unknown>>(() => {
        const init: Record<string, unknown> = {};
        for (const f of fields) init[f.name] = f.defaultValue ?? (f.type === "checkbox" ? false : "");
        return init;
    });
    const handleSubmit = useCallback(() => {
        // Attach form values to the row for the handler
        const enrichedRow = { ...row, _formValues: values } as TData;
        action.onClick(enrichedRow);
        onOpenChange(false);
    }, [action, row, values, onOpenChange]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{action.label}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-3 py-2">
                    {fields.map((field) => (
                        <div key={field.name} className="grid gap-1.5">
                            <Label className="text-sm">{field.label}{field.required && <span className="text-destructive"> *</span>}</Label>
                            {field.type === "select" ? (
                                <Select value={String(values[field.name] ?? "")} onValueChange={(v) => setValues((p) => ({ ...p, [field.name]: v }))}>
                                    <SelectTrigger><SelectValue placeholder={field.placeholder} /></SelectTrigger>
                                    <SelectContent>
                                        {field.options?.map((opt) => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            ) : field.type === "textarea" ? (
                                <textarea className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    value={String(values[field.name] ?? "")} placeholder={field.placeholder}
                                    onChange={(e) => setValues((p) => ({ ...p, [field.name]: e.target.value }))} />
                            ) : field.type === "checkbox" ? (
                                <div className="flex items-center gap-2">
                                    <Checkbox checked={!!values[field.name]} onCheckedChange={(v) => setValues((p) => ({ ...p, [field.name]: !!v }))} />
                                </div>
                            ) : (
                                <Input type={field.type === "number" ? "number" : "text"}
                                    value={String(values[field.name] ?? "")} placeholder={field.placeholder}
                                    onChange={(e) => setValues((p) => ({ ...p, [field.name]: field.type === "number" ? Number(e.target.value) : e.target.value }))} />
                            )}
                        </div>
                    ))}
                </div>
                <DialogFoot>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>{t.cancel}</Button>
                    <Button onClick={handleSubmit}>{t.confirmAction}</Button>
                </DialogFoot>
            </DialogContent>
        </Dialog>
    );
}

// ─── User-selectable grouping dropdown ───────────────────────────────────────

function GroupBySelector({ options, columns, currentGroupBy, onChange, t }: {
    options: string[]; columns: DataTableColumnDef[];
    currentGroupBy: string | null; onChange: (columnId: string | null) => void;
    t: DataTableTranslations;
}) {
    const colMap = new Map(columns.map((c) => [c.id, c]));
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-1.5">
                    <AlignJustify className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">{t.groupBy}</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onChange(null)} className={cn(!currentGroupBy && "font-semibold")}>
                    {!currentGroupBy && <Check className="mr-2 h-3.5 w-3.5" />}
                    <span className={currentGroupBy ? "ml-6" : ""}>{t.none}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {options.map((colId) => (
                    <DropdownMenuItem key={colId} onClick={() => onChange(colId)} className={cn(currentGroupBy === colId && "font-semibold")}>
                        {currentGroupBy === colId && <Check className="mr-2 h-3.5 w-3.5" />}
                        <span className={currentGroupBy !== colId ? "ml-6" : ""}>{colMap.get(colId)?.label ?? colId}</span>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

// ─── Main DataTable component ───────────────────────────────────────────────

function DataTableInner<TData extends object>({
    className, tableData, tableName, prefix, actions, bulkActions,
    renderCell: renderCellProp, renderHeader: renderHeaderProp,
    renderFooterCell: renderFooterCellProp, renderFilter: renderFilterProp,
    rowClassName, rowDataAttributes, groupClassName,
    options: optionsOverride, translations: translationsOverride,
    onRowClick, rowLink, emptyState, debounceMs, partialReloadKey,
    onInlineEdit, realtimeChannel, realtimeEvent = ".updated",
    renderDetailRow, selectionMode = "checkbox", slots,
    onReorder, onBatchEdit, emptyStateIllustration,
    onStateChange, onRowCreate, mobileBreakpoint = 0, children,
    headerActions, groupByOptions, onGroupByChange,
}: DataTableProps<TData>) {
    // Extract column configs from JSX children (<DataTable.Column>)
    const jsxColumnConfigs = useMemo(
        () => children ? extractColumnConfigs<TData>(children) : null,
        [children],
    );

    // Merge JSX column overrides with prop-based overrides (props take priority)
    const renderCell = renderCellProp ?? jsxColumnConfigs?.renderCell;
    const renderHeader = renderHeaderProp ?? jsxColumnConfigs?.renderHeader;
    const renderFooterCell = renderFooterCellProp ?? jsxColumnConfigs?.renderFooterCell;
    const renderFilter = renderFilterProp ?? jsxColumnConfigs?.renderFilter;
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
    const virtualContainerRef = useRef<HTMLDivElement>(null);
    const allRows = table.getRowModel().rows;
    const { virtualRows, totalHeight, offsetTop } = useVirtualRows(
        resolvedOptions.virtualScrolling, virtualContainerRef, allRows.length,
        density === "compact" ? 32 : density === "spacious" ? 52 : 40
    );
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
    const [showTrashed, setShowTrashed] = useState(false);

    // Detail modal/drawer state
    const detailDisplay = config?.detailDisplay ?? "inline";
    const [detailRow, setDetailRow] = useState<TData | null>(null);

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

    // User-selectable grouping
    const [userGroupBy, setUserGroupBy] = useState<string | null>(null);
    const handleGroupByChange = useCallback((colId: string | null) => {
        setUserGroupBy(colId);
        onGroupByChange?.(colId);
    }, [onGroupByChange]);

    // Form action dialog
    const [formAction, setFormAction] = useState<{ action: import("./types").DataTableAction<TData>; row: TData } | null>(null);

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
                meta: { type: col.type, group: col.group ?? null, editable: col.editable, currency: col.currency, locale: col.locale, toggleable: col.toggleable, prefix: col.prefix, suffix: col.suffix, tooltip: col.tooltip, description: col.description, lineClamp: col.lineClamp, iconMap: col.iconMap, colorMap: col.colorMap, selectOptions: col.selectOptions, html: col.html, markdown: col.markdown, bulleted: col.bulleted, stacked: col.stacked, rowIndex: col.rowIndex, avatarColumn: col.avatarColumn, hasDynamicSuffix: col.hasDynamicSuffix } satisfies ColumnMeta,
                cell: ({ row }) => {
                    const value = row.getValue(col.id);
                    const rowData = row.original as Record<string, unknown>;

                    // Row index column
                    if (col.rowIndex) {
                        const pageOffset = ((tableData.meta?.currentPage ?? 1) - 1) * (tableData.meta?.perPage ?? 0);
                        return <span className="text-muted-foreground tabular-nums">{pageOffset + row.index + 1}</span>;
                    }

                    // Stacked/composite columns
                    if (col.stacked && col.stacked.length > 0) {
                        return (
                            <div className="flex flex-col gap-0.5">
                                {col.stacked.map((stackedId) => {
                                    const stackedValue = rowData[stackedId];
                                    return <span key={stackedId} className="text-sm first:font-medium [&:not(:first-child)]:text-xs [&:not(:first-child)]:text-muted-foreground">{stackedValue != null ? String(stackedValue) : "—"}</span>;
                                })}
                            </div>
                        );
                    }

                    // Avatar composite cell: avatar image + text name
                    if (col.avatarColumn) {
                        const avatarUrl = rowData[col.avatarColumn];
                        const displayValue = value != null ? String(value) : "—";
                        return (
                            <div className="flex items-center gap-2.5">
                                {avatarUrl ? (
                                    <img src={String(avatarUrl)} alt={displayValue} className="h-8 w-8 shrink-0 rounded-full object-cover ring-1 ring-border/50" />
                                ) : (
                                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground ring-1 ring-border/50">{displayValue.charAt(0).toUpperCase()}</span>
                                )}
                                <span className="truncate font-medium">{displayValue}</span>
                            </div>
                        );
                    }

                    // Boolean toggle switch
                    if (col.toggleable && tableData.toggleUrl) {
                        return <ToggleCell value={!!value} row={rowData}
                            columnId={col.id} toggleUrl={tableData.toggleUrl} />;
                    }

                    // Inline select dropdown
                    if (col.type === "select" && col.selectOptions && onInlineEdit) {
                        return <SelectCell value={String(value ?? "")} options={col.selectOptions} onSave={(newVal) => {
                            pushEdit({ rowId: rowData.id, columnId: col.id, oldValue: value, newValue: newVal });
                            return onInlineEdit(row.original, col.id, newVal);
                        }} />;
                    }

                    // Inline editing with undo/redo support
                    if (col.editable && onInlineEdit) {
                        return <InlineEditCell value={value} columnId={col.id} columnType={col.type}
                            onSave={(newVal) => {
                                const rowId = rowData.id;
                                pushEdit({ rowId, columnId: col.id, oldValue: value, newValue: newVal });
                                return onInlineEdit(row.original, col.id, newVal);
                            }} t={t} />;
                    }

                    if (renderCell) { const custom = renderCell(col.id, value, row.original); if (custom !== undefined) return custom; }
                    if (value === null || value === undefined) return <span className="text-muted-foreground">—</span>;

                    // Wrap helper for prefix/suffix/tooltip/lineClamp/colorMap
                    const wrapCell = (content: React.ReactNode) => {
                        let wrapped = content;
                        // Prefix/suffix (supports dynamic server-resolved suffixes)
                        const resolvedSuffix = col.hasDynamicSuffix ? (rowData[`_suffix_${col.id}`] as string | null) : col.suffix;
                        if (col.prefix || resolvedSuffix) {
                            wrapped = <span>{col.prefix}{wrapped}{resolvedSuffix}</span>;
                        }
                        // Color map
                        if (col.colorMap) {
                            const colorClass = col.colorMap[String(value)] ?? null;
                            if (colorClass) wrapped = <span className={colorClass}>{wrapped}</span>;
                        }
                        // Line clamp
                        if (col.lineClamp) {
                            wrapped = <span className="block overflow-hidden" style={{ display: "-webkit-box", WebkitLineClamp: col.lineClamp, WebkitBoxOrient: "vertical" }}>{wrapped}</span>;
                        }
                        // Tooltip
                        if (col.tooltip) {
                            const tooltipText = rowData[col.tooltip] != null ? String(rowData[col.tooltip]) : col.tooltip;
                            wrapped = <span title={tooltipText}>{wrapped}</span>;
                        }
                        return wrapped;
                    };

                    // Icon column
                    if (col.type === "icon" && col.iconMap) {
                        const iconName = col.iconMap[String(value)] ?? String(value);
                        return wrapCell(<span className="inline-flex items-center gap-1.5"><span className="text-sm">{iconName}</span></span>);
                    }

                    // Color swatch column
                    if (col.type === "color" && typeof value === "string") {
                        return wrapCell(
                            <div className="flex items-center gap-2">
                                <span className="inline-block h-5 w-5 rounded border" style={{ backgroundColor: value }} />
                                <span className="text-xs text-muted-foreground font-mono">{value}</span>
                            </div>
                        );
                    }

                    if (col.type === "image" && typeof value === "string") {
                        return <img src={value} alt={col.label} className="h-8 w-8 rounded-full object-cover ring-1 ring-border/50" />;
                    }
                    if (col.type === "badge") {
                        const strValue = String(value);
                        const opt = col.options?.find((o) => o.value === strValue);
                        return wrapCell(<span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                            BADGE_VARIANTS[opt?.variant ?? "default"] ?? BADGE_VARIANTS.default)}>{opt?.label ?? strValue}</span>);
                    }
                    if (col.type === "currency" && (typeof value === "number" || typeof value === "string")) {
                        const numValue = typeof value === "string" ? parseFloat(value) : value;
                        if (!isNaN(numValue)) {
                            try { return wrapCell(<span className="tabular-nums">{numValue.toLocaleString(col.locale ?? undefined, { style: "currency", currency: col.currency ?? "USD" })}</span>); }
                            catch { return wrapCell(<span className="tabular-nums">{numValue.toLocaleString()}</span>); }
                        }
                    }
                    if (col.type === "percentage" && (typeof value === "number" || typeof value === "string")) {
                        const numValue = typeof value === "string" ? parseFloat(value) : value;
                        if (!isNaN(numValue)) return wrapCell(<span className="tabular-nums">{numValue.toLocaleString(col.locale ?? undefined, { style: "percent", minimumFractionDigits: 0, maximumFractionDigits: 2 })}</span>);
                    }
                    if (col.type === "link" && typeof value === "string") {
                        return wrapCell(<a href={value} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline" onClick={(e) => e.stopPropagation()}>
                            <span className="max-w-[200px] truncate">{value.replace(/^https?:\/\//, "")}</span><ExternalLink className="h-3 w-3 shrink-0" /></a>);
                    }
                    if (col.type === "email" && typeof value === "string") {
                        return wrapCell(<a href={`mailto:${value}`} className="text-primary hover:underline" onClick={(e) => e.stopPropagation()}>{value}</a>);
                    }
                    if (col.type === "phone" && typeof value === "string") {
                        return wrapCell(<a href={`tel:${value}`} className="text-primary hover:underline" onClick={(e) => e.stopPropagation()}>{value}</a>);
                    }
                    if (typeof value === "boolean") {
                        return value ? <Check className="h-4 w-4 text-emerald-600" />
                            : <X className="h-4 w-4 text-muted-foreground/40" />;
                    }

                    // HTML rendering (sanitized)
                    if (col.html && typeof value === "string") {
                        return wrapCell(<span dangerouslySetInnerHTML={{ __html: sanitizeHtml(value) }} />);
                    }

                    // Markdown rendering (simplified — bold, italic, code, links — sanitized)
                    if (col.markdown && typeof value === "string") {
                        const rendered = value
                            .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
                            .replace(/\*(.+?)\*/g, "<em>$1</em>")
                            .replace(/`(.+?)`/g, "<code class='rounded bg-muted px-1 py-0.5 text-xs'>$1</code>")
                            .replace(/\[(.+?)\]\((.+?)\)/g, "<a href='$2' class='text-primary hover:underline'>$1</a>");
                        return wrapCell(<span dangerouslySetInnerHTML={{ __html: sanitizeHtml(rendered) }} />);
                    }

                    // Bulleted list
                    if (col.bulleted && Array.isArray(value)) {
                        return wrapCell(
                            <ul className="list-disc list-inside space-y-0.5 text-sm">
                                {(value as unknown[]).map((item, i) => <li key={i}>{String(item)}</li>)}
                            </ul>
                        );
                    }

                    if (col.type === "number" && typeof value === "number") return wrapCell(<span className="tabular-nums">{value.toLocaleString()}</span>);
                    // Search highlighting for text values
                    const strValue = String(value);
                    if (resolvedOptions.searchHighlight && currentSearchTerm && col.type === "text") {
                        return wrapCell(highlightText(strValue, currentSearchTerm));
                    }
                    return wrapCell(strValue);
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

        // Detail row expand column (supports inline, modal, and drawer modes)
        if (hasDetailRows) {
            result.push({
                id: "_expand", header: "", enableHiding: false, enableResizing: false, size: 36,
                cell: ({ row }) => {
                    const rowId = String((row.original as Record<string, unknown>).id ?? row.index);
                    const isExpanded = expandedRows.has(rowId);

                    if (detailDisplay === "modal" || detailDisplay === "drawer") {
                        return (
                            <Button variant="ghost" size="icon" className="h-6 w-6"
                                onClick={(e) => { e.stopPropagation(); setDetailRow(row.original); }}
                                aria-label={t.expand}>
                                {detailDisplay === "drawer" ? <PanelRight className="h-4 w-4" /> : <Expand className="h-4 w-4" />}
                            </Button>
                        );
                    }

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
                cell: ({ row }) => <DataTableRowActions row={row.original} actions={actions} t={t}
                    onFormAction={(action, r) => setFormAction({ action, row: r })} /> });
        }

        return result;
    }, [mergedColumns, actions, hasBulkActions, renderCell, t, onInlineEdit, resolvedOptions.columnResizing, resolvedOptions.rowReorder, resolvedOptions.searchHighlight, resolvedOptions.copyCell, columnSizing, hasDetailRows, expandedRows, tableName, selectionMode, responsiveHiddenCols, tableData.toggleUrl, onReorder, handleRowDragStart, handleRowDragOver, handleRowDragEnd, currentSearchTerm]);

    const { table, meta, columnVisibility, columnOrder, setColumnOrder, rowSelection, setRowSelection,
        applyColumns, handleSort, handlePageChange, handlePerPageChange, handleCursorChange,
        handleGlobalSearch, handleApplyQuickView, handleApplyCustomSearch,
    } = useDataTable<TData>({ tableData, tableName, columnDefs, prefix, debounceMs, partialReloadKey,
        columnResizing: resolvedOptions.columnResizing, columnSizing, onColumnSizingChange: setColumnSizing, onStateChange });

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
    const searchInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!resolvedOptions.shortcutsOverlay) return;
        const handler = (e: KeyboardEvent) => {
            if (e.key === "?" && !e.ctrlKey && !e.metaKey && !(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLTextAreaElement)) {
                setShortcutsOpen(true);
            }
            // Ctrl+F: focus global search input
            if (resolvedOptions.globalSearch && (e.ctrlKey || e.metaKey) && e.key === "f" && !(e.target instanceof HTMLInputElement)) {
                e.preventDefault();
                searchInputRef.current?.focus();
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
    }, [resolvedOptions.shortcutsOverlay, resolvedOptions.undoRedo, resolvedOptions.globalSearch, handleUndo, handleRedo]);

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

    // Mobile breakpoint detection
    const isMobile = useMobileBreakpoint(mobileBreakpoint);

    // Filter chip clear handlers
    const filterKeyForChips = prefix ? `${prefix}_filter` : "filter";
    const pageKeyForChips = prefix ? `${prefix}_page` : "page";
    const handleClearFilterChip = useCallback((columnId: string) => {
        const url = new URL(window.location.href);
        url.searchParams.delete(`${filterKeyForChips}[${columnId}]`);
        url.searchParams.delete(pageKeyForChips);
        const options: Record<string, unknown> = { preserveScroll: true };
        if (partialReloadKey) options.only = [partialReloadKey];
        router.get(url.pathname + "?" + url.searchParams.toString(), {}, options);
    }, [filterKeyForChips, pageKeyForChips, partialReloadKey]);

    const handleClearAllFilterChips = useCallback(() => {
        const url = new URL(window.location.href);
        for (const key of [...url.searchParams.keys()]) {
            if (key.startsWith(`${filterKeyForChips}[`)) url.searchParams.delete(key);
        }
        url.searchParams.delete(pageKeyForChips);
        const options: Record<string, unknown> = { preserveScroll: true };
        if (partialReloadKey) options.only = [partialReloadKey];
        router.get(url.pathname + "?" + url.searchParams.toString(), {}, options);
    }, [filterKeyForChips, pageKeyForChips, partialReloadKey]);

    const activeFilterColumnIds = useMemo(() => new Set(Object.keys(meta.filters as Record<string, unknown>)), [meta.filters]);

    const summaryLabels: Record<string, string> = useMemo(() => ({
        sum: t.summarySum, avg: t.summaryAvg, min: t.summaryMin, max: t.summaryMax, count: t.summaryCount,
        range: t.summaryRange ?? "Range",
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

    // Row grouping: group rows by column value (server-side or user-selectable)
    const groupByColumn = userGroupBy ?? tableData.groupByColumn;
    const groupedRows = useMemo(() => {
        if (!groupByColumn || (!resolvedOptions.rowGrouping && !userGroupBy)) return null;
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
        <div className="space-y-4 dt-root">
            {/* Skip-link for keyboard users to bypass toolbar */}
            <a href={`#dt-table-${tableName}`} className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:rounded-md focus:bg-primary focus:px-3 focus:py-1.5 focus:text-primary-foreground focus:text-sm focus:font-medium focus:shadow-lg">
                {t.skipToTable}
            </a>
            {slots?.beforeTable}

            {/* ── Toolbar ── */}
            <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3 print:hidden">
                <div className="flex flex-1 items-center gap-2 min-w-0">
                    {resolvedOptions.globalSearch && (
                        <div className="relative w-56 lg:w-64">
                            <Search className="absolute left-2.5 top-2 h-4 w-4 text-muted-foreground/60" />
                            <Input ref={searchInputRef} placeholder={t.search} value={globalSearchValue} onChange={handleGlobalSearchChange}
                                className="h-8 pl-8 text-sm rounded-lg border-border/60 focus-visible:ring-primary/30" aria-label={t.search} />
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
                        <div className="hidden items-center gap-2 md:flex">
                            {/* Header actions */}
                            {headerActions?.map((action, i) => {
                                const Icon = action.icon;
                                return (
                                    <Button key={i} variant={action.variant ?? "outline"} size="sm" className="h-8 gap-1.5" onClick={action.onClick}>
                                        {Icon && <Icon className="h-3.5 w-3.5" />}
                                        <span className="hidden sm:inline">{action.label}</span>
                                    </Button>
                                );
                            })}
                            {/* User-selectable grouping */}
                            {groupByOptions && groupByOptions.length > 0 && (
                                <GroupBySelector options={groupByOptions} columns={mergedColumns}
                                    currentGroupBy={userGroupBy} onChange={handleGroupByChange} t={t} />
                            )}
                            <DataTableToolbar {...toolbarProps} />
                        </div>
                    </>
                )}
            </div>

            {/* ── Active filter chips ── */}
            <FilterChips filters={meta.filters as Record<string, unknown>} columns={mergedColumns}
                onClear={handleClearFilterChip} onClearAll={handleClearAllFilterChips} t={t} />

            {/* ── Inline row creation ── */}
            {onRowCreate && (
                <InlineRowCreator columns={mergedColumns} onRowCreate={onRowCreate} t={t} />
            )}

            {/* ── Bulk actions bar ── */}
            {hasBulkActions && selectedRows.length > 0 && (
                <div className="flex items-center gap-2 rounded-lg border bg-primary/5 border-primary/20 px-3 py-2 text-sm print:hidden">
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
                <div className="flex items-center justify-center gap-2 py-1.5 text-xs text-muted-foreground/70 print:hidden">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />{t.loading}
                </div>
            )}

            {/* ── Deferred loading placeholder ── */}
            {config?.deferLoading && !deferLoaded && (
                <div className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin" />{t.loading}
                </div>
            )}

            {/* ── Mobile card layout ── */}
            {isMobile && (!config?.deferLoading || deferLoaded) && (
                <MobileCardLayout rows={tableData.data} columns={mergedColumns}
                    renderCell={renderCell} actions={actions} onRowClick={onRowClick}
                    rowLink={rowLink} t={t} density={density} />
            )}

            {/* ── Table ── */}
            {!isMobile && (!config?.deferLoading || deferLoaded) && (
                <div id={`dt-table-${tableName}`} className={cn("rounded-xl border shadow-sm overflow-hidden", className)}
                    tabIndex={resolvedOptions.keyboardNavigation ? 0 : undefined}
                    onKeyDown={resolvedOptions.keyboardNavigation ? handleTableKeyDown : undefined}>
                    <div ref={virtualContainerRef} className={cn("overflow-x-auto", resolvedOptions.virtualScrolling && "max-h-[600px] overflow-y-auto")}>
                        <Table style={resolvedOptions.columnResizing ? { width: table.getCenterTotalSize() } : undefined}
                            role="grid" aria-rowcount={meta.total} aria-colcount={table.getVisibleLeafColumns().length}>
                            <TableHeader className={cn(resolvedOptions.stickyHeader && "sticky top-0 z-10 bg-background shadow-[0_1px_3px_-1px_rgba(0,0,0,0.1)]")}>
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
                                                                isActualGroup && "text-center text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/80 bg-muted/50 border-b border-border/60",
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
                                                            <div className="flex flex-col">
                                                                <div className="flex items-center gap-1">
                                                                    <DataTableColumnHeader label={colDef.label} sortable={colDef.sortable} sorts={meta.sorts}
                                                                        columnId={colDef.id} onSort={handleSort} align={isNumber ? "right" : "left"}>
                                                                        {renderHeader?.[colDef.id]}
                                                                    </DataTableColumnHeader>
                                                                    {hasActiveFilter && <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />}
                                                                </div>
                                                                {colDef.description && <span className="text-[10px] font-normal text-muted-foreground/70 leading-tight">{colDef.description}</span>}
                                                            </div>
                                                        ) : (
                                                            <div className="flex flex-col">
                                                                <div className="flex items-center gap-1">
                                                                    {renderHeader?.[header.column.id] ?? flexRender(header.column.columnDef.header, header.getContext())}
                                                                    {hasActiveFilter && <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />}
                                                                </div>
                                                                {colDef?.description && <span className="text-[10px] font-normal text-muted-foreground/70 leading-tight">{colDef.description}</span>}
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
                                                        className={cn("h-10 text-xs font-semibold text-muted-foreground bg-muted/20 border-b-2 border-border/60", isNumber && "text-right",
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
                                                            "transition-colors border-b border-border/40",
                                                            densityClasses.row,
                                                            index % 2 === 1 && "bg-muted/30",
                                                            "hover:bg-muted/50",
                                                            row.getIsSelected() && "bg-primary/8 hover:bg-primary/12",
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
                                                    {isExpanded && renderDetailRow && detailDisplay === "inline" && (
                                                        <TableRow key={`${row.id}-detail`} className="bg-muted/20 hover:bg-muted/30 border-b border-border/30">
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
                                            // Resolve group header display labels using column options/type
                                            const groupCol = groupByColumn ? mergedColumns.find((c) => c.id === groupByColumn) : null;
                                            const resolveGroupLabel = (rawValue: string): string => {
                                                if (!groupCol) return rawValue;
                                                // Badge/option columns: map value to option label
                                                if ((groupCol.type === "badge" || groupCol.type === "option") && groupCol.options) {
                                                    const opt = groupCol.options.find((o) => o.value === rawValue);
                                                    if (opt) return opt.label;
                                                }
                                                // Boolean columns: show Yes/No instead of true/false
                                                if (groupCol.type === "boolean" || rawValue === "true" || rawValue === "false") {
                                                    if (rawValue === "true" || rawValue === "1") return t.yes;
                                                    if (rawValue === "false" || rawValue === "0") return t.no;
                                                }
                                                return rawValue;
                                            };
                                            let rowIdx = 0;
                                            return [...groupedRows.entries()].map(([groupName, rows]) => {
                                                const isCollapsed = collapsedGroups.has(groupName);
                                                const startIdx = rowIdx;
                                                rowIdx += rows.length;
                                                const displayLabel = resolveGroupLabel(groupName);
                                                return (
                                                    <>{/* group fragment */}
                                                        <TableRow key={`group-${groupName}`}
                                                            className="bg-muted/40 hover:bg-muted/50 cursor-pointer border-b border-border/40 font-medium"
                                                            onClick={() => setCollapsedGroups((prev) => {
                                                                const next = new Set(prev);
                                                                if (next.has(groupName)) next.delete(groupName); else next.add(groupName);
                                                                return next;
                                                            })}>
                                                            <TableCell colSpan={table.getVisibleLeafColumns().length} className="py-2 font-medium">
                                                                <div className="flex items-center gap-2">
                                                                    {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                                                    <span>{displayLabel}</span>
                                                                    <span className="text-muted-foreground text-xs">({rows.length})</span>
                                                                </div>
                                                            </TableCell>
                                                        </TableRow>
                                                        {!isCollapsed && rows.map((row, i) => renderRow(row, startIdx + i))}
                                                    </>
                                                );
                                            });
                                        }

                                        // Normal mode — with optional virtual scrolling
                                        if (virtualRows) {
                                            const rows = allRows.slice(virtualRows.startIndex, virtualRows.endIndex);
                                            return (
                                                <>
                                                    {offsetTop > 0 && <tr style={{ height: offsetTop }} />}
                                                    {rows.map((row, i) => renderRow(row, virtualRows.startIndex + i))}
                                                    {(totalHeight - offsetTop - rows.length * (density === "compact" ? 32 : density === "spacious" ? 52 : 40)) > 0 && (
                                                        <tr style={{ height: totalHeight - offsetTop - rows.length * (density === "compact" ? 32 : density === "spacious" ? 52 : 40) }} />
                                                    )}
                                                </>
                                            );
                                        }
                                        return allRows.map((row, index) => renderRow(row, index));
                                    })()
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={table.getVisibleLeafColumns().length} className="h-48 text-center text-muted-foreground/70">
                                            <EmptyState customEmpty={emptyState} illustration={emptyStateIllustration}
                                                showIllustration={resolvedOptions.emptyStateIllustration} t={t} />
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>

                            {/* Per-page footer */}
                            {tableData.footer && (
                                <TableFooter>
                                    <TableRow className="bg-muted/40 font-medium border-t-2 border-border/60">
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
                                    <TableRow className="bg-muted/20 border-t-2 border-border/60">
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
            <div className="flex items-center justify-between pt-1 print:hidden">
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
                        <DataTablePagination meta={meta} onPageChange={handlePageChange} onPerPageChange={handlePerPageChange} onCursorChange={handleCursorChange} t={t} prefix={prefix} partialReloadKey={partialReloadKey} />
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

            {/* ── Detail row modal ── */}
            {hasDetailRows && detailDisplay === "modal" && renderDetailRow && (
                <Dialog open={!!detailRow} onOpenChange={(open) => { if (!open) setDetailRow(null); }}>
                    <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{t.expand}</DialogTitle>
                            <DialogDescription className="sr-only">{t.expand}</DialogDescription>
                        </DialogHeader>
                        <div className="py-2">
                            {detailRow && renderDetailRow(detailRow)}
                        </div>
                    </DialogContent>
                </Dialog>
            )}

            {/* ── Detail row drawer (side sheet) ── */}
            {hasDetailRows && detailDisplay === "drawer" && renderDetailRow && (
                <Sheet open={!!detailRow} onOpenChange={(open) => { if (!open) setDetailRow(null); }}>
                    <SheetContent className="sm:max-w-lg overflow-y-auto">
                        <SheetHeader>
                            <SheetTitle>{t.expand}</SheetTitle>
                            <SheetDescription className="sr-only">{t.expand}</SheetDescription>
                        </SheetHeader>
                        <div className="py-4">
                            {detailRow && renderDetailRow(detailRow)}
                        </div>
                    </SheetContent>
                </Sheet>
            )}

            {/* ── Form action dialog ── */}
            {formAction && formAction.action.form && (
                <FormActionDialog open={!!formAction} onOpenChange={(open) => { if (!open) setFormAction(null); }}
                    action={formAction.action} row={formAction.row} t={t} />
            )}

            {resolvedOptions.printable && (
                <style>{`@media print { body * { visibility: hidden; } .dt-root, .dt-root * { visibility: visible; } .dt-root { position: absolute; left: 0; top: 0; width: 100%; } .print\\:hidden { display: none !important; } table { border-collapse: collapse; width: 100%; } th, td { border: 1px solid #ddd; padding: 8px; text-align: left; } th { background-color: #f5f5f5; font-weight: bold; } }`}</style>
            )}
        </div>
    );
}

// ─── Exported component with Error Boundary ─────────────────────────────────

function DataTableWithBoundary<TData extends object>(props: DataTableProps<TData>) {
    return (
        <DataTableErrorBoundary>
            <DataTableInner {...props} />
        </DataTableErrorBoundary>
    );
}

/**
 * DataTable compound component.
 *
 * Supports both prop-based and JSX-based column configuration:
 *
 * @example Prop-based (traditional)
 * ```tsx
 * <DataTable tableData={data} tableName="products" renderCell={(col, val) => ...} />
 * ```
 *
 * @example JSX-based (declarative)
 * ```tsx
 * <DataTable tableData={data} tableName="products">
 *   <DataTable.Column id="name" renderCell={(val, row) => <strong>{val}</strong>} />
 *   <DataTable.Column id="status" renderHeader={<span>Status</span>} />
 * </DataTable>
 * ```
 */
export const DataTable = Object.assign(DataTableWithBoundary, {
    Column: DataTableColumn,
});
