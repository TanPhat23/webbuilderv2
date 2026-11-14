
import { useEffect } from "react";
import { useParams } from '@tanstack/react-router';
import { useElementEvents } from "@/features/eventworkflows/hooks/useElementEvents";
import type { ElementEvents } from "@/features/editor";

interface UseEditorElementOptions {
  elementId: string;
  events?: ElementEvents | null;
  settings?: unknown;
}

export function useEditorElement({ elementId, events, settings }: UseEditorElementOptions) {
  const { id: projectId } = useParams({ strict: false });

  const { elementRef, registerEvents, createEventHandlers, eventsActive } =
    useElementEvents({
      elementId,
      settings,
      projectId: projectId ?? "",
    });

  useEffect(() => {
    if (events) registerEvents(events);
  }, [events, registerEvents]);

  const eventHandlers = createEventHandlers();

  return { elementRef, eventHandlers, eventsActive };
}
