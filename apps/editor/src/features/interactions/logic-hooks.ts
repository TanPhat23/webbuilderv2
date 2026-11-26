// src/features/interactions/logic-hooks.ts
import { useEffect, useMemo } from "react";
import { useParams, useSearch } from "@tanstack/react-router";
import { mergedLogic, useLogicStore, type MergedLogic } from "./logic-store";

/** Loads the project's logic and returns the variables and flows visible on the current page. */
export function useActiveLogic(): MergedLogic & { projectId: string | null; pageId: string | null } {
  const { id } = useParams({ strict: false }) as { id?: string };
  const { page } = useSearch({ strict: false }) as { page?: string };
  const projectId = id ?? null;
  const pageId = page || null;
  const load = useLogicStore((s) => s.load);
  const project = useLogicStore((s) => s.project);
  const pages = useLogicStore((s) => s.pages);

  useEffect(() => {
    if (projectId) load(projectId);
  }, [projectId, load]);

  const merged = useMemo(() => mergedLogic({ project, pages }, pageId), [project, pages, pageId]);
  return { ...merged, projectId, pageId };
}
