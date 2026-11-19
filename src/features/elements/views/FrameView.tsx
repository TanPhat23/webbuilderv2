import React from "react";
import type { CMSContentItemElement, FrameElement } from "@/features/editor/interfaces/elements.interface";
import type { ViewProps } from "../view-props";

export default function FrameView({ rootProps, children }: ViewProps<FrameElement | CMSContentItemElement>) {
  return <div {...rootProps}>{children}</div>;
}
