"use client";
import React from "react";
import { useInsertElement } from "@/features/editor";
import { useSelectedElement } from "@/features/editor";
import { usePageStore } from "@/features/editor";
import { ElementFactory } from "@/features/editor/utils/element/create/ElementFactory";
import { Button } from "@/components/ui/button";
import { SectionElement } from "@/features/editor";

interface SectionActionsProps {
  element: SectionElement;
}

export function SectionActions({ element }: SectionActionsProps) {
  const insertElement = useInsertElement();
  const selectedElement = useSelectedElement();
  const { currentPage } = usePageStore();

  if (!selectedElement || selectedElement.id !== element.id) return null;
  if (!insertElement || !currentPage?.Id) return null;

  const handleCreateSection = () => {
    const newElement = ElementFactory.getInstance().createElement({
      type: "Section",
      pageId: currentPage.Id,
    });

    if (newElement) {
      insertElement(element, newElement);
    }
  };

  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        transform: "translateX(-50%)",
        bottom: -30,
        zIndex: 10,
      }}
    >
      <Button
        className="h-6 text-primary-foreground"
        onDoubleClick={handleCreateSection}
      >
        + Add Section
      </Button>
    </div>
  );
}
