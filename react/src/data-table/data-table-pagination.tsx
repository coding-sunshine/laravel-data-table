import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
} from "lucide-react";
import type { DataTableTranslations } from "./i18n";
import type { DataTableMeta } from "./types";

interface DataTablePaginationProps {
    meta: DataTableMeta;
    onPageChange: (page: number) => void;
    onPerPageChange: (perPage: number) => void;
    onCursorChange?: (cursor: string | null) => void;
    t: DataTableTranslations;
}

export function DataTablePagination({
    meta,
    onPageChange,
    onPerPageChange,
    onCursorChange,
    t,
}: DataTablePaginationProps) {
    const isCursor = meta.paginationType === "cursor";
    const isSimple = meta.paginationType === "simple";

    return (
        <div className="flex items-center justify-between px-2 py-4">
            <div className="text-sm text-muted-foreground">
                {!isCursor && !isSimple && t.totalResults(meta.total)}
            </div>
            <div className="flex items-center gap-6 lg:gap-8">
                <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{t.rowsPerPage}</p>
                    <Select
                        value={String(meta.perPage)}
                        onValueChange={(value) => onPerPageChange(Number(value))}
                    >
                        <SelectTrigger className="h-8 w-[70px]">
                            <SelectValue placeholder={String(meta.perPage)} />
                        </SelectTrigger>
                        <SelectContent side="top">
                            {[10, 25, 50, 100].map((size) => (
                                <SelectItem key={size} value={String(size)}>
                                    {size}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                {!isCursor && (
                    <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                        {t.pageOf(meta.currentPage, meta.lastPage)}
                    </div>
                )}
                {isCursor ? (
                    <div className="flex items-center gap-1">
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => onCursorChange?.(meta.prevCursor ?? null)}
                            disabled={!meta.prevCursor}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => onCursorChange?.(meta.nextCursor ?? null)}
                            disabled={!meta.nextCursor}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                ) : (
                    <div className="flex items-center gap-1">
                        {!isSimple && (
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => onPageChange(1)}
                                disabled={meta.currentPage <= 1}
                            >
                                <ChevronsLeft className="h-4 w-4" />
                            </Button>
                        )}
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => onPageChange(meta.currentPage - 1)}
                            disabled={meta.currentPage <= 1}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => onPageChange(meta.currentPage + 1)}
                            disabled={meta.currentPage >= meta.lastPage}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                        {!isSimple && (
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => onPageChange(meta.lastPage)}
                                disabled={meta.currentPage >= meta.lastPage}
                            >
                                <ChevronsRight className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
