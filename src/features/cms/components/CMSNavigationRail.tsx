import React, { useState } from "react";
import { toast } from "sonner";
import { Database, Plus, Table2, Terminal, Webhook } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useCMSContext } from "../provider/CMSProvider";
import { DeleteConfirm } from "./DeleteConfirm";

export type StudioSection = "collections" | "webhooks" | "mcp";

interface CMSNavigationRailProps {
  readonly activeSection: StudioSection;
  readonly onSelectCollections: () => void;
  readonly onSelectWebhooks: () => void;
  readonly onSelectMcp: () => void;
  readonly isAdding: boolean;
  readonly onAddingChange: (adding: boolean) => void;
}

export function CMSNavigationRail({
  activeSection,
  onSelectCollections,
  onSelectWebhooks,
  onSelectMcp,
  isAdding,
  onAddingChange,
}: CMSNavigationRailProps): React.ReactElement {
  const {
    contentTypes,
    contentItems,
    selectedTypeId,
    selectType,
    typesLoading,
    createTypeMutation,
    deleteTypeMutation,
    handleDeleteType,
  } = useCMSContext();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleCreateSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      return;
    }
    createTypeMutation.mutate(
      {
        name: trimmedName,
        description: description.trim() || undefined,
      },
      {
        onSuccess: (created) => {
          selectType(created.id);
          onSelectCollections();
          setName("");
          setDescription("");
          onAddingChange(false);
          toast.success(`Collection "${created.name}" created`);
        },
        onError: () => {
          toast.error("Failed to create collection");
        },
      },
    );
  };

  const handleCancelAdd = (): void => {
    setName("");
    setDescription("");
    onAddingChange(false);
  };

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-border/60 bg-card/50">
      <div className="flex h-14 shrink-0 items-center gap-2.5 border-b border-border/50 px-4">
        <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
          <Database className="size-4" />
        </div>
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-sm font-semibold tracking-tight text-foreground">
            CMS Studio
          </span>
          <span className="truncate text-[11px] text-muted-foreground">
            Collections &amp; Backend
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Collections
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            title="New collection"
            aria-label="New collection"
            onClick={() => {
              onSelectCollections();
              onAddingChange(true);
            }}
            className="size-6 text-muted-foreground hover:text-foreground"
          >
            <Plus className="size-3.5" />
          </Button>
        </div>

        {isAdding && (
          <form
            onSubmit={handleCreateSubmit}
            className="flex flex-col gap-2 rounded-lg border border-border/70 bg-background p-2.5 shadow-sm"
          >
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Collection name"
              className="h-8 text-xs"
              autoFocus
            />
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description (optional)"
              className="h-8 text-xs"
            />
            <div className="flex items-center justify-end gap-1.5 pt-0.5">
              <Button
                type="button"
                variant="ghost"
                size="xs"
                onClick={handleCancelAdd}
                disabled={createTypeMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="xs"
                disabled={!name.trim() || createTypeMutation.isPending}
              >
                {createTypeMutation.isPending ? "Creating…" : "Create"}
              </Button>
            </div>
          </form>
        )}

        {typesLoading ? (
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-9 w-full rounded-lg" />
            <Skeleton className="h-9 w-full rounded-lg" />
            <Skeleton className="h-9 w-full rounded-lg" />
          </div>
        ) : contentTypes.length === 0 ? (
          !isAdding && (
            <button
              type="button"
              onClick={() => {
                onSelectCollections();
                onAddingChange(true);
              }}
              className="flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-border/70 px-3 py-4 text-xs font-medium text-muted-foreground transition-colors hover:border-border hover:bg-muted/40 hover:text-foreground"
            >
              <Plus className="size-3.5" />
              <span>Create first collection</span>
            </button>
          )
        ) : (
          <div className="flex flex-col gap-0.5">
            {contentTypes.map((type) => {
              const isSelected =
                activeSection === "collections" && selectedTypeId === type.id;
              const itemCount =
                selectedTypeId === type.id
                  ? contentItems.length
                  : type.items?.length;

              return (
                <div
                  key={type.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    selectType(type.id);
                    onSelectCollections();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      selectType(type.id);
                      onSelectCollections();
                    }
                  }}
                  className={cn(
                    "group flex items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-xs transition-colors cursor-pointer select-none",
                    isSelected
                      ? "bg-accent text-accent-foreground font-medium"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                  )}
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <Table2 className="size-3.5 shrink-0 opacity-75" />
                    <span className="truncate">{type.name}</span>
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    {typeof itemCount === "number" && (
                      <span
                        className={cn(
                          "rounded-md px-1.5 py-0.5 text-[10px] font-medium tabular-nums",
                          isSelected
                            ? "bg-background/70 text-foreground"
                            : "bg-muted text-muted-foreground",
                        )}
                      >
                        {itemCount}
                      </span>
                    )}
                    <div className="opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                      <DeleteConfirm
                        label={type.name}
                        description={`Permanently delete the "${type.name}" collection along with all its fields and items?`}
                        onConfirm={() => handleDeleteType(type.id)}
                        isPending={deleteTypeMutation.isPending}
                        buttonClassName="size-6"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex shrink-0 flex-col gap-1.5 border-t border-border/50 p-3">
        <span className="px-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Integrations
        </span>
        <button
          type="button"
          onClick={onSelectWebhooks}
          className={cn(
            "flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs transition-colors",
            activeSection === "webhooks"
              ? "bg-accent font-medium text-accent-foreground"
              : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
          )}
        >
          <Webhook className="size-3.5 shrink-0" />
          <span>Webhooks</span>
        </button>
        <button
          type="button"
          onClick={onSelectMcp}
          className={cn(
            "flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs transition-colors",
            activeSection === "mcp"
              ? "bg-accent font-medium text-accent-foreground"
              : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
          )}
        >
          <Terminal className="size-3.5 shrink-0" />
          <span>MCP</span>
        </button>
      </div>
    </aside>
  );
}
