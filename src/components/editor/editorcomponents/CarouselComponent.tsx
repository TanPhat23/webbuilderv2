import React from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useElementHandler } from "@/hooks";
import { EditorComponentProps } from "@/interfaces/editor.interface";
import {
  CarouselElement,
  CarouselSettings,
} from "@/interfaces/elements.interface";
import { cn } from "@/lib/utils";
import { elementHelper } from "@/lib/utils/element/elementhelper";
import ElementLoader from "../ElementLoader";
import { useEditorElement, eventsStyle } from "./shared";

const CarouselComponent = ({ element, data }: EditorComponentProps) => {
  const carouselElement = element as CarouselElement;
  const { elementRef, eventHandlers, eventsActive } = useEditorElement({
    elementId: element.id,
    events: element.events,
  });

  const { getCommonProps } = useElementHandler();

  if (!carouselElement.elements) {
    return <div>No carousel content available.</div>;
  }

  const carouselSettings: CarouselSettings = carouselElement.settings ?? {};
  const hasNavigation = carouselSettings.withNavigation ?? true;
  const safeStyles = elementHelper.getSafeStyles(carouselElement);

  return (
    <Carousel
      ref={elementRef as React.RefObject<HTMLDivElement>}
      data-element-id={element.id}
      data-element-type={element.type}
      {...getCommonProps(carouselElement)}
      {...eventHandlers}
      opts={carouselSettings}
      className={cn("w-full h-full")}
      style={{
        ...safeStyles,
        width: "100%",
        height: "100%",
        ...eventsStyle(eventsActive),
      }}
      role="region"
      aria-roledescription="carousel"
    >
      <CarouselContent>
        {carouselElement.elements.map((slide) => (
          <CarouselItem key={slide.id}>
            <div className="p-1 h-full w-full">
              <ElementLoader elements={[slide]} data={data} />
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>

      {hasNavigation && (
        <>
          <CarouselPrevious />
          <CarouselNext />
        </>
      )}
    </Carousel>
  );
};

export default CarouselComponent;
