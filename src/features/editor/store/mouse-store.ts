import { create } from "zustand";
import type { User } from "@/features/collaboration";

type MousePosition = {
  x: number;
  y: number;
};

type Collaborator = User;

type AwarenessState = {
  cursor?: {
    x?: number;
    y?: number;
  };
  selectedElement?: string;
};

type Awareness = {
  getStates?: () => Map<unknown, AwarenessState>;
};

type MouseStore = {
  mousePositions: Record<string, MousePosition>;
  selectedElements: Record<string, string>;
  users: Record<string, Collaborator>;
  remoteUsers: Record<string, MousePosition>;
  selectedByUser: Record<string, string>;
  updateMousePosition: (userId: string, position: MousePosition) => void;
  removeMousePosition: (userId: string) => void;
  setSelectedElement: (userId: string, elementId: string) => void;
  removeSelectedElement: (userId: string) => void;
  setMousePositions: (positions: Record<string, MousePosition>) => void;
  setSelectedElements: (elements: Record<string, string>) => void;
  setUsers: (users: Record<string, Collaborator>) => void;
  setRemoteUsers: (remoteUsers: Record<string, MousePosition>) => void;
  setSelectedByUser: (selectedByUser: Record<string, string>) => void;
  syncFromAwareness: (awareness?: Awareness | null) => void;
  removeUser: (userId: string) => void;
  clear: () => void;
};

export const useMouseStore = create<MouseStore>((set, get) => ({
  mousePositions: {},
  selectedElements: {},
  users: {},
  remoteUsers: {},
  selectedByUser: {},

  updateMousePosition: (userId: string, position: MousePosition) => {
    set((state) => ({
      mousePositions: {
        ...state.mousePositions,
        [userId]: position,
      },
    }));
  },

  removeMousePosition: (userId: string) => {
    set((state) => {
      const { [userId]: _, ...rest } = state.mousePositions;
      return {
        mousePositions: rest,
      };
    });
  },

  setSelectedElement: (userId: string, elementId: string) => {
    set((state) => ({
      selectedElements: {
        ...state.selectedElements,
        [userId]: elementId,
      },
    }));
  },

  removeSelectedElement: (userId: string) => {
    set((state) => {
      const { [userId]: _, ...rest } = state.selectedElements;
      return {
        selectedElements: rest,
      };
    });
  },

  setMousePositions: (positions: Record<string, MousePosition>) => {
    set({ mousePositions: positions });
  },

  setSelectedElements: (elements: Record<string, string>) => {
    set({ selectedElements: elements });
  },

  setUsers: (users: Record<string, Collaborator>) => {
    set({ users });
  },

  removeUser: (userId: string) => {
    set((state) => {
      const { [userId]: _, ...rest } = state.users;
      return {
        users: rest,
      };
    });
  },

  setRemoteUsers: (remoteUsers: Record<string, MousePosition>) => {
    set({ remoteUsers });
  },

  setSelectedByUser: (selectedByUser: Record<string, string>) => {
    set({ selectedByUser });
  },

  syncFromAwareness: (awareness?: Awareness | null) => {
    if (!awareness || !awareness.getStates) return;

    const allStates = awareness.getStates();
    const remoteUsers: Record<string, MousePosition> = {};
    const selectedByUser: Record<string, string> = {};

    allStates.forEach((state, clientId) => {
      const clientIdString = String(clientId);
      if (state && state.cursor) {
        remoteUsers[clientIdString] = {
          x: state.cursor.x ?? 0,
          y: state.cursor.y ?? 0,
        };
      }
      if (state && state.selectedElement) {
        selectedByUser[clientIdString] = state.selectedElement;
      }
    });

    set({ remoteUsers, selectedByUser });
  },

  clear: () => {
    set({
      mousePositions: {},
      selectedElements: {},
      users: {},
      remoteUsers: {},
      selectedByUser: {},
    });
  },
}));

export const MouseStore = useMouseStore;
