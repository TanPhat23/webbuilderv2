"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2, Globe, EyeOff } from "lucide-react";

interface PublishProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isPublishing: boolean;
  projectName?: string;
  currentlyPublished: boolean;
}

export function PublishProjectDialog({
  open,
  onOpenChange,
  onConfirm,
  isPublishing,
  projectName,
  currentlyPublished,
}: PublishProjectDialogProps) {
  const action = currentlyPublished ? "unpublish" : "publish";
  const ActionIcon = currentlyPublished ? EyeOff : Globe;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <ActionIcon className="h-5 w-5" />
            {currentlyPublished ? "Unpublish Project" : "Publish Project"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {currentlyPublished ? (
              <>
                Are you sure you want to unpublish{" "}
                {projectName ? (
                  <>
                    <span className="font-semibold text-foreground">
                      {projectName}
                    </span>
                    ?
                  </>
                ) : (
                  "this project?"
                )}{" "}
                This will make the project inaccessible to public viewers. The
                project will remain in your dashboard and can be republished at
                any time.
              </>
            ) : (
              <>
                Are you sure you want to publish{" "}
                {projectName ? (
                  <>
                    <span className="font-semibold text-foreground">
                      {projectName}
                    </span>
                    ?
                  </>
                ) : (
                  "this project?"
                )}{" "}
                This will make the project publicly accessible. Make sure all
                content is ready and reviewed before publishing.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPublishing}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className={
              currentlyPublished
                ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                : ""
            }
            disabled={isPublishing}
          >
            {isPublishing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {currentlyPublished ? "Unpublishing..." : "Publishing..."}
              </>
            ) : (
              <>
                <ActionIcon className="mr-2 h-4 w-4" />
                {currentlyPublished ? "Unpublish" : "Publish"}
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
