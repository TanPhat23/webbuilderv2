"use client";

import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { WorkflowCanvasWrapper } from "./canvas/WorkflowCanvasWrapper";
import { NodePalette, type PaletteElement } from "./canvas/NodePalette";
import { NodeConfigPanel } from "./nodes/NodeConfigPanel";
import { WorkflowData, NodeType } from "./types/workflow.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Save, RotateCcw, Loader2 } from "lucide-react";
import { toast } from "sonner";
import clsx from "clsx";
import { useWorkflowCanvas } from "@/features/editor/hooks";
import { useElements } from "@/features/editor";
import { validateWorkflowCanvas } from "@/features/eventworkflows/schema/workflowCanvas";
import type { ZodIssue } from "zod";
import { ElementTreeHelper } from "@/features/editor/utils/element/element-tree-helper";
import { useUpdateEventWorkflow } from "@/features/eventworkflows/hooks/useEventWorkflowMutations";
import { transformWorkflowToEventHandlers } from "@/features/eventworkflows/utils/workflowTransformer";

const AUTOSAVE_DELAY_MS = 3000;

interface WorkflowEditorProps {
  workflowId?: string;
  workflowName?: string;
  onNameChange?: (name: string) => void;
  initialWorkflow?: WorkflowData;
  readOnly?: boolean;
  className?: string;
  onBack?: () => void;
}

