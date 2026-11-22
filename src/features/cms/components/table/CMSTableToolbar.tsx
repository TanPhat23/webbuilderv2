import { Plus, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ContentType } from "@/features/cms/interfaces/cms.interface";

interface CMSTableToolbarProps {
  selectedType?: ContentType;
  hasSelection: boolean;
  fieldCount: number;
  visibleCount: number;
  itemCount: number;
  globalFilter: string;
  setGlobalFilter: (value: string) => void;
  canAddItem: boolean;
  openNewRow: () => void;
}

export function CMSTableToolbar({
  selectedType, hasSelection, fieldCount, visibleCount, itemCount, globalFilter,
  setGlobalFilter, canAddItem, openNewRow,
}: CMSTableToolbarProps) {
  return (
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
              {fieldCount} fields
            </Badge>
            <Badge variant="outline" className="text-[10px] shrink-0">
              {visibleCount} / {itemCount} items
            </Badge>
          </>
        ) : (
          <span className="text-sm text-muted-foreground">
            Select a content type
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {hasSelection && (
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
          disabled={!canAddItem}
        >
          <Plus className="h-3.5 w-3.5" />
          Add item
        </Button>
      </div>
    </div>
  );
}
