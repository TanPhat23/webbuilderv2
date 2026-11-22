import type { ReactNode } from "react";
import { flexRender, type Row, type Table as TableInstance } from "@tanstack/react-table";
import { Loader2, Plus } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { ContentItem } from "@/features/cms/interfaces/cms.interface";
import { cn } from "@/lib/utils";

function CMSGridHeader({ table }: { table: TableInstance<ContentItem> }) {
  return (
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
  );
}

function CMSDataRows({ rows, editingId }: { rows: Row<ContentItem>[]; editingId: string | null }) {
  return rows.map((row) => (
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
  ));
}

type GridStatus = "loading" | "unselected" | "empty" | null;

function CMSGridStatus({
  status, colSpan, openNewRow,
}: { status: GridStatus; colSpan: number; openNewRow: () => void }) {
  if (!status) return null;

  return (
    <TableRow>
      <TableCell
        colSpan={colSpan}
        className={cn("py-20 text-center", status !== "loading" && "text-sm text-muted-foreground")}
      >
        {status === "loading" && (
          <Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground" />
        )}
        {status === "unselected" && "Select a content type from the left panel"}
        {status === "empty" && (
          <>
            No items yet —{" "}
            <button
              onClick={openNewRow}
              className="underline underline-offset-2 hover:text-foreground transition-colors"
            >
              add the first one
            </button>
          </>
        )}
      </TableCell>
    </TableRow>
  );
}

interface CMSItemGridProps {
  table: TableInstance<ContentItem>;
  colSpan: number;
  status: GridStatus;
  editingId: string | null;
  canAddItem: boolean;
  openNewRow: () => void;
  children?: ReactNode;
}

export function CMSItemGrid({
  table, colSpan, status, editingId, canAddItem, openNewRow, children,
}: CMSItemGridProps) {
  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
      <div className="flex-1 overflow-auto">
        <Table>
          <CMSGridHeader table={table} />
          <TableBody>
            {children}
            <CMSGridStatus status={status} colSpan={colSpan} openNewRow={openNewRow} />
            {status !== "loading" && <CMSDataRows rows={table.getRowModel().rows} editingId={editingId} />}
          </TableBody>
        </Table>
      </div>
      {canAddItem && (
        <button
          onClick={openNewRow}
          className="shrink-0 w-full flex items-center gap-2 px-4 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors border-t"
        >
          <Plus className="h-3.5 w-3.5" />
          Add item
        </button>
      )}
    </div>
  );
}
