"use client";

import React from "react";
import { useElementHandler } from "@/hooks";
import { EditorComponentProps } from "@/interfaces/editor.interface";
import { IFrameElement, IFrameSettings } from "@/interfaces/elements.interface";
import { elementHelper } from "@/lib/utils/element/elementhelper";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyMedia,
  EmptyDescription,
} from "@/components/ui/empty";
import { Globe } from "lucide-react";
import { useEditorElement, eventsStyle } from "./shared";

const IFrameComponent = ({ element }: EditorComponentProps) => {
  const iframeElement = element as IFrameElement;
  const { elementRef, eventHandlers, eventsActive } = useEditorElement({
    elementId: element.id,
    events: element.events,
  });

  const { getCommonProps } = useElementHandler();
  const safeStyles = elementHelper.getSafeStyles(iframeElement);

  const settings = (iframeElement.settings ?? {}) as IFrameSettings;
  const sandbox = settings.sandbox ?? "allow-scripts allow-same-origin";
  const allow = settings.allow;
  const loading = settings.loading ?? "lazy";
  const referrerPolicy = settings.referrerPolicy;
  const iframeWidth = settings.width ?? "100%";
  const iframeHeight = settings.height ?? 400;

  const rootProps = {
    ref: elementRef as React.RefObject<HTMLDivElement>,
    "data-element-id": element.id,
    "data-element-type": element.type,
    ...getCommonProps(iframeElement),
    ...eventHandlers,
    style: {
      ...safeStyles,
      width: "100%",
      height: "100%",
      ...eventsStyle(eventsActive),
    },
  };

  if (iframeElement.src) {
    return (
      <div
        {...rootProps}
        className="relative w-full h-full"
        style={{
          ...rootProps.style,
          position: "relative",
        }}
      >
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
    <div {...rootProps} className="w-full h-full">
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
