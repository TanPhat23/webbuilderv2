
import { ElementType } from "@/types/global.type";
import { Component } from "lucide-react";
import React from "react";
import { ComponentTooltip } from "../ComponentTooltip";
import { IconRenderer, type IconName } from "@/features/editor/utils/icons/iconMap";
import {
  setElementTypeDrag,
  setTemplateDrag,
} from "@/features/editor/utils/element/dragPayload";

type HolderProps = {
  icon: IconName;
  type: ElementType;
};

const ComponentHolder = ({ icon, type }: HolderProps) => {
  return (
    <ComponentTooltip componentType={type}>
      <div
        draggable
        onDragStart={(e) => setElementTypeDrag(e.dataTransfer, type)}
        className="flex flex-row items-center gap-2 w-full px-2 h-full text-xs rounded-md cursor-grab active:cursor-grabbing transition-colors"
      >
        <IconRenderer
          name={icon}
          className="w-3.5 h-3.5 shrink-0 text-muted-foreground"
        />
        <span className="truncate">{type}</span>
      </div>
    </ComponentTooltip>
  );
};

type CustomComponentHolderProps = {
  name: string;
  index: number;
};

export function CustomComponentHolder({
  name,
  index,
}: CustomComponentHolderProps) {
  return (
    <div
      draggable
      onDragStart={(e) => setTemplateDrag(e.dataTransfer, index)}
      className="flex flex-row items-center gap-2 w-full px-2 h-full text-xs rounded-md cursor-grab active:cursor-grabbing transition-colors"
    >
      <Component className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
      <span className="truncate">{name}</span>
    </div>
  );
}

export default ComponentHolder;
