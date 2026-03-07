import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Project } from "@/features/projects";
import {
  getUserProjects,
  getProjectById,
  getProjectPages,
  createProject,
  updateProject,
  deleteProject,
} from "@/features/projects/api/project";
import { QUERY_CONFIG } from "@/utils/query/queryConfig";
import { showErrorToast, showSuccessToast } from "@/utils/errors/errorToast";
import { getErrorMessage, onMutationError } from "@/hooks/utils/mutationUtils";

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

export function useUserProjects() {
  return useQuery({
    queryKey: projectKeys.userProjects(),
    queryFn: () => getUserProjects(),
    ...QUERY_CONFIG.DEFAULT,
  });
}

export function useProject(projectId: string | null) {
  return useQuery({
    queryKey: projectKeys.detail(projectId || ""),
    queryFn: () => getProjectById({ data: { projectId: projectId! } }),
    enabled: !!projectId,
  });
}

export function useProjectPages(projectId: string | null) {
  return useQuery({
    queryKey: projectKeys.pages(projectId || ""),
    queryFn: () => getProjectPages({ data: { projectId: projectId! } }),
    enabled: !!projectId,
    ...QUERY_CONFIG.DEFAULT,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (project: Pick<Project, "id" | "name" | "description">) =>
      createProject({ data: project }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.userProjects() });
      showSuccessToast("Project created successfully!");
    },
    onError: onMutationError("Failed to create project"),
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, updates }: { projectId: string; updates: Partial<Project> }) =>
      updateProject({ data: { projectId, updates } }),
    onMutate: async ({ projectId, updates }) => {
      await queryClient.cancelQueries({ queryKey: projectKeys.detail(projectId) });
      await queryClient.cancelQueries({ queryKey: projectKeys.userProjects() });

      const previousProject = queryClient.getQueryData<Project>(
        projectKeys.detail(projectId),
      );
      const previousProjects = queryClient.getQueryData<Project[]>(
        projectKeys.userProjects(),
      );

      if (previousProject) {
        queryClient.setQueryData<Project>(projectKeys.detail(projectId), {
          ...previousProject,
          ...updates,
        });
      }

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
      queryClient.setQueryData(projectKeys.detail(projectId), data);
      queryClient.invalidateQueries({ queryKey: projectKeys.userProjects() });
      showSuccessToast("Project updated successfully!");
    },
    onError: (error, { projectId }, context) => {
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
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(projectId) });
      queryClient.invalidateQueries({ queryKey: projectKeys.userProjects() });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (projectId: string) => deleteProject({ data: { projectId } }),
    onMutate: async (projectId) => {
      await queryClient.cancelQueries({ queryKey: projectKeys.userProjects() });

      const previousProjects = queryClient.getQueryData<Project[]>(
        projectKeys.userProjects(),
      );

      queryClient.setQueryData<Project[]>(projectKeys.userProjects(), (old) =>
        old ? old.filter((p) => p.id !== projectId) : [],
      );

      return { previousProjects };
    },
    onSuccess: () => {
      showSuccessToast("Project deleted successfully!");
    },
    onError: (error, _projectId, context) => {
      if (context?.previousProjects) {
        queryClient.setQueryData(
          projectKeys.userProjects(),
          context.previousProjects,
        );
      }
      showErrorToast(getErrorMessage(error, "Failed to delete project"));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.userProjects() });
    },
  });
}

export function usePublishProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, publish }: { projectId: string; publish: boolean }) =>
      updateProject({ data: { projectId, updates: { published: publish } } }),
    onMutate: async ({ projectId, publish }) => {
      await queryClient.cancelQueries({ queryKey: projectKeys.detail(projectId) });
      await queryClient.cancelQueries({ queryKey: projectKeys.userProjects() });

      const previousProject = queryClient.getQueryData<Project>(
        projectKeys.detail(projectId),
      );
      const previousProjects = queryClient.getQueryData<Project[]>(
        projectKeys.userProjects(),
      );

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
      queryClient.setQueryData(projectKeys.detail(projectId), data);
      queryClient.invalidateQueries({ queryKey: projectKeys.userProjects() });
      showSuccessToast(
        publish ? "Project published successfully!" : "Project unpublished successfully!",
      );
    },
    onError: (error, { projectId }, context) => {
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
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(projectId) });
      queryClient.invalidateQueries({ queryKey: projectKeys.userProjects() });
    },
  });
}