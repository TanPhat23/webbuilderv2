"use client";

import {
  CollaboratorRole,
  Collaborator,
} from "@/features/collaboration";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, LogOut, Loader2, Eye, Edit } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { getRoleIcon, getRoleBadgeVariant } from "./utils";

// Helper functions for user display
const getFullName = (user: Collaborator["user"]) => {
  if (!user) return "Unknown User";
  const { firstName, lastName } = user;
  if (firstName && lastName) return `${firstName} ${lastName}`;
  if (firstName) return firstName;
  if (lastName) return lastName;
  return "Unknown User";
};

const getAvatarInitial = (user: Collaborator["user"]) => {
  if (!user) return "";
  const { firstName, lastName, email } = user;
  if (firstName) return firstName.charAt(0).toUpperCase();
  if (lastName) return lastName.charAt(0).toUpperCase();
  if (email) return email.charAt(0).toUpperCase();
  return "";
};

interface CollaboratorsTableProps {
  collaborators: Collaborator[];
  currentUserId: string;
  isOwner: boolean;
  isLoading: boolean;
  isUpdatingRole: boolean;
  onUpdateRole: (collaboratorId: string, role: CollaboratorRole) => void;
  onRemoveCollaborator: (collaboratorId: string) => void;
}

export default function CollaboratorsTable({
  collaborators,
  currentUserId,
  isOwner,
  isLoading,
  isUpdatingRole,
  onUpdateRole,
  onRemoveCollaborator,
}: CollaboratorsTableProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (collaborators.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No team members yet. Invite someone to collaborate!
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>User</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Joined</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {collaborators.map((collaborator) => {
          const isCurrentUser = collaborator.userId === currentUserId;
          const canModify =
            isOwner && collaborator.role !== CollaboratorRole.OWNER;

          return (
            <TableRow key={collaborator.id}>
              <TableCell>
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                    {getAvatarInitial(collaborator.user)}
                  </div>
                  <div>
                    <div className="font-medium">
                      {getFullName(collaborator.user)}
                      {isCurrentUser && (
                        <span className="ml-2 text-xs text-muted-foreground">
                          (You)
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {collaborator.user?.email}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                {canModify ? (
                  <Select
                    value={collaborator.role}
                    onValueChange={(value) =>
                      onUpdateRole(collaborator.id, value as CollaboratorRole)
                    }
                    disabled={isUpdatingRole}
                  >
                    <SelectTrigger className="w-[140px]">
                      <div className="flex items-center gap-2">
                        {getRoleIcon(collaborator.role)}
                        <SelectValue />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={CollaboratorRole.VIEWER}>
                        <div className="flex items-center gap-2">
                          <span>Viewer</span>
                        </div>
                      </SelectItem>
                      <SelectItem value={CollaboratorRole.EDITOR}>
                        <div className="flex items-center gap-2">
                          <span>Editor</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge variant={getRoleBadgeVariant(collaborator.role)}>
                    <div className="flex items-center gap-1">
                      {getRoleIcon(collaborator.role)}
                      <span className="capitalize">{collaborator.role}</span>
                    </div>
                  </Badge>
                )}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(collaborator.createdAt), {
                  addSuffix: true,
                })}
              </TableCell>
              <TableCell className="text-right">
                {isCurrentUser &&
                collaborator.role !== CollaboratorRole.OWNER ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveCollaborator(collaborator.id)}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Leave
                  </Button>
                ) : canModify ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveCollaborator(collaborator.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                ) : null}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
