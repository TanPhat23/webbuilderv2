/// <reference path="../../lucide-dynamic.d.ts" />
import React from "react";
import { DynamicIcon, type IconName } from "lucide-react/dynamic.mjs";
import type { IconElement } from "../../types/elements";
import type { ViewProps } from "../view-props";

interface IconViewProps extends ViewProps<IconElement> {
  fallback?: () => React.ReactNode;
}

export default function IconView({ element, rootProps, fallback }: IconViewProps) {
  return <span {...rootProps}><DynamicIcon
    name={(element.settings?.iconName ?? "star") as IconName}
    size={element.settings?.size ?? 24} strokeWidth={element.settings?.strokeWidth ?? 2}
    color={element.settings?.color} fill={element.settings?.fill}
    absoluteStrokeWidth={element.settings?.absoluteStrokeWidth}
    fallback={fallback}
  /></span>;
}
