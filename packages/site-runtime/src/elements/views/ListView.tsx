import React from "react";
import type { ListElement } from "../../types/elements";
import type { ViewProps } from "../view-props";

export default function ListView({ rootProps, children, data }: ViewProps<ListElement>) {
  return <ul {...rootProps}>{Array.isArray(data)
    ? React.Children.map(children, (item) => <li>{item}</li>)
    : children}</ul>;
}
