import { createContext, useContext } from "react";
import type { CollaborationContextValue } from "../interfaces/websocket";

export const CollaborationContext =
  createContext<CollaborationContextValue | null>(null);

export function useCollaboration(): CollaborationContextValue {
  const context = useContext(CollaborationContext);
  if (!context) {
    throw new Error(
      "useCollaboration must be used within a <CollaborationProvider>",
    );
  }
  return context;
}

export function useCollaborationOptional(): CollaborationContextValue | null {
  return useContext(CollaborationContext);
}
