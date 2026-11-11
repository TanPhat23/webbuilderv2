import React from "react";
import { EditorComponentProps } from "@/features/editor";
import { ListElement } from "@/features/editor";
import { LayoutGroup } from "framer-motion";
import ElementLoader from "../ElementLoader";
import { useCanvasElement } from "./shared";

const ListComponent = ({ element, data }: EditorComponentProps) => {
  const listElement = element as ListElement;

  const { rootProps } = useCanvasElement(listElement);
  const itemsToRender = Array.isArray(data) ? data : listElement.elements || [];

  return (
    <ul {...rootProps}>
      <LayoutGroup>
        {itemsToRender.map((item, index) => (
          <li key={index} className="list-item">
            {Array.isArray(data) ? (
              <ElementLoader elements={listElement.elements} data={item} />
            ) : (
              <ElementLoader elements={[item]} />
            )}
          </li>
        ))}
      </LayoutGroup>
    </ul>
  );
};

export default ListComponent;
