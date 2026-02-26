import React from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { CarouselElement } from "@/features/editor";
import { elementHelper } from "@/features/editor/utils/element/elementhelper";
import PreviewElementLoader from "./PreviewElementLoader";

interface PreviewCarouselComponentProps {
  element: CarouselElement;
  data?: any;
}

const PreviewCarouselComponent = ({
  element,
  data,
}: PreviewCarouselComponentProps) => {
  const safeStyles = elementHelper.getSafeStyles(element);
  const carouselSettings = element.settings || {};
  const hasNavigation = carouselSettings.withNavigation ?? true;

  if (!element || !element.elements) {
    return <div>No carousel content available.</div>;
  }

  return (
    <div className={element.tailwindStyles} style={safeStyles}>
      <Carousel
        opts={{
          align: "start",
          loop: true,
          ...carouselSettings,
        }}
      >
        <CarouselContent>
          {element.elements.map((item, index) => (
            <CarouselItem key={item.id || index}>
              <PreviewElementLoader elements={[item]} data={data} />
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
    </div>
  );
};

export default PreviewCarouselComponent;
