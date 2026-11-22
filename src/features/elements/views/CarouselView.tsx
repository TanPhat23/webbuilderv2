import React from "react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import type { CarouselElement } from "@/types/elements";
import type { ViewProps } from "../view-props";

export default function CarouselView({ element, rootProps, children }: ViewProps<CarouselElement>) {
  const settings = element.settings ?? {};
  if (!element.elements) {
    const { className, style, ...props } = rootProps;
    return <div {...props}>No carousel content available.</div>;
  }

  return (
    <div {...rootProps}>
      <Carousel opts={{ align: "start", loop: true, ...settings }}>
        <CarouselContent>
          {React.Children.map(children, (child) => <CarouselItem>{child}</CarouselItem>)}
        </CarouselContent>
        {(settings.withNavigation ?? true) && <><CarouselPrevious /><CarouselNext /></>}
      </Carousel>
    </div>
  );
}
