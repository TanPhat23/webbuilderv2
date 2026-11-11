import React from "react";
import { DynamicIcon, type IconName } from "lucide-react/dynamic.mjs";
import { EditorComponentProps } from "@/features/editor";
import { IconElement, IconSettings } from "@/features/editor";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyMedia,
  EmptyDescription,
} from "@/components/ui/empty";
import { Smile } from "lucide-react";
import { useCanvasElement } from "./shared";

const IconComponent = ({ element }: EditorComponentProps) => {
  const iconElement = element as IconElement;
  const { rootProps } = useCanvasElement(iconElement, {
    style: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
    },
  });

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
    <div {...rootProps}>
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
