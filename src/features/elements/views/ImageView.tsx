import React from "react";
import type { ImageElement } from "@/types/elements";
import type { ViewProps } from "../view-props";

export default function ImageView({ element, rootProps }: ViewProps<ImageElement>) {
  return <img src={element.src || ""} alt={element.name ?? (element.content || "Image")}
    {...rootProps} style={{ ...rootProps.style, objectFit: "cover" }} />;
}
