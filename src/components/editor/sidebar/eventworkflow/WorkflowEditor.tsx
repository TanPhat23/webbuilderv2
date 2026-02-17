"use client";

import React, { useState, useEffect } from "react";
import { WorkflowCanvasWrapper } from "./canvas/WorkflowCanvasWrapper";
import { NodePalette } from "./canvas/NodePalette";
import { NodeConfigPanel } from "./nodes/NodeConfigPanel";
import { WorkflowData, NodeType, WorkflowNode } from "./types/workflow.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Save, RotateCcw, Zap, Code2, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import clsx from "clsx";
import { useWorkflowCanvas } from "@/hooks/editor";
import { validateWorkflowCanvas } from "@/schema/zod/workflowCanvas";
import type { ZodIssue } from "zod";

interface WorkflowEditorProps {
  workflowName?: string;
  onSave?: (workflow: WorkflowData) => void;
  onNameChange?: (name: string) => void;
  initialWorkflow?: WorkflowData;
  readOnly?: boolean;
  className?: string;
  onBack?: () => void;
}

export const WorkflowEditor = ({
  workflowName = "New Workflow",
  onSave,
  onNameChange,
  initialWorkflow,
  readOnly = false,
  className,
  onBack,
}: WorkflowEditorProps) => {
  const { workflow, loadWorkflow, clearWorkflow, getWorkflow, updateNode } =
    useWorkflowCanvas();

  const [name, setName] = useState(workflowName);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showNodeProperties, setShowNodeProperties] = useState(false);
  const [configNodeId, setConfigNodeId] = useState<string | null>(null);
  const [showConfigPanel, setShowConfigPanel] = useState(false);

  useEffect(() => {
    if (initialWorkflow) {
      loadWorkflow(initialWorkflow);
    }
  }, [initialWorkflow, loadWorkflow]);

  const handleNameChange = (newName: string) => {
    setName(newName);
    onNameChange?.(newName);
  };

  const handleSave = () => {
    const currentWorkflow = getWorkflow();

    // Use Zod validation for the entire workflow canvas
    const validation = validateWorkflowCanvas(currentWorkflow);
    if (!validation.success) {
      const errors =
        validation.error?.issues.map((issue: ZodIssue) => issue.message) ?? [];
      toast.error(`Workflow validation failed:\n${errors.join("\n")}`);
      console.error("Validation errors:", validation.error);
      return;
    }

    onSave?.(currentWorkflow);
    toast.success("Workflow saved!");
  };

  const handleCopyJSON = () => {
    const currentWorkflow = getWorkflow();
    const dataStr = JSON.stringify(currentWorkflow, null, 2);
    navigator.clipboard.writeText(dataStr);
    setCopied(true);
    toast.success("Workflow copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

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
      data: {
        label,
        description,
        config: config,
      },
    });

    toast.success("Node configuration saved!");
  };

  const configNode = workflow.nodes.find((n) => n.id === configNodeId) || null;

  return (
    <div className={clsx("flex flex-col h-full bg-background", className)}>
      {/* Header */}
      <div className="border-b border-border px-4 py-3 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {onBack && (
              <Button
                variant="outline"
                size="sm"
                onClick={onBack}
                className="gap-2"
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
          <div className="flex items-center gap-2 shrink-0">
            {!readOnly && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleSave}
                  className="gap-2"
                  title="Save workflow"
                >
                  <Save className="h-4 w-4" />
                  <span className="hidden sm:inline">Save</span>
                </Button>

                <AlertDialog
                  open={showClearConfirm}
                  onOpenChange={setShowClearConfirm}
                >
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowClearConfirm(true)}
                    className="gap-2"
                    title="Clear workflow"
                  >
                    <RotateCcw className="h-4 w-4" />
                    <span className="hidden sm:inline">Clear</span>
                  </Button>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Clear Workflow</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will remove all nodes and connections. This action
                        cannot be undone.
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
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs defaultValue="canvas" className="flex flex-col h-full">
          <TabsList className="w-full justify-start rounded-none border-b border-border bg-muted/50 px-4">
            <TabsTrigger value="canvas">Canvas</TabsTrigger>
            <TabsTrigger value="json">JSON</TabsTrigger>
          </TabsList>

          <TabsContent
            value="canvas"
            className="flex-1 overflow-hidden flex gap-4 p-4"
          >
            <div className="flex-1 rounded-lg border border-border overflow-hidden">
              <WorkflowCanvasWrapper
                readOnly={readOnly}
                onNodeConfigure={handleNodeConfigure}
              />
            </div>

            {!readOnly && (
              <div className="w-80 flex flex-col gap-4">
                <NodePalette />

                <Dialog
                  open={showNodeProperties}
                  onOpenChange={setShowNodeProperties}
                >
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full gap-2">
                      <Code2 className="h-4 w-4" />
                      Workflow Info
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Workflow Information</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Nodes</label>
                        <p className="text-2xl font-bold text-primary">
                          {workflow.nodes.length}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">
                          Connections
                        </label>
                        <p className="text-2xl font-bold text-accent">
                          {workflow.connections.length}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Nodes List
                        </label>
                        <ScrollArea className="h-48 border border-border rounded-lg p-3">
                          {workflow.nodes.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                              No nodes yet
                            </p>
                          ) : (
                            <ul className="space-y-1">
                              {workflow.nodes.map((node) => (
                                <li
                                  key={node.id}
                                  className="text-sm p-2 hover:bg-muted rounded transition-colors"
                                >
                                  <div className="font-medium">
                                    {node.data.label}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {node.type} • {node.id}
                                  </div>
                                </li>
                              ))}
                            </ul>
                          )}
                        </ScrollArea>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                <div className="text-xs text-muted-foreground p-3 bg-muted rounded-lg">
                  <p className="font-semibold mb-2">Tips:</p>
                  <ul className="space-y-1 list-disc list-inside">
                    <li>Drag nodes from the palette to canvas</li>
                    <li>Click ports to create connections</li>
                    <li>Ctrl/Cmd + Scroll to zoom</li>
                    <li>Press Delete to remove selected items</li>
                  </ul>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="json" className="flex-1 overflow-hidden p-4">
            <div className="h-full border border-border rounded-lg overflow-hidden flex flex-col">
              <div className="bg-muted border-b border-border px-4 py-2 flex items-center justify-between">
                <span className="text-sm font-medium">Workflow JSON</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleCopyJSON}
                  className="gap-2"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
              <ScrollArea className="flex-1">
                <pre className="p-4 font-mono text-sm text-muted-foreground">
                  <code>{JSON.stringify(getWorkflow(), null, 2)}</code>
                </pre>
              </ScrollArea>
            </div>
          </TabsContent>
        </Tabs>
      </div>

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
