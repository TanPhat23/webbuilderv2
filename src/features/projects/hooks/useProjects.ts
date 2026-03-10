import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Project } from "@/features/projects";
import {
  getUserProjects,
  getProjectById,
  getProjectPages,
  createProject,
  updateProject,
  deleteProject,
} from "@/features/projects/api/project.api";
import { QUERY_CONFIG } from "@/utils/query/queryConfig";
import { showSuccessToast } from "@/utils/errors/errorToast";
import { onMutationError } from "@/hooks/utils/mutationUtils";
import type {
  CreateProjectInput,
  ProjectUpdateFields,
} from "../schema/project";

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
  return useQuery<Project>({
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
    mutationFn: (project: CreateProjectInput) =>
      createProject({
        data: {
          ...project,
          description: project.description ?? undefined,
        },
      }),
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
    mutationFn: ({
      projectId,
      updates,
    }: {
      projectId: string;
      updates: ProjectUpdateFields;
    }) => updateProject({ data: { projectId, updates } }),
    onSuccess: (data, { projectId }) => {
      queryClient.setQueryData(projectKeys.detail(projectId), data);
      queryClient.invalidateQueries({ queryKey: projectKeys.userProjects() });
      showSuccessToast("Project updated successfully!");
    },
    onError: onMutationError("Failed to update project"),
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (projectId: string) => deleteProject({ data: { projectId } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.userProjects() });
      showSuccessToast("Project deleted successfully!");
    },
    onError: onMutationError("Failed to delete project"),
  });
}

export function usePublishProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      publish,
    }: {
      projectId: string;
      publish: boolean;
    }) =>
      updateProject({ data: { projectId, updates: { published: publish } } }),
    onSuccess: (data, { projectId, publish }) => {
      queryClient.setQueryData(projectKeys.detail(projectId), data);
      queryClient.invalidateQueries({ queryKey: projectKeys.userProjects() });
      showSuccessToast(
        publish
          ? "Project published successfully!"
          : "Project unpublished successfully!",
      );
    },
    onError: onMutationError("Failed to update project"),
  });
}
