"use client";

import React from "react";
import { DynamicIcon, type IconName } from "lucide-react/dynamic";
import { useElementHandler } from "@/hooks";
import { EditorComponentProps } from "@/features/editor";
import { IconElement, IconSettings } from "@/features/editor";
import { elementHelper } from "@/features/editor/utils/element/elementhelper";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyMedia,
  EmptyDescription,
} from "@/components/ui/empty";
import { Smile } from "lucide-react";
import { useEditorElement, eventsStyle } from "./shared";

const IconComponent = ({ element }: EditorComponentProps) => {
  const iconElement = element as IconElement;
  const { elementRef, eventHandlers, eventsActive } = useEditorElement({
    elementId: element.id,
    events: element.events,
  });

  const { getCommonProps } = useElementHandler();
  const safeStyles = elementHelper.getSafeStyles(iconElement);

  const settings = (iconElement.settings ?? {}) as IconSettings;
  const iconName = settings.iconName ?? "star";
  const size = settings.size ?? 24;
  const strokeWidth = settings.strokeWidth ?? 2;
  const color = settings.color ?? "currentColor";
  const fill = settings.fill ?? "none";
  const absoluteStrokeWidth = settings.absoluteStrokeWidth ?? false;

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
      {...getCommonProps(iconElement)}
      {...eventHandlers}
      style={{
        ...safeStyles,
        width: "100%",
        height: "100%",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        ...eventsStyle(eventsActive),
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
