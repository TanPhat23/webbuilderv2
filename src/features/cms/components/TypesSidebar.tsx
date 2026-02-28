"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Plus, X, ChevronRight } from "lucide-react";
import { useCMSContext } from "../provider/CMSProvider";
import { DeleteDialog } from "./primitives";
import { cn } from "@/lib/utils";

export function TypesSidebar() {
  const {
    contentTypes,
    selectedTypeId,
    typesLoading,
    createTypeMutation,
    deleteTypeMutation,
    selectType,
    handleCreateType,
    handleDeleteType,
  } = useCMSContext();

  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleSave = () => {
    if (!name.trim()) return;
    handleCreateType({
      name: name.trim(),
      description: description.trim() || undefined,
    });
    setName("");
    setDescription("");
    setAdding(false);
  };

  const handleCancel = () => {
    setAdding(false);
    setName("");
    setDescription("");
  };

  return (
    <div className="flex flex-col h-full border-r bg-muted/20">
      {/* Header */}
      <div className="flex items-center justify-between px-3 h-10 border-b shrink-0">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Content Types
        </span>
        <Button
          size="sm"
          variant="ghost"
          className="h-6 w-6 p-0"
          onClick={() => setAdding(true)}
          disabled={adding}
          title="Add content type"
        >
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Inline add form */}
      {adding && (
        <div className="px-2 py-2 border-b space-y-1.5 bg-muted/30 shrink-0">
          <Input
            autoFocus
            placeholder="Type name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-7 text-xs"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave();
              if (e.key === "Escape") handleCancel();
            }}
          />
          <Input
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="h-7 text-xs"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave();
              if (e.key === "Escape") handleCancel();
            }}
          />
          <div className="flex gap-1">
            <Button
              size="sm"
              className="h-6 text-xs flex-1"
              onClick={handleSave}
              disabled={!name.trim() || createTypeMutation.isPending}
            >
              {createTypeMutation.isPending ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                "Save"
              )}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0"
              onClick={handleCancel}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )}

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {typesLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        ) : contentTypes.length === 0 ? (
          <p className="px-3 py-6 text-center text-xs text-muted-foreground">
            No types yet
          </p>
        ) : (
          contentTypes.map((type) => (
            <div
              key={type.id}
              onClick={() => selectType(type.id)}
              className={cn(
                "group flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-accent/50 transition-colors border-b border-border/40",
                selectedTypeId === type.id &&
                  "bg-accent text-accent-foreground",
              )}
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <ChevronRight
                  className={cn(
                    "h-3 w-3 shrink-0 text-muted-foreground transition-transform",
                    selectedTypeId === type.id && "rotate-90 text-foreground",
                  )}
                />
                <div className="min-w-0">
                  <p className="text-xs font-medium truncate">{type.name}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {type.fields?.length ?? 0}f &middot;{" "}
                    {type.items?.length ?? 0}i
                  </p>
                </div>
              </div>

              <span onClick={(e) => e.stopPropagation()}>
                <DeleteDialog
                  label="Content Type"
                  description={`Delete "${type.name}"? All associated fields and content items will also be removed.`}
                  onConfirm={() => handleDeleteType(type.id)}
                  isPending={deleteTypeMutation.isPending}
                />
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
