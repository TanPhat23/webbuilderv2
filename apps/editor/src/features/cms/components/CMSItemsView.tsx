import React, { useMemo, useState } from "react";
import { FileText, Inbox, Pencil, Plus, Search, SlidersHorizontal, X } from "lucide-react";
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
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@webbuilder/site-runtime/lib/utils";
import type { ContentField, ContentItem } from "../interfaces/cms.interface";
import { useCMSContext } from "../provider/CMSProvider";
import { DeleteConfirm } from "./DeleteConfirm";
import { stripHtmlToPreview } from "./richTextUtils";

type StatusFilter = "all" | "published" | "draft";

interface CMSItemsViewProps {
  readonly onCreateItem: () => void;
  readonly onEditItem: (item: ContentItem) => void;
  readonly onSwitchToSchema: () => void;
}

function renderFieldCell(
  field: ContentField,
  rawValue: string | undefined,
): React.ReactElement {
  const value = rawValue?.trim() ?? "";

  if (field.type === "boolean") {
    const isTruthy = value === "true";
    return (
      <Badge
        variant={isTruthy ? "secondary" : "outline"}
        className="text-[11px] font-normal"
      >
        {isTruthy ? "Yes" : "No"}
      </Badge>
    );
  }

  if (!value) {
    return <span className="text-muted-foreground/50">—</span>;
  }

  if (field.type === "richtext") {
    const preview = stripHtmlToPreview(value);
    if (!preview) {
      return <span className="text-muted-foreground/50">—</span>;
    }
    return (
      <div className="flex max-w-52 items-center gap-1.5 text-muted-foreground">
        <FileText className="size-3.5 shrink-0 opacity-70" />
        <span className="truncate text-xs">{preview}</span>
      </div>
    );
  }

  return (
    <span className="block max-w-52 truncate text-xs text-foreground/90">
      {value}
    </span>
  );
}

