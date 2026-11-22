import React, { useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import type { EditorElement } from "@/types/global.type";
import type { Step } from "../schema";
import { createVisibleTracker, indexInteractions } from "../runtime/dispatch";
import { browserPlatform } from "../runtime/executors";
import { collectPageIds, type PlatformFactory } from "../runtime/hostDom";
import { createVariableStore, safeStorage, type VariableDef } from "../runtime/variables";
import {
  useInteractionEvents,
  type ImageErrorState,
} from "../hooks/useInteractionEvents";
import { useVisibleInteractions } from "../hooks/useVisibleInteractions";
import RunLogPanel from "./RunLogPanel";

const NO_VARIABLES: Record<string, VariableDef> = {};
const NO_FLOWS: Record<string, { do: Step[] }> = {};

interface InteractionHostProps {
  elements: EditorElement[];
  enabled: boolean;
  namespace: string;
  showLog?: boolean;
  platform?: PlatformFactory;
  variables?: Record<string, VariableDef>;
  flows?: Record<string, { do: Step[] }>;
  children: React.ReactNode;
}

export function InteractionHost({
  elements,
  enabled,
  namespace,
  showLog = false,
  platform = browserPlatform,
  variables = NO_VARIABLES,
  flows = NO_FLOWS,
  children,
}: InteractionHostProps) {
  const ref = useRef<HTMLDivElement>(null);
  const hostState = useRef({
    namespace,
    tracker: createVisibleTracker(),
    fired: new Map<string, Set<string>>(),
    imageErrors: new WeakMap<Element, ImageErrorState>(),
  });
  if (hostState.current.namespace !== namespace) {
    hostState.current = {
      namespace,
      tracker: createVisibleTracker(),
      fired: new Map(),
      imageErrors: new WeakMap(),
    };
  }

  const index = useMemo(() => indexInteractions(elements), [elements]);
  const ids = useMemo(() => collectPageIds(elements), [elements]);
  const idsRef = useRef(ids);
  idsRef.current = ids;

  const vars = useMemo(
    () =>
      createVariableStore(variables, {
        namespace,
        session: safeStorage(() => window.sessionStorage),
        local: safeStorage(() => window.localStorage),
      }),
    [variables, namespace],
  );

  useInteractionEvents({
    rootRef: ref,
    enabled,
    platform,
    flows,
    vars,
    index,
    idsRef,
    fired: hostState.current.fired,
    imageErrors: hostState.current.imageErrors,
  });

  useVisibleInteractions({
    rootRef: ref,
    tracker: hostState.current.tracker,
    enabled,
    index,
    idsRef,
    platform,
    flows,
    vars,
  });

  return (
    <>
      <div ref={ref} style={{ display: "contents" }}>
        {children}
      </div>
      {showLog && enabled && typeof document !== "undefined"
        ? createPortal(<RunLogPanel />, document.body)
        : null}
    </>
  );
}

export default InteractionHost;
