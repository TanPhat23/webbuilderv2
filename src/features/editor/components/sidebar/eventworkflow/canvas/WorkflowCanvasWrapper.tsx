"use client";

import React from "react";
import { ReactFlowProvider } from "reactflow";
import { WorkflowCanvas } from "./WorkflowCanvas";

interface WorkflowCanvasWrapperProps {
  readOnly?: boolean;
  onWorkflowChange?: (workflow: any) => void;
  onNodeConfigure?: (nodeId: string) => void;
  className?: string;
}

export const WorkflowCanvasWrapper = ({
  readOnly = false,
  onWorkflowChange,
  onNodeConfigure,
  className,
}: WorkflowCanvasWrapperProps) => {
  return (
    <ReactFlowProvider>
      <WorkflowCanvas
        readOnly={readOnly}
        onWorkflowChange={onWorkflowChange}
        onNodeConfigure={onNodeConfigure}
        className={className}
      />
    </ReactFlowProvider>
  );
};

export default WorkflowCanvasWrapper;
