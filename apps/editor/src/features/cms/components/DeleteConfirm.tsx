import React from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@webbuilder/site-runtime/lib/utils";

interface DeleteConfirmProps {
  readonly label: string;
  readonly description: string;
  readonly onConfirm: () => void;
  readonly isPending?: boolean;
  readonly buttonClassName?: string;
  readonly buttonLabel?: string;
}

export function DeleteConfirm({
  label,
  description,
  onConfirm,
  isPending,
  buttonClassName,
  buttonLabel,
}: DeleteConfirmProps): React.ReactElement {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          type="button"
          size={buttonLabel ? "sm" : "icon-xs"}
          variant="ghost"
          className={cn(
            "text-muted-foreground hover:text-destructive hover:bg-destructive/10",
            buttonLabel ? "h-8 gap-1.5 px-2.5 text-xs" : "size-7",
            buttonClassName,
          )}
          title={`Delete ${label}`}
          aria-label={`Delete ${label}`}
          onClick={(e) => e.stopPropagation()}
        >
          <Trash2 className="size-3.5" />
          {buttonLabel && <span>{buttonLabel}</span>}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent onClick={(e) => e.stopPropagation()}>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {label}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isPending ? "Deleting…" : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
