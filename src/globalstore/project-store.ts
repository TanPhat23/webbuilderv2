"use client";

import { projectService } from "@/services/project";
import { create } from "zustand";
import type { Project } from "@/interfaces/project.interface";

/**
 * ProjectStore (client / optimistic)
 *
 * This store uses the `Project` interface from `src/interfaces/project.interface.ts`
 * which uses camelCase field names and string dates (ISO).
 *
 * It performs optimistic local updates but still calls `projectService.updateProject`
 * so the shape returned by the server should match the `Project` interface.
 *
 * Public API:
 * - loadProject(project)
 * - resetProject()
 * - setProject(project | null)
 * - updateProject(updates, id?) -> Promise<Project | null>
 */

type ProjectStoreState = {
  project: Project | null;
  isUpdating: boolean;
  errorMessage: string | null;

  loadProject: (project: Project) => void;
  resetProject: () => void;
  setProject: (project: Project | null) => void;

  updateProject: (
    updates: Partial<Project>,
    id?: string,
  ) => Promise<Project | null>;
};

const nowIso = () => new Date().toISOString();

export const useProjectStore = create<ProjectStoreState>((set, get) => {
  return {
    project: null,
    isUpdating: false,
    errorMessage: null,

    loadProject: (project: Project) => {
      set({ project, errorMessage: null });
    },

    resetProject: () => {
      set({ project: null, errorMessage: null });
    },

    setProject: (project: Project | null) => {
      set({ project });
    },

    updateProject: async (updates: Partial<Project>, id?: string) => {
      const current = get().project;
      const projectId =
        id ?? (updates as Partial<Project & { id?: string }>).id ?? current?.id;

      if (!projectId) {
        const msg = "No project id available for update";
        set({ errorMessage: msg });
        return null;
      }

      const optimistic: Project = {
        ...current,
        ...updates,
        updatedAt: nowIso(),
      } as Project;

      set({ project: optimistic, isUpdating: true, errorMessage: null });

      try {
        const serverProject = await projectService.updateProjectPartial(
          projectId,
          updates,
        );

        if (serverProject) {
          const mergedProject: Project = {
            ...serverProject,
            header: {
              ...serverProject.header,
              ...(typeof serverProject.header?.cssStyles === "undefined" &&
              typeof optimistic.header?.cssStyles !== "undefined"
                ? { cssStyles: optimistic.header.cssStyles }
                : {}),
            },
          };

          set({
            project: mergedProject,
            isUpdating: false,
            errorMessage: null,
          });
          return mergedProject;
        }

        set({
          isUpdating: false,
          errorMessage: "Update completed but no updated project returned",
        });
        return optimistic;
      } catch (err) {
        console.error("updateProject failed:", err);
        set({
          project: current ?? null,
          isUpdating: false,
          errorMessage: String(
            (err as Error)?.message ?? err ?? "Update failed",
          ),
        });
        return null;
      }
    },
  };
});
