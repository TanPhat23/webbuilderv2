import { ElementType } from "@/types/global.type";
import { Component } from "lucide-react";
import React from "react";
import { ComponentTooltip } from "../ComponentTooltip";
import { IconRenderer, type IconName } from "@/features/editor/utils/icons/iconMap";
import {
  setElementTypeDrag,
  setTemplateDrag,
} from "@/features/editor/utils/element/dragPayload";
import { cn } from "@/lib/utils";

type HolderVariant = "card" | "row";

type HolderProps = {
  icon: IconName;
  type: ElementType;
  label?: string;
  variant?: HolderVariant;
  className?: string;
};

const ComponentHolder = ({
  icon,
  type,
  label,
  variant = "card",
  className,
}: HolderProps) => {
  const displayLabel = label || type;

  if (variant === "row") {
    return (
      <ComponentTooltip componentType={type}>
        <div
          draggable
          onDragStart={(e) => setElementTypeDrag(e.dataTransfer, type)}
          className={cn(
            "flex flex-row items-center gap-2 w-full px-2 h-full text-xs rounded-md cursor-grab active:cursor-grabbing transition-colors",
            className,
          )}
        >
          <IconRenderer
            name={icon}
            className="w-3.5 h-3.5 shrink-0 text-muted-foreground"
          />
          <span className="truncate">{displayLabel}</span>
        </div>
      </ComponentTooltip>
    );
  }

  return (
    <ComponentTooltip componentType={type}>
      <div
        draggable
        onDragStart={(e) => setElementTypeDrag(e.dataTransfer, type)}
        className={cn(
          "group/item flex flex-col items-center justify-center gap-1.5 w-full h-[62px] px-2 py-1.5 text-center select-none rounded-lg border border-border/60 bg-card/50 hover:bg-accent hover:border-primary/40 cursor-grab active:cursor-grabbing transition-all duration-150 shadow-xs",
          className,
        )}
      >
        <IconRenderer
          name={icon}
          className="w-4 h-4 shrink-0 text-muted-foreground group-hover/item:text-foreground group-hover/item:scale-105 transition-all duration-150"
        />
        <span className="w-full text-[11px] font-medium leading-tight text-muted-foreground group-hover/item:text-foreground truncate transition-colors">
          {displayLabel}
        </span>
      </div>
    </ComponentTooltip>
  );
};

type CustomComponentHolderProps = {
  name: string;
  index: number;
  variant?: HolderVariant;
  className?: string;
};

export function CustomComponentHolder({
  name,
  index,
  variant = "card",
  className,
}: CustomComponentHolderProps) {
  if (variant === "row") {
    return (
      <div
        draggable
        onDragStart={(e) => setTemplateDrag(e.dataTransfer, index)}
        className={cn(
          "flex flex-row items-center gap-2 w-full px-2 h-full text-xs rounded-md cursor-grab active:cursor-grabbing transition-colors",
          className,
        )}
      >
        <Component className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
        <span className="truncate">{name}</span>
      </div>
    );
  }

  return (
    <div
      draggable
      onDragStart={(e) => setTemplateDrag(e.dataTransfer, index)}
      className={cn(
        "group/item flex flex-col items-center justify-center gap-1.5 w-full h-[62px] px-2 py-1.5 text-center select-none rounded-lg border border-border/60 bg-card/50 hover:bg-accent hover:border-primary/40 cursor-grab active:cursor-grabbing transition-all duration-150 shadow-xs",
        className,
      )}
    >
      <Component className="w-4 h-4 shrink-0 text-muted-foreground group-hover/item:text-foreground group-hover/item:scale-105 transition-all duration-150" />
      <span className="w-full text-[11px] font-medium leading-tight text-muted-foreground group-hover/item:text-foreground truncate transition-colors">
        {name}
      </span>
    </div>
  );
}

export default ComponentHolder;
