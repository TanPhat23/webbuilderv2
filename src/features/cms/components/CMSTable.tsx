import { useState } from "react";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { useCMSContext } from "../provider/CMSProvider";
import { CMSItemGrid } from "./table/CMSItemGrid";
import { CMSTableToolbar } from "./table/CMSTableToolbar";
import { NewItemRow } from "./table/NewItemRow";
import { useCMSColumns } from "./table/useCMSColumns";
import { useCMSItemEditing } from "./table/useCMSItemEditing";

function getGridStatus({ isLoading, hasSelection, isEmpty }: {
  isLoading: boolean;
  hasSelection: boolean;
  isEmpty: boolean;
}) {
  if (isLoading) return "loading";
  if (!hasSelection) return "unselected";
  if (isEmpty) return "empty";
  return null;
}

export function CMSTable() {
  const cms = useCMSContext();
  const editing = useCMSItemEditing(cms);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const columns = useCMSColumns({
    ...cms,
    ...editing,
    isSaving: cms.updateItemMutation.isPending,
    isDeleting: cms.deleteItemMutation.isPending,
  });

  const table = useReactTable({
    data: cms.contentItems,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    state: { sorting, globalFilter },
  });

  const hasSelection = Boolean(cms.selectedTypeId);
  const isLoading = cms.fieldsLoading || cms.itemsLoading;
  const canAddItem = hasSelection && !editing.newRow && !isLoading;
  const isEmpty = cms.contentItems.length === 0 && !editing.newRow;
  const status = getGridStatus({ isLoading, hasSelection, isEmpty });

  return (
    <div className="flex flex-col h-full min-h-0">
      <CMSTableToolbar
        selectedType={cms.selectedType}
        hasSelection={hasSelection}
        fieldCount={cms.contentFields.length}
        visibleCount={table.getRowModel().rows.length}
        itemCount={cms.contentItems.length}
        globalFilter={globalFilter}
        setGlobalFilter={setGlobalFilter}
        canAddItem={canAddItem}
        openNewRow={editing.openNewRow}
      />
      <CMSItemGrid
        table={table}
        colSpan={5 + cms.contentFields.length}
        status={status}
        editingId={editing.editingId}
        canAddItem={canAddItem}
        openNewRow={editing.openNewRow}
      >
        {editing.newRow && (
          <NewItemRow
            newRow={editing.newRow}
            contentFields={cms.contentFields}
            setNewRow={editing.setNewRow}
            isSaving={cms.createItemMutation.isPending}
            onSave={editing.saveNew}
            onCancel={editing.cancelNewRow}
          />
        )}
      </CMSItemGrid>
    </div>
  );
}
