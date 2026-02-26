"use client";

import { useState } from "react";
import { useCreateInvitation } from "@/hooks";
import { CollaboratorRole } from "@/features/collaboration";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, Loader2, Mail, Edit, Eye } from "lucide-react";

interface InvitationCardProps {
  projectId: string;
  projectName?: string;
}

export default function InvitationCard({
  projectId,
  projectName,
}: InvitationCardProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<CollaboratorRole>(CollaboratorRole.VIEWER);
  const createInvitation = useCreateInvitation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !role) return;

    try {
      await createInvitation.mutateAsync({
        projectId,
        email,
        role,
      });
      setEmail("");
      setRole(CollaboratorRole.VIEWER);
    } catch (error) {
      console.error("Failed to send invitation:", error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Invite Collaborator
        </CardTitle>
        <CardDescription>
          {projectName
            ? `Invite someone to collaborate on ${projectName}`
            : "Invite someone to collaborate on this project"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="invite-email">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="invite-email"
                type="email"
                placeholder="colleague@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
                disabled={createInvitation.isPending}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="invite-role">Access Level</Label>
            <Select
              value={role}
              onValueChange={(value) => setRole(value as CollaboratorRole)}
              disabled={createInvitation.isPending}
            >
              <SelectTrigger id="invite-role">
                <SelectValue placeholder="Select access level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={CollaboratorRole.VIEWER}>
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-gray-500" />
                    <div>
                      <div className="font-medium">Viewer</div>
                      <div className="text-xs text-muted-foreground">
                        Can view project only
                      </div>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value={CollaboratorRole.EDITOR}>
                  <div className="flex items-center gap-2">
                    <Edit className="h-4 w-4 text-blue-500" />
                    <div>
                      <div className="font-medium">Editor</div>
                      <div className="text-xs text-muted-foreground">
                        Can view and edit project
                      </div>
                    </div>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={!email || !role || createInvitation.isPending}
          >
            {createInvitation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending Invitation...
              </>
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" />
                Send Invitation
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
