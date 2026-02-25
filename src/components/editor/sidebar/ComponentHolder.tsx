"use client";

import { ElementType } from "@/types/global.type";
import { Component } from "lucide-react";
import React from "react";
import { ComponentTooltip } from "../ComponentTooltip";
import { IconRenderer, type IconName } from "@/lib/utils/icons/iconMap";

type HolderProps = {
  icon: IconName;
  type: ElementType;
};

const ComponentHolder = ({ icon, type }: HolderProps) => {
  const onDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    elementType: string,
  ) => {
    e.dataTransfer.setData("elementType", elementType);
  };

  return (
    <ComponentTooltip componentType={type}>
      <div
        draggable
        onDragStart={(e) => onDragStart(e, type)}
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
  const onDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData("customComponentName", index.toString());
  };

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e)}
      className="flex flex-row items-center gap-2 w-full px-2 h-full text-xs rounded-md cursor-grab active:cursor-grabbing transition-colors"
    >
      <Component className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
      <span className="truncate">{name}</span>
    </div>
  );
}

export default ComponentHolder;
