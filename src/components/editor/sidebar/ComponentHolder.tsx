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
        className="flex flex-row justify-between items-center w-full px-2 h-full text-xs rounded-md cursor-grab active:cursor-grabbing transition-colors"
      >
        <div>{type}</div>
        <IconRenderer name={icon} className="w-4 h-4" />
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
      className="flex flex-row justify-between items-center w-full px-2 h-full text-xs rounded-md cursor-grab active:cursor-grabbing transition-colors"
    >
      <div>{name}</div>
      <Component className="w-4 h-4" />
    </div>
  );
}

export default ComponentHolder;
