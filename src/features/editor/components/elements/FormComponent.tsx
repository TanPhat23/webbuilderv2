
import React from "react";
import { ElementFactory } from "@/features/editor/utils/element/create/ElementFactory";
import { useAddElement } from "@/features/editor";
import { useSelectedElement } from "@/features/editor";
import { FormElement } from "@/features/editor";
import FormView from "@/features/elements/views/FormView";
import { EditorComponentProps } from "@/features/editor";
import ElementLoader from "../ElementLoader";
import { useCurrentPage } from "@/features/projects/hooks/useProjects";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useCanvasElement } from "./shared";

export default function FormComponent({ element, data }: EditorComponentProps) {
  const formElement = element as FormElement;
  const { rootProps } = useCanvasElement(formElement);
  const addElement = useAddElement();
  const currentPage = useCurrentPage();
  const selectedElement = useSelectedElement();

  const isSelected = selectedElement?.id === formElement.id;
  const handleAddField = () => {
    const newField = ElementFactory.getInstance().createElement({
      type: "Input",
      pageId: currentPage?.Id || "",
      parentId: formElement.id,
    });
    if (newField) addElement(newField);
  };

  const { autoComplete, noValidate } = formElement.settings ?? { autoComplete: "on" };
  return (
    <FormView element={formElement} rootProps={{ ...rootProps, autoComplete, noValidate }} mode="edit">
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
    </FormView>
  );
}
