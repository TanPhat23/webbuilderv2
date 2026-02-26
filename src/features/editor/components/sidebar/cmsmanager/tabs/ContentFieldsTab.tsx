import React, { useMemo, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { ContentField, ContentType } from "@/features/cms";
import { Database, Loader2, FileText } from "lucide-react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  ColumnDef,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import { useTableEditing } from "@/features/table";
import { useTableState } from "@/features/table";
import {
  SortableHeader,
  ConfirmDeleteDialog,
  TableActionButtons,
  TableToolbar,
} from "./components";

interface ContentFieldsTabProps {
  selectedTypeId: string;
  contentTypes: ContentType[];
  contentFields: ContentField[];
  isLoading: boolean;
  createFieldMutation: any;
  updateFieldMutation: any;
  deleteFieldMutation: any;
  onCreateField: (data: any) => void;
  onDeleteField: (contentTypeId: string, fieldId: string) => void;
}

const FIELD_TYPES = [
  "text",
  "textarea",
  "richtext",
  "number",
  "boolean",
  "date",
  "email",
  "url",
  "select",
  "multiselect",
] as const;

export const ContentFieldsTab: React.FC<ContentFieldsTabProps> = ({
  selectedTypeId,
  contentTypes,
  contentFields,
  isLoading,
  createFieldMutation,
  updateFieldMutation,
  deleteFieldMutation,
  onCreateField,
  onDeleteField,
}) => {
  const columnHelper = createColumnHelper<ContentField>();

  // Use custom hooks for state management
  const { sorting, setSorting, globalFilter, setGlobalFilter } =
    useTableState();

  const {
    editingRowsSet,
    editedValues,
    newRow,
    startEditing,
    stopEditing,
    updateField,
    getFieldValue,
    startNewRow,
    cancelNewRow,
    updateNewRowField,
    isEditing,
  } = useTableEditing<ContentField>({
    getInitialValues: (field) => ({
      name: field.name,
      type: field.type,
      required: field.required,
    }),
  });

  // Handlers
  const handleStartEditing = useCallback(
    (fieldId: string) => {
      const field = contentFields.find((f) => f.id === fieldId);
      if (field) {
        startEditing(fieldId, field);
      }
    },
    [contentFields, startEditing],
  );

  const handleSaveExisting = useCallback(
    async (fieldId: string) => {
      const editedData = editedValues[fieldId];
      if (!editedData) return;

      const updateData = {
        name: editedData.name,
        type: editedData.type,
        required: editedData.required,
      };

      try {
        updateFieldMutation.mutate({
          contentTypeId: selectedTypeId,
          fieldId,
          data: updateData,
        });
        stopEditing(fieldId);
      } catch (error) {
        console.error("Failed to update field:", error);
      }
    },
    [editedValues, updateFieldMutation, selectedTypeId, stopEditing],
  );

  const handleSaveNew = useCallback(async () => {
    if (!newRow) return;

    const fieldData = {
      name: newRow.name || "",
      type: newRow.type || "text",
      required: newRow.required || false,
    };

    try {
      onCreateField(fieldData);
      cancelNewRow();
    } catch (error) {
      console.error("Failed to create field:", error);
    }
  }, [newRow, onCreateField, cancelNewRow]);

  const handleUpdateField = useCallback(
    (fieldId: string, property: string, value: any) => {
      if (newRow?.isNew) {
        updateNewRowField(property, value);
      } else {
        updateField(fieldId, property, value);
      }
    },
    [newRow, updateField, updateNewRowField],
  );

  // Column definitions
  const columns = useMemo<ColumnDef<ContentField, any>[]>(
    () => [
      columnHelper.accessor("name", {
        header: ({ column }) => (
          <SortableHeader column={column}>Name</SortableHeader>
        ),
        cell: ({ row, getValue }) => {
          const field = row.original;
          const editing = isEditing(field.id);

          return editing ? (
            <Input
              value={getFieldValue(field.id, "name", getValue())}
              onChange={(e) =>
                handleUpdateField(field.id, "name", e.target.value)
              }
              className="h-8"
            />
          ) : (
            <span className="font-medium">{getValue()}</span>
          );
        },
      }),
      columnHelper.accessor("type", {
        header: ({ column }) => (
          <SortableHeader column={column}>Type</SortableHeader>
        ),
        cell: ({ row, getValue }) => {
          const field = row.original;
          const editing = isEditing(field.id);

          return editing ? (
            <Select
              value={getFieldValue(field.id, "type", getValue())}
              onValueChange={(value) =>
                handleUpdateField(field.id, "type", value)
              }
            >
              <SelectTrigger className="h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FIELD_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <span className="capitalize">{getValue()}</span>
          );
        },
      }),
      columnHelper.accessor("required", {
        header: "Required",
        cell: ({ row, getValue }) => {
          const field = row.original;
          const editing = isEditing(field.id);

          return editing ? (
            <Switch
              checked={getFieldValue(field.id, "required", getValue())}
              onCheckedChange={(checked) =>
                handleUpdateField(field.id, "required", checked)
              }
            />
          ) : getValue() ? (
            <Badge variant="secondary">Required</Badge>
          ) : (
            <span className="text-muted-foreground">Optional</span>
          );
        },
      }),
      columnHelper.display({
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const field = row.original;
          const editing = isEditing(field.id);

          return (
            <div className="flex gap-1">
              <TableActionButtons
                isEditing={editing}
                onEdit={() => handleStartEditing(field.id)}
                onSave={() => handleSaveExisting(field.id)}
                onCancel={() => stopEditing(field.id)}
                isSaving={updateFieldMutation.isPending}
              />
              {!editing && (
                <ConfirmDeleteDialog
                  itemName={field.name}
                  itemType="Content Field"
                  onConfirm={() => onDeleteField(selectedTypeId, field.id)}
                  isPending={deleteFieldMutation.isPending}
                  description={`Are you sure you want to delete the field "${field.name}"? This action cannot be undone.`}
                />
              )}
            </div>
          );
        },
      }),
    ],
    [
      columnHelper,
      isEditing,
      getFieldValue,
      handleUpdateField,
      handleStartEditing,
      handleSaveExisting,
      stopEditing,
      updateFieldMutation.isPending,
      deleteFieldMutation.isPending,
      onDeleteField,
      selectedTypeId,
    ],
  );

  const table = useReactTable({
    data: contentFields,
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
  });

  const selectedType = contentTypes.find((t) => t.id === selectedTypeId);

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
            fields.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <TableToolbar
          title="Content Fields Grid"
          onAdd={() => startNewRow({ name: "", type: "text", required: false })}
          searchValue={globalFilter}
          onSearchChange={setGlobalFilter}
          searchPlaceholder="Search content fields..."
          addDisabled={!!newRow}
        />
        {selectedType && (
          <p className="text-sm text-muted-foreground mt-1">
            For: {selectedType.name}
          </p>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : contentFields.length === 0 && !newRow ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FileText />
            </EmptyMedia>
            <EmptyTitle>No fields yet</EmptyTitle>
            <EmptyDescription>
              Add your first field to define the structure for this content
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
                <TableRow>
                  <TableCell>
                    <Input
                      value={newRow.name || ""}
                      onChange={(e) =>
                        updateNewRowField("name", e.target.value)
                      }
                      placeholder="Enter field name"
                      className="h-8"
                    />
                  </TableCell>
                  <TableCell>
                    <Select
                      value={newRow.type || "text"}
                      onValueChange={(value) =>
                        updateNewRowField("type", value)
                      }
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FIELD_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={newRow.required || false}
                      onCheckedChange={(checked) =>
                        updateNewRowField("required", checked)
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <TableActionButtons
                      isEditing={true}
                      onEdit={() => {}}
                      onSave={handleSaveNew}
                      onCancel={cancelNewRow}
                      isSaving={createFieldMutation.isPending}
                    />
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
