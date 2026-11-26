import React from "react";
import type { EditorComponentProps } from "@/features/editor/interfaces/editor.interface";
import { componentSetting } from "@webbuilder/site-runtime/projects/components";
import { ComponentInstanceCanvas } from "./ComponentInstanceCanvas";
import AudioComponent from "./elements/AudioComponent";
import ButtonComponent from "./elements/ButtonComponent";
import CanvasView from "./elements/CanvasView";
import CMSContentGridComponent from "./elements/CMSContentGridComponent";
import CMSContentItemComponent from "./elements/CMSContentItemComponent";
import CMSContentListComponent from "./elements/CMSContentListComponent";
import FormComponent from "./elements/FormComponent";
import IFrameComponent from "./elements/IFrameComponent";
import IconComponent from "./elements/IconComponent";
import ImageComponent from "./elements/ImageComponent";
import LinkComponent from "./elements/LinkComponent";
import ListComponent from "./elements/ListComponent";
import SectionComponent from "./elements/SectionComponent";
import SelectComponent from "./elements/SelectComponent";
import TableComponent from "./elements/TableComponent";
import TextareaComponent from "./elements/TextareaComponent";
import VideoComponent from "./elements/VideoComponent";
import { ChoiceInputComponent } from "./elements/shared/ChoiceInputComponent";

function ElementRenderer({ element, data }: EditorComponentProps) {
  const props = { element, data };
  if (componentSetting(element)) return <ComponentInstanceCanvas {...props} />;

  switch (element.type) {
    case "Audio": return <AudioComponent {...props} />;
    case "Button": return <ButtonComponent {...props} />;
    case "CMSContentGrid": return <CMSContentGridComponent {...props} />;
    case "CMSContentItem": return <CMSContentItemComponent {...props} />;
    case "CMSContentList": return <CMSContentListComponent {...props} />;
    case "Checkbox":
    case "Radio": return <ChoiceInputComponent {...props} />;
    case "Form": return <FormComponent {...props} />;
    case "IFrame": return <IFrameComponent {...props} />;
    case "Icon": return <IconComponent {...props} />;
    case "Image": return <ImageComponent {...props} />;
    case "Link": return <LinkComponent {...props} />;
    case "List": return <ListComponent {...props} />;
    case "Section": return <SectionComponent {...props} />;
    case "Select": return <SelectComponent {...props} />;
    case "Table": return <TableComponent {...props} />;
    case "Textarea": return <TextareaComponent {...props} />;
    case "Video": return <VideoComponent {...props} />;
    default: return <CanvasView {...props} />;
  }
}

export default React.memo(
  ElementRenderer,
  (prev, next) => prev.element === next.element && prev.data === next.data,
);
