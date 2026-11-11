import React, { memo, useRef } from "react";
import { createPortal } from "react-dom";
import { viewportSizes } from "@/features/editor";
import { Viewport } from "@/features/editor/hooks/useEditor";
import { cn } from "@/lib/utils";
import { useCurrentProject } from "@/features/projects/hooks/useProjects";
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
  const { data: project } = useCurrentProject();

  const projectHead = useProjectHead(project?.header?.cssStyles);
  const srcDoc = useIframeSrcDoc(projectHead, currentView);
  const mountNode = useIframeMountNode(iframeRef, srcDoc, currentView);
  useIframeStyleInjection(iframeRef, projectHead, mountNode);

  const isDesktop = currentView === "desktop";

  const containerStyle: React.CSSProperties = isDesktop
    ? { width: "100%", height: "100%", minHeight: "100%" }
    : {
        width: viewportSizes[currentView].width,
        height: viewportSizes[currentView].height,
        minHeight: viewportSizes[currentView].height,
      };

  const containerClasses = cn(
    "transition-all duration-300 bg-card relative",
    isDesktop
      ? "h-full w-full rounded-xl ring-1 ring-border/80 shadow-2xl overflow-hidden"
      : "rounded-xl ring-1 ring-border/80 shadow-2xl overflow-hidden shrink-0 my-auto",
  );

  const content = isLoading ? (
    <ElementLoading count={6} />
  ) : (
    React.cloneElement(children, { iframeRef } as React.ComponentProps<any>)
  );

  return (
    <div
      className={cn(
        "overflow-auto scrollbar-hide h-full w-full flex items-center justify-center",
        "bg-canvas-backdrop bg-[radial-gradient(var(--canvas-dot)_1px,transparent_1px)] [background-size:16px_16px]",
        isDesktop ? "p-4 md:p-6" : "p-8",
      )}
    >
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
          <ElementLoading count={6} />
        )}
        {mountNode && createPortal(content, mountNode)}
      </div>
    </div>
  );
};

export default memo(PreviewContainer);
