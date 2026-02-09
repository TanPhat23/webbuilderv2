"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Users, UserPlus } from "lucide-react";
import { CollaborationManager } from "@/components/collaboration";
import { useAuth } from "@clerk/nextjs";
import { useProjectStore } from "@/globalstore/project-store";

interface CollaborationButtonProps {
  projectId: string;
}

export default function CollaborationButton({
  projectId,
}: CollaborationButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { userId } = useAuth();
  const { project } = useProjectStore();

  const isOwner = project?.ownerId === userId;

  if (!isOwner) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
        >
          <Users className="h-4 w-4" />
          <span className="hidden sm:inline">Collaborators</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[40vw]! min-w-[20vw] max-h-[95vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Project Collaboration
          </DialogTitle>
        </DialogHeader>
        <CollaborationManager
          projectId={projectId}
          currentUserId={userId || ""}
          isOwner={isOwner}
        />
      </DialogContent>
    </Dialog>
  );
}
