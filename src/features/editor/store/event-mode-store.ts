import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PersistStorage, StorageValue } from "zustand/middleware";

interface EventModeState {
  // Event mode state
  isEventModeEnabled: boolean;
  setEventModeEnabled: (enabled: boolean) => void;
  toggleEventMode: () => void;

  // Per-element event override
  disabledElementEvents: Set<string>;
  disableElementEvents: (elementId: string) => void;
  enableElementEvents: (elementId: string) => void;
  toggleElementEvents: (elementId: string) => void;
  isElementEventsDisabled: (elementId: string) => boolean;
  clearDisabledElements: () => void;
}

type PersistedEventModeState = Pick<
  EventModeState,
  "isEventModeEnabled" | "disabledElementEvents"
>;

const customStorage: PersistStorage<EventModeState> = {
  getItem: (name: string): StorageValue<EventModeState> | null => {
    const item = localStorage.getItem(name);
    if (!item) return null;

    try {
      const parsed = JSON.parse(item) as StorageValue<PersistedEventModeState>;
      return {
        state: {
          isEventModeEnabled: parsed.state.isEventModeEnabled,
          disabledElementEvents: new Set(parsed.state.disabledElementEvents),
        } as EventModeState,
        version: parsed.version,
      };
    } catch {
      return null;
    }
  },
  setItem: (name: string, value: StorageValue<EventModeState>) => {
    const serialized = JSON.stringify({
      state: {
        isEventModeEnabled: value.state.isEventModeEnabled,
        disabledElementEvents: Array.from(value.state.disabledElementEvents),
      },
      version: value.version,
    });
    localStorage.setItem(name, serialized);
  },
  removeItem: (name: string) => localStorage.removeItem(name),
};

export const useEventModeStore = create<EventModeState>()(
  persist(
    (set, get) => ({
      isEventModeEnabled: false,
      setEventModeEnabled: (enabled: boolean) => {
        set({ isEventModeEnabled: enabled });
      },
      toggleEventMode: () => {
        set((state) => ({
          isEventModeEnabled: !state.isEventModeEnabled,
        }));
      },

      // Per-element event tracking
      disabledElementEvents: new Set<string>(),

      disableElementEvents: (elementId: string) => {
        set((state) => {
          const newSet = new Set(state.disabledElementEvents);
          newSet.add(elementId);
          return { disabledElementEvents: newSet };
        });
      },

      enableElementEvents: (elementId: string) => {
        set((state) => {
          const newSet = new Set(state.disabledElementEvents);
          newSet.delete(elementId);
          return { disabledElementEvents: newSet };
        });
      },

      toggleElementEvents: (elementId: string) => {
        set((state) => {
          const newSet = new Set(state.disabledElementEvents);
          if (newSet.has(elementId)) {
            newSet.delete(elementId);
          } else {
            newSet.add(elementId);
          }
          return { disabledElementEvents: newSet };
        });
      },

      isElementEventsDisabled: (elementId: string) => {
        return get().disabledElementEvents.has(elementId);
      },

      clearDisabledElements: () => {
        set({ disabledElementEvents: new Set<string>() });
      },
    }),
    {
      name: "event-mode-store",
      storage: customStorage,
    },
  ),
);
