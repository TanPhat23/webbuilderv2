"use client";

import React from "react";
import { ReactFlowProvider } from "reactflow";
import { WorkflowCanvas } from "./WorkflowCanvas";

interface WorkflowCanvasWrapperProps {
  readOnly?: boolean;
  workflowId?: string;
  onWorkflowChange?: (workflow: unknown) => void;
  onNodeConfigure?: (nodeId: string) => void;
  className?: string;
}

export const WorkflowCanvasWrapper = ({
  readOnly = false,
  workflowId,
  onWorkflowChange,
  onNodeConfigure,
  className,
}: WorkflowCanvasWrapperProps) => {
  return (
    <ReactFlowProvider>
      <WorkflowCanvas
        readOnly={readOnly}
        workflowId={workflowId}
        onWorkflowChange={onWorkflowChange}
        onNodeConfigure={onNodeConfigure}
        className={className}
      />
    </ReactFlowProvider>
  );
};

export default WorkflowCanvasWrapper;
