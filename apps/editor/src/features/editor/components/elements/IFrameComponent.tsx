
import React from "react";
import { EditorComponentProps } from "@/features/editor";
import { IFrameElement } from "@/features/editor";
import IFrameView from "@webbuilder/site-runtime/elements/views/IFrameView";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyMedia,
  EmptyDescription,
} from "@/components/ui/empty";
import { Globe } from "lucide-react";
import { useCanvasElement } from "./shared";

const IFrameComponent = ({ element }: EditorComponentProps) => {
  const iframeElement = element as IFrameElement;
  const { rootProps, eventsActive } = useCanvasElement(iframeElement, {
    style: { position: "relative" },
  });

  if (iframeElement.src) {
    return (
      <IFrameView element={iframeElement} rootProps={rootProps} mode="edit">
        <div
          className="absolute inset-0"
          style={{
            pointerEvents: eventsActive ? "none" : "auto",
            background: "transparent",
          }}
        />
      </IFrameView>
    );
  }

  return (
    <div {...rootProps}>
      <Empty className="w-full h-full min-w-56 md:p-6">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Globe />
          </EmptyMedia>
          <EmptyTitle>No URL set</EmptyTitle>
          <EmptyDescription className="text-xs">
            Set a source URL in the settings panel to embed external content
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    </div>
  );
};

export default IFrameComponent;
