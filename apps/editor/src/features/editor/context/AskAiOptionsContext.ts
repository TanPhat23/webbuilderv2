import { createContext, useContext } from "react";
import type { EditorElement } from "@webbuilder/site-runtime/types/global.type";

/** One entry of the context menu's "Ask AI" submenu. */
export interface AskAiOption {
  readonly id: string;
  readonly label: string;
  /** Hands this option's prompt for the element to the AI chat. */
  readonly run: (element: EditorElement | undefined) => void;
}

/**
 * Provided by whoever hosts the AI chat. The editor only renders the options,
 * so it never depends on the AI feature (which depends on the editor).
 */
export const AskAiOptionsContext = createContext<readonly AskAiOption[] | undefined>(
  undefined,
);

/** The "Ask AI" options, or undefined where no AI chat is mounted. */
export function useAskAiOptions(): readonly AskAiOption[] | undefined {
  return useContext(AskAiOptionsContext);
}
