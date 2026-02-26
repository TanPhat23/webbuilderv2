"use client";

import { useState } from "react";
import { useInvitationManager, useCollaboratorManager } from "@/hooks";
import { CollaboratorRole } from "@/features/collaboration";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import InviteMemberDialog from "./InviteMemberDialog";
import CollaboratorsTable from "./CollaboratorsTable";
import InvitationsTable from "./InvitationsTable";
import ConfirmationDialogs from "./ConfirmationDialogs";

interface CollaborationManagerProps {
  projectId: string;
  currentUserId: string;
  isOwner: boolean;
}

export function CollaborationManager({
  projectId,
  currentUserId,
  isOwner,
}: CollaborationManagerProps) {
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [deleteCollaboratorId, setDeleteCollaboratorId] = useState<
    string | null
  >(null);
  const [deleteInvitationId, setDeleteInvitationId] = useState<string | null>(
    null,
  );

  const invitations = useInvitationManager(projectId);
  const collaborators = useCollaboratorManager(projectId);

  const handleInvite = async (email: string, role: CollaboratorRole) => {
    await invitations.createInvitationAsync({
      projectId,
      email,
      role,
    });
  };

  const handleUpdateRole = async (
    collaboratorId: string,
    role: CollaboratorRole,
  ) => {
    await collaborators.updateCollaboratorRoleAsync(collaboratorId, { role });
  };

  const handleRemoveCollaborator = async () => {
    if (!deleteCollaboratorId) return;

    await collaborators.removeCollaboratorAsync(deleteCollaboratorId);
    setDeleteCollaboratorId(null);
  };

  const handleDeleteInvitation = async () => {
    if (!deleteInvitationId) return;

    await invitations.deleteInvitationAsync(deleteInvitationId);
    setDeleteInvitationId(null);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>
                Manage who has access to this project
              </CardDescription>
            </div>
            {isOwner && (
              <InviteMemberDialog
                isOpen={isInviteDialogOpen}
                onOpenChange={setIsInviteDialogOpen}
                onInvite={handleInvite}
                isCreating={invitations.isCreating}
              />
            )}
          </div>
        </CardHeader>
        <CardContent>
          <CollaboratorsTable
            collaborators={collaborators.collaborators}
            currentUserId={currentUserId}
            isOwner={isOwner}
            isLoading={collaborators.isLoading}
            isUpdatingRole={collaborators.isUpdatingRole}
            onUpdateRole={handleUpdateRole}
            onRemoveCollaborator={setDeleteCollaboratorId}
          />
        </CardContent>
      </Card>

      {isOwner && (
        <Card>
          <CardHeader>
            <CardTitle>Pending Invitations</CardTitle>
            <CardDescription>
              Invitations sent but not yet accepted
            </CardDescription>
          </CardHeader>
          <CardContent>
            <InvitationsTable
              invitations={invitations.invitations}
              isLoading={invitations.isLoading}
              onDeleteInvitation={setDeleteInvitationId}
            />
          </CardContent>
        </Card>
      )}

      <ConfirmationDialogs
        deleteCollaboratorId={deleteCollaboratorId}
        deleteInvitationId={deleteInvitationId}
        collaborators={collaborators.collaborators}
        currentUserId={currentUserId}
        isRemoving={collaborators.isRemoving}
        isDeleting={invitations.isDeleting}
        onCancelRemoveCollaborator={() => setDeleteCollaboratorId(null)}
        onConfirmRemoveCollaborator={handleRemoveCollaborator}
        onCancelDeleteInvitation={() => setDeleteInvitationId(null)}
        onConfirmDeleteInvitation={handleDeleteInvitation}
      />
    </div>
  );
}
