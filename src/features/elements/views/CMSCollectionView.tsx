import React from "react";
import type { CMSContentGridElement, CMSContentListElement } from "@/types/elements";
import type { ViewProps } from "../view-props";

export default function CMSCollectionView({ element, rootProps, children }: ViewProps<CMSContentGridElement | CMSContentListElement>) {
  const isGrid = element.type === "CMSContentGrid";
  const props = isGrid ? {
    ...rootProps,
    className: undefined,
    style: {
      ...rootProps.style,
      width: "100%",
      height: "100%",
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
      gap: "1rem",
    },
  } : rootProps;

  return (
    <div {...props}>
      {React.Children.map(children, (child) => (
        <div style={isGrid ? { width: "100%" } : undefined}>{child}</div>
      ))}
    </div>
  );
}
