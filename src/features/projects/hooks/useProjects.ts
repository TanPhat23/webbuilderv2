"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { projectService } from "@/features/projects";
import type { Project } from "@/features/projects";
import { QUERY_CONFIG } from "@/utils/query/queryConfig";
import {
  showErrorToast,
  showSuccessToast,
} from "@/utils/errors/errorToast";
import {
  getErrorMessage,
  onMutationError,
} from "@/hooks/utils/mutationUtils";

// Query keys
export const projectKeys = {
  all: ["projects"] as const,
  lists: () => [...projectKeys.all, "list"] as const,
  list: (filters?: Record<string, unknown>) =>
    [...projectKeys.lists(), filters] as const,
  details: () => [...projectKeys.all, "detail"] as const,
  detail: (id: string) => [...projectKeys.details(), id] as const,
  userProjects: () => [...projectKeys.all, "user"] as const,
  pages: (projectId: string) =>
    [...projectKeys.detail(projectId), "pages"] as const,
};

/** Hook to get all user projects. */
export function useUserProjects() {
  return useQuery({
    queryKey: projectKeys.userProjects(),
    queryFn: projectService.getUserProjects,
    ...QUERY_CONFIG.DEFAULT,
  });
}

/** Hook to get a specific project by ID. */
export function useProject(projectId: string | null) {
  return useQuery({
    queryKey: projectKeys.detail(projectId || ""),
    queryFn: async () => {
      if (!projectId) throw new Error("Project ID is required");
      return await projectService.getProjectById(projectId);
    },
    enabled: !!projectId,
  });
}

/** Hook to get project pages. */
export function useProjectPages(projectId: string | null) {
  return useQuery({
    queryKey: projectKeys.pages(projectId || ""),
    queryFn: async () => {
      if (!projectId) throw new Error("Project ID is required");
      return await projectService.getProjectPages(projectId);
    },
    enabled: !!projectId,
    ...QUERY_CONFIG.DEFAULT,
  });
}

/** Hook to create a new project. */
export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (project: Project) => {
      return await projectService.createProject(project);
    },
    onSuccess: (data) => {
      // Invalidate and refetch user projects
      queryClient.invalidateQueries({ queryKey: projectKeys.userProjects() });

      // Optimistically add to cache
      queryClient.setQueryData<Project[]>(projectKeys.userProjects(), (old) => {
        return old ? [data, ...old] : [data];
      });

      showSuccessToast("Project created successfully!");
    },
    onError: onMutationError("Failed to create project"),
  });
}

/** Hook to update a project. */
export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      projectId,
      updates,
    }: {
      projectId: string;
      updates: Partial<Project>;
    }) => {
      return await projectService.updateProjectPartial(projectId, updates);
    },
    onMutate: async ({ projectId, updates }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: projectKeys.detail(projectId),
      });
      await queryClient.cancelQueries({
        queryKey: projectKeys.userProjects(),
      });

      // Snapshot the previous values
      const previousProject = queryClient.getQueryData<Project>(
        projectKeys.detail(projectId),
      );
      const previousProjects = queryClient.getQueryData<Project[]>(
        projectKeys.userProjects(),
      );

      // Optimistically update the project
      if (previousProject) {
        queryClient.setQueryData<Project>(projectKeys.detail(projectId), {
          ...previousProject,
          ...updates,
        });
      }

      // Optimistically update in the list
      if (previousProjects) {
        queryClient.setQueryData<Project[]>(
          projectKeys.userProjects(),
          previousProjects.map((p) =>
            p.id === projectId ? { ...p, ...updates } : p,
          ),
        );
      }

      return { previousProject, previousProjects };
    },
    onSuccess: (data, { projectId }) => {
      // Update with server data
      queryClient.setQueryData(projectKeys.detail(projectId), data);
      queryClient.invalidateQueries({ queryKey: projectKeys.userProjects() });

      showSuccessToast("Project updated successfully!");
    },
    onError: (error, { projectId }, context) => {
      // Rollback on error
      if (context?.previousProject) {
        queryClient.setQueryData(
          projectKeys.detail(projectId),
          context.previousProject,
        );
      }
      if (context?.previousProjects) {
        queryClient.setQueryData(
          projectKeys.userProjects(),
          context.previousProjects,
        );
      }

      showErrorToast(getErrorMessage(error, "Failed to update project"));
    },
    onSettled: (_, __, { projectId }) => {
      queryClient.invalidateQueries({
        queryKey: projectKeys.detail(projectId),
      });
      queryClient.invalidateQueries({ queryKey: projectKeys.userProjects() });
    },
  });
}

