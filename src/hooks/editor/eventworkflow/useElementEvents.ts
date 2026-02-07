"use client";

/**
 * useElementEvents Hook
 * Provides event handling capabilities for elements in preview mode
 * Respects global event mode toggle to avoid interference with element handler
 */

import { useState, useRef, useEffect, useCallback } from "react";
import {
  EventHandler,
  ElementEvents,
  EventExecutionContext,
} from "@/interfaces/events.interface";
import { eventExecutor } from "@/lib/events/eventExecutor";
import { useEventModeStore } from "@/globalstore/eventmodestore";
import { useElementConnections } from "@/hooks/editor/eventworkflow/useElementEventWorkflows";
import { useEventWorkflows } from "@/hooks/editor/eventworkflow/useEventWorkflows";
import { transformWorkflowToEventHandlers } from "@/lib/utils/workflow/workflowTransformer";

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

  const [elementState, setElementState] = useState<Record<string, any>>({});
  const elementRef = useRef<HTMLElement | null>(null);
  const eventsMapRef = useRef<Map<string, EventHandler[]>>(new Map());
  const previousWorkflowHandlersRef = useRef<ElementEvents | null>(null);

  // Get event mode state
  const { isEventModeEnabled, isElementEventsDisabled } = useEventModeStore();

  // React Query hooks handle fetching, caching, stale-time, and deduplication
  const { data: connections = [] } = useElementConnections(elementId);
  const { data: workflows = [] } = useEventWorkflows(projectId || "");

  // Determine if events should be active
  const shouldEventsBeActive = enableEventsOverride ? true : isEventModeEnabled;
  const areEventsDisabledForElement = isElementEventsDisabled(elementId);
  const eventsActive = shouldEventsBeActive && !areEventsDisabledForElement;

  /**
   * Register event handlers for an element
   */
  const registerEvents = useCallback(
    (elementEvents: ElementEvents) => {
      eventsMapRef.current.clear();
      if (!eventsActive) {
        return;
      }
      Object.entries(elementEvents).forEach(([eventType, handlers]) => {
        if (Array.isArray(handlers)) {
          eventsMapRef.current.set(eventType, handlers);
        }
      });
    },
    [elementId, eventsActive],
  );

  /**
   * Handle event and execute associated handlers
   */
  const handleEvent = async (
    eventType: string,
    nativeEvent: React.SyntheticEvent | Event,
  ) => {
    // Skip if events are not active
    if (!eventsActive) {
      return;
    }

    const handlers = eventsMapRef.current.get(eventType);

    if (!handlers || handlers.length === 0) {
      return;
    }

    for (const handler of handlers) {
      const context: EventExecutionContext = {
        element: elementRef.current,
        event: nativeEvent,
        elementState,
        globalState,
        elementInstance: elementRef.current,
      };

      try {
        await eventExecutor.execute(handler, context);

        // Update state if changed
        onStateChange?.(elementState);
      } catch (error) {
        console.error(`Error handling ${eventType}:`, error);
      }
    }
  };

  /**
   * Create event handlers for all registered events
   */
  const createEventHandlers = () => {
    const handlers: Record<string, (e: Event) => void> = {};

    if (!eventsActive) {
      return handlers;
    }

    eventsMapRef.current.forEach((_, eventType) => {
      handlers[eventType] = (e: Event) => {
        handleEvent(eventType, e);
      };
    });

    return handlers;
  };

  /**
   * Update element state
   */
  const updateState = (key: string, value: unknown) => {
    setElementState((prev) => {
      const newState = { ...prev, [key]: value };
      onStateChange?.(newState);
      return newState;
    });
  };

  /**
   * Get current element state
   */
  const getState = (key?: string) => {
    if (key) {
      return elementState[key];
    }
    return elementState;
  };

  /**
   * Enable events for this element
   */
  const enableEvents = () => {
    useEventModeStore.getState().enableElementEvents(elementId);
  };

  /**
   * Disable events for this element
   */
  const disableEvents = () => {
    useEventModeStore.getState().disableElementEvents(elementId);
  };

  /**
   * Check if events are currently active
   */
  const areEventsEnabled = () => {
    return eventsActive;
  };

  // Register workflow handlers dynamically
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

    // Only log if workflow handlers have actually changed
    const handlersChanged =
      JSON.stringify(workflowHandlers) !==
      JSON.stringify(previousWorkflowHandlersRef.current);

    if (handlersChanged) {
      console.log(
        `Registering workflow events for element ${elementId}:`,
        workflowHandlers,
      );
      previousWorkflowHandlersRef.current = workflowHandlers;
    }

    registerEvents(workflowHandlers);
  }, [
    projectId,
    elementId,
    eventsActive,
    connections,
    workflows,
    registerEvents,
  ]);

  // Re-register events when event mode changes
  useEffect(() => {
    // Events will be re-registered through the registerEvents call
    // This hook dependency ensures we respond to mode changes
  }, [eventsActive, isEventModeEnabled, areEventsDisabledForElement]);

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
