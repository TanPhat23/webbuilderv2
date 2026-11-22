import React from "react";
import type { CMSContentItemElement, FrameElement } from "@/types/elements";
import type { ViewProps } from "../view-props";

export default function FrameView({ rootProps, children }: ViewProps<FrameElement | CMSContentItemElement>) {
  return <div {...rootProps}>{children}</div>;
}
