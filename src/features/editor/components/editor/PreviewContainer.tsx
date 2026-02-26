"use client";

import React, { memo, useRef } from "react";
import { createPortal } from "react-dom";
import { viewportSizes } from "@/features/editor";
import { Viewport } from "@/hooks";
import { cn } from "@/lib/utils";
import { useProjectStore } from "@/features/editor";
import ElementLoading from "@/features/editor/components/skeleton/ElementLoading";
import {
  useProjectHead,
  useIframeSrcDoc,
  useIframeMountNode,
  useIframeStyleInjection,
} from "@/features/editor/hooks/useIframePreview";

type PreviewContainerProps = {
  currentView: Viewport;
  children: React.ReactElement;
  isLoading?: boolean;
};

const PreviewContainer: React.FC<PreviewContainerProps> = ({
  currentView,
  children,
  isLoading = false,
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { project } = useProjectStore();

  const projectHead = useProjectHead(project?.header?.cssStyles);
  const srcDoc = useIframeSrcDoc(projectHead, currentView);
  const mountNode = useIframeMountNode(iframeRef, srcDoc, currentView);
  useIframeStyleInjection(iframeRef, projectHead, mountNode);

  const containerStyle: React.CSSProperties = {
    width: viewportSizes[currentView].width,
    height: viewportSizes[currentView].height,
    minHeight: viewportSizes[currentView].height,
  };

  const containerClasses = cn(
    "transition-all duration-300 bg-card relative",
    currentView === "desktop"
      ? "h-full w-full"
      : "rounded-lg border-2 border-border shadow-lg",
  );

  const content = isLoading ? (
    <ElementLoading count={6} variant="mixed" />
  ) : (
    React.cloneElement(children, { iframeRef } as any)
  );

  return (
    <div className="overflow-auto scrollbar-hide h-full flex items-start justify-center bg-neutral-200 dark:bg-neutral-900 p-8">
      <div className={containerClasses} style={containerStyle}>
        <iframe
          ref={iframeRef}
          key={currentView}
          id="preview-iframe"
          title={`preview-${currentView}`}
          srcDoc={
            srcDoc ||
            `<!doctype html><html><head>${projectHead}</head><body><div id="react-iframe-root"></div></body></html>`
          }
          aria-label="editor-preview-iframe"
          style={{ width: "100%", height: "100%", border: "none" }}
        />
        {!mountNode && isLoading && (
          <ElementLoading count={6} variant="mixed" />
        )}
        {mountNode && createPortal(content, mountNode)}
      </div>
    </div>
  );
};

export default memo(PreviewContainer);