/** Hook to delete a project. */
export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (projectId: string) => {
      await projectService.deleteProject(projectId);
      return projectId;
    },
    onMutate: async (projectId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: projectKeys.userProjects() });

      // Snapshot the previous value
      const previousProjects = queryClient.getQueryData<Project[]>(
        projectKeys.userProjects(),
      );

      // Optimistically remove the project
      queryClient.setQueryData<Project[]>(projectKeys.userProjects(), (old) =>
        old ? old.filter((p) => p.id !== projectId) : [],
      );

      return { previousProjects };
    },
    onSuccess: () => {
      showSuccessToast("Project deleted successfully!");
    },
    onError: (error, _projectId, context) => {
      // Rollback on error
      if (context?.previousProjects) {
        queryClient.setQueryData(
          projectKeys.userProjects(),
          context.previousProjects,
        );
      }

      showErrorToast(getErrorMessage(error, "Failed to delete project"));
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: projectKeys.userProjects() });
    },
  });
}

/** Hook to publish/unpublish a project. */
export function usePublishProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      projectId,
      publish,
    }: {
      projectId: string;
      publish: boolean;
    }) => {
      return await projectService.updateProjectPartial(projectId, {
        published: publish,
      });
    },
    onMutate: async ({ projectId, publish }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: projectKeys.detail(projectId),
      });
      await queryClient.cancelQueries({
        queryKey: projectKeys.userProjects(),
      });

      // Snapshot the previous values
      const previousProject = queryClient.getQueryData<Project>(
        projectKeys.detail(projectId),
      );
      const previousProjects = queryClient.getQueryData<Project[]>(
        projectKeys.userProjects(),
      );

      // Optimistically update
      if (previousProject) {
        queryClient.setQueryData<Project>(projectKeys.detail(projectId), {
          ...previousProject,
          published: publish,
        });
      }

      if (previousProjects) {
        queryClient.setQueryData<Project[]>(
          projectKeys.userProjects(),
          previousProjects.map((p) =>
            p.id === projectId ? { ...p, published: publish } : p,
          ),
        );
      }

      return { previousProject, previousProjects };
    },
    onSuccess: (data, { projectId, publish }) => {
      // Update with server data
      queryClient.setQueryData(projectKeys.detail(projectId), data);
      queryClient.invalidateQueries({ queryKey: projectKeys.userProjects() });

      showSuccessToast(
        publish
          ? "Project published successfully!"
          : "Project unpublished successfully!",
      );
    },
    onError: (error, { projectId }, context) => {
      // Rollback on error
      if (context?.previousProject) {
        queryClient.setQueryData(
          projectKeys.detail(projectId),
          context.previousProject,
        );
      }
      if (context?.previousProjects) {
        queryClient.setQueryData(
          projectKeys.userProjects(),
          context.previousProjects,
        );
      }

      showErrorToast(getErrorMessage(error, "Failed to update project"));
    },
    onSettled: (_, __, { projectId }) => {
      queryClient.invalidateQueries({
        queryKey: projectKeys.detail(projectId),
      });
      queryClient.invalidateQueries({ queryKey: projectKeys.userProjects() });
    },
  });
}
