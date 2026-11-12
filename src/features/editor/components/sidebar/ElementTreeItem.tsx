import React from "react";
import { ChevronRight } from "lucide-react";
import { useIsSelected, useSetSelectedElement } from "@/features/editor";
import elementHolders from "@/features/editor/constants/elements";
import { IconRenderer, type IconName } from "@/features/editor/utils/icons/iconMap";
import { cn } from "@/lib/utils";
import type { ContainerElement, EditorElement } from "@/types/global.type";

const ICON_BY_TYPE = new Map<string, IconName>(
  elementHolders.map((h) => [h.type, h.icon]),
);

const INDENT = 12;

function childrenOf(element: EditorElement): EditorElement[] {
  return "elements" in element && Array.isArray(element.elements)
    ? (element as ContainerElement).elements
    : [];
}

export default function ElementTreeItem({
  element,
  level = 0,
}: {
  element: EditorElement;
  level?: number;
}) {
  const isSelected = useIsSelected(element.id);
  const setSelectedElement = useSetSelectedElement();
  const [isOpen, setIsOpen] = React.useState(level < 2);

  const children = childrenOf(element);
  const hasChildren = children.length > 0;
  const name = element.name || element.type;
  const icon = ICON_BY_TYPE.get(element.type);

  return (
    <div role="treeitem" aria-expanded={hasChildren ? isOpen : undefined} aria-selected={isSelected}>
      <div
        onClick={(e) => {
          e.stopPropagation();
          setSelectedElement(isSelected ? undefined : element);
        }}
        className={cn(
          "group mx-1.5 flex h-7 cursor-pointer items-center gap-1 rounded-md pr-2 text-xs text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground",
          isSelected && "bg-primary/10 text-foreground ring-1 ring-inset ring-primary/40 hover:bg-primary/15",
        )}
        style={{ paddingLeft: level * INDENT + 4 }}
      >
        {hasChildren ? (
          <button
            type="button"
            aria-label={isOpen ? "Collapse" : "Expand"}
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen((o) => !o);
            }}
            className="flex h-4 w-4 shrink-0 items-center justify-center rounded-sm hover:bg-foreground/10"
          >
            <ChevronRight
              className={cn("h-3 w-3 transition-transform", isOpen && "rotate-90")}
            />
          </button>
        ) : (
          <span className="w-4 shrink-0" />
        )}
        {icon ? (
          <IconRenderer name={icon} className="h-3.5 w-3.5 shrink-0" />
        ) : (
          <span className="h-3.5 w-3.5 shrink-0 rounded-sm border border-current opacity-50" />
        )}
        <span className="ml-1 truncate">{name}</span>
        {element.name && element.name !== element.type && (
          <span className="ml-auto shrink-0 pl-2 text-[10px] text-muted-foreground/60 opacity-0 group-hover:opacity-100">
            {element.type}
          </span>
        )}
      </div>

      {hasChildren && isOpen && (
        <div role="group" className="relative">
          <span
            aria-hidden
            className="absolute bottom-1 top-0 w-px bg-border"
            style={{ left: level * INDENT + 6 + 8 + 4 }}
          />
          {children.map((child) => (
            <ElementTreeItem key={child.id} element={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
