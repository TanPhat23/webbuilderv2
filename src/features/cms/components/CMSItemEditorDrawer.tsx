import React, { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Loader2, SlidersHorizontal, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type {
  ContentField,
  ContentFieldValueInput,
  ContentItem,
} from "../interfaces/cms.interface";
import { ContentItemFormSchema } from "../schema/cms";
import { useCMSContext } from "../provider/CMSProvider";
import { DeleteConfirm } from "./DeleteConfirm";
import { getFieldTypeMeta } from "./fieldTypeMeta";
import { RichTextEditor } from "./RichTextEditor";
import {
  sanitizeRichTextHtml,
  slugifyTitle,
  stripHtmlToPreview,
} from "./richTextUtils";

export type ItemDrawerState =
  | { readonly mode: "create" }
  | { readonly mode: "edit"; readonly item: ContentItem };

interface CMSItemEditorDrawerProps {
  readonly drawerState: ItemDrawerState;
  readonly onClose: () => void;
  readonly onSwitchToSchema: () => void;
}

function buildInitialFieldValues(
  fields: readonly ContentField[],
  item?: ContentItem,
): Record<string, string> {
  const result: Record<string, string> = {};
  const existingMap = new Map<string, string>();
  for (const fv of item?.fieldValues ?? []) {
    if (fv.value !== undefined) {
      existingMap.set(fv.fieldId, fv.value);
    }
  }
  for (const field of fields) {
    const existing = existingMap.get(field.id);
    if (existing !== undefined) {
      result[field.id] = existing;
    } else if (field.type === "boolean") {
      result[field.id] = "false";
    } else {
      result[field.id] = "";
    }
  }
  return result;
}

export function CMSItemEditorDrawer({
  drawerState,
  onClose,
  onSwitchToSchema,
}: CMSItemEditorDrawerProps): React.ReactElement {
  const {
    selectedType,
    contentFields,
    createItemMutation,
    updateItemMutation,
    deleteItemMutation,
  } = useCMSContext();

  const isEdit = drawerState.mode === "edit";
  const editingItem = isEdit ? drawerState.item : undefined;

  const [title, setTitle] = useState(editingItem?.title ?? "");
  const [slug, setSlug] = useState(editingItem?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [published, setPublished] = useState(editingItem?.published ?? false);
  const [fieldValues, setFieldValues] = useState<Record<string, string>>(() =>
    buildInitialFieldValues(contentFields, editingItem),
  );

  const isSaving = createItemMutation.isPending || updateItemMutation.isPending;

  const missingRequiredField = useMemo(() => {
    for (const field of contentFields) {
      if (!field.required) {
        continue;
      }
      const raw = fieldValues[field.id] ?? "";
      if (field.type === "boolean") {
        continue;
      }
      const normalized =
        field.type === "richtext" ? stripHtmlToPreview(raw) : raw.trim();
      if (!normalized) {
        return field.name;
      }
    }
    return null;
  }, [contentFields, fieldValues]);

  const effectiveSlug = slug.trim() || slugifyTitle(title);
  const canSubmit =
    title.trim().length > 0 &&
    effectiveSlug.length > 0 &&
    missingRequiredField === null &&
    !isSaving;

  const handleTitleChange = (nextTitle: string): void => {
    setTitle(nextTitle);
    if (!slugTouched) {
      setSlug(slugifyTitle(nextTitle));
    }
  };

  const handleFieldChange = (fieldId: string, value: string): void => {
    setFieldValues((prev) => ({ ...prev, [fieldId]: value }));
  };

  const handleSubmit = useCallback((): void => {
    if (!selectedType || isSaving) {
      return;
    }

    const parsed = ContentItemFormSchema.safeParse({
      title: title.trim(),
      slug: effectiveSlug,
      published,
    });

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      toast.error(firstIssue?.message ?? "Please check required fields");
      return;
    }

    if (missingRequiredField) {
      toast.error(`"${missingRequiredField}" is required`);
      return;
    }

    const fieldValuesPayload: ContentFieldValueInput[] = contentFields.map(
      (field) => {
        const raw = fieldValues[field.id] ?? "";
        return {
          fieldId: field.id,
          value: field.type === "richtext" ? sanitizeRichTextHtml(raw) : raw,
        };
      },
    );

    if (isEdit && editingItem) {
      updateItemMutation.mutate(
        {
          contentTypeId: selectedType.id,
          itemId: editingItem.id,
          data: {
            ...parsed.data,
            fieldValues: fieldValuesPayload,
          },
        },
        {
          onSuccess: () => {
            toast.success("Item saved");
            onClose();
          },
          onError: () => {
            toast.error("Failed to save item");
          },
        },
      );
    } else {
      createItemMutation.mutate(
        {
          contentTypeId: selectedType.id,
          data: {
            ...parsed.data,
            fieldValues: fieldValuesPayload,
          },
        },
        {
          onSuccess: () => {
            toast.success("Item created");
            onClose();
          },
          onError: () => {
            toast.error("Failed to create item");
          },
        },
      );
    }
  }, [
    contentFields,
    createItemMutation,
    editingItem,
    effectiveSlug,
    fieldValues,
    isEdit,
    isSaving,
    missingRequiredField,
    onClose,
    published,
    selectedType,
    title,
    updateItemMutation,
  ]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        if (canSubmit) {
          handleSubmit();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [canSubmit, handleSubmit, onClose]);

  const handleDelete = (): void => {
    if (!selectedType || !editingItem) {
      return;
    }
    deleteItemMutation.mutate(
      { contentTypeId: selectedType.id, itemId: editingItem.id },
      {
        onSuccess: () => {
          toast.success("Item deleted");
          onClose();
        },
        onError: () => {
          toast.error("Failed to delete item");
        },
      },
    );
  };

  return (
    <div
      className="absolute inset-0 z-30 flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-label={isEdit ? "Edit item" : "New item"}
    >
      <div
        className="absolute inset-0 bg-background/60 backdrop-blur-[2px]"
        onClick={onClose}
      />

      <div className="relative z-10 flex h-full w-full max-w-2xl flex-col border-l border-border/60 bg-card shadow-2xl">
        <div className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-border/60 px-6">
          <div className="flex min-w-0 items-center gap-2.5">
            <h3 className="truncate text-sm font-semibold tracking-tight text-foreground">
              {isEdit ? "Edit item" : "New item"}
            </h3>
            {selectedType && (
              <Badge variant="secondary" className="text-[11px] font-normal">
                {selectedType.name}
              </Badge>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <div className="flex items-center gap-2">
              <Switch
                id="cms-drawer-published"
                checked={published}
                onCheckedChange={setPublished}
              />
              <Label
                htmlFor="cms-drawer-published"
                className="cursor-pointer text-xs font-medium"
              >
                <Badge
                  variant={published ? "default" : "secondary"}
                  className="text-[11px]"
                >
                  {published ? "Published" : "Draft"}
                </Badge>
              </Label>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Close drawer"
              onClick={onClose}
            >
              <X className="size-4" />
            </Button>
          </div>
        </div>

        <form
          id="cms-item-editor-form"
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="flex flex-1 flex-col gap-5 overflow-y-auto p-6"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="cms-item-title" className="text-xs font-medium">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="cms-item-title"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Enter item title"
                autoFocus
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="cms-item-slug" className="text-xs font-medium">
                Slug <span className="text-destructive">*</span>
              </Label>
              <div className="flex items-center rounded-md border border-input bg-background focus-within:ring-1 focus-within:ring-ring">
                <span className="border-r border-border/60 bg-muted/40 px-2.5 py-2 font-mono text-xs text-muted-foreground select-none">
                  /
                </span>
                <Input
                  id="cms-item-slug"
                  value={slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    setSlug(e.target.value);
                  }}
                  placeholder="auto-generated-slug"
                  className="border-0 font-mono text-xs shadow-none focus-visible:ring-0"
                />
              </div>
            </div>
          </div>

          {contentFields.length === 0 ? (
            <div className="flex items-center justify-between gap-4 rounded-xl border border-dashed border-border/70 bg-muted/20 p-4">
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-medium text-foreground">
                  No custom fields defined yet
                </span>
                <span className="text-xs text-muted-foreground">
                  Add fields like Rich Text, Number, Date, or Toggle in the
                  Schema tab.
                </span>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="shrink-0 gap-1.5 text-xs"
                onClick={() => {
                  onClose();
                  onSwitchToSchema();
                }}
              >
                <SlidersHorizontal className="size-3.5" />
                Add fields in Schema
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              {contentFields.map((field) => {
                const meta = getFieldTypeMeta(field.type);
                const val = fieldValues[field.id] ?? "";
                const inputId = `cms-field-${field.id}`;

                return (
                  <div key={field.id} className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <Label htmlFor={inputId} className="text-xs font-medium">
                        {field.name}
                        {field.required && (
                          <span className="ml-0.5 text-destructive">*</span>
                        )}
                      </Label>
                      <Badge
                        variant="outline"
                        className="text-[10px] font-normal text-muted-foreground"
                      >
                        {meta.label}
                      </Badge>
                    </div>

                    {field.type === "richtext" ? (
                      <RichTextEditor
                        value={val}
                        onChange={(html) => handleFieldChange(field.id, html)}
                        placeholder={`Write ${field.name.toLowerCase()}…`}
                      />
                    ) : field.type === "textarea" ? (
                      <Textarea
                        id={inputId}
                        rows={4}
                        value={val}
                        onChange={(e) =>
                          handleFieldChange(field.id, e.target.value)
                        }
                        placeholder={`Enter ${field.name.toLowerCase()}…`}
                      />
                    ) : field.type === "boolean" ? (
                      <div className="flex items-center justify-between rounded-lg border border-border/60 bg-background px-3.5 py-2.5">
                        <span className="text-xs text-muted-foreground">
                          {val === "true" ? "Enabled" : "Disabled"}
                        </span>
                        <Switch
                          id={inputId}
                          checked={val === "true"}
                          onCheckedChange={(checked) =>
                            handleFieldChange(
                              field.id,
                              checked ? "true" : "false",
                            )
                          }
                        />
                      </div>
                    ) : field.type === "number" ? (
                      <Input
                        id={inputId}
                        type="number"
                        value={val}
                        onChange={(e) =>
                          handleFieldChange(field.id, e.target.value)
                        }
                        placeholder="0"
                      />
                    ) : field.type === "date" ? (
                      <Input
                        id={inputId}
                        type="date"
                        value={val}
                        onChange={(e) =>
                          handleFieldChange(field.id, e.target.value)
                        }
                      />
                    ) : field.type === "email" ? (
                      <Input
                        id={inputId}
                        type="email"
                        value={val}
                        onChange={(e) =>
                          handleFieldChange(field.id, e.target.value)
                        }
                        placeholder="name@example.com"
                      />
                    ) : field.type === "url" ? (
                      <Input
                        id={inputId}
                        type="url"
                        value={val}
                        onChange={(e) =>
                          handleFieldChange(field.id, e.target.value)
                        }
                        placeholder="https://example.com"
                        className="font-mono text-xs"
                      />
                    ) : (
                      <div className="flex flex-col gap-1">
                        <Input
                          id={inputId}
                          value={val}
                          onChange={(e) =>
                            handleFieldChange(field.id, e.target.value)
                          }
                          placeholder={
                            field.type === "multiselect"
                              ? "tag-one, tag-two, tag-three"
                              : `Enter ${field.name.toLowerCase()}…`
                          }
                        />
                        {field.type === "multiselect" && (
                          <span className="text-[11px] text-muted-foreground">
                            Separate multiple values with commas.
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </form>

        <div className="flex shrink-0 items-center justify-between gap-3 border-t border-border/60 bg-card px-6 py-3.5">
          <div>
            {isEdit && editingItem && (
              <DeleteConfirm
                label={editingItem.title}
                description={`Permanently delete "${editingItem.title}"? This action cannot be undone.`}
                onConfirm={handleDelete}
                isPending={deleteItemMutation.isPending}
                buttonLabel="Delete"
                buttonClassName="text-destructive hover:text-destructive"
              />
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClose}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="cms-item-editor-form"
              size="sm"
              disabled={!canSubmit}
              className="gap-1.5"
            >
              {isSaving && <Loader2 className="size-3.5 animate-spin" />}
              {isEdit ? "Save changes" : "Create item"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
