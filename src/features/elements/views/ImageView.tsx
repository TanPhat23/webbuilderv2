import React from "react";
import type { ImageElement } from "@/features/editor/interfaces/elements.interface";
import type { ViewProps } from "../view-props";

export default function ImageView({ element, rootProps }: ViewProps<ImageElement>) {
  return <img src={element.src || ""} alt={element.name ?? (element.content || "Image")}
    {...rootProps} style={{ ...rootProps.style, objectFit: "cover" }} />;
}
