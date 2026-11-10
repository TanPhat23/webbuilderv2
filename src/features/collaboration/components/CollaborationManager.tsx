
import { useState } from "react";
import { useProjectInvitations, useCreateInvitation, useDeleteInvitation } from "@/features/collaboration/hooks/useInvitations";
import { useProjectCollaborators, useUpdateCollaboratorRole, useRemoveCollaborator } from "@/features/collaboration/hooks/useCollaborators";
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

  const invitations = useProjectInvitations(projectId);
  const collaborators = useProjectCollaborators(projectId);
  const createInvitation = useCreateInvitation();
  const deleteInvitation = useDeleteInvitation(projectId);
  const updateRole = useUpdateCollaboratorRole(projectId);
  const removeCollaborator = useRemoveCollaborator(projectId);

  const handleInvite = async (email: string, role: CollaboratorRole) => {
    await createInvitation.mutateAsync({
      projectId,
      email,
      role,
    });
  };

  const handleUpdateRole = async (
    collaboratorId: string,
    role: CollaboratorRole,
  ) => {
    await updateRole.mutateAsync({ collaboratorId, role: { role } });
  };

  const handleRemoveCollaborator = async () => {
    if (!deleteCollaboratorId) return;

    await removeCollaborator.mutateAsync(deleteCollaboratorId);
    setDeleteCollaboratorId(null);
  };

  const handleDeleteInvitation = async () => {
    if (!deleteInvitationId) return;

    await deleteInvitation.mutateAsync(deleteInvitationId);
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
                isCreating={createInvitation.isPending}
              />
            )}
          </div>
        </CardHeader>
        <CardContent>
          <CollaboratorsTable
            collaborators={collaborators.data || []}
            currentUserId={currentUserId}
            isOwner={isOwner}
            isLoading={collaborators.isLoading}
            isUpdatingRole={updateRole.isPending}
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
              invitations={invitations.data || []}
              isLoading={invitations.isLoading}
              onDeleteInvitation={setDeleteInvitationId}
            />
          </CardContent>
        </Card>
      )}

      <ConfirmationDialogs
        deleteCollaboratorId={deleteCollaboratorId}
        deleteInvitationId={deleteInvitationId}
        collaborators={collaborators.data || []}
        currentUserId={currentUserId}
        isRemoving={removeCollaborator.isPending}
        isDeleting={deleteInvitation.isPending}
        onCancelRemoveCollaborator={() => setDeleteCollaboratorId(null)}
        onConfirmRemoveCollaborator={handleRemoveCollaborator}
        onCancelDeleteInvitation={() => setDeleteInvitationId(null)}
        onConfirmDeleteInvitation={handleDeleteInvitation}
      />
    </div>
  );
}
