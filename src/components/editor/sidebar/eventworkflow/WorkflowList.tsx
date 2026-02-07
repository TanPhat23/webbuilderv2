"use client";

import React, { useState } from "react";
import { useEventWorkflowActions } from "@/hooks/editor/eventworkflow/useEventWorkflows";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Trash2,
  Edit2,
  Zap,
  Search,
  Plus,
  Loader2,
  Workflow,
  Link as LinkIcon,
  Info,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface WorkflowListProps {
  projectId: string;
  onEdit: (workflowId: string, workflowName: string) => void;
  onConnect: (workflowId: string) => void;
  onCreate: () => void;
}

export const WorkflowList = ({
  projectId,
  onEdit,
  onConnect,
  onCreate,
}: WorkflowListProps) => {
  const { workflows, isLoading, error, isDeleting, deleteWorkflow } =
    useEventWorkflowActions(projectId);

  const [searchQuery, setSearchQuery] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Ensure workflows is always an array
  const workflowsArray = Array.isArray(workflows) ? workflows : [];

  const filteredWorkflows = workflowsArray.filter((workflow) =>
    workflow.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleDelete = async (workflowId: string) => {
    try {
      await deleteWorkflow(workflowId);
      toast.success("Workflow deleted successfully");
      setDeleteConfirmId(null);
    } catch (error) {
      console.error("Failed to delete workflow:", error);
      toast.error("Failed to delete workflow");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Event Workflows</h2>
            <p className="text-sm text-muted-foreground">
              Create visual workflows to handle element events
            </p>
          </div>
          <Button onClick={onCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            New Workflow
          </Button>
        </div>

        <Card className="border-destructive bg-destructive/10 dark:border-destructive dark:bg-destructive/20">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-destructive">
                  Error Loading Workflows
                </p>
                <p className="text-sm text-destructive/80">
                  {error || "Failed to load workflows"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Event Workflows</h2>
          <p className="text-sm text-muted-foreground">
            Create visual workflows to handle element events
          </p>
        </div>
        <Button onClick={onCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          New Workflow
        </Button>
      </div>

      {/* Info Card */}
      <Card className="border-primary bg-primary/10 dark:border-primary dark:bg-primary/20">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-primary">How it works</p>
              <p className="text-sm text-muted-foreground">
                1. Create a workflow with drag-and-drop nodes
                <br />
                2. Design your logic visually (triggers, actions, conditions)
                <br />
                3. Connect the workflow to element events (onClick, onChange,
                etc.)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search */}
      {workflowsArray.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search workflows..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      )}

      {/* Workflow List */}
      <ScrollArea className="h-[calc(100vh-400px)]">
        {filteredWorkflows.length === 0 && searchQuery ? (
          <div className="text-center py-12">
            <p className="text-sm text-muted-foreground">
              No workflows found matching "{searchQuery}"
            </p>
          </div>
        ) : filteredWorkflows.length === 0 ? (
          <Card className="border-dashed">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Workflow className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>No workflows yet</CardTitle>
              <CardDescription>
                Create your first workflow to get started with visual event
                handling
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center pb-6">
              <Button onClick={onCreate} size="lg" className="gap-2">
                <Plus className="h-4 w-4" />
                Create Your First Workflow
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredWorkflows.map((workflow) => (
              <Card
                key={workflow.id}
                className="hover:border-primary/50 transition-colors"
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Zap className="h-4 w-4 text-accent shrink-0" />
                        <h3 className="font-semibold truncate">
                          {workflow.name}
                        </h3>
                        {!workflow.enabled && (
                          <Badge variant="secondary" className="text-xs">
                            Disabled
                          </Badge>
                        )}
                      </div>

                      {workflow.description && (
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {workflow.description}
                        </p>
                      )}

                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Workflow className="h-3 w-3" />
                          {workflow.canvasData?.nodes?.length || 0} nodes
                        </span>
                        <span>
                          Created{" "}
                          {new Date(workflow.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => onConnect(workflow.id)}
                              className="h-8 w-8 p-0"
                            >
                              <LinkIcon className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            Connect to element events
                          </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => onEdit(workflow.id, workflow.name)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit2 className="h-4 w-4 text-primary" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Edit workflow</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setDeleteConfirmId(workflow.id)}
                              disabled={isDeleting}
                              className="h-8 w-8 p-0 hover:text-destructive"
                            >
                              {isDeleting && deleteConfirmId === workflow.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Delete workflow</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteConfirmId}
        onOpenChange={(open) => !open && setDeleteConfirmId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Workflow</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this workflow? This action cannot
              be undone and will remove all connections to elements.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default WorkflowList;
