import type { AgentPresence } from "@/features/collaboration/interfaces/websocket";
import { ElementStore } from "@/features/editor/store/element-store";
import {
  diffTrees,
  type TreeOp,
} from "@/features/editor/utils/element/treeDiff";
import type { EditorElement } from "@webbuilder/site-runtime/types/global.type";
import {
  applyTreeOpsLocally,
  planChoreographySteps,
  type ChoreographyAction,
  type ChoreographyStep,
} from "./choreographyPlanner";
import {
  useAgentPlaybackStore,
  type StartPlaybackInput,
  type StepPlaybackInput,
} from "./playbackStore";

export interface PlayEditParams {
  readonly beforeTree: EditorElement[];
  readonly afterTree: EditorElement[];
  readonly agentName: string;
  readonly summary: string;
  readonly onComplete?: () => void;
}

export interface LiveEditPlaybackSink {
  readonly start: (input: StartPlaybackInput) => void;
  readonly setStep: (input: StepPlaybackInput) => void;
  readonly clear: () => void;
}

export interface LiveEditPlayerDeps {
  readonly getElements: () => EditorElement[];
  readonly rememberTree: (previous: EditorElement[]) => void;
  readonly applyProgressiveStep: (
    next: EditorElement[],
    ops: readonly TreeOp[],
  ) => void;
  readonly playback: LiveEditPlaybackSink;
  readonly prefersReducedMotion: () => boolean;
  readonly setTimeoutFn?: (
    fn: () => void,
    ms: number,
  ) => ReturnType<typeof setTimeout>;
  readonly clearTimeoutFn?: (id: ReturnType<typeof setTimeout>) => void;
}

export interface LiveEditPlayer {
  readonly play: (params: PlayEditParams) => void;
  readonly flush: () => void;
  readonly isPlaying: () => boolean;
  readonly setPresenceBroadcaster: (
    broadcaster: ((agent: AgentPresence | null) => void) | null,
  ) => void;
}

interface ActiveSession {
  readonly finalTree: EditorElement[];
  readonly agentName: string;
  readonly steps: readonly ChoreographyStep[];
  readonly onComplete?: () => void;
  stepIndex: number;
  timerId: ReturnType<typeof setTimeout> | null;
}

const DELETE_BEAT_MS = 220;

