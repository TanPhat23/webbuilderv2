import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Database,
  FileText,
  Inbox,
  Layers,
  Plus,
  Terminal,
  UtensilsCrossed,
  Webhook,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CMSProvider, useCMSContext } from "../provider/CMSProvider";
import { CMSAccessView } from "./CMSAccessView";
import {
  CMSItemEditorDrawer,
  type ItemDrawerState,
} from "./CMSItemEditorDrawer";
import { CMSItemsView } from "./CMSItemsView";
import { CMSMcpView } from "./CMSMcpView";
import {
  CMSNavigationRail,
  type StudioSection,
} from "./CMSNavigationRail";
import { CMSSchemaView } from "./CMSSchemaView";
import { WebhooksTab } from "./WebhooksTab";

type CollectionTab = "items" | "fields" | "api";

interface StarterCollection {
  readonly name: string;
  readonly description: string;
  readonly icon: React.ComponentType<{ className?: string }>;
}

const STARTER_COLLECTIONS: readonly StarterCollection[] = [
  {
    name: "Blog Posts",
    description: "Articles, changelogs, and long-form editorial content.",
    icon: FileText,
  },
  {
    name: "Menu Items",
    description: "Structured catalog items with prices and descriptions.",
    icon: UtensilsCrossed,
  },
  {
    name: "Form Submissions",
    description: "Collect leads, inquiries, and messages from public forms.",
    icon: Inbox,
  },
];

