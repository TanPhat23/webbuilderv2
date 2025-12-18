import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useElementHandler } from "@/hooks";
import { useElementEvents } from "@/hooks/editor/eventworkflow/useElementEvents";
import { EditorComponentProps } from "@/interfaces/editor.interface";
import {
  CarouselElement,
  CarouselSettings,
} from "@/interfaces/elements.interface";
import { cn } from "@/lib/utils";
import { elementHelper } from "@/lib/utils/element/elementhelper";
import { useEffect } from "react";
import ElementLoader from "../ElementLoader";
import { useParams } from "next/navigation";

const CarouselComponent = ({ element, data }: EditorComponentProps) => {
  const carouselElement = element as CarouselElement;
  const { id } = useParams();
  const { getCommonProps } = useElementHandler();
  const { elementRef, registerEvents, createEventHandlers, eventsActive } =
    useElementEvents({
      elementId: element.id,
      projectId: id as string,
    });

  element = element as CarouselElement;
  if (!element || !element.elements) {
    return <div>No carousel content available.</div>;
  }

  const carouselSettings: CarouselSettings = element.settings ?? {};
  const hasNavigation = carouselSettings.withNavigation ?? true;

  const safeStyles = elementHelper.getSafeStyles(element);

  // Register events when element events change
  useEffect(() => {
    if (element.events) {
      registerEvents(element.events);
    }
  }, [element.events, registerEvents]);

  const eventHandlers = createEventHandlers();

  return (
    <Carousel
      ref={elementRef as any}
      data-element-id={element.id}
      data-element-type={element.type}
      {...getCommonProps(element)}
      {...eventHandlers}
      opts={carouselSettings}
      className={cn("w-full h-full")}
      style={{
        ...safeStyles,
        width: "100%",
        height: "100%",
        cursor: eventsActive ? "pointer" : "inherit",
        userSelect: eventsActive ? "none" : "auto",
      }}
      role="region"
      aria-roledescription="carousel"
    >
      <CarouselContent>
        {element.elements.map((slide) => (
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
