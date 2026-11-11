
import React from "react";
import { EditorComponentProps } from "@/features/editor";
import { IFrameElement, IFrameSettings } from "@/features/editor";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyMedia,
  EmptyDescription,
} from "@/components/ui/empty";
import { Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCanvasElement } from "./shared";

const IFrameComponent = ({ element }: EditorComponentProps) => {
  const iframeElement = element as IFrameElement;
  const { rootProps, eventsActive } = useCanvasElement(iframeElement, {
    style: { position: "relative" },
  });

  const settings = (iframeElement.settings ?? {}) as IFrameSettings;
  const sandbox = settings.sandbox ?? "allow-scripts allow-same-origin";
  const allow = settings.allow;
  const loading = settings.loading ?? "lazy";
  const referrerPolicy = settings.referrerPolicy;
  const iframeWidth = settings.width ?? "100%";
  const iframeHeight = settings.height ?? 400;


  if (iframeElement.src) {
    return (
      <div {...rootProps} className={cn(rootProps.className, "w-full h-full")}>
        <iframe
          src={iframeElement.src}
          title={iframeElement.name || "Embedded content"}
          sandbox={sandbox}
          allow={allow}
          loading={loading}
          referrerPolicy={referrerPolicy}
          style={{
            width:
              typeof iframeWidth === "number"
                ? `${iframeWidth}px`
                : iframeWidth,
            height:
              typeof iframeHeight === "number"
                ? `${iframeHeight}px`
                : iframeHeight,
            border: "none",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            pointerEvents: eventsActive ? "none" : "auto",
            background: "transparent",
          }}
        />
      </div>
    );
  }

  return (
    <div {...rootProps} className={cn(rootProps.className, "w-full h-full")}>
      <Empty className="w-full h-full">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Globe />
          </EmptyMedia>
          <EmptyTitle>No URL set</EmptyTitle>
          <EmptyDescription className="text-xs">
            Set a source URL in the settings panel to embed external content
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    </div>
  );
};

export default IFrameComponent;
