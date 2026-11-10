
import { useEffect } from "react";
import { useParams } from '@tanstack/react-router';
import { useElementEvents } from "@/features/eventworkflows/hooks/useElementEvents";
import type { ElementEvents } from "@/features/editor";

interface UseEditorElementOptions {
  elementId: string;
  events?: ElementEvents | null;
}

export function useEditorElement({ elementId, events }: UseEditorElementOptions) {
  const { id: projectId } = useParams({ strict: false });

  const { elementRef, registerEvents, createEventHandlers, eventsActive } =
    useElementEvents({
      elementId,
      projectId: projectId ?? "",
    });

  useEffect(() => {
    if (events) registerEvents(events);
  }, [events, registerEvents]);

  const eventHandlers = createEventHandlers();

  return { elementRef, eventHandlers, eventsActive };
}
