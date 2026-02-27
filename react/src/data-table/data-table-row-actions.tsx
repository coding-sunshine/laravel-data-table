import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { useState } from "react";
import type { DataTableTranslations } from "./i18n";
import type { DataTableAction, DataTableConfirmOptions } from "./types";

interface DataTableRowActionsProps<TData> {
    row: TData;
    actions: DataTableAction<TData>[];
    t: DataTableTranslations;
}

export function DataTableRowActions<TData>({
    row,
    actions,
    t,
}: DataTableRowActionsProps<TData>) {
    const [confirmAction, setConfirmAction] = useState<{ action: DataTableAction<TData>; opts: DataTableConfirmOptions } | null>(null);

    const visibleActions = actions.filter(
        (action) => !action.visible || action.visible(row),
    );

    if (visibleActions.length === 0) return null;

    function handleClick(action: DataTableAction<TData>) {
        if (action.confirm) {
            const opts: DataTableConfirmOptions = typeof action.confirm === "object"
                ? action.confirm
                : {};
            setConfirmAction({ action, opts });
        } else {
            action.onClick(row);
        }
    }

    function handleConfirm() {
        if (confirmAction) {
            confirmAction.action.onClick(row);
            setConfirmAction(null);
        }
    }

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">{t.actions}</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    {visibleActions.map((action, index) => (
                        <DropdownMenuItem
                            key={index}
                            onClick={() => handleClick(action)}
                            className={
                                action.variant === "destructive"
                                    ? "text-destructive focus:text-destructive"
                                    : ""
                            }
                        >
                            {action.label}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>

            <Dialog open={!!confirmAction} onOpenChange={(open) => { if (!open) setConfirmAction(null); }}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            {confirmAction?.opts.title ?? t.confirmTitle}
                        </DialogTitle>
                        <DialogDescription>
                            {confirmAction?.opts.description ?? t.confirmDescription}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setConfirmAction(null)}>
                            {confirmAction?.opts.cancelLabel ?? t.confirmCancel}
                        </Button>
                        <Button
                            variant={confirmAction?.opts.variant ?? confirmAction?.action.variant ?? "default"}
                            onClick={handleConfirm}
                        >
                            {confirmAction?.opts.confirmLabel ?? t.confirmAction}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
