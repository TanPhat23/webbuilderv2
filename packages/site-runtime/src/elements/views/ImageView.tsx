import React from "react";
import type { ImageElement } from "../../types/elements";
import { replacePlaceholders } from "../lib/replacePlaceholders";
import type { ViewProps } from "../view-props";

export default function ImageView({ element, rootProps, data }: ViewProps<ImageElement>) {
  const rawSrc = element.src || "";
  const resolvedSrc = data ? replacePlaceholders(rawSrc, data) : rawSrc;
  const rawAlt = element.content ?? (element.name || "Image");
  const resolvedAlt = data ? replacePlaceholders(rawAlt, data) : rawAlt;

  return (
    <img
      src={resolvedSrc}
      alt={resolvedAlt}
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
