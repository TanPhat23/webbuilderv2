"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useElementHandler } from "@/hooks";
import { useElementEvents } from "@/hooks/editor/eventworkflow/useElementEvents";
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
import { cn } from "@/lib/utils";

const IFrameComponent = ({ element }: EditorComponentProps) => {
  const iframeElement = element as IFrameElement;
  const { id } = useParams();

  const { getCommonProps } = useElementHandler();
  const { elementRef, registerEvents, createEventHandlers, eventsActive } =
    useElementEvents({
      elementId: element.id,
      projectId: id as string,
    });

  const safeStyles = elementHelper.getSafeStyles(iframeElement);

  const settings = (iframeElement.settings ?? {}) as IFrameSettings;
  const sandbox = settings.sandbox ?? "allow-scripts allow-same-origin";
  const allow = settings.allow;
  const loading = settings.loading ?? "lazy";
  const referrerPolicy = settings.referrerPolicy;
  const iframeWidth = settings.width ?? "100%";
  const iframeHeight = settings.height ?? 400;

  useEffect(() => {
    if (element.events) {
      registerEvents(element.events);
    }
  }, [element.events, registerEvents]);

  const eventHandlers = createEventHandlers();

  if (iframeElement.src) {
    return (
      <div
        ref={elementRef as React.RefObject<HTMLDivElement>}
        data-element-id={element.id}
        data-element-type={element.type}
        className="relative w-full h-full"
        {...eventHandlers}
        style={{
          ...safeStyles,
          width: "100%",
          height: "100%",
          cursor: eventsActive ? "pointer" : "inherit",
          userSelect: eventsActive ? "none" : "auto",
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
            width: typeof iframeWidth === "number" ? `${iframeWidth}px` : iframeWidth,
            height: typeof iframeHeight === "number" ? `${iframeHeight}px` : iframeHeight,
            border: "none",
          }}
        />
        {/* Overlay to prevent iframe from capturing pointer events in the editor */}
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
    <div
      ref={elementRef as React.RefObject<HTMLDivElement>}
      data-element-id={element.id}
      data-element-type={element.type}
      className="w-full h-full"
      {...eventHandlers}
      style={{
        ...safeStyles,
        width: "100%",
        height: "100%",
        cursor: eventsActive ? "pointer" : "inherit",
        userSelect: eventsActive ? "none" : "auto",
      }}
    >
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
