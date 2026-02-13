import { Accordion } from "@/components/ui/accordion";
import { ElementType } from "@/types/global.type";
import React, { Suspense } from "react";
import { useSelectedElement } from "@/globalstore/selectors/selection-selectors";

// ---------------------------------------------------------------------------
// Lazy-loaded configuration panels — each panel and its dependencies are
// only loaded when the user actually selects the corresponding element type.
// This reduces the initial JS bundle for the editor sidebar significantly.
// ---------------------------------------------------------------------------

const LinkConfigurationAccordion = React.lazy(() =>
  import("./LinkConfiguration").then((m) => ({
    default: m.LinkConfigurationAccordion,
  })),
);

const FormConfigurationAccordion = React.lazy(() =>
  import("./FormConfiguration").then((m) => ({
    default: m.FormConfigurationAccordion,
  })),
);

const InputConfiguration = React.lazy(() => import("./InputConfiguration"));

const SelectConfigurationAccordion = React.lazy(() =>
  import("./SelectConfiguration").then((m) => ({
    default: m.SelectConfigurationAccordion,
  })),
);

const ImageConfiguration = React.lazy(() =>
  import("./ImageConfiguration").then((m) => ({
    default: m.ImageConfiguration,
  })),
);

const CarouselConfigurationAccordion = React.lazy(
  () => import("./CarouselConfiguration"),
);

const CMSConfiguration = React.lazy(() => import("./CMSConfiguration"));

/**
 * Lightweight loading placeholder shown while a configuration panel chunk
 * is being fetched. Keeps the sidebar from jumping around.
 */
function ConfigurationFallback() {
  return (
    <div className="flex items-center justify-center py-6">
      <div className="h-5 w-5 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
    </div>
  );
}

export default function Settings() {
  const selectedElement = useSelectedElement();

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
        <Suspense fallback={<ConfigurationFallback />}>{content}</Suspense>
      </Accordion>
    </div>
  );
}
