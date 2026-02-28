"use client";

import React, { useState, useEffect } from "react";
import { WorkflowNode, NodeType } from "../types/workflow.types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";

interface NodeConfigPanelProps {
  node: WorkflowNode | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (nodeId: string, config: Record<string, any>) => void;
}

const EVENT_TYPES = [
  "onClick",
  "onDoubleClick",
  "onMouseEnter",
  "onMouseLeave",
  "onMouseDown",
  "onMouseUp",
  "onFocus",
  "onBlur",
  "onChange",
  "onSubmit",
  "onKeyDown",
  "onKeyUp",
  "onScroll",
  "onLoad",
  "onError",
];

const ACTION_TYPES = [
  "navigate",
  "showElement",
  "hideElement",
  "toggleElement",
  "apiCall",
  "setData",
  "customCode",
  "scrollTo",
  "modal",
  "submitForm",
  "resetForm",
  "playAnimation",
  "showNotification",
  "copyToClipboard",
  "downloadFile",
  "toggleClass",
  "addClass",
  "removeClass",
];

export const NodeConfigPanel = ({
  node,
  isOpen,
  onOpenChange,
  onSave,
}: NodeConfigPanelProps) => {
  const [config, setConfig] = useState<Record<string, any>>({});

  useEffect(() => {
    if (node) {
      setConfig(node.data?.config || {});
    }
  }, [node, isOpen]);

  if (!node) return null;

  const handleSave = () => {
    if (node) {
      // Ensure actionType/eventType are set based on node type
      const configToSave = { ...config };

      if (node.type === NodeType.ACTION && !configToSave.actionType) {
        configToSave.actionType = "navigate";
      }
      if (node.type === NodeType.TRIGGER && !configToSave.eventType) {
        configToSave.eventType = "onClick";
      }

      onSave(node.id, configToSave);
      onOpenChange(false);
    }
  };

  const updateConfig = (key: string, value: unknown) => {
    setConfig((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const renderTriggerConfig = () => (
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-medium mb-2 block">Event Type</Label>
        <Select
          value={config.eventType || "onClick"}
          onValueChange={(value) => updateConfig("eventType", value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {EVENT_TYPES.map((event) => (
              <SelectItem key={event} value={event}>
                {event}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  const renderActionConfig = () => (
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-medium mb-2 block">Action Type</Label>
        <Select
          value={config.actionType || "navigate"}
          onValueChange={(value) => updateConfig("actionType", value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ACTION_TYPES.map((action) => (
              <SelectItem key={action} value={action}>
                {action}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Action-specific config */}
      {renderActionTypeConfig()}

      <div className="space-y-2">
        <Label className="text-sm font-medium">Additional Options</Label>
        <div className="space-y-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.preventDefault || false}
              onChange={(e) => updateConfig("preventDefault", e.target.checked)}
              className="rounded border"
            />
            <span className="text-sm">Prevent Default</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.stopPropagation || false}
              onChange={(e) =>
                updateConfig("stopPropagation", e.target.checked)
              }
              className="rounded border"
            />
            <span className="text-sm">Stop Propagation</span>
          </label>
        </div>
      </div>

      <div>
        <Label className="text-sm font-medium mb-2 block">Delay (ms)</Label>
        <Input
          type="number"
          min="0"
          value={config.delay || 0}
          onChange={(e) => updateConfig("delay", parseInt(e.target.value))}
          placeholder="0"
        />
      </div>
    </div>
  );

  const renderActionTypeConfig = () => {
    const actionType = config.actionType || "navigate";

    switch (actionType) {
      case "navigate":
        return (
          <div className="space-y-3 bg-muted p-3 rounded-lg">
            <div>
              <Label className="text-sm font-medium mb-2 block">Target</Label>
              <Select
                value={config.target || "url"}
                onValueChange={(value) => updateConfig("target", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="url">URL</SelectItem>
                  <SelectItem value="page">Page</SelectItem>
                  <SelectItem value="external">External</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-medium mb-2 block">Value</Label>
              <Input
                placeholder={
                  config.target === "url" ? "https://example.com" : "page-slug"
                }
                value={config.value || ""}
                onChange={(e) => updateConfig("value", e.target.value)}
              />
            </div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={config.openInNewTab || false}
                onChange={(e) => updateConfig("openInNewTab", e.target.checked)}
                className="rounded border"
              />
              <span className="text-sm">Open in New Tab</span>
            </label>
          </div>
        );

      case "showElement":
      case "hideElement":
      case "toggleElement":
        return (
          <div className="space-y-3 bg-muted p-3 rounded-lg">
            <div>
              <Label className="text-sm font-medium mb-2 block">
                Element ID
              </Label>
              <Input
                placeholder="element-id"
                value={config.elementId || ""}
                onChange={(e) => updateConfig("elementId", e.target.value)}
              />
            </div>
            <div>
              <Label className="text-sm font-medium mb-2 block">
                Animation Duration (ms)
              </Label>
              <Input
                type="number"
                min="0"
                placeholder="300"
                value={config.animationDuration || 0}
                onChange={(e) =>
                  updateConfig("animationDuration", parseInt(e.target.value))
                }
              />
            </div>
          </div>
        );

      case "apiCall":
        return (
          <div className="space-y-3 bg-muted p-3 rounded-lg">
            <div>
              <Label className="text-sm font-medium mb-2 block">URL</Label>
              <Input
                placeholder="https://api.example.com/endpoint"
                value={config.url || ""}
                onChange={(e) => updateConfig("url", e.target.value)}
              />
            </div>
            <div>
              <Label className="text-sm font-medium mb-2 block">Method</Label>
              <Select
                value={config.method || "GET"}
                onValueChange={(value) => updateConfig("method", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GET">GET</SelectItem>
                  <SelectItem value="POST">POST</SelectItem>
                  <SelectItem value="PUT">PUT</SelectItem>
                  <SelectItem value="DELETE">DELETE</SelectItem>
                  <SelectItem value="PATCH">PATCH</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-medium mb-2 block">
                Timeout (ms)
              </Label>
              <Input
                type="number"
                min="0"
                placeholder="5000"
                value={config.timeout || 5000}
                onChange={(e) =>
                  updateConfig("timeout", parseInt(e.target.value))
                }
              />
            </div>
          </div>
        );

      case "customCode":
        return (
          <div className="space-y-3 bg-muted p-3 rounded-lg">
            <div>
              <Label className="text-sm font-medium mb-2 block">Code</Label>
              <textarea
                className="w-full h-32 p-2 rounded border bg-background font-mono text-sm"
                placeholder="// Custom code here"
                value={config.code || ""}
                onChange={(e) => updateConfig("code", e.target.value)}
              />
            </div>
          </div>
        );

      case "scrollTo":
        return (
          <div className="space-y-3 bg-muted p-3 rounded-lg">
            <div>
              <Label className="text-sm font-medium mb-2 block">Target</Label>
              <Select
                value={config.target || "elementId"}
                onValueChange={(value) => updateConfig("target", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="elementId">Element ID</SelectItem>
                  <SelectItem value="position">Position</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-medium mb-2 block">Value</Label>
              <Input
                placeholder={
                  config.target === "elementId" ? "element-id" : "Position (px)"
                }
                value={config.value || ""}
                onChange={(e) => updateConfig("value", e.target.value)}
              />
            </div>
            <div>
              <Label className="text-sm font-medium mb-2 block">Behavior</Label>
              <Select
                value={config.behavior || "smooth"}
                onValueChange={(value) => updateConfig("behavior", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="smooth">Smooth</SelectItem>
                  <SelectItem value="auto">Auto</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case "setData":
        return (
          <div className="space-y-3 bg-muted p-3 rounded-lg">
            <div>
              <Label className="text-sm font-medium mb-2 block">
                Data Path
              </Label>
              <Input
                placeholder="state.myValue"
                value={config.dataPath || ""}
                onChange={(e) => updateConfig("dataPath", e.target.value)}
              />
            </div>
            <div>
              <Label className="text-sm font-medium mb-2 block">Value</Label>
              <Input
                placeholder="value"
                value={config.value || ""}
                onChange={(e) => updateConfig("value", e.target.value)}
              />
            </div>
          </div>
        );

      case "showNotification":
        return (
          <div className="space-y-3 bg-muted p-3 rounded-lg">
            <div>
              <Label className="text-sm font-medium mb-2 block">Message</Label>
              <Input
                placeholder="Notification message"
                value={config.message || ""}
                onChange={(e) => updateConfig("message", e.target.value)}
              />
            </div>
            <div>
              <Label className="text-sm font-medium mb-2 block">Type</Label>
              <Select
                value={config.notificationType || "info"}
                onValueChange={(value) =>
                  updateConfig("notificationType", value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case "modal":
        return (
          <div className="space-y-3 bg-muted p-3 rounded-lg">
            <div>
              <Label className="text-sm font-medium mb-2 block">Action</Label>
              <Select
                value={config.action || "open"}
                onValueChange={(value) => updateConfig("action", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="close">Close</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-medium mb-2 block">
                Modal ID (optional)
              </Label>
              <Input
                placeholder="modal-id"
                value={config.modalId || ""}
                onChange={(e) => updateConfig("modalId", e.target.value)}
              />
            </div>
          </div>
        );

      case "playAnimation":
        return (
          <div className="space-y-3 bg-muted p-3 rounded-lg">
            <div>
              <Label className="text-sm font-medium mb-2 block">
                Element ID
              </Label>
              <Input
                placeholder="element-id"
                value={config.elementId || ""}
                onChange={(e) => updateConfig("elementId", e.target.value)}
              />
            </div>
            <div>
              <Label className="text-sm font-medium mb-2 block">
                Animation Type
              </Label>
              <Select
                value={config.animationType || "fadeIn"}
                onValueChange={(value) => updateConfig("animationType", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fadeIn">Fade In</SelectItem>
                  <SelectItem value="slideIn">Slide In</SelectItem>
                  <SelectItem value="bounce">Bounce</SelectItem>
                  <SelectItem value="pulse">Pulse</SelectItem>
                  <SelectItem value="shake">Shake</SelectItem>
                  <SelectItem value="spin">Spin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-medium mb-2 block">
                Duration (ms)
              </Label>
              <Input
                type="number"
                min="0"
                placeholder="1000"
                value={config.duration || 1000}
                onChange={(e) =>
                  updateConfig("duration", parseInt(e.target.value))
                }
              />
            </div>
          </div>
        );

      case "toggleClass":
      case "addClass":
      case "removeClass":
        return (
          <div className="space-y-3 bg-muted p-3 rounded-lg">
            <div>
              <Label className="text-sm font-medium mb-2 block">
                Element ID
              </Label>
              <Input
                placeholder="element-id"
                value={config.elementId || ""}
                onChange={(e) => updateConfig("elementId", e.target.value)}
              />
            </div>
            <div>
              <Label className="text-sm font-medium mb-2 block">
                Class Name
              </Label>
              <Input
                placeholder="class-name"
                value={config.className || ""}
                onChange={(e) => updateConfig("className", e.target.value)}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const renderConditionConfig = () => (
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-medium mb-2 block">Condition Type</Label>
        <Select
          value={config.conditionType || "stateEquals"}
          onValueChange={(value) => updateConfig("conditionType", value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="stateEquals">State Equals</SelectItem>
            <SelectItem value="stateCheck">State Check</SelectItem>
            <SelectItem value="customCode">Custom Code</SelectItem>
            <SelectItem value="always">Always True</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {config.conditionType !== "always" &&
        config.conditionType !== "customCode" && (
          <>
            <div>
              <Label className="text-sm font-medium mb-2 block">
                State Path
              </Label>
              <Input
                placeholder="state.property"
                value={config.left || ""}
                onChange={(e) => updateConfig("left", e.target.value)}
              />
            </div>
            <div>
              <Label className="text-sm font-medium mb-2 block">Operator</Label>
              <Select
                value={config.operator || "=="}
                onValueChange={(value) => updateConfig("operator", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="==">=</SelectItem>
                  <SelectItem value="!=">!=</SelectItem>
                  <SelectItem value=">">&gt;</SelectItem>
                  <SelectItem value="<">&lt;</SelectItem>
                  <SelectItem value=">=">&gt;=</SelectItem>
                  <SelectItem value="<=">&lt;=</SelectItem>
                  <SelectItem value="includes">Includes</SelectItem>
                  <SelectItem value="notIncludes">Not Includes</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-medium mb-2 block">Value</Label>
              <Input
                placeholder="value"
                value={config.right || ""}
                onChange={(e) => updateConfig("right", e.target.value)}
              />
            </div>
          </>
        )}

      {config.conditionType === "customCode" && (
        <div>
          <Label className="text-sm font-medium mb-2 block">Code</Label>
          <textarea
            className="w-full h-32 p-2 rounded border bg-background font-mono text-sm"
            placeholder="// Return boolean"
            value={config.customCode || ""}
            onChange={(e) => updateConfig("customCode", e.target.value)}
          />
        </div>
      )}
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Configure {node.type} Node</DialogTitle>
        </DialogHeader>

        <ScrollArea className="pr-4">
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">Label</Label>
              <Input
                value={config.label || node.data.label}
                onChange={(e) => updateConfig("label", e.target.value)}
                placeholder="Node label"
              />
            </div>

            <div>
              <Label className="text-sm font-medium mb-2 block">
                Description
              </Label>
              <Input
                value={config.description || node.data.description || ""}
                onChange={(e) => updateConfig("description", e.target.value)}
                placeholder="Node description"
              />
            </div>

            {node.type === NodeType.TRIGGER && renderTriggerConfig()}
            {node.type === NodeType.ACTION && renderActionConfig()}
            {node.type === NodeType.CONDITION && renderConditionConfig()}
          </div>
        </ScrollArea>

        <div className="flex gap-2 pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button onClick={handleSave} className="flex-1">
            Save Configuration
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NodeConfigPanel;
