import React, { useState } from "react";
import { toast } from "sonner";
import { Layers, Lock, Pencil, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { cn } from "@webbuilder/site-runtime/lib/utils";
import type { ContentField } from "../interfaces/cms.interface";
import { useCMSContext } from "../provider/CMSProvider";
import { DeleteConfirm } from "./DeleteConfirm";
import { FIELD_TYPE_META, getFieldTypeMeta } from "./fieldTypeMeta";
import { FIELD_TYPES, type FieldType } from "./types";

interface CMSSchemaViewProps {
  readonly isAddingField: boolean;
  readonly onAddingFieldChange: (adding: boolean) => void;
}

interface FieldEditorState {
  readonly editingId: string | null;
  readonly name: string;
  readonly type: FieldType;
  readonly required: boolean;
}

function toFieldType(raw: string): FieldType {
  for (const candidate of FIELD_TYPES) {
    if (candidate === raw) {
      return candidate;
    }
  }
  return "text";
}

const SYSTEM_FIELDS: ReadonlyArray<{
  readonly name: string;
  readonly type: string;
}> = [
  { name: "Title", type: "Short Text" },
  { name: "Slug", type: "URL Path" },
  { name: "Status", type: "Published / Draft" },
];

export function CMSSchemaView({
  isAddingField,
  onAddingFieldChange,
}: CMSSchemaViewProps): React.ReactElement {
  const {
    selectedType,
    contentFields,
    fieldsLoading,
    createFieldMutation,
    updateFieldMutation,
    deleteFieldMutation,
    handleDeleteField,
  } = useCMSContext();

  const [editor, setEditor] = useState<FieldEditorState | null>(null);

  const activeEditor: FieldEditorState | null =
    editor ??
    (isAddingField
      ? { editingId: null, name: "", type: "text", required: false }
      : null);

  const openCreate = (): void => {
    setEditor({ editingId: null, name: "", type: "text", required: false });
    onAddingFieldChange(true);
  };

  const openEdit = (field: ContentField): void => {
    setEditor({
      editingId: field.id,
      name: field.name,
      type: toFieldType(field.type),
      required: field.required,
    });
    onAddingFieldChange(false);
  };

  const closeEditor = (): void => {
    setEditor(null);
    onAddingFieldChange(false);
  };

  const handleSave = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (!selectedType || !activeEditor) {
      return;
    }
    const trimmedName = activeEditor.name.trim();
    if (!trimmedName) {
      toast.error("Field name is required");
      return;
    }

    if (activeEditor.editingId) {
      updateFieldMutation.mutate(
        {
          contentTypeId: selectedType.id,
          fieldId: activeEditor.editingId,
          data: {
            name: trimmedName,
            type: activeEditor.type,
            required: activeEditor.required,
          },
        },
        {
          onSuccess: () => {
            toast.success(`Field "${trimmedName}" updated`);
            closeEditor();
          },
          onError: () => toast.error("Failed to update field"),
        },
      );
    } else {
      createFieldMutation.mutate(
        {
          contentTypeId: selectedType.id,
          data: {
            name: trimmedName,
            type: activeEditor.type,
            required: activeEditor.required,
          },
        },
        {
          onSuccess: () => {
            toast.success(`Field "${trimmedName}" added`);
            closeEditor();
          },
          onError: () => toast.error("Failed to add field"),
        },
      );
    }
  };

  const isPending =
    createFieldMutation.isPending || updateFieldMutation.isPending;

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
        <div className="flex flex-col gap-2 rounded-xl border border-border/60 bg-muted/20 p-4">
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Lock className="size-3.5" />
            <span>Built-in system fields</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {SYSTEM_FIELDS.map((sys) => (
              <div
                key={sys.name}
                className="flex items-center gap-2 rounded-lg border border-border/60 bg-background px-2.5 py-1.5 text-xs"
              >
                <span className="font-medium text-foreground">{sys.name}</span>
                <span className="text-[11px] text-muted-foreground">
                  {sys.type}
                </span>
              </div>
            ))}
          </div>
        </div>

        {activeEditor && (
          <form
            onSubmit={handleSave}
            className="flex flex-col gap-5 rounded-xl border border-border/70 bg-card p-5 shadow-sm"
          >
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold text-foreground">
                {activeEditor.editingId ? "Edit field" : "Add new field"}
              </h3>
              <div className="flex items-center gap-2">
                <Switch
                  id="cms-field-required"
                  checked={activeEditor.required}
                  onCheckedChange={(checked) =>
                    setEditor({ ...activeEditor, required: checked })
                  }
                />
                <Label
                  htmlFor="cms-field-required"
                  className="cursor-pointer text-xs font-normal"
                >
                  Required
                </Label>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="cms-field-name" className="text-xs font-medium">
                Field name
              </Label>
              <Input
                id="cms-field-name"
                value={activeEditor.name}
                onChange={(e) =>
                  setEditor({ ...activeEditor, name: e.target.value })
                }
                placeholder="e.g. Body, Price, Published Date"
                autoFocus
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-xs font-medium">Field type</Label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5">
                {FIELD_TYPES.map((fieldType) => {
                  const meta = FIELD_TYPE_META[fieldType];
                  const Icon = meta.icon;
                  const selected = activeEditor.type === fieldType;
                  return (
                    <button
                      key={fieldType}
                      type="button"
                      onClick={() =>
                        setEditor({ ...activeEditor, type: fieldType })
                      }
                      className={cn(
                        "flex flex-col items-start gap-1.5 rounded-xl border p-3 text-left transition-all",
                        selected
                          ? "border-primary bg-primary/8 ring-1 ring-primary/40"
                          : "border-border/60 bg-background hover:border-border hover:bg-muted/40",
                      )}
                    >
                      <div
                        className={cn(
                          "flex size-7 items-center justify-center rounded-md",
                          selected
                            ? "bg-primary/15 text-primary"
                            : "bg-muted text-muted-foreground",
                        )}
                      >
                        <Icon className="size-3.5" />
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-medium text-foreground">
                          {meta.label}
                        </span>
                        <span className="line-clamp-2 text-[10px] leading-snug text-muted-foreground">
                          {meta.description}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-border/50 pt-3">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={closeEditor}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={!activeEditor.name.trim() || isPending}
              >
                {activeEditor.editingId ? "Save changes" : "Add field"}
              </Button>
            </div>
          </form>
        )}

        <div className="flex flex-col gap-2.5">
          {fieldsLoading ? (
            <div className="flex flex-col gap-2.5">
              <Skeleton className="h-16 w-full rounded-xl" />
              <Skeleton className="h-16 w-full rounded-xl" />
              <Skeleton className="h-16 w-full rounded-xl" />
            </div>
          ) : contentFields.length === 0 ? (
            !activeEditor && (
              <div className="rounded-xl border border-dashed border-border/70 bg-card/30 p-8">
                <Empty>
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <Layers className="size-5" />
                    </EmptyMedia>
                    <EmptyTitle className="text-base">
                      No custom fields yet
                    </EmptyTitle>
                    <EmptyDescription>
                      Shape your collection schema with Rich Text, Numbers,
                      Dates, URLs, Toggles, and more.
                    </EmptyDescription>
                  </EmptyHeader>
                  <Button
                    type="button"
                    size="sm"
                    onClick={openCreate}
                    className="gap-1.5"
                  >
                    <Plus className="size-3.5" />
                    Add your first field
                  </Button>
                </Empty>
              </div>
            )
          ) : (
            contentFields.map((field) => {
              const meta = getFieldTypeMeta(field.type);
              const Icon = meta.icon;
              return (
                <div
                  key={field.id}
                  className="flex items-center justify-between gap-4 rounded-xl border border-border/60 bg-card/40 px-4 py-3 transition-colors hover:border-border"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                      <Icon className="size-4" />
                    </div>
                    <div className="flex min-w-0 flex-col gap-0.5">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-medium text-foreground">
                          {field.name}
                        </span>
                        {field.required && (
                          <Badge
                            variant="secondary"
                            className="text-[10px] font-medium"
                          >
                            Required
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {meta.label} · {meta.description}
                      </span>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="h-7 gap-1 px-2 text-xs text-muted-foreground hover:text-foreground"
                      onClick={() => openEdit(field)}
                    >
                      <Pencil className="size-3.5" />
                      Edit
                    </Button>
                    {selectedType && (
                      <DeleteConfirm
                        label={field.name}
                        description={`Delete field "${field.name}"? Existing values for this field will be removed from all items.`}
                        onConfirm={() =>
                          handleDeleteField(selectedType.id, field.id)
                        }
                        isPending={deleteFieldMutation.isPending}
                      />
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
