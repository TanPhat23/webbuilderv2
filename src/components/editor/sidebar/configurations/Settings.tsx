import { Accordion } from "@/components/ui/accordion";
import { ElementType } from "@/types/global.type";
import React from "react";
import { LinkConfigurationAccordion } from "./LinkConfiguration";
import { FormConfigurationAccordion } from "./FormConfiguration";
import InputConfiguration from "./InputConfiguration";
import { useSelectionStore } from "@/globalstore/selectionstore";
import CarouselConfigurationAccordion from "./CarouselConfiguration";
import DataLoaderConfiguration from "./DataLoaderConfiguration";
import CMSConfiguration from "./CMSConfiguration";
import { ImageConfiguration } from "./ImageConfiguration";
import { SelectConfigurationAccordion } from "./SelectConfiguration";

export default function Settings() {
  const { selectedElement } = useSelectionStore();

  const renderChildElement = (type: ElementType): React.ReactNode => {
    if (!type) {
      return null;
    }

    switch (type) {
      case "Link":
        return <LinkConfigurationAccordion />;
      case "Form":
        return <FormConfigurationAccordion />;
      case "Input":
        return <InputConfiguration />;
      case "Select":
        return <SelectConfigurationAccordion />;
      case "Image":
        return <ImageConfiguration />;
      case "Carousel":
        return <CarouselConfigurationAccordion />;
      case "DataLoader":
        return <DataLoaderConfiguration />;
      case "CMSContentList":
      case "CMSContentItem":
      case "CMSContentGrid":
        return selectedElement ? <CMSConfiguration /> : null;
      default:
        return null;
    }
  };

  if (!selectedElement) {
    return null;
  }

  const content = renderChildElement(selectedElement.type);

  if (!content) {
    return (
      <div className="p-4 text-center text-sm text-muted-foreground">
        No configurations available for this element.
      </div>
    );
  }

  return (
    <div className="w-full">
      <Accordion type="multiple" className="w-full">
        {content}
      </Accordion>
    </div>
  );
}
