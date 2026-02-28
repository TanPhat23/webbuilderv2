"use client";

import React, { useState, useMemo, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  createColumnHelper,
} from "@tanstack/react-table";
import {
  Plus,
  Save,
  X,
  Loader2,
  Eye,
  EyeOff,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { ContentItem } from "@/features/cms";
import { ContentItemFormSchema } from "@/features/cms/schema/cms";
import { EditableItemValues } from "./types";
import {
  EditableCell,
  RowActions,
  FieldHeaderCell,
  AddFieldHeaderCell,
} from "./table";
import { cn } from "@/lib/utils";
import { useCMSContext } from "../provider/CMSProvider";

// ─── Sortable header ──────────────────────────────────────────────────────────

function SortableHeader({
  column,
  children,
}: {
  column: any;
  children: React.ReactNode;
}) {
  const dir = column.getIsSorted();
  return (
    <button
      onClick={() => column.toggleSorting(dir === "asc")}
      className="flex items-center gap-1 group/sort text-xs font-semibold"
    >
      {children}
      <span className="text-muted-foreground/40 group-hover/sort:text-muted-foreground transition-colors">
        {dir === "asc" ? (
          <ArrowUp className="h-3 w-3" />
        ) : dir === "desc" ? (
          <ArrowDown className="h-3 w-3" />
        ) : (
          <ArrowUpDown className="h-3 w-3" />
        )}
      </span>
    </button>
  );
}

// ─── CMSTable ─────────────────────────────────────────────────────────────────

export function CMSTable() {
  const {
    selectedTypeId,
    selectedType,
    contentFields,
    contentItems,
    fieldsLoading,
    itemsLoading,
    createFieldMutation,
    updateFieldMutation,
    deleteFieldMutation,
    createItemMutation,
    updateItemMutation,
    deleteItemMutation,
    handleCreateField,
    handleCreateItem,
    handleDeleteField,
    handleDeleteItem,
  } = useCMSContext();

  // ── Item editing state ──────────────────────────────────────────────────────

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<EditableItemValues>({
    title: "",
    slug: "",
    published: false,
    fieldValues: {},
  });

  // Stable refs — column useMemo never re-runs on each keystroke,
  // preventing cell remount and focus loss.
  const editingIdRef = useRef<string | null>(null);
  const editValuesRef = useRef<EditableItemValues>({
    title: "",
    slug: "",
    published: false,
    fieldValues: {},
  });

  const setEditValuesStable = useCallback(
    (updater: (prev: EditableItemValues) => EditableItemValues) => {
      const next = updater(editValuesRef.current);
      editValuesRef.current = next;
      setEditValues(next);
    },
    [],
  );

  // ── New-row state ───────────────────────────────────────────────────────────

  const [newRow, setNewRow] = useState<EditableItemValues | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const columnHelper = createColumnHelper<ContentItem>();

  // ── Field values lookup map ─────────────────────────────────────────────────

  const fieldValuesMap = useMemo(() => {
    const map: Record<string, Record<string, string>> = {};
    contentItems.forEach((item) => {
      map[item.id] = {};
      item.fieldValues?.forEach((fv) => {
        map[item.id][fv.fieldId] = fv.value ?? "";
      });
    });
    return map;
  }, [contentItems]);

  // ── Item handlers ───────────────────────────────────────────────────────────

  const startEdit = useCallback(
    (item: ContentItem) => {
      const vals: EditableItemValues = {
        title: item.title,
        slug: item.slug,
        published: item.published,
        fieldValues: { ...fieldValuesMap[item.id] },
      };
      editValuesRef.current = vals;
      editingIdRef.current = item.id;
      setEditValues(vals);
      setEditingId(item.id);
    },
    [fieldValuesMap],
  );

  const cancelEdit = useCallback(() => {
    editingIdRef.current = null;
    setEditingId(null);
  }, []);

  const saveEdit = useCallback(
    (itemId: string) => {
      const v = editValuesRef.current;
      updateItemMutation.mutate({
        contentTypeId: selectedTypeId,
        itemId,
        data: {
          title: v.title,
          slug: v.slug,
          published: v.published,
          fieldValues: Object.entries(v.fieldValues).map(
            ([fieldId, value]) => ({ fieldId, value }),
          ),
        },
      });
      editingIdRef.current = null;
      setEditingId(null);
    },
    [updateItemMutation, selectedTypeId],
  );

  const saveNew = () => {
    if (!newRow) return;
    const result = ContentItemFormSchema.safeParse({
      title: newRow.title,
      slug: newRow.slug,
      published: newRow.published,
    });
    if (!result.success) return;
    handleCreateItem({
      ...result.data,
      fieldValues: Object.entries(newRow.fieldValues).map(
        ([fieldId, value]) => ({ fieldId, value }),
      ),
    });
    setNewRow(null);
  };

  const openNewRow = () => {
    const fv: Record<string, string> = {};
    contentFields.forEach((f) => {
      fv[f.id] = "";
    });
    setNewRow({ title: "", slug: "", published: false, fieldValues: fv });
  };

  // ── Column definitions ──────────────────────────────────────────────────────
  // editingId / editValues are intentionally NOT in deps — refs are used instead
  // so columns are never recreated on keystrokes, preventing focus loss.

  const columns = useMemo<ColumnDef<ContentItem, any>[]>(() => {
    const base: ColumnDef<ContentItem, any>[] = [
      columnHelper.accessor("title", {
        header: ({ column }) => (
          <SortableHeader column={column}>Title</SortableHeader>
        ),
        cell: ({ row, getValue }) => (
          <EditableCell
            itemId={row.original.id}
            editingIdRef={editingIdRef}
            renderEdit={() => (
              <Input
                autoFocus
                defaultValue={editValuesRef.current.title}
                onChange={(e) =>
                  setEditValuesStable((p) => ({ ...p, title: e.target.value }))
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") saveEdit(row.original.id);
                  if (e.key === "Escape") cancelEdit();
                }}
                className="h-7 text-xs min-w-32"
              />
            )}
            renderView={() => (
              <span className="font-medium text-sm">{getValue()}</span>
            )}
          />
        ),
      }),
      columnHelper.accessor("slug", {
        header: ({ column }) => (
          <SortableHeader column={column}>Slug</SortableHeader>
        ),
        cell: ({ row, getValue }) => (
          <EditableCell
            itemId={row.original.id}
            editingIdRef={editingIdRef}
            renderEdit={() => (
              <Input
                defaultValue={editValuesRef.current.slug}
                onChange={(e) =>
                  setEditValuesStable((p) => ({ ...p, slug: e.target.value }))
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") saveEdit(row.original.id);
                  if (e.key === "Escape") cancelEdit();
                }}
                className="h-7 text-xs font-mono min-w-32"
              />
            )}
            renderView={() => (
              <span className="text-xs font-mono text-muted-foreground">
                {getValue()}
              </span>
            )}
          />
        ),
      }),
      columnHelper.accessor("published", {
        header: "Status",
        cell: ({ row, getValue }) => (
          <EditableCell
            itemId={row.original.id}
            editingIdRef={editingIdRef}
            renderEdit={() => (
              <Switch
                defaultChecked={editValuesRef.current.published}
                onCheckedChange={(v) =>
                  setEditValuesStable((p) => ({ ...p, published: v }))
                }
              />
            )}
            renderView={() => (
              <Badge
                variant={getValue() ? "default" : "secondary"}
                className="gap-1 text-xs"
              >
                {getValue() ? (
                  <Eye className="h-2.5 w-2.5" />
                ) : (
                  <EyeOff className="h-2.5 w-2.5" />
                )}
                {getValue() ? "Published" : "Draft"}
              </Badge>
            )}
          />
        ),
      }),
    ];

    // One dynamic column per field — header is clickable to edit/delete
    const fieldCols: ColumnDef<ContentItem, any>[] = contentFields.map(
      (field) => ({
        id: `field-${field.id}`,
        enableSorting: false,
        header: () => (
          <FieldHeaderCell
            field={field}
            contentTypeId={selectedTypeId}
            updateMutation={updateFieldMutation}
            deleteMutation={deleteFieldMutation}
            onDelete={handleDeleteField}
          />
        ),
        cell: ({ row }: { row: any }) => {
          const item = row.original as ContentItem;
          const stored = fieldValuesMap[item.id]?.[field.id] ?? "";
          return (
            <EditableCell
              itemId={item.id}
              editingIdRef={editingIdRef}
              renderEdit={() => (
                <Input
                  defaultValue={
                    editValuesRef.current.fieldValues[field.id] ?? stored
                  }
                  onChange={(e) =>
                    setEditValuesStable((p) => ({
                      ...p,
                      fieldValues: {
                        ...p.fieldValues,
                        [field.id]: e.target.value,
                      },
                    }))
                  }
                  className="h-7 text-xs min-w-32"
                />
              )}
              renderView={() => (
                <span
                  className="text-xs text-muted-foreground block truncate max-w-16"
                  title={stored}
                >
                  {stored || "—"}
                </span>
              )}
            />
          );
        },
      }),
    );

    // + column — header opens popover to add a new field
    const addFieldCol: ColumnDef<ContentItem, any> = {
      id: "__add_field__",
      enableSorting: false,
      header: () => (
        <AddFieldHeaderCell
          contentTypeId={selectedTypeId}
          createMutation={createFieldMutation}
          onCreate={handleCreateField}
        />
      ),
      cell: () => null,
    };

    // Actions column
    const actionsCol: ColumnDef<ContentItem, any> = columnHelper.display({
      id: "actions",
      header: () => (
        <span className="text-xs font-semibold text-muted-foreground">
          Actions
        </span>
      ),
      cell: ({ row }) => (
        <RowActions
          item={row.original}
          editingIdRef={editingIdRef}
          onEdit={startEdit}
          onSave={saveEdit}
          onCancel={cancelEdit}
          onDelete={handleDeleteItem}
          selectedTypeId={selectedTypeId}
          isSaving={updateItemMutation.isPending}
          isDeleting={deleteItemMutation.isPending}
        />
      ),
    });

    return [...base, ...fieldCols, addFieldCol, actionsCol];
  }, [
    contentFields,
    fieldValuesMap,
    selectedTypeId,
    updateItemMutation.isPending,
    deleteItemMutation.isPending,
    updateFieldMutation,
    deleteFieldMutation,
    createFieldMutation,
    handleDeleteField,
    handleCreateField,
    handleDeleteItem,
    startEdit,
    saveEdit,
    cancelEdit,
    setEditValuesStable,
  ]);

  const table = useReactTable({
    data: contentItems,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    state: { sorting, globalFilter },
  });

  const isLoading = fieldsLoading || itemsLoading;
  const colSpan = 3 + contentFields.length + 2;

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* ── Toolbar ── */}
      <div className="flex items-center justify-between gap-3 px-4 h-12 border-b shrink-0 bg-background">
        <div className="flex items-center gap-2 min-w-0">
          {selectedType ? (
            <>
              <span className="font-semibold text-sm truncate">
                {selectedType.name}
              </span>
              {selectedType.description && (
                <span className="text-xs text-muted-foreground truncate hidden sm:block">
                  — {selectedType.description}
                </span>
              )}
              <Badge variant="secondary" className="text-[10px] shrink-0">
                {contentFields.length} fields
              </Badge>
              <Badge variant="outline" className="text-[10px] shrink-0">
                {table.getRowModel().rows.length} / {contentItems.length} items
              </Badge>
            </>
          ) : (
            <span className="text-sm text-muted-foreground">
              Select a content type
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {selectedTypeId && (
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Search…"
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="h-8 pl-8 w-44 text-sm"
              />
            </div>
          )}
          <Button
            size="sm"
            className="h-8 gap-1.5"
            onClick={openNewRow}
            disabled={!selectedTypeId || !!newRow || isLoading}
          >
            <Plus className="h-3.5 w-3.5" />
            Add item
          </Button>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto">
          <Table>
            <TableHeader className="sticky top-0 z-10">
              {table.getHeaderGroups().map((hg) => (
                <TableRow key={hg.id} className="bg-muted/70 hover:bg-muted/70">
                  {hg.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="h-9 px-3 whitespace-nowrap"
                    >
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
              {/* New item row */}
              {newRow && (
                <TableRow className="bg-primary/5 hover:bg-primary/5">
                  <TableCell className="px-3 py-1.5">
                    <Input
                      autoFocus
                      value={newRow.title}
                      onChange={(e) =>
                        setNewRow((p) => p && { ...p, title: e.target.value })
                      }
                      placeholder="Title"
                      className="h-7 text-xs min-w-32"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveNew();
                        if (e.key === "Escape") setNewRow(null);
                      }}
                    />
                  </TableCell>
                  <TableCell className="px-3 py-1.5">
                    <Input
                      value={newRow.slug}
                      onChange={(e) =>
                        setNewRow((p) => p && { ...p, slug: e.target.value })
                      }
                      placeholder="slug"
                      className="h-7 text-xs font-mono min-w-32"
                    />
                  </TableCell>
                  <TableCell className="px-3 py-1.5">
                    <Switch
                      checked={newRow.published}
                      onCheckedChange={(v) =>
                        setNewRow((p) => p && { ...p, published: v })
                      }
                    />
                  </TableCell>
                  {contentFields.map((field) => (
                    <TableCell key={field.id} className="px-3 py-1.5">
                      <Input
                        value={newRow.fieldValues[field.id] ?? ""}
                        onChange={(e) =>
                          setNewRow(
                            (p) =>
                              p && {
                                ...p,
                                fieldValues: {
                                  ...p.fieldValues,
                                  [field.id]: e.target.value,
                                },
                              },
                          )
                        }
                        placeholder={field.name}
                        className="h-7 text-xs min-w-32"
                      />
                    </TableCell>
                  ))}
                  {/* empty cell under + add-field column */}
                  <TableCell className="px-3 py-1.5" />
                  <TableCell className="px-3 py-1.5">
                    <div className="flex items-center gap-0.5">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0"
                        onClick={saveNew}
                        disabled={
                          !newRow.title.trim() || createItemMutation.isPending
                        }
                        title="Save"
                      >
                        {createItemMutation.isPending ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Save className="h-3.5 w-3.5" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0"
                        onClick={() => setNewRow(null)}
                        title="Cancel"
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}

              {/* Loading */}
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={colSpan} className="py-20 text-center">
                    <Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground" />
                  </TableCell>
                </TableRow>
              )}

              {/* No type selected */}
              {!isLoading && !selectedTypeId && (
                <TableRow>
                  <TableCell
                    colSpan={colSpan}
                    className="py-20 text-center text-sm text-muted-foreground"
                  >
                    Select a content type from the left panel
                  </TableCell>
                </TableRow>
              )}

              {/* Empty */}
              {!isLoading &&
                selectedTypeId &&
                contentItems.length === 0 &&
                !newRow && (
                  <TableRow>
                    <TableCell
                      colSpan={colSpan}
                      className="py-20 text-center text-sm text-muted-foreground"
                    >
                      No items yet —{" "}
                      <button
                        onClick={openNewRow}
                        className="underline underline-offset-2 hover:text-foreground transition-colors"
                      >
                        add the first one
                      </button>
                    </TableCell>
                  </TableRow>
                )}

              {/* Data rows */}
              {!isLoading &&
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className={cn(
                      "hover:bg-muted/40 transition-colors",
                      editingId === row.original.id && "bg-muted/30",
                    )}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="px-3 py-2">
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

        {/* Add item footer */}
        {selectedTypeId && !newRow && !isLoading && (
          <button
            onClick={openNewRow}
            className="shrink-0 w-full flex items-center gap-2 px-4 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors border-t"
          >
            <Plus className="h-3.5 w-3.5" />
            Add item
          </button>
        )}
      </div>
    </div>
  );
}
