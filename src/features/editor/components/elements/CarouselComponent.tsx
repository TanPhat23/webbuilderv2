import React from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { EditorComponentProps } from "@/features/editor";
import {
  CarouselElement,
  CarouselSettings,
} from "@/features/editor";
import { cn } from "@/lib/utils";
import ElementLoader from "../ElementLoader";
import { useCanvasElement } from "./shared";

const CarouselComponent = ({ element, data }: EditorComponentProps) => {
  const carouselElement = element as CarouselElement;
  const { rootProps } = useCanvasElement(carouselElement);
  if (!carouselElement.elements) {
    return <div>No carousel content available.</div>;
  }

  const carouselSettings: CarouselSettings = carouselElement.settings ?? {};
  const hasNavigation = carouselSettings.withNavigation ?? true;
  return (
    <Carousel
      {...rootProps}
      opts={carouselSettings}
      className={cn("w-full h-full")}
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
