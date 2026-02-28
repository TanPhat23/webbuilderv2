"use client";

import React, { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ChevronDown } from "lucide-react";
import { ContentField } from "@/features/cms";
import { EditingField } from "../types";
import { FieldForm } from "./FieldForm";
import { DeleteConfirm } from "./DeleteConfirm";
import { cn } from "@/lib/utils";

interface FieldHeaderCellProps {
  field: ContentField;
  contentTypeId: string;
  updateMutation: any;
  deleteMutation: any;
  onDelete: (contentTypeId: string, fieldId: string) => void;
}

export function FieldHeaderCell({
  field,
  contentTypeId,
  updateMutation,
  deleteMutation,
  onDelete,
}: FieldHeaderCellProps) {
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<EditingField>({
    name: field.name,
    type: field.type,
    required: field.required,
  });

  const handleOpen = (next: boolean) => {
    if (next) {
      setValues({ name: field.name, type: field.type, required: field.required });
    }
    setOpen(next);
  };

  const save = () => {
    if (!values.name.trim()) return;
    updateMutation.mutate({ contentTypeId, fieldId: field.id, data: values });
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={handleOpen}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "group/fh flex items-center gap-1 rounded px-1.5 py-0.5 -mx-1.5 whitespace-nowrap",
            "hover:bg-accent transition-colors",
            open && "bg-accent",
          )}
          title="Click to edit field"
        >
          <span className="text-xs font-semibold">{field.name}</span>
          {field.required && (
            <span className="text-destructive text-[10px] leading-none">*</span>
          )}
          <ChevronDown className="h-3 w-3 text-muted-foreground opacity-0 group-hover/fh:opacity-100 transition-opacity" />
        </button>
      </PopoverTrigger>

      <PopoverContent
        side="bottom"
        align="start"
        className="w-60 p-3"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Edit field
          </p>
          <DeleteConfirm
            label="Field"
            description={`Delete field "${field.name}"? All stored values for this field will also be removed.`}
            onConfirm={() => {
              onDelete(contentTypeId, field.id);
              setOpen(false);
            }}
            isPending={deleteMutation.isPending}
          />
        </div>

        <FieldForm
          values={values}
          onChange={setValues}
          onSave={save}
          onCancel={() => setOpen(false)}
          isSaving={updateMutation.isPending}
          saveLabel="Save"
        />
      </PopoverContent>
    </Popover>
  );
}
