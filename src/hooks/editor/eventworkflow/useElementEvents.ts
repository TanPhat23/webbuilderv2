"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import {
  EventHandler,
  ElementEvents,
  EventExecutionContext,
} from "@/interfaces/events.interface";
import { eventExecutor } from "@/lib/events/eventExecutor";
import { useEventModeStore } from "@/globalstore/event-mode-store";
import { useElementConnections } from "@/hooks/editor/eventworkflow/useElementEventWorkflows";
import { useEventWorkflows } from "@/hooks/editor/eventworkflow/useEventWorkflows";
import { transformWorkflowToEventHandlers } from "@/lib/utils/workflow/workflowTransformer";
import { usePageStore } from "@/globalstore/page-store";

interface UseElementEventsOptions {
  elementId: string;
  onStateChange?: (newState: Record<string, any>) => void;
  globalState?: Record<string, any>;
  enableEventsOverride?: boolean;
  projectId?: string;
}

export function useElementEvents(options: UseElementEventsOptions) {
  const {
    elementId,
    onStateChange,
    globalState,
    enableEventsOverride,
    projectId,
  } = options;

  const pageId = usePageStore((state) => state.currentPage?.Id);

  const [elementState, setElementState] = useState<Record<string, any>>({});
  const elementStateRef = useRef<Record<string, any>>({});
  const elementRef = useRef<HTMLElement | null>(null);
  const eventsMapRef = useRef<Map<string, EventHandler[]>>(new Map());
  const previousWorkflowHandlersRef = useRef<ElementEvents | null>(null);

  // Keep ref in sync so handleEvent never reads stale closure state.
  useEffect(() => {
    elementStateRef.current = elementState;
  }, [elementState]);

  const { isEventModeEnabled, isElementEventsDisabled } = useEventModeStore();

  const { data: connections = [] } = useElementConnections(elementId, pageId);
  const { data: workflows = [] } = useEventWorkflows(projectId || "");

  const shouldEventsBeActive = enableEventsOverride ? true : isEventModeEnabled;
  const areEventsDisabledForElement = isElementEventsDisabled(elementId);
  const eventsActive = shouldEventsBeActive && !areEventsDisabledForElement;

  const registerEvents = useCallback(
    (elementEvents: ElementEvents) => {
      eventsMapRef.current.clear();
      if (!eventsActive) return;
      Object.entries(elementEvents).forEach(([eventType, handlers]) => {
        if (Array.isArray(handlers)) {
          eventsMapRef.current.set(eventType, handlers);
        }
      });
    },
    [eventsActive],
  );

  const handleEvent = useCallback(
    async (eventType: string, nativeEvent: React.SyntheticEvent | Event) => {
      if (!eventsActive) return;

      const handlers = eventsMapRef.current.get(eventType);
      if (!handlers || handlers.length === 0) return;

      for (const handler of handlers) {
        const context: EventExecutionContext = {
          element: elementRef.current,
          event: nativeEvent,
          elementState: elementStateRef.current,
          globalState,
          elementInstance: elementRef.current,
        };

        try {
          await eventExecutor.execute(handler, context);
          onStateChange?.(elementStateRef.current);
        } catch (error) {
          console.error(`Error handling ${eventType}:`, error);
        }
      }
    },
    [eventsActive, globalState, onStateChange],
  );

  const createEventHandlers = useCallback(() => {
    const handlers: Record<string, (e: Event) => void> = {};
    if (!eventsActive) return handlers;

    eventsMapRef.current.forEach((_, eventType) => {
      handlers[eventType] = (e: Event) => handleEvent(eventType, e);
    });

    return handlers;
  }, [eventsActive, handleEvent]);

  const updateState = useCallback(
    (key: string, value: unknown) => {
      setElementState((prev) => {
        const newState = { ...prev, [key]: value };
        onStateChange?.(newState);
        return newState;
      });
    },
    [onStateChange],
  );

  const getState = useCallback((key?: string) => {
    if (key) return elementStateRef.current[key];
    return elementStateRef.current;
  }, []);

  const enableEvents = useCallback(() => {
    useEventModeStore.getState().enableElementEvents(elementId);
  }, [elementId]);

  const disableEvents = useCallback(() => {
    useEventModeStore.getState().disableElementEvents(elementId);
  }, [elementId]);

  const areEventsEnabled = useCallback(() => eventsActive, [eventsActive]);

  useEffect(() => {
    if (!projectId || !eventsActive) return;

    const workflowHandlers: ElementEvents = {};

    for (const conn of connections) {
      const workflow = workflows.find((w) => w.id === conn.workflowId);
      if (workflow?.canvasData) {
        const handlers = transformWorkflowToEventHandlers(workflow.canvasData);
        if (!workflowHandlers[conn.eventName]) {
          workflowHandlers[conn.eventName] = [];
        }
        workflowHandlers[conn.eventName].push(...handlers);
      }
    }

    const handlersChanged =
      JSON.stringify(workflowHandlers) !==
      JSON.stringify(previousWorkflowHandlersRef.current);

    if (handlersChanged) {
      previousWorkflowHandlersRef.current = workflowHandlers;
      registerEvents(workflowHandlers);
    }
  }, [
    projectId,
    elementId,
    eventsActive,
    connections,
    workflows,
    registerEvents,
  ]);

  return {
    elementRef,
    registerEvents,
    handleEvent,
    createEventHandlers,
    updateState,
    getState,
    state: elementState,
    enableEvents,
    disableEvents,
    areEventsEnabled,
    eventsActive,
  };
}
