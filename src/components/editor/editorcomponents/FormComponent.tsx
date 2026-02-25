"use client";

import React from "react";
import { useElementHandler } from "@/hooks";
import { elementHelper } from "@/lib/utils/element/elementhelper";
import { ElementFactory } from "@/lib/utils/element/create/ElementFactory";
import { useAddElement } from "@/globalstore/selectors/element-selectors";
import { useSelectedElement } from "@/globalstore/selectors/selection-selectors";
import { FormElement, FormSettings } from "@/interfaces/elements.interface";
import { EditorComponentProps } from "@/interfaces/editor.interface";
import ElementLoader from "../ElementLoader";
import { usePageStore } from "@/globalstore/page-store";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEditorElement, eventsStyle } from "./shared";

export default function FormComponent({ element, data }: EditorComponentProps) {
  const formElement = element as FormElement;
  const { elementRef, eventHandlers, eventsActive } = useEditorElement({
    elementId: element.id,
    events: element.events,
  });

  const { getCommonProps } = useElementHandler();
  const addElement = useAddElement();
  const { currentPage } = usePageStore();
  const selectedElement = useSelectedElement();

  const isSelected = selectedElement?.id === formElement.id;
  const settings = (formElement.settings as FormSettings) ?? {
    method: "post",
    action: "",
    target: "_self",
    autoComplete: "on",
  };

  const safeStyles = elementHelper.getSafeStyles(formElement);

  const handleAddField = () => {
    const newField = ElementFactory.getInstance().createElement({
      type: "Input",
      pageId: currentPage?.Id || "",
      parentId: formElement.id,
    });
    if (newField) addElement(newField);
  };

  return (
    <form
      ref={elementRef as React.RefObject<HTMLFormElement>}
      data-element-id={element.id}
      data-element-type={element.type}
      {...getCommonProps(formElement)}
      {...eventHandlers}
      className={cn(
        "flex flex-col gap-4 p-6 border rounded-xl transition-all duration-200",
        "bg-card text-card-foreground border-border shadow-sm",
        formElement.tailwindStyles,
      )}
      style={{
        ...safeStyles,
        width: "100%",
        height: "100%",
        ...eventsStyle(eventsActive),
      }}
      action={settings.action}
      method={settings.method}
      target={settings.target}
      autoComplete={settings.autoComplete}
      noValidate={settings.noValidate}
    >
      <ElementLoader elements={formElement.elements} data={data} />

      {isSelected && (
        <Button
          type="button"
          variant="outline"
          className="w-full border-dashed border-2 hover:border-solid hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-all"
          onClick={handleAddField}
        >
          <Plus className="mr-2 h-4 w-4" /> Add Form Field
        </Button>
      )}
    </form>
  );
}