function defaultPrefersReducedMotion(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function collectOpIds(ops: readonly TreeOp[]): readonly string[] {
  return ops.map((op) => (op.type === "create" ? op.element.id : op.id));
}

export function createLiveEditPlayer(deps: LiveEditPlayerDeps): LiveEditPlayer {
  const scheduleTimeout =
    deps.setTimeoutFn ?? ((fn: () => void, ms: number) => setTimeout(fn, ms));
  const cancelTimeout =
    deps.clearTimeoutFn ?? ((id: ReturnType<typeof setTimeout>) => clearTimeout(id));

  let active: ActiveSession | null = null;
  let presenceBroadcaster: ((agent: AgentPresence | null) => void) | null = null;

  const broadcastPresence = (agent: AgentPresence | null): void => {
    presenceBroadcaster?.(agent);
  };

  const clearTimer = (session: ActiveSession): void => {
    if (session.timerId !== null) {
      cancelTimeout(session.timerId);
      session.timerId = null;
    }
  };

  const finalizeSession = (session: ActiveSession): void => {
    clearTimer(session);
    const remainingOps = diffTrees(deps.getElements(), session.finalTree);
    if (remainingOps.length > 0) {
      deps.applyProgressiveStep(session.finalTree, remainingOps);
    }
    active = null;
    deps.playback.clear();
    broadcastPresence({
      active: false,
      name: session.agentName,
      status: "",
      elementId: null,
      action: null,
    });
    session.onComplete?.();
  };

  const broadcastStep = (
    session: ActiveSession,
    step: ChoreographyStep,
    action: ChoreographyAction,
  ): void => {
    broadcastPresence({
      active: true,
      name: session.agentName,
      status: step.label,
      elementId: step.targetElementId || null,
      action,
    });
  };

  const runStep = (session: ActiveSession): void => {
    if (active !== session) return;

    const step = session.steps[session.stepIndex];
    if (!step) {
      finalizeSession(session);
      return;
    }

    const stepNumber = session.stepIndex + 1;
    const touchedIds = collectOpIds(step.ops);

    if (step.action === "delete") {
      deps.playback.setStep({
        currentStep: stepNumber,
        targetElementId: step.targetElementId || null,
        action: step.action,
        statusLabel: step.label,
        touchedIds,
      });
      broadcastStep(session, step, step.action);

      session.timerId = scheduleTimeout(() => {
        if (active !== session) return;
        const nextTree = applyTreeOpsLocally(deps.getElements(), step.ops);
        deps.applyProgressiveStep(nextTree, step.ops);
        session.stepIndex += 1;

        const remainingDelay = Math.max(0, step.delayMs - DELETE_BEAT_MS);
        session.timerId = scheduleTimeout(() => {
          runStep(session);
        }, remainingDelay);
      }, DELETE_BEAT_MS);
      return;
    }

    const nextTree = applyTreeOpsLocally(deps.getElements(), step.ops);
    deps.applyProgressiveStep(nextTree, step.ops);
    deps.playback.setStep({
      currentStep: stepNumber,
      targetElementId: step.targetElementId || null,
      action: step.action,
      statusLabel: step.label,
      touchedIds,
    });
    broadcastStep(session, step, step.action);

    session.stepIndex += 1;
    session.timerId = scheduleTimeout(() => {
      runStep(session);
    }, step.delayMs);
  };

  const flush = (): void => {
    if (!active) return;
    finalizeSession(active);
  };

  const play = (params: PlayEditParams): void => {
    if (active) {
      flush();
    }

    const steps = planChoreographySteps(params.beforeTree, params.afterTree);
    const directOps = diffTrees(params.beforeTree, params.afterTree);

    if (steps.length === 0) {
      if (directOps.length > 0) {
        deps.rememberTree(params.beforeTree);
        deps.applyProgressiveStep(params.afterTree, directOps);
      }
      params.onComplete?.();
      return;
    }

    deps.rememberTree(params.beforeTree);

    if (deps.prefersReducedMotion()) {
      const remaining = diffTrees(deps.getElements(), params.afterTree);
      if (remaining.length > 0) {
        deps.applyProgressiveStep(params.afterTree, remaining);
      }
      params.onComplete?.();
      return;
    }

    const session: ActiveSession = {
      finalTree: params.afterTree,
      agentName: params.agentName,
      steps,
      onComplete: params.onComplete,
      stepIndex: 0,
      timerId: null,
    };

    active = session;
    deps.playback.start({
      agentName: params.agentName,
      totalSteps: steps.length,
      statusLabel: steps[0]?.label ?? params.summary,
    });
    runStep(session);
  };

  return {
    play,
    flush,
    isPlaying: (): boolean => active !== null,
    setPresenceBroadcaster: (
      broadcaster: ((agent: AgentPresence | null) => void) | null,
    ): void => {
      presenceBroadcaster = broadcaster;
    },
  };
}

export const liveEditPlayer: LiveEditPlayer = createLiveEditPlayer({
  getElements: (): EditorElement[] => ElementStore.getState().elements,
  rememberTree: (previous: EditorElement[]): void => {
    ElementStore.getState().rememberTree(previous);
  },
  applyProgressiveStep: (
    next: EditorElement[],
    ops: readonly TreeOp[],
  ): void => {
    ElementStore.getState().applyProgressiveStep(next, ops);
  },
  playback: {
    start: (input: StartPlaybackInput): void => {
      useAgentPlaybackStore.getState().start(input);
    },
    setStep: (input: StepPlaybackInput): void => {
      useAgentPlaybackStore.getState().setStep(input);
    },
    clear: (): void => {
      useAgentPlaybackStore.getState().clear();
    },
  },
  prefersReducedMotion: defaultPrefersReducedMotion,
});
