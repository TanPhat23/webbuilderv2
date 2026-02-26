import React, { useMemo, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { ContentType } from "@/features/cms";
import { Eye, Loader2, Database } from "lucide-react";
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
import { Button } from "@/components/ui/button";

interface ContentTypesTabProps {
  contentTypes: ContentType[];
  isLoading: boolean;
  createTypeMutation: any;
  updateTypeMutation: any;
  deleteTypeMutation: any;
  onSelectType: (typeId: string) => void;
  onCreateType: (data: any) => void;
  onDeleteType: (typeId: string) => void;
}

export const ContentTypesTab: React.FC<ContentTypesTabProps> = ({
  contentTypes,
  isLoading,
  createTypeMutation,
  updateTypeMutation,
  deleteTypeMutation,
  onSelectType,
  onCreateType,
  onDeleteType,
}) => {
  const columnHelper = createColumnHelper<ContentType>();

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
  } = useTableEditing<ContentType>({
    getInitialValues: (type) => ({
      name: type.name,
      description: type.description,
    }),
  });

  // Handlers
  const handleStartEditing = useCallback(
    (typeId: string) => {
      const type = contentTypes.find((t) => t.id === typeId);
      if (type) {
        startEditing(typeId, type);
      }
    },
    [contentTypes, startEditing],
  );

  const handleSaveExisting = useCallback(
    async (typeId: string) => {
      const editedData = editedValues[typeId];
      if (!editedData) return;

      const updateData = {
        name: editedData.name,
        description: editedData.description,
      };

      try {
        updateTypeMutation.mutate({ id: typeId, data: updateData });
        stopEditing(typeId);
      } catch (error) {
        console.error("Failed to update type:", error);
      }
    },
    [editedValues, updateTypeMutation, stopEditing],
  );

  const handleSaveNew = useCallback(async () => {
    if (!newRow) return;

    const typeData = {
      name: newRow.name || "",
      description: newRow.description || "",
    };

    try {
      await onCreateType(typeData);
      cancelNewRow();
    } catch (error) {
      console.error("Failed to create type:", error);
    }
  }, [newRow, onCreateType, cancelNewRow]);

  const handleUpdateField = useCallback(
    (typeId: string, field: string, value: string) => {
      if (newRow?.isNew) {
        updateNewRowField(field, value);
      } else {
        updateField(typeId, field, value);
      }
    },
    [newRow, updateField, updateNewRowField],
  );

  // Column definitions
  const columns = useMemo<ColumnDef<ContentType, any>[]>(
    () => [
      columnHelper.accessor("name", {
        header: ({ column }) => (
          <SortableHeader column={column}>Name</SortableHeader>
        ),
        cell: ({ row, getValue }) => {
          const type = row.original;
          const editing = isEditing(type.id);

          return editing ? (
            <Input
              value={getFieldValue(type.id, "name", getValue())}
              onChange={(e) =>
                handleUpdateField(type.id, "name", e.target.value)
              }
              className="h-8"
            />
          ) : (
            <span className="font-medium">{getValue()}</span>
          );
        },
      }),
      columnHelper.accessor("description", {
        header: "Description",
        cell: ({ row, getValue }) => {
          const type = row.original;
          const editing = isEditing(type.id);

          return editing ? (
            <Textarea
              value={getFieldValue(type.id, "description", getValue() || "")}
              onChange={(e) =>
                handleUpdateField(type.id, "description", e.target.value)
              }
              className="h-8 resize-none"
              rows={1}
            />
          ) : (
            <span className="text-muted-foreground">{getValue() || "-"}</span>
          );
        },
      }),
      columnHelper.accessor((row) => row.fields?.length || 0, {
        id: "fields",
        header: "Fields",
        cell: ({ getValue }) => <span>{getValue()}</span>,
      }),
      columnHelper.accessor((row) => row.items?.length || 0, {
        id: "items",
        header: "Items",
        cell: ({ getValue }) => <span>{getValue()}</span>,
      }),
      columnHelper.display({
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const type = row.original;
          const editing = isEditing(type.id);

          return (
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onSelectType(type.id)}
                className="h-8 w-8 p-0"
                title="View Details"
              >
                <Eye className="h-4 w-4" />
              </Button>
              <TableActionButtons
                isEditing={editing}
                onEdit={() => handleStartEditing(type.id)}
                onSave={() => handleSaveExisting(type.id)}
                onCancel={() => stopEditing(type.id)}
                isSaving={updateTypeMutation.isPending}
              />
              {!editing && (
                <ConfirmDeleteDialog
                  itemName={type.name}
                  itemType="Content Type"
                  onConfirm={() => onDeleteType(type.id)}
                  isPending={deleteTypeMutation.isPending}
                  description={`Are you sure you want to delete "${type.name}"? This action cannot be undone and will also delete all associated fields and content items.`}
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
      updateTypeMutation.isPending,
      deleteTypeMutation.isPending,
      onSelectType,
      onDeleteType,
    ],
  );

  const table = useReactTable({
    data: contentTypes,
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

  return (
    <div className="space-y-4">
      <TableToolbar
        title="Content Types Grid"
        onAdd={() => startNewRow({ name: "", description: "" })}
        searchValue={globalFilter}
        onSearchChange={setGlobalFilter}
        searchPlaceholder="Search content types..."
        addDisabled={!!newRow}
      />

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : contentTypes.length === 0 && !newRow ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Database />
            </EmptyMedia>
            <EmptyTitle>No content types yet</EmptyTitle>
            <EmptyDescription>
              Get started by creating your first content type to structure your
              content.
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
                      placeholder="Enter type name"
                      className="h-8"
                    />
                  </TableCell>
                  <TableCell>
                    <Textarea
                      value={newRow.description || ""}
                      onChange={(e) =>
                        updateNewRowField("description", e.target.value)
                      }
                      placeholder="Enter description"
                      className="h-8 resize-none"
                      rows={1}
                    />
                  </TableCell>
                  <TableCell className="text-muted-foreground">0</TableCell>
                  <TableCell className="text-muted-foreground">0</TableCell>
                  <TableCell>
                    <TableActionButtons
                      isEditing={true}
                      onEdit={() => {}}
                      onSave={handleSaveNew}
                      onCancel={cancelNewRow}
                      isSaving={createTypeMutation.isPending}
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