export function CMSItemsView({
  onCreateItem,
  onEditItem,
  onSwitchToSchema,
}: CMSItemsViewProps): React.ReactElement {
  const {
    selectedType,
    contentFields,
    contentItems,
    itemsLoading,
    deleteItemMutation,
    handleDeleteItem,
  } = useCMSContext();

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const counts = useMemo(() => {
    let published = 0;
    let draft = 0;
    for (const item of contentItems) {
      if (item.published) {
        published += 1;
      } else {
        draft += 1;
      }
    }
    return {
      all: contentItems.length,
      published,
      draft,
    };
  }, [contentItems]);

  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return contentItems.filter((item) => {
      if (statusFilter === "published" && !item.published) {
        return false;
      }
      if (statusFilter === "draft" && item.published) {
        return false;
      }
      if (!q) {
        return true;
      }
      if (
        item.title.toLowerCase().includes(q) ||
        item.slug.toLowerCase().includes(q)
      ) {
        return true;
      }
      return (item.fieldValues ?? []).some((fv) =>
        stripHtmlToPreview(fv.value ?? "").toLowerCase().includes(q),
      );
    });
  }, [contentItems, searchQuery, statusFilter]);

  const filterPills: ReadonlyArray<{
    readonly id: StatusFilter;
    readonly label: string;
    readonly count: number;
  }> = [
    { id: "all", label: "All", count: counts.all },
    { id: "published", label: "Published", count: counts.published },
    { id: "draft", label: "Draft", count: counts.draft },
  ];

  return (
    <div className="flex flex-1 min-h-0 flex-col overflow-hidden">
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 px-6 pt-4 pb-3">
        <div
          role="group"
          aria-label="Filter items by status"
          className="flex items-center gap-1 rounded-lg border border-border/60 bg-muted/30 p-0.5"
        >
          {filterPills.map((pill) => {
            const active = statusFilter === pill.id;
            return (
              <button
                key={pill.id}
                type="button"
                onClick={() => setStatusFilter(pill.id)}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                  active
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <span>{pill.label}</span>
                <span className="text-[11px] text-muted-foreground tabular-nums">
                  {pill.count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search items…"
            className="h-8 pr-8 pl-8 text-xs"
          />
          {searchQuery.length > 0 && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => setSearchQuery("")}
              className="absolute top-1/2 right-2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-1 min-h-0 flex-col overflow-hidden px-6 pb-6">
        {itemsLoading ? (
          <div className="flex flex-col gap-3 rounded-xl border border-border/60 bg-card/30 p-4">
            {[0, 1, 2, 3, 4].map((row) => (
              <div key={row} className="flex items-center justify-between gap-4">
                <div className="flex flex-1 flex-col gap-1.5">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-4 w-36" />
              </div>
            ))}
          </div>
        ) : contentItems.length === 0 ? (
          <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-border/70 bg-card/30 p-8">
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Inbox className="size-5" />
                </EmptyMedia>
                <EmptyTitle className="text-base">
                  No items in {selectedType?.name ?? "this collection"} yet
                </EmptyTitle>
                <EmptyDescription>
                  Create your first record or define custom schema fields like
                  Rich Text, Date, or Toggle before adding content.
                </EmptyDescription>
              </EmptyHeader>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  onClick={onCreateItem}
                  className="gap-1.5"
                >
                  <Plus className="size-3.5" />
                  Create first item
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={onSwitchToSchema}
                  className="gap-1.5"
                >
                  <SlidersHorizontal className="size-3.5" />
                  Configure fields
                </Button>
              </div>
            </Empty>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="flex flex-1 items-center justify-center rounded-xl border border-border/60 bg-card/30 p-8">
            <div className="flex flex-col items-center gap-3 text-center">
              <p className="text-sm font-medium text-foreground">
                No matching items
              </p>
              <p className="text-xs text-muted-foreground">
                Try adjusting your search query or status filter.
              </p>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => {
                  setStatusFilter("all");
                  setSearchQuery("");
                }}
              >
                Reset filters
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-1 min-h-0 flex-col overflow-hidden rounded-xl border border-border/60 bg-card/30">
            <div className="flex-1 overflow-auto">
              <Table>
                <TableHeader className="sticky top-0 z-10 bg-muted/40 backdrop-blur-xs">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="min-w-56 text-xs font-medium text-muted-foreground">
                      Item
                    </TableHead>
                    <TableHead className="w-28 text-xs font-medium text-muted-foreground">
                      Status
                    </TableHead>
                    {contentFields.map((field) => (
                      <TableHead
                        key={field.id}
                        className="min-w-36 text-xs font-medium text-muted-foreground"
                      >
                        {field.name}
                      </TableHead>
                    ))}
                    <TableHead className="w-24 text-right text-xs font-medium text-muted-foreground">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.map((item) => {
                    const valuesByFieldId = new Map<string, string>();
                    for (const fv of item.fieldValues ?? []) {
                      if (fv.value !== undefined) {
                        valuesByFieldId.set(fv.fieldId, fv.value);
                      }
                    }

                    return (
                      <TableRow
                        key={item.id}
                        onClick={() => onEditItem(item)}
                        className="group cursor-pointer transition-colors hover:bg-muted/40"
                      >
                        <TableCell className="py-3">
                          <div className="flex min-w-0 flex-col gap-0.5">
                            <span className="truncate text-sm font-medium text-foreground">
                              {item.title}
                            </span>
                            <span className="truncate font-mono text-[11px] text-muted-foreground">
                              /{item.slug}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="py-3">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium",
                              item.published
                                ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                : "border-border bg-muted/60 text-muted-foreground",
                            )}
                          >
                            <span
                              className={cn(
                                "size-1.5 rounded-full",
                                item.published
                                  ? "bg-emerald-500"
                                  : "bg-muted-foreground/60",
                              )}
                            />
                            {item.published ? "Published" : "Draft"}
                          </span>
                        </TableCell>
                        {contentFields.map((field) => (
                          <TableCell key={field.id} className="py-3">
                            {renderFieldCell(
                              field,
                              valuesByFieldId.get(field.id),
                            )}
                          </TableCell>
                        ))}
                        <TableCell className="py-3 text-right">
                          <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                            <Button
                              type="button"
                              size="icon-xs"
                              variant="ghost"
                              title={`Edit ${item.title}`}
                              aria-label={`Edit ${item.title}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                onEditItem(item);
                              }}
                              className="size-7 text-muted-foreground hover:text-foreground"
                            >
                              <Pencil className="size-3.5" />
                            </Button>
                            {selectedType && (
                              <DeleteConfirm
                                label={item.title}
                                description={`Permanently delete "${item.title}"? This action cannot be undone.`}
                                onConfirm={() =>
                                  handleDeleteItem(selectedType.id, item.id)
                                }
                                isPending={deleteItemMutation.isPending}
                              />
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
