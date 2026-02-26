"use client";

import React from "react";
import EditorCodePanel from "@/features/editor/components/editor/EditorCodePanel";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

export type CodeSplitProps = {
  /**
   * The right-hand content (the preview) that will be rendered in the split.
   * This is typically a React element that contains the PreviewContainer.
   */
  canvas: React.ReactElement;
  /**
   * Default size for the left (code) panel expressed as a percentage (0-100).
   * Defaults to 50.
   */
  defaultSize?: number;
  /**
   * Minimum size for each panel expressed as a percentage (0-100).
   * Defaults to 25.
   */
  minSize?: number;
  /**
   * Optional className to forward to the panel group.
   */
  className?: string;
};

/**
 * CodeSplit
 *
 * A small, re-usable split-pane component used for code + preview layouts.
 * The left pane contains the `EditorCodePanel`; the right pane receives the
 * `canvas` element (typically the preview / iframe container).
 *
 * This component is intentionally minimal — it keeps all layout concerns here
 * so the editor page can remain focused on wiring up content and state.
 */
export default function CodeSplit({
  canvas,
  defaultSize = 50,
  minSize = 25,
  className = "",
}: CodeSplitProps) {
  return (
    <ResizablePanelGroup
      orientation="horizontal"
      className={`h-full w-full ${className}`.trim()}
    >
      <ResizablePanel defaultSize={defaultSize} minSize={minSize}>
        <EditorCodePanel />
      </ResizablePanel>

      <ResizableHandle withHandle />

      <ResizablePanel
        defaultSize={Math.max(0, 100 - defaultSize)}
        minSize={minSize}
      >
        <div className="h-full min-w-0 overflow-auto">{canvas}</div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
