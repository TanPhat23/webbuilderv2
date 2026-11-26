import React from "react";
import type { ViewProps } from "../view-props";

export default function SeparatorView({ rootProps }: ViewProps) {
  return <hr {...rootProps} />;
}
