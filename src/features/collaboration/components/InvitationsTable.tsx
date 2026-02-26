"use client";

import { Invitation } from "@/features/collaboration";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, Trash2, Loader2, Clock, CheckCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { getRoleIcon, getRoleBadgeVariant } from "./utils";

interface InvitationsTableProps {
  invitations: Invitation[];
  isLoading: boolean;
  onDeleteInvitation: (invitationId: string) => void;
}

export default function InvitationsTable({
  invitations,
  isLoading,
  onDeleteInvitation,
}: InvitationsTableProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (invitations.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No pending invitations
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Sent</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invitations.map((invitation) => {
          const isExpired = new Date(invitation.expiresAt) < new Date();
          const isAccepted = !!invitation.acceptedAt;

          return (
            <TableRow key={invitation.id}>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{invitation.email}</span>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={getRoleBadgeVariant(invitation.role)}>
                  <div className="flex items-center gap-1">
                    {getRoleIcon(invitation.role)}
                    <span className="capitalize">{invitation.role}</span>
                  </div>
                </Badge>
              </TableCell>
              <TableCell>
                {isAccepted ? (
                  <Badge variant="default" className="bg-green-500">
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Accepted
                  </Badge>
                ) : isExpired ? (
                  <Badge variant="destructive">
                    <Clock className="mr-1 h-3 w-3" />
                    Expired
                  </Badge>
                ) : (
                  <Badge variant="secondary">
                    <Clock className="mr-1 h-3 w-3" />
                    Pending
                  </Badge>
                )}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(invitation.createdAt), {
                  addSuffix: true,
                })}
              </TableCell>
              <TableCell className="text-right">
                {!isAccepted && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeleteInvitation(invitation.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
