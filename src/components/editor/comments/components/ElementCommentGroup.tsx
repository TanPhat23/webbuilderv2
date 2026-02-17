"use client";

import React, { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { ChevronDown, Layers, MousePointerClick } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ElementComment } from "@/interfaces/elementcomment.interface";
import { useElements } from "@/globalstore/selectors/element-selectors";
import { elementHelper } from "@/lib/utils/element/elementhelper";
import { CommentCard } from "./CommentCard";

interface ElementCommentGroupProps {
  elementId: string;
  comments: ElementComment[];
  isEditing: boolean;
  editingCommentId: string | null;
  editingText: string;
  isLoading: boolean;
  onStartEdit: (id: string, content: string) => void;
  onCancelEdit: () => void;
  onUpdate: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleResolved: (id: string) => void;
  onEditTextChange: (text: string) => void;
  onElementSelect: (elementId: string) => void;
}

export function ElementCommentGroup({
  elementId,
  comments,
  isEditing,
  editingCommentId,
  editingText,
  isLoading,
  onStartEdit,
  onCancelEdit,
  onUpdate,
  onDelete,
  onToggleResolved,
  onEditTextChange,
  onElementSelect,
}: ElementCommentGroupProps) {
  const { user } = useUser();
  const elements = useElements();
  const [isOpen, setIsOpen] = useState(true);

  const element = elementHelper.findById(elements, elementId);
  const unresolvedCount = comments.filter((c) => !c.resolved).length;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="border border-border rounded-lg overflow-hidden bg-card">
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="w-full flex items-center justify-between p-3 hover:bg-muted"
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <motion.div
                animate={{ rotate: isOpen ? 0 : -90 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </motion.div>
              <div className="h-8 w-8 rounded-lg bg-accent flex items-center justify-center">
                <Layers className="h-4 w-4 text-accent-foreground" />
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-semibold text-foreground truncate">
                  {element?.type || "Element"}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  #{elementId.slice(0, 12)}...
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {comments.length}
                </Badge>
                {unresolvedCount > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    {unresolvedCount} active
                  </Badge>
                )}
              </div>
            </div>
          </Button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="p-3 pt-0 space-y-2 border-t border-border">
            <Button
              size="sm"
              variant="outline"
              className="w-full gap-2"
              onClick={() => onElementSelect(elementId)}
            >
              <MousePointerClick className="h-3.5 w-3.5" />
              Focus on this element
            </Button>

            <AnimatePresence mode="popLayout">
              {comments.map((comment) => (
                <CommentCard
                  key={comment.id}
                  comment={comment}
                  isEditing={isEditing && editingCommentId === comment.id}
                  editingText={editingText}
                  isLoading={isLoading}
                  canEdit={user?.id === comment.authorId}
                  onStartEdit={onStartEdit}
                  onCancelEdit={onCancelEdit}
                  onUpdate={onUpdate}
                  onDelete={onDelete}
                  onToggleResolved={onToggleResolved}
                  onEditTextChange={onEditTextChange}
                  onDoubleClick={() => onElementSelect(elementId)}
                />
              ))}
            </AnimatePresence>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
