"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { WorkflowList } from "./WorkflowList";
import { WorkflowCreator } from "./WorkflowCreator";
import { WorkflowEditor } from "./WorkflowEditor";
import { useWorkflowManager } from "@/features/eventworkflows/hooks/useWorkflowManager";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Zap, List, Plus, X, Loader2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

// ─── Types ────────────────────────────────────────────────────────────────────

interface EventWorkflowManagerDialogProps {
  projectId: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

// ─── Nav items ────────────────────────────────────────────────────────────────

type NavViewType = "list" | "create";

type NavItem = {
  id: NavViewType;
  label: string;
  icon: React.ReactNode;
};

const NAV_ITEMS: NavItem[] = [
  {
    id: "list",
    label: "Workflows",
    icon: <List className="h-4 w-4" />,
  },
  {
    id: "create",
    label: "New Workflow",
    icon: <Plus className="h-4 w-4" />,
  },
];

// ─── Header ───────────────────────────────────────────────────────────────────

interface HeaderProps {
  view: ReturnType<typeof useWorkflowManager>["view"];
}

function getDialogTitle(view: HeaderProps["view"]): string {
  if (view.type === "create") return "Create New Workflow";
  if (view.type === "edit")
    return `Edit Workflow: ${view.workflowName || "Untitled"}`;
  return "Workflow Manager";
}

function ManagerHeader({ view }: HeaderProps) {
  const crumbs: string[] = ["Workflows"];
  if (view.type === "create") crumbs.push("New Workflow");
  if (view.type === "edit") crumbs.push(view.workflowName || "Edit");

  return (
    <div className="flex items-center justify-between h-12 px-4 border-b border-border bg-card shrink-0">
      <div className="flex items-center gap-1.5 text-sm">
        <Zap className="h-4 w-4 text-primary shrink-0" />
        {crumbs.map((crumb, i) => (
          <span key={i} className="flex items-center gap-1.5">
            {i > 0 && (
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            )}
            <span
              className={cn(
                i === crumbs.length - 1
                  ? "font-semibold text-foreground"
                  : "text-muted-foreground",
              )}
            >
              {crumb}
            </span>
          </span>
        ))}
        {view.type === "edit" && (
          <Badge variant="secondary" className="ml-1 text-xs h-5">
            editing
          </Badge>
        )}
      </div>
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

interface SidebarProps {
  activeViewType: string;
  onNavigate: (viewType: NavViewType) => void;
}

function ManagerSidebar({ activeViewType, onNavigate }: SidebarProps) {
  return (
    <aside className="w-52 shrink-0 flex flex-col border-r border-border bg-card">
      <div className="px-3 pt-4 pb-2">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground px-2">
          Navigation
        </p>
      </div>

      <nav className="flex-1 px-2 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const isActive =
            activeViewType === item.id ||
            (activeViewType === "edit" && item.id === "list");

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={cn(
                "w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors text-left",
                isActive
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <span
                className={cn(
                  "shrink-0",
                  isActive ? "text-primary" : "text-muted-foreground",
                )}
              >
                {item.icon}
              </span>
              {item.label}
            </button>
          );
        })}
      </nav>

      <Separator />

      <div className="p-3">
        <div className="rounded-lg bg-muted/50 border border-border p-3 space-y-1.5">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            Quick tips
          </p>
          <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
            <li>Drag elements onto the canvas</li>
            <li>Click + to add elements directly</li>
            <li>Wire event handles to triggers</li>
            <li>Del key removes selection</li>
          </ul>
        </div>
      </div>
    </aside>
  );
}

// ─── Loading screen ───────────────────────────────────────────────────────────

function WorkflowLoadingScreen() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm">Loading workflow…</p>
      </div>
    </div>
  );
}

// ─── Content area ─────────────────────────────────────────────────────────────

interface ContentAreaProps {
  manager: ReturnType<typeof useWorkflowManager>;
}

function ContentArea({ manager }: ContentAreaProps) {
  const {
    view,
    projectId,
    goToList,
    goToCreate,
    goToEdit,
    onWorkflowCreated,
    isLoadingWorkflow,
    currentWorkflowId,
    currentWorkflowName,
    initialData,
  } = manager;

  if (view.type === "list") {
    return (
      <WorkflowList
        projectId={projectId}
        onEdit={goToEdit}
        onCreate={goToCreate}
      />
    );
  }

  if (view.type === "create") {
    return (
      <WorkflowCreator
        projectId={projectId}
        onSuccess={onWorkflowCreated}
        onCancel={goToList}
      />
    );
  }

  if (view.type === "edit") {
    if (isLoadingWorkflow) return <WorkflowLoadingScreen />;

    return (
      <WorkflowEditor
        workflowId={currentWorkflowId}
        workflowName={currentWorkflowName}
        initialWorkflow={initialData ?? { nodes: [], connections: [] }}
        onBack={goToList}
        className="h-full"
      />
    );
  }

  return null;
}

// ─── Dialog ───────────────────────────────────────────────────────────────────

export const EventWorkflowManagerDialog = ({
  projectId,
  isOpen,
  onOpenChange,
}: EventWorkflowManagerDialogProps) => {
  const manager = useWorkflowManager({ projectId, isOpen });
  const { view, goToList, goToCreate } = manager;

  const handleNavigate = (viewType: NavViewType) => {
    if (viewType === "list") goToList();
    else if (viewType === "create") goToCreate();
  };

  const isEditView = view.type === "edit";

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw]! h-full p-0 flex flex-col gap-0 ">
        <VisuallyHidden>
          <DialogTitle>{getDialogTitle(view)}</DialogTitle>
        </VisuallyHidden>
        <ManagerHeader view={view} />
        <div className="flex flex-1 overflow-hidden">
          {!isEditView && (
            <ManagerSidebar
              activeViewType={view.type}
              onNavigate={handleNavigate}
            />
          )}

          <main className="flex-1 min-w-0 h-full">
            <div className={cn("h-full", isEditView ? "" : "p-4")}>
              <ContentArea manager={manager} />
            </div>
          </main>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EventWorkflowManagerDialog;
