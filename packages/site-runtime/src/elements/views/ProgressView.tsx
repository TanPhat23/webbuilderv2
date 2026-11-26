import React from "react";
import type { ProgressElement } from "../../types/elements";
import type { ViewProps } from "../view-props";

export default function ProgressView({ element, rootProps }: ViewProps<ProgressElement>) {
  const settings = element.settings;
  return <progress {...rootProps} aria-label={settings?.label || "Progress"}
    max={settings?.max ?? 100} value={settings?.indeterminate ? undefined : settings?.value ?? 50} />;
}
