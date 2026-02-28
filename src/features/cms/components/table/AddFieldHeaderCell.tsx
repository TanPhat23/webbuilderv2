"use client";

import React, { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { EditingField } from "../types";
import { FieldForm } from "./FieldForm";
import { cn } from "@/lib/utils";

interface AddFieldHeaderCellProps {
  contentTypeId: string;
  createMutation: any;
  onCreate: (data: EditingField) => void;
}

const DEFAULT_VALUES: EditingField = {
  name: "",
  type: "text",
  required: false,
};

export function AddFieldHeaderCell({
  contentTypeId,
  createMutation,
  onCreate,
}: AddFieldHeaderCellProps) {
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<EditingField>(DEFAULT_VALUES);

  const handleOpen = (next: boolean) => {
    if (!next) setValues(DEFAULT_VALUES);
    setOpen(next);
  };

  const save = () => {
    if (!values.name.trim()) return;
    onCreate(values);
    setValues(DEFAULT_VALUES);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={handleOpen}>
      <PopoverTrigger asChild>
        <Button
          size="sm"
          variant="ghost"
          className={cn(
            "h-6 w-6 p-0 text-muted-foreground hover:text-foreground hover:bg-accent",
            open && "bg-accent text-foreground",
          )}
          title="Add field"
          disabled={!contentTypeId}
        >
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        side="bottom"
        align="start"
        className="w-60 p-3"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
          New field
        </p>

        <FieldForm
          values={values}
          onChange={setValues}
          onSave={save}
          onCancel={() => setOpen(false)}
          isSaving={createMutation.isPending}
          saveLabel="Add field"
        />
      </PopoverContent>
    </Popover>
  );
}
