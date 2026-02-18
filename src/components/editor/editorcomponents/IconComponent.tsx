"use client";

import React, { useEffect } from "react";
import { useParams } from "next/navigation";
import { DynamicIcon, type IconName } from "lucide-react/dynamic";
import { useElementHandler } from "@/hooks";
import { useElementEvents } from "@/hooks/editor/eventworkflow/useElementEvents";
import { EditorComponentProps } from "@/interfaces/editor.interface";
import { IconElement, IconSettings } from "@/interfaces/elements.interface";
import { elementHelper } from "@/lib/utils/element/elementhelper";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyMedia,
  EmptyDescription,
} from "@/components/ui/empty";
import { Smile } from "lucide-react";

const IconComponent = ({ element }: EditorComponentProps) => {
  const iconElement = element as IconElement;
  const { id } = useParams();

  const { getCommonProps } = useElementHandler();
  const { elementRef, registerEvents, createEventHandlers, eventsActive } =
    useElementEvents({
      elementId: element.id,
      projectId: id as string,
    });

  const safeStyles = elementHelper.getSafeStyles(iconElement);

  const settings = (iconElement.settings ?? {}) as IconSettings;
  const iconName = settings.iconName ?? "star";
  const size = settings.size ?? 24;
  const strokeWidth = settings.strokeWidth ?? 2;
  const color = settings.color ?? "currentColor";
  const fill = settings.fill ?? "none";
  const absoluteStrokeWidth = settings.absoluteStrokeWidth ?? false;

  useEffect(() => {
    if (element.events) {
      registerEvents(element.events);
    }
  }, [element.events, registerEvents]);

  const eventHandlers = createEventHandlers();

  const fallback = () => (
    <Empty className="w-full h-full min-h-12">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Smile />
        </EmptyMedia>
        <EmptyTitle className="text-xs">Icon not found</EmptyTitle>
        <EmptyDescription className="text-xs">
          &ldquo;{iconName}&rdquo; is not a valid Lucide icon name
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );

  return (
    <div
      ref={elementRef as React.RefObject<HTMLDivElement>}
      data-element-id={element.id}
      data-element-type={element.type}
      {...eventHandlers}
      style={{
        ...safeStyles,
        width: "100%",
        height: "100%",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: eventsActive ? "pointer" : "inherit",
        userSelect: eventsActive ? "none" : "auto",
      }}
    >
      <DynamicIcon
        name={iconName as IconName}
        size={size}
        strokeWidth={strokeWidth}
        color={color}
        fill={fill}
        absoluteStrokeWidth={absoluteStrokeWidth}
        fallback={fallback}
      />
    </div>
  );
};

export default IconComponent;
