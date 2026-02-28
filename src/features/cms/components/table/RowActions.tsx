"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Edit, Save, X, Loader2 } from "lucide-react";
import { ContentItem } from "@/features/cms";
import { DeleteConfirm } from "./DeleteConfirm";

interface RowActionsProps {
  item: ContentItem;
  editingIdRef: React.RefObject<string | null>;
  onEdit: (item: ContentItem) => void;
  onSave: (id: string) => void;
  onCancel: () => void;
  onDelete: (contentTypeId: string, itemId: string) => void;
  selectedTypeId: string;
  isSaving: boolean;
  isDeleting: boolean;
}

export function RowActions({
  item,
  editingIdRef,
  onEdit,
  onSave,
  onCancel,
  onDelete,
  selectedTypeId,
  isSaving,
  isDeleting,
}: RowActionsProps) {
  const isEdit = editingIdRef.current === item.id;

  return (
    <div className="flex items-center gap-0.5">
      {isEdit ? (
        <>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0"
            onClick={() => onSave(item.id)}
            disabled={isSaving}
            title="Save"
          >
            {isSaving ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0"
            onClick={onCancel}
            title="Cancel"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </>
      ) : (
        <>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0"
            onClick={() => onEdit(item)}
            title="Edit row"
          >
            <Edit className="h-3.5 w-3.5" />
          </Button>
          <DeleteConfirm
            label="Content Item"
            description={`Delete "${item.title}"? This cannot be undone.`}
            onConfirm={() => onDelete(selectedTypeId, item.id)}
            isPending={isDeleting}
          />
        </>
      )}
    </div>
  );
}
