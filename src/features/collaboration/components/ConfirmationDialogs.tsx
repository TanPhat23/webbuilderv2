"use client";

import { Collaborator } from "@/features/collaboration";
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
import { Loader2 } from "lucide-react";

interface ConfirmationDialogsProps {
  deleteCollaboratorId: string | null;
  deleteInvitationId: string | null;
  collaborators: Collaborator[];
  currentUserId: string;
  isRemoving: boolean;
  isDeleting: boolean;
  onCancelRemoveCollaborator: () => void;
  onConfirmRemoveCollaborator: () => void;
  onCancelDeleteInvitation: () => void;
  onConfirmDeleteInvitation: () => void;
}

export default function ConfirmationDialogs({
  deleteCollaboratorId,
  deleteInvitationId,
  collaborators,
  currentUserId,
  isRemoving,
  isDeleting,
  onCancelRemoveCollaborator,
  onConfirmRemoveCollaborator,
  onCancelDeleteInvitation,
  onConfirmDeleteInvitation,
}: ConfirmationDialogsProps) {
  const collaboratorToRemove = collaborators.find(
    (c) => c.id === deleteCollaboratorId,
  );
  const isLeaving = collaboratorToRemove?.userId === currentUserId;

  return (
    <>
      {/* Delete Collaborator Confirmation */}
      <AlertDialog
        open={!!deleteCollaboratorId}
        onOpenChange={(open) => !open && onCancelRemoveCollaborator()}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {isLeaving ? "Leave Project" : "Remove Team Member"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isLeaving
                ? "Are you sure you want to leave this project? You will lose access to all project resources."
                : "Are you sure you want to remove this team member? They will lose access to the project."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={onConfirmRemoveCollaborator}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isRemoving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLeaving ? "Leave Project" : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Invitation Confirmation */}
      <AlertDialog
        open={!!deleteInvitationId}
        onOpenChange={(open) => !open && onCancelDeleteInvitation()}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke Invitation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to revoke this invitation? The recipient
              will no longer be able to use the invitation link.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={onConfirmDeleteInvitation}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Revoke
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
