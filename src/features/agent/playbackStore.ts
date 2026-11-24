import { create } from "zustand";
import type { ChoreographyAction } from "./choreographyPlanner";

export interface TouchedRecord {
  readonly action: ChoreographyAction;
  readonly at: number;
}

export type AgentPlaybackState =
  | {
      readonly status: "idle";
      readonly recentlyTouched: Readonly<Record<string, TouchedRecord>>;
    }
  | {
      readonly status: "playing";
      readonly agentName: string;
      readonly currentStep: number;
      readonly totalSteps: number;
      readonly targetElementId: string | null;
      readonly action: ChoreographyAction | null;
      readonly statusLabel: string;
      readonly recentlyTouched: Readonly<Record<string, TouchedRecord>>;
    };

export interface StartPlaybackInput {
  readonly agentName: string;
  readonly totalSteps: number;
  readonly statusLabel: string;
}

export interface StepPlaybackInput {
  readonly currentStep: number;
  readonly targetElementId: string | null;
  readonly action: ChoreographyAction;
  readonly statusLabel: string;
  readonly touchedIds?: readonly string[];
}

export interface AgentPlaybackStore {
  readonly playback: AgentPlaybackState;
  readonly start: (input: StartPlaybackInput) => void;
  readonly setStep: (input: StepPlaybackInput) => void;
  readonly clear: () => void;
  readonly pruneTouched: (maxAgeMs?: number) => void;
}

const DEFAULT_TOUCHED_TTL_MS = 650;

export const useAgentPlaybackStore = create<AgentPlaybackStore>((set) => ({
  playback: {
    status: "idle",
    recentlyTouched: {},
  },

  start: ({ agentName, totalSteps, statusLabel }): void => {
    set((state) => ({
      playback: {
        status: "playing",
        agentName,
        currentStep: 0,
        totalSteps,
        targetElementId: null,
        action: null,
        statusLabel,
        recentlyTouched: state.playback.recentlyTouched,
      },
    }));
  },

  setStep: ({
    currentStep,
    targetElementId,
    action,
    statusLabel,
    touchedIds,
  }): void => {
    const now = Date.now();
    set((state) => {
      if (state.playback.status !== "playing") {
        return state;
      }

      const nextTouched: Record<string, TouchedRecord> = {};
      for (const [id, record] of Object.entries(state.playback.recentlyTouched)) {
        if (now - record.at <= DEFAULT_TOUCHED_TTL_MS) {
          nextTouched[id] = record;
        }
      }

      const ids = touchedIds ?? (targetElementId ? [targetElementId] : []);
      for (const id of ids) {
        if (id) {
          nextTouched[id] = { action, at: now };
        }
      }

      return {
        playback: {
          ...state.playback,
          currentStep,
          targetElementId,
          action,
          statusLabel,
          recentlyTouched: nextTouched,
        },
      };
    });
  },

  clear: (): void => {
    set({
      playback: {
        status: "idle",
        recentlyTouched: {},
      },
    });
  },

  pruneTouched: (maxAgeMs = DEFAULT_TOUCHED_TTL_MS): void => {
    const now = Date.now();
    set((state) => {
      const entries = Object.entries(state.playback.recentlyTouched);
      if (entries.length === 0) return state;

      const kept: Record<string, TouchedRecord> = {};
      let removedAny = false;
      for (const [id, record] of entries) {
        if (now - record.at <= maxAgeMs) {
          kept[id] = record;
        } else {
          removedAny = true;
        }
      }

      if (!removedAny) return state;
      return {
        playback: {
          ...state.playback,
          recentlyTouched: kept,
        },
      };
    });
  },
}));