function CMSStudioShell({
  projectId,
  mcpConnectPanel,
}: {
  readonly projectId?: string;
  readonly mcpConnectPanel?: React.ReactNode;
}): React.ReactElement {
  const {
    contentTypes,
    contentFields,
    contentItems,
    selectedType,
    selectedTypeId,
    selectType,
    typesLoading,
    createTypeMutation,
  } = useCMSContext();

  const [activeSection, setActiveSection] =
    useState<StudioSection>("collections");
  const [activeTab, setActiveTab] = useState<CollectionTab>("items");
  const [isAddingType, setIsAddingType] = useState(false);
  const [isAddingField, setIsAddingField] = useState(false);
  const [drawerState, setDrawerState] = useState<ItemDrawerState | null>(null);

  useEffect(() => {
    setDrawerState(null);
    setIsAddingField(false);
  }, [selectedTypeId]);

  const handleCreateStarter = (starter: StarterCollection): void => {
    createTypeMutation.mutate(
      { name: starter.name, description: starter.description },
      {
        onSuccess: (created) => {
          selectType(created.id);
          setActiveSection("collections");
          setActiveTab("items");
          toast.success(`Collection "${created.name}" created`);
        },
        onError: () => {
          toast.error("Failed to create collection");
        },
      },
    );
  };

  return (
    <div className="flex h-full w-full min-h-0 flex-row overflow-hidden">
      <CMSNavigationRail
        activeSection={activeSection}
        onSelectCollections={() => setActiveSection("collections")}
        onSelectWebhooks={() => setActiveSection("webhooks")}
        onSelectMcp={() => setActiveSection("mcp")}
        isAdding={isAddingType}
        onAddingChange={setIsAddingType}
      />

      <main className="relative flex flex-1 min-w-0 flex-col overflow-hidden bg-background">
        {activeSection === "webhooks" ? (
          <>
            <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b border-border/60 px-6">
              <div className="flex min-w-0 items-center gap-2.5">
                <Webhook className="size-4 text-muted-foreground" />
                <h2 className="truncate text-base font-semibold tracking-tight text-foreground">
                  Project Webhooks
                </h2>
              </div>
              <DialogClose asChild>
                <Button variant="ghost" size="icon-sm" aria-label="Close">
                  <X className="size-4" />
                </Button>
              </DialogClose>
            </header>
            <WebhooksTab projectId={projectId} />
          </>
        ) : activeSection === "mcp" ? (
          <>
            <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b border-border/60 px-6">
              <div className="flex min-w-0 items-center gap-2.5">
                <Terminal className="size-4 text-muted-foreground" />
                <h2 className="truncate text-base font-semibold tracking-tight text-foreground">
                  MCP Integration
                </h2>
              </div>
              <DialogClose asChild>
                <Button variant="ghost" size="icon-sm" aria-label="Close">
                  <X className="size-4" />
                </Button>
              </DialogClose>
            </header>
            <CMSMcpView
              projectId={projectId}
              mcpConnectPanel={mcpConnectPanel}
            />
          </>
        ) : !typesLoading && contentTypes.length === 0 ? (
          <>
            <header className="flex h-14 shrink-0 items-center justify-end border-b border-border/50 px-6">
              <DialogClose asChild>
                <Button variant="ghost" size="icon-sm" aria-label="Close">
                  <X className="size-4" />
                </Button>
              </DialogClose>
            </header>
            <div className="flex flex-1 items-center justify-center overflow-y-auto p-8">
              <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-6 text-center">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                  <Database className="size-6" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <h2 className="text-xl font-semibold tracking-tight text-foreground">
                    Build your content backend
                  </h2>
                  <p className="max-w-md text-sm text-muted-foreground">
                    Create structured collections with rich text, custom fields,
                    and instant public APIs—or start from a template below.
                  </p>
                </div>

                <Button
                  type="button"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => setIsAddingType(true)}
                >
                  <Plus className="size-4" />
                  Create collection
                </Button>

                <div className="grid w-full grid-cols-1 gap-3 pt-2 text-left sm:grid-cols-3">
                  {STARTER_COLLECTIONS.map((starter) => {
                    const Icon = starter.icon;
                    return (
                      <button
                        key={starter.name}
                        type="button"
                        disabled={createTypeMutation.isPending}
                        onClick={() => handleCreateStarter(starter)}
                        className="group flex flex-col gap-2.5 rounded-xl border border-border/60 bg-card/40 p-4 text-left transition-all hover:border-border hover:bg-card"
                      >
                        <div className="flex size-8 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors group-hover:bg-primary/15 group-hover:text-primary">
                          <Icon className="size-4" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-sm font-medium text-foreground">
                            {starter.name}
                          </span>
                          <span className="text-xs leading-relaxed text-muted-foreground">
                            {starter.description}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </>
        ) : !selectedType ? (
          <>
            <header className="flex h-14 shrink-0 items-center justify-end border-b border-border/50 px-6">
              <DialogClose asChild>
                <Button variant="ghost" size="icon-sm" aria-label="Close">
                  <X className="size-4" />
                </Button>
              </DialogClose>
            </header>
            <div className="flex flex-1 items-center justify-center p-8">
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Layers className="size-5" />
                  </EmptyMedia>
                  <EmptyTitle className="text-base">
                    Select a collection from the left rail
                  </EmptyTitle>
                  <EmptyDescription>
                    Choose an existing collection to inspect its items, edit
                    schema fields, or configure public API access.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            </div>
          </>
        ) : (
          <>
            <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b border-border/60 px-6">
              <div className="flex min-w-0 items-center gap-4">
                <div className="flex min-w-0 flex-col">
                  <h2
                    className="truncate text-base font-semibold tracking-tight text-foreground"
                    title={selectedType.description || selectedType.name}
                  >
                    {selectedType.name}
                  </h2>
                  {selectedType.description && (
                    <span className="hidden truncate text-[11px] text-muted-foreground xl:block">
                      {selectedType.description}
                    </span>
                  )}
                </div>

                <Tabs
                  value={activeTab}
                  onValueChange={(value) => {
                    if (
                      value === "items" ||
                      value === "fields" ||
                      value === "api"
                    ) {
                      setActiveTab(value);
                    }
                  }}
                >
                  <TabsList className="h-8">
                    <TabsTrigger value="items" className="gap-1.5 text-xs">
                      <span>Items</span>
                      <span className="text-[11px] text-muted-foreground tabular-nums">
                        {contentItems.length}
                      </span>
                    </TabsTrigger>
                    <TabsTrigger value="fields" className="gap-1.5 text-xs">
                      <span>Fields</span>
                      <span className="text-[11px] text-muted-foreground tabular-nums">
                        {contentFields.length}
                      </span>
                    </TabsTrigger>
                    <TabsTrigger value="api" className="text-xs">
                      API
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              <div className="flex shrink-0 items-center gap-3">
                {activeTab === "items" && (
                  <Button
                    type="button"
                    size="sm"
                    className="h-8 gap-1.5 text-xs"
                    onClick={() => setDrawerState({ mode: "create" })}
                  >
                    <Plus className="size-3.5" />
                    New item
                  </Button>
                )}
                {activeTab === "fields" && (
                  <Button
                    type="button"
                    size="sm"
                    className="h-8 gap-1.5 text-xs"
                    onClick={() => setIsAddingField(true)}
                  >
                    <Plus className="size-3.5" />
                    Add field
                  </Button>
                )}
                <Separator orientation="vertical" className="h-5" />
                <DialogClose asChild>
                  <Button variant="ghost" size="icon-sm" aria-label="Close">
                    <X className="size-4" />
                  </Button>
                </DialogClose>
              </div>
            </header>

            {activeTab === "items" && (
              <CMSItemsView
                onCreateItem={() => setDrawerState({ mode: "create" })}
                onEditItem={(item) => setDrawerState({ mode: "edit", item })}
                onSwitchToSchema={() => setActiveTab("fields")}
              />
            )}
            {activeTab === "fields" && (
              <CMSSchemaView
                isAddingField={isAddingField}
                onAddingFieldChange={setIsAddingField}
              />
            )}
            {activeTab === "api" && (
              <CMSAccessView
                projectId={projectId}
                onOpenMcp={() => setActiveSection("mcp")}
              />
            )}

            {drawerState && (
              <CMSItemEditorDrawer
                key={
                  drawerState.mode === "edit" ? drawerState.item.id : "create"
                }
                drawerState={drawerState}
                onClose={() => setDrawerState(null)}
                onSwitchToSchema={() => setActiveTab("fields")}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}

function CMSManagerDialog({
  projectId,
  mcpConnectPanel,
}: {
  readonly projectId?: string;
  readonly mcpConnectPanel?: React.ReactNode;
}): React.ReactElement {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="h-8 w-full gap-2 text-xs"
        onClick={() => setOpen(true)}
      >
        <Database className="size-3.5" />
        Open CMS Manager
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          showCloseButton={false}
          className="flex h-[88vh] max-h-[88vh] w-[94vw] max-w-[1440px]! flex-row gap-0 overflow-hidden rounded-2xl border-border/60 p-0"
        >
          <DialogTitle className="sr-only">CMS Studio</DialogTitle>
          <DialogDescription className="sr-only">
            Manage content collections, schema fields, rich text items, API
            access, and project webhooks.
          </DialogDescription>
          <CMSProvider projectId={projectId}>
            <CMSStudioShell
              projectId={projectId}
              mcpConnectPanel={mcpConnectPanel}
            />
          </CMSProvider>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default CMSManagerDialog;
