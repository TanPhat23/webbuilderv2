import { useMemo, type ReactNode, type RefObject } from "react";
import type { Column, ColumnDef } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown, Eye, EyeOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import type { ContentItem } from "@/features/cms/interfaces/cms.interface";
import type { CMSContextValue, EditableItemValues } from "../types";
import { AddFieldHeaderCell, EditableCell, FieldHeaderCell, RowActions } from ".";

type CMSColumn = ColumnDef<ContentItem, string> | ColumnDef<ContentItem, boolean> | ColumnDef<ContentItem>;

type CMSColumnOptions = Pick<CMSContextValue,
  | "selectedTypeId"
  | "contentFields"
  | "createFieldMutation"
  | "updateFieldMutation"
  | "deleteFieldMutation"
  | "handleCreateField"
  | "handleDeleteField"
  | "handleDeleteItem"
> & {
  fieldValuesMap: Record<string, Record<string, string>>;
  editingIdRef: RefObject<string | null>;
  editValuesRef: RefObject<EditableItemValues>;
  setEditValuesStable: (updater: (previous: EditableItemValues) => EditableItemValues) => void;
  startEdit: (item: ContentItem) => void;
  saveEdit: (itemId: string) => void;
  cancelEdit: () => void;
  isSaving: boolean;
  isDeleting: boolean;
};

function SortableHeader({
  column,
  children,
}: {
  column: Column<ContentItem, string>;
  children: ReactNode;
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

export function useCMSColumns({
  contentFields,
  fieldValuesMap,
  selectedTypeId,
  isSaving,
  isDeleting,
  updateFieldMutation,
  deleteFieldMutation,
  createFieldMutation,
  handleDeleteField,
  handleCreateField,
  handleDeleteItem,
  editingIdRef,
  editValuesRef,
  startEdit,
  saveEdit,
  cancelEdit,
  setEditValuesStable,
}: CMSColumnOptions) {
  // Cell callbacks use refs so keystrokes don't rebuild columns and remount inputs.
  return useMemo<CMSColumn[]>(() => {
    const titleColumn: ColumnDef<ContentItem, string> = {
      accessorKey: "title",
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
    };

    const slugColumn: ColumnDef<ContentItem, string> = {
      accessorKey: "slug",
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
    };

    const publishedColumn: ColumnDef<ContentItem, boolean> = {
      accessorKey: "published",
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
    };

    // One dynamic column per field — header is clickable to edit/delete
    const fieldCols: ColumnDef<ContentItem>[] = contentFields.map(
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
        cell: ({ row }) => {
          const item = row.original;
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
    const addFieldCol: ColumnDef<ContentItem> = {
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
    const actionsCol: ColumnDef<ContentItem> = {
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
          isSaving={isSaving}
          isDeleting={isDeleting}
        />
      ),
    };

    return [titleColumn, slugColumn, publishedColumn, ...fieldCols, addFieldCol, actionsCol];
  }, [
    contentFields,
    fieldValuesMap,
    selectedTypeId,
    isSaving,
    isDeleting,
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
    editingIdRef,
    editValuesRef,
  ]);
}
