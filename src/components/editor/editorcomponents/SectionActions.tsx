"use client";
import React from "react";
import { useInsertElement } from "@/globalstore/selectors/element-selectors";
import { useSelectedElement } from "@/globalstore/selectors/selection-selectors";
import { usePageStore } from "@/globalstore/page-store";
import { ElementFactory } from "@/lib/utils/element/create/ElementFactory";
import { Button } from "@/components/ui/button";
import { SectionElement } from "@/interfaces/elements.interface";

interface SectionActionsProps {
  element: SectionElement;
}

/**
 * SectionActions Component
 *
 * Handles the "+ Add Section" button for SectionComponent.
 * Isolated in a separate component to avoid putting store dependencies
 * directly in the base SectionComponent, which caused hydration issues.
 */
export function SectionActions({ element }: SectionActionsProps) {
  const insertElement = useInsertElement();
  const selectedElement = useSelectedElement();
  const { currentPage } = usePageStore();

  // Don't render if this section isn't selected
  if (!selectedElement || selectedElement.id !== element.id) {
    return null;
  }

  if (!insertElement || !currentPage?.Id) {
    return null;
  }

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