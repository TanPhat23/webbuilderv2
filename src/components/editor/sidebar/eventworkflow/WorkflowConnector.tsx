"use client";

import React, { useState } from "react";
import {
  useEventWorkflowActions,
  useEventWorkflow,
} from "@/hooks/editor/eventworkflow/useEventWorkflows";
import { useElementEventWorkflowActions } from "@/hooks/editor/eventworkflow/useElementEventWorkflows";
import { useSelectionStore } from "@/globalstore/selectionstore";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Trash2,
  Link as LinkIcon,
  Zap,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { EVENT_TYPES, CONNECTION_CONFIG } from "@/constants/eventWorkflows";

interface WorkflowConnectorProps {
  projectId: string;
  workflowId?: string;
  onBack: () => void;
}

export const WorkflowConnector = ({
  projectId,
  workflowId,
  onBack,
}: WorkflowConnectorProps) => {
  const { workflows } = useEventWorkflowActions(projectId);
  const { selectedElement } = useSelectionStore();
  const [selectedEvent, setSelectedEvent] = useState<string>("");

  const element = selectedElement as any;
  const elementId = element?.id;

  const {
    isLoading,
    getConnectedWorkflows,
    isWorkflowConnected,
    getWorkflowConnections,
    isConnectedToEvent,
    handleConnect,
    handleDisconnect,
  } = useElementEventWorkflowActions(elementId);

  const { data: targetWorkflow } = useEventWorkflow(
    workflowId || "",
    !!workflowId,
  );

  const onConnect = async (eventType: string, wId: string) => {
    if (!elementId) return;
    try {
      await handleConnect(eventType, wId);
      setSelectedEvent("");
    } catch (error) {
      console.error("Failed to connect workflow:", error);
    }
  };

  const onDisconnect = async (eventType: string, wId: string) => {
    if (!elementId) return;
    try {
      await handleDisconnect(eventType, wId);
    } catch (error) {
      console.error("Failed to disconnect workflow:", error);
    }
  };

  if (!selectedElement) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Workflows
        </Button>

        <Card className="border-accent bg-accent/10 dark:border-accent dark:bg-accent/20">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-accent shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-sm text-accent mb-1">
                  No Element Selected
                </p>
                <p className="text-sm text-muted-foreground">
                  Please select an element from the canvas to connect workflows
                  to its events.
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
      <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
        <ArrowLeft className="h-4 w-4" />
        Back to Workflows
      </Button>

      {/* Element Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <LinkIcon className="h-4 w-4" />
            Connect to Element Events
          </CardTitle>
          <CardDescription>
            Selected:{" "}
            <span className="font-semibold">
              {element.name || "Unnamed Element"}
            </span>
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Quick Connect for Specific Workflow */}
      {targetWorkflow && (
        <Card className="border-primary bg-primary/10 dark:border-primary dark:bg-primary/20">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              {targetWorkflow.name}
            </CardTitle>
            <CardDescription>
              {isWorkflowConnected(targetWorkflow.id)
                ? `Connected to ${getWorkflowConnections(targetWorkflow.id).length} event(s)`
                : "Not connected yet"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex gap-2">
                <Select
                  value={selectedEvent}
                  onValueChange={(value) => {
                    setSelectedEvent(value);
                    onConnect(value, targetWorkflow.id);
                  }}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select event to connect..." />
                  </SelectTrigger>
                  <SelectContent>
                    {EVENT_TYPES.map((event) => {
                      const isConnected = isConnectedToEvent(
                        event.value,
                        targetWorkflow.id,
                      );
                      return (
                        <SelectItem
                          key={event.value}
                          value={event.value}
                          disabled={isConnected}
                        >
                          <div>
                            <div className="font-medium">{event.label}</div>
                            <div className="text-xs text-muted-foreground">
                              {event.description}
                            </div>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              {getWorkflowConnections(targetWorkflow.id).length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Currently connected to:</p>
                  {getWorkflowConnections(targetWorkflow.id).map((event) => (
                    <div
                      key={event.value}
                      className="flex items-center justify-between p-2 bg-background rounded-md border"
                    >
                      <span className="text-sm">{event.label}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          onDisconnect(event.value, targetWorkflow.id)
                        }
                        disabled={isLoading}
                        className="h-7 w-7 p-0 hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Events */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">All Events</CardTitle>
          <CardDescription>
            Manage all event connections for this element
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[calc(100vh-500px)]">
            <div className="space-y-3">
              {EVENT_TYPES.map((event) => {
                const connectedWorkflows = getConnectedWorkflows(
                  event.value,
                  workflows,
                );
                const hasConnections = connectedWorkflows.length > 0;

                return (
                  <Card
                    key={event.value}
                    className={cn(
                      "transition-colors",
                      hasConnections
                        ? "border-primary bg-primary/10 dark:border-primary dark:bg-primary/20"
                        : "border-dashed",
                    )}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-sm">
                              {event.label}
                            </h4>
                            {hasConnections && (
                              <Badge
                                variant="secondary"
                                className="text-xs bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary"
                              >
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                {connectedWorkflows.length}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {event.description}
                          </p>
                        </div>
                      </div>

                      {/* Connected Workflows */}
                      {hasConnections && (
                        <div className="space-y-2 mb-3 pl-3 border-l-2 border-primary dark:border-primary">
                          {connectedWorkflows
                            .filter((workflow) => workflow !== undefined)
                            .map((workflow) => (
                              <div
                                key={workflow.id}
                                className="flex items-center justify-between p-2 bg-background rounded"
                              >
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                  <Zap className="h-3.5 w-3.5 text-accent shrink-0" />
                                  <span className="text-sm truncate">
                                    {workflow.name}
                                  </span>
                                </div>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() =>
                                    onDisconnect(event.value, workflow.id)
                                  }
                                  disabled={isLoading}
                                  className="h-7 w-7 p-0 hover:text-destructive shrink-0"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            ))}
                        </div>
                      )}

                      {/* Add Workflow Dropdown */}
                      <Select
                        onValueChange={(workflowId) =>
                          onConnect(event.value, workflowId)
                        }
                        disabled={isLoading}
                      >
                        <SelectTrigger className="h-9 text-sm">
                          <SelectValue placeholder="+ Add workflow" />
                        </SelectTrigger>
                        <SelectContent>
                          {workflows
                            .filter(
                              (w) =>
                                !connectedWorkflows.some(
                                  (cw) => cw && cw.id === w.id,
                                ),
                            )
                            .map((workflow) => (
                              <SelectItem key={workflow.id} value={workflow.id}>
                                <div className="flex items-center gap-2">
                                  <Zap className="h-3.5 w-3.5 text-accent" />
                                  <span>{workflow.name}</span>
                                </div>
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkflowConnector;
