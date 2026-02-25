"use client";

import { createContext, useContext } from "react";
import type { ResponsiveStyles } from "@/interfaces/elements.interface";

interface ResizeContextValue {
  pendingStylesRef: React.RefObject<ResponsiveStyles | null>;
}

export const ResizeContext = createContext<ResizeContextValue | null>(null);

export function useResizeContext(): ResizeContextValue | null {
  return useContext(ResizeContext);
}
