"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Trash2, GripVertical, MoveUp, MoveDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { elementHelper } from "@/lib/utils/element/elementhelper";
import { EditorElement } from "@/types/global.type";
import { useElementStore } from "@/globalstore/elementstore";

interface WireframeCanvasProps {
  pageId: string;
}

export function WireframeCanvas({ pageId }: WireframeCanvasProps) {
  const { elements, addElement, deleteElement, swapElement } =
    useElementStore<EditorElement>();
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [draggedBlockIndex, setDraggedBlockIndex] = useState<number | null>(
    null,
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);

    const type = e.dataTransfer.getData("wireframeBlockType");
    const name = e.dataTransfer.getData("wireframeBlockName");

    // Only accept drops from the sidebar (which have type and name)
    // Reordering drops are handled by onDragOver/onDragEnd logic below
    if (type && name && draggedBlockIndex === null) {
      // Create a new section element for the wireframe block
      const newElement = elementHelper.createElement.create(
        "Section",
        pageId,
        name,
      ) as EditorElement;

      if (newElement) {
        addElement(newElement);
      }
    }
  };

  const removeBlock = (id: string) => {
    deleteElement(id);
  };

  const moveBlock = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index > 0) {
      const currentId = elements[index].id;
      const prevId = elements[index - 1].id;
      swapElement(currentId, prevId);
    } else if (direction === "down" && index < elements.length - 1) {
      const currentId = elements[index].id;
      const nextId = elements[index + 1].id;
      swapElement(currentId, nextId);
    }
  };

  // Internal Drag and Drop for reordering
  const handleSortStart = (e: React.DragEvent, index: number) => {
    setDraggedBlockIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleSortOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedBlockIndex === null || draggedBlockIndex === index) return;

    const draggedId = elements[draggedBlockIndex].id;
    const targetId = elements[index].id;

    swapElement(draggedId, targetId);
    setDraggedBlockIndex(index);
  };

  const handleSortEnd = () => {
    setDraggedBlockIndex(null);
  };

  return (
    <div
      className={cn(
        "flex-1 h-full bg-muted/30 relative flex flex-col",
        isDraggingOver && "bg-primary/5",
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="p-4 border-b bg-background flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold">Page Layout</h2>
          <p className="text-sm text-muted-foreground">
            Drag components from the sidebar to build your wireframe.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              elements.forEach((el: EditorElement) => deleteElement(el.id));
            }}
            disabled={elements.length === 0}
          >
            Clear All
          </Button>
          <Button size="sm" disabled={elements.length === 0}>
            Convert to Design
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 p-8">
        <div className="max-w-3xl mx-auto space-y-4 min-h-[500px]">
          {elements.length === 0 ? (
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg h-64 flex flex-col items-center justify-center text-muted-foreground">
              <p>Empty Canvas</p>
              <p className="text-sm">Drop components here</p>
            </div>
          ) : (
            elements.map((element: EditorElement, index: number) => (
              <div
                key={element.id}
                draggable
                onDragStart={(e) => handleSortStart(e, index)}
                onDragOver={(e) => handleSortOver(e, index)}
                onDragEnd={handleSortEnd}
                className={cn(
                  "bg-background border rounded-lg p-4 shadow-sm flex items-center gap-4 group transition-all",
                  draggedBlockIndex === index &&
                    "opacity-50 ring-2 ring-primary",
                )}
              >
                <div className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground">
                  <GripVertical className="h-5 w-5" />
                </div>

                <div className="h-12 w-20 bg-muted rounded flex items-center justify-center text-xs text-muted-foreground">
                  Preview
                </div>

                <div className="flex-1">
                  <h3 className="font-medium">
                    {element.name || "Untitled Section"}
                  </h3>
                  <p className="text-xs text-muted-foreground capitalize">
                    {element.type}
                  </p>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => moveBlock(index, "up")}
                    disabled={index === 0}
                  >
                    <MoveUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => moveBlock(index, "down")}
                    disabled={index === elements.length - 1}
                  >
                    <MoveDown className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => removeBlock(element.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
