import React from "react";
import IconView from "@webbuilder/site-runtime/elements/views/IconView";
import { EditorComponentProps } from "@/features/editor";
import { IconElement } from "@/features/editor";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyMedia,
  EmptyDescription,
} from "@/components/ui/empty";
import { Smile } from "lucide-react";
import { useCanvasElement } from "./shared";

const IconComponent = ({ element }: EditorComponentProps) => {
  const iconElement = element as IconElement;
  const { rootProps } = useCanvasElement(iconElement);
  const iconName = iconElement.settings?.iconName ?? "star";

  const fallback = () => (
    <Empty className="w-full h-full min-h-12">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Smile />
        </EmptyMedia>
        <EmptyTitle className="text-xs">Icon not found</EmptyTitle>
        <EmptyDescription className="text-xs">
          &ldquo;{iconName}&rdquo; is not a valid Lucide icon name
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );

  return <IconView element={iconElement} rootProps={rootProps} mode="edit" fallback={fallback} />;
};

export default IconComponent;
