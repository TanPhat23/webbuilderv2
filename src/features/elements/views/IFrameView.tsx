import React from "react";
import type { IFrameElement } from "@/features/editor/interfaces/elements.interface";
import type { ViewProps } from "../view-props";

export default function IFrameView({ element, rootProps, children }: ViewProps<IFrameElement>) {
  const src = element.src;
  return (
    <div {...rootProps}>
      <iframe src={src && /^https?:\/\//i.test(src) ? src : undefined}
        title={element.name || "Embedded content"} loading={element.settings?.loading ?? "lazy"}
        sandbox="allow-scripts" referrerPolicy="no-referrer"
        width={element.settings?.width ?? "100%"} height={element.settings?.height ?? 400} />
      {children}
    </div>
  );
}
