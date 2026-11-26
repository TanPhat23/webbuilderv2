import type { QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { EditorElement } from "@webbuilder/site-runtime/types/global.type";
import type { DropPayload } from "../utils/element/dragPayload";
import { customComps } from "./customcomponents/customComponents";
import { ElementFactory } from "./ElementFactory";
import { componentFromDrop } from "./componentDrop";

export function resolveInsertedElement(
  payload: Exclude<DropPayload, { kind: "move" }>,
  pageId: string,
  queryClient: QueryClient,
  projectId: string | null,
  userId: string | null,
): EditorElement | undefined {
  const factory = ElementFactory.getInstance();
  if (payload.kind === "create") {
    return factory.createElement({ type: payload.elementType, pageId });
  }
  if (payload.kind === "template") {
    const template = customComps[payload.index];
    return template
      ? factory.createElementFromTemplate({ element: template, pageId })
      : undefined;
  }
  if (!projectId) return undefined;
  const instance = componentFromDrop(payload, queryClient, projectId, pageId, userId);
  if (!instance) toast.error("This component cannot be inserted here.");
  return instance;
}