export const WorkflowEditor = ({
  workflowId,
  workflowName = "New Workflow",
  onNameChange,
  initialWorkflow,
  readOnly = false,
  className,
  onBack,
}: WorkflowEditorProps) => {
  const {
    workflow,
    loadWorkflow,
    clearWorkflow,
    getWorkflow,
    updateNode,
    addNode,
  } = useWorkflowCanvas();

  const updateMutation = useUpdateEventWorkflow();

  const [name, setName] = useState(workflowName);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [configNodeId, setConfigNodeId] = useState<string | null>(null);
  const [showConfigPanel, setShowConfigPanel] = useState(false);
  const isSaving = updateMutation.isPending;
  const [isLoaded, setIsLoaded] = useState(false);
  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (initialWorkflow) {
      loadWorkflow(initialWorkflow);
      const t = setTimeout(() => setIsLoaded(true), 200);
      return () => clearTimeout(t);
    }
  }, [initialWorkflow, loadWorkflow]);

  const handleNameChange = (newName: string) => {
    setName(newName);
    onNameChange?.(newName);
  };

  const triggerSave = useCallback(
    async (currentWorkflow: WorkflowData) => {
      if (!workflowId) return;

      const validation = validateWorkflowCanvas(currentWorkflow);
      if (!validation.success) {
        const errors =
          validation.error?.issues.map((issue: ZodIssue) => issue.message) ??
          [];
        toast.error(`Workflow validation failed:\n${errors.join("\n")}`);
        return;
      }

      try {
        await updateMutation.mutateAsync({
          workflowId,
          input: {
            handlers: transformWorkflowToEventHandlers(currentWorkflow),
            canvasData: currentWorkflow,
            enabled: true,
          },
        });
      } catch {
        console.error("Failed to save workflow");
      }
    },
    [workflowId, updateMutation],
  );

  // Autosave on workflow change
  useEffect(() => {
    if (!isLoaded || readOnly) return;
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    autosaveTimer.current = setTimeout(() => {
      triggerSave(getWorkflow());
    }, AUTOSAVE_DELAY_MS);
    return () => {
      if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    };
  }, [workflow, isLoaded, readOnly, triggerSave, getWorkflow]);

  const handleClear = () => {
    clearWorkflow();
    toast.success("Workflow cleared!");
    setShowClearConfirm(false);
  };

  const handleNodeConfigure = (nodeId: string) => {
    setConfigNodeId(nodeId);
    setShowConfigPanel(true);
  };

  const handleSaveNodeConfig = (
    nodeId: string,
    config: Record<string, unknown>,
  ) => {
    const existingNode = workflow.nodes.find((n) => n.id === nodeId);
    const existingLabel = existingNode?.data?.label ?? "";
    const existingDescription = existingNode?.data?.description;

    const label =
      typeof config["label"] === "string" && config["label"].trim().length > 0
        ? config["label"]
        : existingLabel;

    const description =
      typeof config["description"] === "string"
        ? config["description"]
        : existingDescription;

    updateNode(nodeId, {
      ...(existingNode ?? {}),
      data: { label, description, config },
    });

    toast.success("Node configuration saved!");
  };

  const configNode = workflow.nodes.find((n) => n.id === configNodeId) ?? null;

  const allElements = useElements();
  const paletteElements = useMemo<PaletteElement[]>(() => {
    const flat = ElementTreeHelper.flatten(allElements);
    return flat.map((el) => ({
      id: el.id,
      name:
        (el.name as string | undefined) ||
        (el.content as string | undefined) ||
        el.type,
      type: el.type as string,
    }));
  }, [allElements]);

  // Track which page elements already have a node on the canvas
  const activeElementIds = useMemo<Set<string>>(
    () =>
      new Set(
        workflow.nodes
          .filter((n) => n.type === NodeType.ELEMENT && n.data.elementId)
          .map((n) => n.data.elementId as string),
      ),
    [workflow.nodes],
  );

  // Add an element node to the canvas at a staggered center position
  const handleAddElement = useCallback(
    (el: PaletteElement) => {
      if (activeElementIds.has(el.id)) return;
      const offset = workflow.nodes.filter(
        (n) => n.type === NodeType.ELEMENT,
      ).length;
      addNode(
        NodeType.ELEMENT,
        { x: 80 + offset * 20, y: 80 + offset * 20 },
        {
          label: el.name,
          elementId: el.id,
          elementName: el.name,
          elementType: el.type,
          connectedEvents: [],
        },
      );
    },
    [activeElementIds, workflow.nodes, addNode],
  );

  return (
    <div className={clsx("flex flex-col h-full bg-background", className)}>
      {/* Header */}
      <div className="shrink-0 border-b border-border px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {onBack && (
              <Button
                variant="outline"
                size="sm"
                onClick={onBack}
                className="gap-2 shrink-0"
              >
                ← Back
              </Button>
            )}
            <Input
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Workflow name"
              className="h-9 text-base font-semibold"
              disabled={readOnly}
            />
          </div>

          {!readOnly && (
            <div className="flex items-center gap-2 shrink-0">
              <Button
                size="sm"
                variant="outline"
                disabled={isSaving}
                className="gap-2 pointer-events-none"
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                <span className="hidden sm:inline">
                  {isSaving ? "Saving…" : "Saved"}
                </span>
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowClearConfirm(true)}
                className="gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                <span className="hidden sm:inline">Clear</span>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Body: canvas + right panel side by side */}
      <div className="flex-1 min-h-0 flex overflow-hidden">
        {/* Canvas */}
        <div className="flex-1 min-w-0 overflow-hidden p-4">
          <div className="h-full rounded-lg border border-border overflow-hidden">
            <WorkflowCanvasWrapper
              readOnly={readOnly}
              workflowId={workflowId}
              onNodeConfigure={handleNodeConfigure}
            />
          </div>
        </div>

        {/* Right panel — fixed width, independently scrollable */}
        {!readOnly && (
          <aside className="w-72 shrink-0 border-l border-border flex flex-col overflow-y-auto bg-background">
            <NodePalette
              elements={paletteElements}
              activeElementIds={activeElementIds}
              onAddElement={handleAddElement}
            />
          </aside>
        )}
      </div>

      {/* Clear confirm */}
      <AlertDialog open={showClearConfirm} onOpenChange={setShowClearConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear Workflow</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove all nodes and connections. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-2">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClear}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Clear
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      <NodeConfigPanel
        node={configNode}
        isOpen={showConfigPanel}
        onOpenChange={setShowConfigPanel}
        onSave={handleSaveNodeConfig}
      />
    </div>
  );
};

export default WorkflowEditor;
