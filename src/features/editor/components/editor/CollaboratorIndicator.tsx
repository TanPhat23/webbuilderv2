"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Users } from "lucide-react";
import { useCollaboratorUsers } from "@/features/editor";
import { useAuth } from "@clerk/nextjs";

// Helper functions for user display
const getFullName = (user: { userName: string; email: string }) => {
  return user.userName || user.email || "Unknown User";
};

const getAvatarInitial = (user: { userName: string; email: string }) => {
  if (user.userName) return user.userName.charAt(0).toUpperCase();
  if (user.email) return user.email.charAt(0).toUpperCase();
  return "";
};

interface CollaboratorIndicatorProps {
  projectId: string;
}

interface OnlineUserItemProps {
  user: { userName: string; email: string };
  isCurrentUser?: boolean;
}

function OnlineUserItem({ user, isCurrentUser = false }: OnlineUserItemProps) {
  const displayName = isCurrentUser ? "You" : getFullName(user);

  return (
    <div
      className={`flex items-center justify-between p-2 ${isCurrentUser ? "rounded-lg bg-muted/50 mb-2" : ""}`}
    >
      <div className="flex items-center gap-2">
        <Avatar className="h-6 w-6">
          <AvatarFallback className="text-xs">
            {getAvatarInitial(user)}
          </AvatarFallback>
        </Avatar>
        <div>
          <div className="text-sm font-medium">{displayName}</div>
          <div className="text-xs text-muted-foreground">{user.email}</div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="text-xs">
          Online
        </Badge>
      </div>
    </div>
  );
}

export default function CollaboratorIndicator({
  projectId,
}: CollaboratorIndicatorProps) {
  const { userId } = useAuth();
  const users = useCollaboratorUsers();

  const onlineUsers = Object.values(users);
  const currentUser = onlineUsers.find((u) => u.userId === userId);
  const otherUsers = onlineUsers.filter((u) => u.userId !== userId);

  const onlineCount = onlineUsers.length;
  const hasOnlineUsers = onlineCount > 0;

  if (!hasOnlineUsers) {
    return null;
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
        >
          <Users className="h-4 w-4" />
          <span className="hidden sm:inline">
            {hasOnlineUsers ? `${onlineCount} ` : "No one online"}
          </span>
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-sm mb-3">Online Collaborators</h4>
            {!hasOnlineUsers && (
              <p className="text-xs text-muted-foreground mb-3">
                No one is currently online in this session.
              </p>
            )}

            {currentUser && <OnlineUserItem user={currentUser} isCurrentUser />}

            {otherUsers.map((user) => (
              <OnlineUserItem key={user.userId} user={user} />
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
