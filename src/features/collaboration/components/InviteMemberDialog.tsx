"use client";

import { useState } from "react";
import { CollaboratorRole } from "@/features/collaboration";
import { useSearchUsers } from "@/hooks";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { UserPlus, Eye, Edit, Loader2 } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

interface InviteMemberDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onInvite: (email: string, role: CollaboratorRole) => Promise<void>;
  isCreating: boolean;
}

export default function InviteMemberDialog({
  isOpen,
  onOpenChange,
  onInvite,
  isCreating,
}: InviteMemberDialogProps) {
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<CollaboratorRole>(
    CollaboratorRole.VIEWER,
  );

  const { data: searchResults, isLoading: isSearching } = useSearchUsers(
    inviteEmail,
    inviteEmail.length > 2,
  );

  // Debug logging
  console.log("Search results:", searchResults);
  console.log("Is searching:", isSearching);
  console.log("Invite email:", inviteEmail);
  console.log("Search results type:", Array.isArray(searchResults));

  const handleInvite = async () => {
    if (!inviteEmail || !inviteRole) return;

    try {
      await onInvite(inviteEmail, inviteRole);
      setInviteEmail("");
      setInviteRole(CollaboratorRole.VIEWER);
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to send invitation:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Invite Member
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite Team Member</DialogTitle>
          <DialogDescription>
            Send an invitation to collaborate on this project
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Command
              className="rounded-lg border shadow-md"
              shouldFilter={false}
            >
              <CommandInput
                placeholder="Search users or enter email..."
                value={inviteEmail}
                onValueChange={setInviteEmail}
              />
              <CommandList>
                {isSearching ? (
                  <div className="py-6 text-center text-sm">
                    <Loader2 className="mx-auto h-4 w-4 animate-spin" />
                  </div>
                ) : (
                  <>
                    <CommandEmpty>
                      {inviteEmail
                        ? "No users found. You can still invite by email."
                        : "Start typing to search users or enter an email."}
                    </CommandEmpty>
                    {searchResults &&
                      Array.isArray(searchResults) &&
                      searchResults.length > 0 && (
                        <CommandGroup heading="Select a user">
                          {searchResults.map((user) => (
                            <CommandItem
                              key={user.id}
                              value={user.email}
                              onSelect={() => setInviteEmail(user.email)}
                            >
                              <div className="flex flex-col">
                                <span>
                                  {`${user.firstName || ""} ${user.lastName || ""}`.trim() ||
                                    "No name"}
                                </span>
                                <span className="text-sm text-muted-foreground">
                                  {user.email}
                                </span>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      )}
                  </>
                )}
              </CommandList>
            </Command>
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select
              value={inviteRole}
              onValueChange={(value) =>
                setInviteRole(value as CollaboratorRole)
              }
            >
              <SelectTrigger id="role">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={CollaboratorRole.VIEWER}>
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    <span>Viewer - Can view only</span>
                  </div>
                </SelectItem>
                <SelectItem value={CollaboratorRole.EDITOR}>
                  <div className="flex items-center gap-2">
                    <Edit className="h-4 w-4" />
                    <span>Editor - Can view and edit</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleInvite}
            disabled={!inviteEmail || !inviteRole || isCreating}
          >
            {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Send Invitation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
