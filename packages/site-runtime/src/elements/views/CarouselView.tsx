import React, { useCallback, useEffect, useState } from "react";
import useEmblaCarousel, { type UseEmblaCarouselType } from "embla-carousel-react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { CarouselElement } from "../../types/elements";
import { cn } from "../../lib/utils";
import type { ViewProps } from "../view-props";

type CarouselApi = UseEmblaCarouselType[1];

export default function CarouselView({
  element,
  rootProps,
  children,
}: ViewProps<CarouselElement>): React.JSX.Element {
  const settings = element.settings ?? {};
  const [carouselRef, api] = useEmblaCarousel({
    align: "start",
    loop: true,
    ...settings,
  });
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const onSelect = useCallback((embla: CarouselApi): void => {
    if (!embla) return;
    setCanScrollPrev(embla.canScrollPrev());
    setCanScrollNext(embla.canScrollNext());
  }, []);

  useEffect(() => {
    if (!api) return;
    onSelect(api);
    api.on("reInit", onSelect);
    api.on("select", onSelect);
    return () => {
      api.off("reInit", onSelect);
      api.off("select", onSelect);
    };
  }, [api, onSelect]);

  const scrollPrev = useCallback((): void => {
    api?.scrollPrev();
  }, [api]);

  const scrollNext = useCallback((): void => {
    api?.scrollNext();
  }, [api]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>): void => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        scrollPrev();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        scrollNext();
      }
    },
    [scrollPrev, scrollNext],
  );

  if (!element.elements) {
    const { className: _className, style: _style, ...props } = rootProps;
    return <div {...props}>No carousel content available.</div>;
  }

  return (
    <div {...rootProps}>
      <div
        onKeyDownCapture={handleKeyDown}
        className="relative"
        role="region"
        aria-roledescription="carousel"
        data-slot="carousel"
      >
        <div
          ref={carouselRef}
          className="overflow-hidden"
          data-slot="carousel-content"
        >
          <div className="-ml-4 flex">
            {React.Children.map(children, (child) => (
              <div
                role="group"
                aria-roledescription="slide"
                data-slot="carousel-item"
                className="min-w-0 shrink-0 grow-0 basis-full pl-4"
              >
                {child}
              </div>
            ))}
          </div>
        </div>
        {(settings.withNavigation ?? true) && (
          <>
            <button
              type="button"
              data-slot="carousel-previous"
              disabled={!canScrollPrev}
              onClick={scrollPrev}
              className={cn(
                "absolute top-1/2 -left-12 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-900 shadow-xs transition-colors hover:bg-zinc-100 disabled:pointer-events-none disabled:opacity-50",
              )}
            >
              <ArrowLeft className="size-4" />
              <span className="sr-only">Previous slide</span>
            </button>
            <button
              type="button"
              data-slot="carousel-next"
              disabled={!canScrollNext}
              onClick={scrollNext}
              className={cn(
                "absolute top-1/2 -right-12 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-900 shadow-xs transition-colors hover:bg-zinc-100 disabled:pointer-events-none disabled:opacity-50",
              )}
            >
              <ArrowRight className="size-4" />
              <span className="sr-only">Next slide</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
