import React, { useState, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { RichTextEditorDialog } from "@/components/ui/rich-text-editor-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyMedia,
} from "@/components/ui/empty";
import {
  ContentItem,
  ContentType,
  ContentField,
  ContentFieldValue,
} from "@/features/cms";
import { ContentItemFormSchema } from "@/features/cms/schema/cms";
import {
  Plus,
  Database,
  Eye,
  EyeOff,
  Loader2,
  Save,
  X,
  FileStack,
} from "lucide-react";
import {
  RequiredIndicator,
  ConfirmDeleteDialog,
  TableActionButtons,
  SortableHeader,
} from "./components";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  ColumnDef,
  SortingState,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";

interface ContentItemsTabProps {
  selectedTypeId: string;
  contentTypes: ContentType[];
  contentFields: ContentField[];
  contentItems: ContentItem[];
  isLoading: boolean;
  createItemMutation: any;
  updateItemMutation: any;
  deleteItemMutation: any;
  onCreateItem: (data: any) => void;
  onDeleteItem: (contentTypeId: string, itemId: string) => void;
}

interface EditableItem {
  id?: string;
  title?: string;
  slug?: string;
  published?: boolean;
  contentTypeId?: string;
  isNew?: boolean;
  isEditing?: boolean;
  fieldValues?: { [fieldId: string]: string };
}

