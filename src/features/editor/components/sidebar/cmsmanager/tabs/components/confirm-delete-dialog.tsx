import React from "react";
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
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface ConfirmDeleteDialogProps {
  /**
   * Title of the item being deleted
   */
  itemName: string;
  /**
   * Type of item (e.g., "Content Type", "Content Field", "Content Item")
   */
  itemType: string;
  /**
   * Function to call when delete is confirmed
   */
  onConfirm: () => void;
  /**
   * Whether the delete action is pending
   */
  isPending?: boolean;
  /**
   * Additional description text (optional)
   */
  description?: string;
  /**
   * Custom trigger button (optional, defaults to trash icon button)
   */
  trigger?: React.ReactNode;
  /**
   * Size of the default trigger button
   */
  triggerSize?: "default" | "sm" | "lg" | "icon";
}

/**
 * Reusable confirmation dialog for delete actions
 * Uses destructive styling from globals.css theme
 */
export function ConfirmDeleteDialog({
  itemName,
  itemType,
  onConfirm,
  isPending = false,
  description,
  trigger,
  triggerSize = "sm",
}: ConfirmDeleteDialogProps) {
  const defaultDescription =
    description ||
    `Are you sure you want to delete "${itemName}"? This action cannot be undone.`;

  const defaultTrigger = (
    <Button
      size={triggerSize}
      variant="destructive"
      className="h-8 w-8 p-0"
      title={`Delete ${itemType}`}
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  );

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {trigger || defaultTrigger}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {itemType}</AlertDialogTitle>
          <AlertDialogDescription>{defaultDescription}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isPending ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
