"use client";
/**
 * useDashboard.ts
 *
 * Encapsulates all state, filtering, sorting, and mutation logic for the
 * project dashboard view. Keeps the Dashboard page component thin.
 */

import { useState, useMemo } from "react";
import { useUserProjects, useDeleteProject, usePublishProject } from "@/hooks";
import type {
  SortOption,
  ViewMode,
} from "../components/DashboardFilters";
import type { Project } from "@/features/projects";

export interface ProjectToDelete {
  id: string;
  name?: string;
}

export interface ProjectToPublish {
  id: string;
  name?: string;
  published: boolean;
}

/** Project with optional extended fields that may exist at runtime. */
type ProjectWithViews = Project & { views?: number };

/**
 * Hook that powers the project dashboard.
 *
 * Manages search, sort, filter state and exposes mutation handlers for
 * delete and publish actions with confirmation dialogs.
 */
export function useDashboard() {
  // State management
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("views");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [showPublishedOnly, setShowPublishedOnly] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] =
    useState<ProjectToDelete | null>(null);
  const [projectToPublish, setProjectToPublish] =
    useState<ProjectToPublish | null>(null);

  // Hooks
  const { data: projects, isLoading } = useUserProjects();
  const deleteProjectMutation = useDeleteProject();
  const publishProjectMutation = usePublishProject();

  // Filter and sort projects
  const filteredAndSortedProjects = useMemo(() => {
    if (!projects) return [];

    return projects
      .filter((project) => {
        const matchesSearch =
          (project.name ?? "")
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          (project.description ?? "")
            .toLowerCase()
            .includes(searchQuery.toLowerCase());
        const matchesPublished = !showPublishedOnly || !!project.published;
        return matchesSearch && matchesPublished;
      })
      .sort((a, b) => {
        let aValue: string | number;
        let bValue: string | number;

        switch (sortBy) {
          case "views":
            aValue = (a as ProjectWithViews).views ?? 0;
            bValue = (b as ProjectWithViews).views ?? 0;
            break;
          case "name":
            aValue = (a.name ?? "").toLowerCase();
            bValue = (b.name ?? "").toLowerCase();
            break;
          case "created":
            aValue = a.createdAt ? new Date(String(a.createdAt)).getTime() : 0;
            bValue = b.createdAt ? new Date(String(b.createdAt)).getTime() : 0;
            break;
          case "modified":
            aValue = a.updatedAt ? new Date(String(a.updatedAt)).getTime() : 0;
            bValue = b.updatedAt ? new Date(String(b.updatedAt)).getTime() : 0;
            break;
          default:
            aValue = 0;
            bValue = 0;
        }

        if (sortOrder === "asc") {
          return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        } else {
          return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
        }
      });
  }, [projects, searchQuery, sortBy, sortOrder, showPublishedOnly]);

  // Handlers
  const handleDeleteProject = (projectId: string) => {
    const project = projects?.find((p) => p.id === projectId);
    setProjectToDelete({
      id: projectId,
      name: project?.name,
    });
  };

  const handleConfirmDelete = () => {
    if (projectToDelete) {
      deleteProjectMutation.mutate(projectToDelete.id);
      setProjectToDelete(null);
    }
  };

  const handlePublishProject = (
    projectId: string,
    currentlyPublished: boolean,
  ) => {
    const project = projects?.find((p) => p.id === projectId);
    setProjectToPublish({
      id: projectId,
      name: project?.name,
      published: currentlyPublished,
    });
  };

  const handleConfirmPublish = () => {
    if (projectToPublish) {
      publishProjectMutation.mutate({
        projectId: projectToPublish.id,
        publish: !projectToPublish.published,
      });
      setProjectToPublish(null);
    }
  };

  return {
    // States
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    viewMode,
    setViewMode,
    showPublishedOnly,
    setShowPublishedOnly,
    isCreateDialogOpen,
    setIsCreateDialogOpen,
    projectToDelete,
    setProjectToDelete,
    projectToPublish,
    setProjectToPublish,

    // Computed
    filteredAndSortedProjects,
    isLoading,

    // Mutations
    deleteProjectMutation,
    publishProjectMutation,

    // Handlers
    handleDeleteProject,
    handleConfirmDelete,
    handlePublishProject,
    handleConfirmPublish,
  };
}