export const ContentItemsTab: React.FC<ContentItemsTabProps> = ({
  selectedTypeId,
  contentTypes,
  contentFields,
  contentItems,
  isLoading,
  createItemMutation,
  updateItemMutation,
  deleteItemMutation,
  onCreateItem,
  onDeleteItem,
}) => {
  const [editingRows, setEditingRows] = useState<string[]>([]);
  const [newRow, setNewRow] = useState<EditableItem | null>(null);
  const [editedValues, setEditedValues] = useState<{
    [key: string]: {
      title?: string;
      slug?: string;
      published?: boolean;
      fieldValues?: { [fieldId: string]: string };
    };
  }>({});
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const editingRowsSet = useMemo(() => new Set(editingRows), [editingRows]);

  const columnHelper = createColumnHelper<ContentItem>();

  const fieldValuesMap = useMemo(() => {
    const map: { [itemId: string]: { [fieldId: string]: string } } = {};
    contentItems.forEach((item) => {
      map[item.id] = {};
      item.fieldValues?.forEach((fv) => {
        map[item.id][fv.fieldId] = fv.value || "";
      });
    });
    return map;
  }, [contentItems]);

  const updateFieldValue = useCallback(
    (itemId: string, fieldId: string, value: string) => {
      if (newRow && newRow.isNew) {
        setNewRow((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            fieldValues: { ...prev.fieldValues, [fieldId]: value },
          };
        });
      } else {
        setEditedValues((prev) => ({
          ...prev,
          [itemId]: {
            ...prev[itemId],
            fieldValues: {
              ...prev[itemId]?.fieldValues,
              [fieldId]: value,
            },
          },
        }));
      }
    },
    [newRow],
  );

  const updateItemField = useCallback(
    (itemId: string, field: string, value: any) => {
      if (newRow && newRow.isNew) {
        setNewRow((prev) => {
          if (!prev) return prev;
          return { ...prev, [field]: value };
        });
      } else {
        setEditedValues((prev) => ({
          ...prev,
          [itemId]: { ...prev[itemId], [field]: value },
        }));
      }
    },
    [newRow],
  );

  const startEditing = useCallback(
    (itemId: string) => {
      const item = contentItems.find((i) => i.id === itemId);
      if (item) {
        setEditedValues((prev) => ({
          ...prev,
          [itemId]: {
            title: item.title,
            slug: item.slug,
            published: item.published,
            fieldValues: { ...fieldValuesMap[itemId] },
          },
        }));
      }
      setEditingRows((prev) => [...prev, itemId]);
    },
    [contentItems, fieldValuesMap],
  );

  const stopEditing = useCallback((itemId: string) => {
    setEditingRows((prev) => prev.filter((id) => id !== itemId));
    setEditedValues((prev) => {
      const newValues = { ...prev };
      delete newValues[itemId];
      return newValues;
    });
  }, []);

  const saveExistingItem = useCallback(
    async (itemId: string) => {
      const editedData = editedValues[itemId];
      if (!editedData) return;

      const itemData = {
        title: editedData.title || "",
        slug: editedData.slug || "",
        published: editedData.published || false,
        fieldValues: Object.entries(editedData.fieldValues || {}).map(
          ([fieldId, value]) => ({
            fieldId,
            value,
          }),
        ),
      };

      try {
        updateItemMutation.mutate({
          contentTypeId: selectedTypeId,
          itemId,
          data: itemData,
        });
        stopEditing(itemId);
      } catch (error) {
        console.error("Failed to update item:", error);
      }
    },
    [editedValues, updateItemMutation, selectedTypeId, stopEditing],
  );

  const columns = useMemo<ColumnDef<ContentItem, any>[]>(() => {
    const baseColumns: ColumnDef<ContentItem, any>[] = [
      columnHelper.accessor("title", {
        header: ({ column }) => (
          <SortableHeader column={column}>Title</SortableHeader>
        ),
        cell: ({ row, table }) => {
          const item = row.original;
          const meta = table.options.meta as any;
          const isEditing = meta?.editingRowsSet?.has(item.id);

          return isEditing ? (
            <Input
              value={
                meta?.editedValues?.[item.id]?.title ?? row.getValue("title")
              }
              onChange={(e) =>
                meta?.updateItemField(item.id, "title", e.target.value)
              }
              className="h-8"
            />
          ) : (
            <span className="font-medium">{row.getValue("title")}</span>
          );
        },
      }),
      columnHelper.accessor("slug", {
        header: ({ column }) => (
          <SortableHeader column={column}>Slug</SortableHeader>
        ),
        cell: ({ row, table }) => {
          const item = row.original;
          const meta = table.options.meta as any;
          const isEditing = meta?.editingRowsSet?.has(item.id);

          return isEditing ? (
            <Input
              value={
                meta?.editedValues?.[item.id]?.slug ?? row.getValue("slug")
              }
              onChange={(e) =>
                meta?.updateItemField(item.id, "slug", e.target.value)
              }
              className="h-8"
            />
          ) : (
            <span className="text-muted-foreground">
              {row.getValue("slug")}
            </span>
          );
        },
      }),
      columnHelper.accessor("published", {
        header: "Published",
        cell: ({ row, table }) => {
          const item = row.original;
          const meta = table.options.meta as any;
          const isEditing = meta?.editingRowsSet?.has(item.id);

          return isEditing ? (
            <Switch
              checked={
                meta?.editedValues?.[item.id]?.published ??
                row.getValue("published")
              }
              onCheckedChange={(checked) =>
                meta?.updateItemField(item.id, "published", checked)
              }
            />
          ) : (
            <Badge
              variant={row.getValue("published") ? "default" : "secondary"}
              className="gap-1"
            >
              {row.getValue("published") ? (
                <Eye className="h-3 w-3" />
              ) : (
                <EyeOff className="h-3 w-3" />
              )}
              {row.getValue("published") ? "Published" : "Draft"}
            </Badge>
          );
        },
      }),
    ];

    const fieldColumns: ColumnDef<ContentItem, any>[] = contentFields.map(
      (field) => ({
        id: `field-${field.id}`,
        header: () => (
          <div>
            {field.name}
            <RequiredIndicator required={field.required} />
          </div>
        ),
        size: 200,
        cell: ({ row, table }) => {
          const item = row.original;
          const meta = table.options.meta as any;
          const isEditing = meta?.editingRowsSet?.has(item.id);
          const fieldValues = meta?.fieldValuesMap?.[item.id] || {};
          const editedData = meta?.editedValues?.[item.id];

          if (isEditing) {
            if (field.type === "richtext") {
              return (
                <div className="w-[200px]">
                  <RichTextEditorDialog
                    value={
                      editedData?.fieldValues?.[field.id] ??
                      fieldValues[field.id] ??
                      ""
                    }
                    onChange={(value) =>
                      meta?.updateFieldValue(item.id, field.id, value)
                    }
                    placeholder={`Enter ${field.name.toLowerCase()}`}
                    title={`Edit ${field.name}`}
                    trigger={
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start"
                      >
                        {editedData?.fieldValues?.[field.id] ||
                        fieldValues[field.id] ? (
                          <span className="truncate">
                            {editedData?.fieldValues?.[field.id] ||
                              fieldValues[field.id]
                                ?.replace(/<[^>]*>/g, "")
                                .slice(0, 50) ||
                              `Edit ${field.name.toLowerCase()}`}
                          </span>
                        ) : (
                          `Edit ${field.name.toLowerCase()}`
                        )}
                      </Button>
                    }
                  />
                </div>
              );
            } else {
              return (
                <Input
                  value={
                    editedData?.fieldValues?.[field.id] ??
                    fieldValues[field.id] ??
                    ""
                  }
                  onChange={(e) =>
                    meta?.updateFieldValue(item.id, field.id, e.target.value)
                  }
                  className="h-8 w-[200px]"
                />
              );
            }
          } else {
            if (field.type === "richtext") {
              const content = fieldValues[field.id] || "-";
              const textContent = content.replace(/<[^>]*>/g, "");
              return (
                <div className="w-[200px] overflow-hidden">
                  <span className="block truncate" title={textContent}>
                    {textContent}
                  </span>
                </div>
              );
            } else {
              return (
                <div className="w-[200px] overflow-hidden">
                  <span
                    className="block truncate"
                    title={fieldValues[field.id] || "-"}
                  >
                    {fieldValues[field.id] || "-"}
                  </span>
                </div>
              );
            }
          }
        },
      }),
    );

    const actionsColumn: ColumnDef<ContentItem, any> = columnHelper.display({
      id: "actions",
      header: "Actions",
      cell: ({ row, table }) => {
        const item = row.original;
        const meta = table.options.meta as any;
        const isEditing = meta?.editingRowsSet?.has(item.id);

        return (
          <div className="flex gap-1">
            <TableActionButtons
              isEditing={isEditing}
              onEdit={() => meta?.startEditing(item.id)}
              onSave={() => meta?.saveExistingItem(item.id)}
              onCancel={() => meta?.stopEditing(item.id)}
              isSaving={meta?.updateItemMutation?.isPending}
            />
            {!isEditing && (
              <ConfirmDeleteDialog
                itemName={item.title}
                itemType="Content Item"
                onConfirm={() => meta?.onDeleteItem(selectedTypeId, item.id)}
                description={`Are you sure you want to delete "${item.title}"? This action cannot be undone.`}
              />
            )}
          </div>
        );
      },
    });

    return [...baseColumns, ...fieldColumns, actionsColumn];
  }, [contentFields]);

  const table = useReactTable({
    data: contentItems,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      globalFilter,
    },
    meta: {
      editingRowsSet,
      editedValues,
      fieldValuesMap,
      updateItemField,
      updateFieldValue,
      startEditing,
      stopEditing,
      saveExistingItem,
      updateItemMutation,
      onDeleteItem,
    },
  });

  const selectedType = contentTypes.find((t) => t.id === selectedTypeId);

  const addNewRow = () => {
    const newItem: EditableItem = {
      isNew: true,
      isEditing: true,
      title: "",
      slug: "",
      published: false,
      fieldValues: {},
      contentTypeId: selectedTypeId,
    };
    contentFields.forEach((field) => {
      newItem.fieldValues![field.id] = "";
    });
    setNewRow(newItem);
  };

  const cancelNewRow = () => {
    setNewRow(null);
  };

  const saveNewRow = async () => {
    if (!newRow) return;

    // Validate required fields
    const validationResult = ContentItemFormSchema.safeParse({
      title: newRow.title || "",
      slug: newRow.slug || "",
      published: newRow.published || false,
    });

    if (!validationResult.success) {
      console.error("Validation failed:", validationResult.error);
      return;
    }

    const itemData = {
      title: newRow.title || "",
      slug: newRow.slug || "",
      published: newRow.published || false,
      fieldValues: Object.entries(newRow.fieldValues || {}).map(
        ([fieldId, value]) => ({
          fieldId,
          value,
        }),
      ),
    };

    try {
      await onCreateItem(itemData);
      setNewRow(null);
    } catch (error) {
      console.error("Failed to create item:", error);
    }
  };

  if (!selectedTypeId) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Database />
          </EmptyMedia>
          <EmptyTitle>Select a Content Type</EmptyTitle>
          <EmptyDescription>
            Choose a content type from the Content Types tab to manage its
            content items.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Content Items Grid</h3>
          <p className="text-sm text-muted-foreground">
            For: {selectedType?.name}
          </p>
        </div>
        <Button size="sm" onClick={addNewRow} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Row
        </Button>
      </div>

      {/* Search Filter */}
      <div className="flex items-center space-x-2">
        <Input
          placeholder="Search content items..."
          value={globalFilter ?? ""}
          onChange={(event) => setGlobalFilter(String(event.target.value))}
          className="max-w-sm"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : contentItems.length === 0 && !newRow ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FileStack />
            </EmptyMedia>
            <EmptyTitle>No content items yet</EmptyTitle>
            <EmptyDescription>
              Create your first content item to start adding content to this
              type.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className="w-48">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {/* New Row */}
              {newRow && (
                <TableRow className="">
                  <TableCell>
                    <Input
                      value={newRow.title || ""}
                      onChange={(e) =>
                        updateItemField("new", "title", e.target.value)
                      }
                      placeholder="Enter title"
                      className="h-8"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={newRow.slug || ""}
                      onChange={(e) =>
                        updateItemField("new", "slug", e.target.value)
                      }
                      placeholder="enter-slug"
                      className="h-8"
                    />
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={newRow.published || false}
                      onCheckedChange={(checked) =>
                        updateItemField("new", "published", checked)
                      }
                    />
                  </TableCell>
                  {contentFields.map((field) => (
                    <TableCell key={field.id}>
                      {field.type === "richtext" ? (
                        <div className="min-w-[300px]">
                          <RichTextEditorDialog
                            value={newRow.fieldValues?.[field.id] || ""}
                            onChange={(value) =>
                              updateFieldValue("new", field.id, value)
                            }
                            placeholder={`Enter ${field.name.toLowerCase()}`}
                            title={`Edit ${field.name}`}
                            trigger={
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full justify-start"
                              >
                                {newRow.fieldValues?.[field.id] ? (
                                  <span className="truncate">
                                    {newRow.fieldValues[field.id]
                                      ?.replace(/<[^>]*>/g, "")
                                      .slice(0, 50)}
                                  </span>
                                ) : (
                                  `Edit ${field.name.toLowerCase()}`
                                )}
                              </Button>
                            }
                          />
                        </div>
                      ) : (
                        <Input
                          value={newRow.fieldValues?.[field.id] || ""}
                          onChange={(e) =>
                            updateFieldValue("new", field.id, e.target.value)
                          }
                          placeholder={`Enter ${field.name.toLowerCase()}`}
                          className="h-8"
                        />
                      )}
                    </TableCell>
                  ))}
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        onClick={saveNewRow}
                        disabled={createItemMutation.isPending}
                        className="h-8 w-8 p-0"
                      >
                        <Save className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={cancelNewRow}
                        className="h-8 w-8 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}

              {/* Existing Rows */}
              {table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};
