import React from "react";
import type { ImageElement } from "@/types/elements";
import type { ViewProps } from "../view-props";

export default function ImageView({ element, rootProps }: ViewProps<ImageElement>) {
  return (
    <img
      src={element.src || ""}
      alt={element.content ?? (element.name || "Image")}
      loading={element.settings?.loading}
      decoding={element.settings?.decoding}
      {...rootProps}
      style={{
        objectFit: element.settings?.objectFit ?? "cover",
        ...rootProps.style,
      }}
    />
  );
}
