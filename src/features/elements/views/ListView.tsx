import React from "react";
import type { ListElement } from "@/features/editor/interfaces/elements.interface";
import type { ViewProps } from "../view-props";

export default function ListView({ rootProps, children, data }: ViewProps<ListElement>) {
  return <ul {...rootProps}>{Array.isArray(data)
    ? React.Children.map(children, (item) => <li>{item}</li>)
    : children}</ul>;
}
