"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ProjectCard } from "@/features/dashboard";
import { ProjectListItem } from "@/features/dashboard";
import { DashboardFilters } from "@/features/dashboard";
import { EmptyState } from "@/features/dashboard";
import { DeleteProjectDialog } from "@/features/dashboard";
import { PublishProjectDialog } from "@/features/dashboard";
import { CreateProjectDialog } from "@/features/dashboard";
import { useDashboard } from "@/hooks";

export default function Dashboard() {
  const {
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
  } = useDashboard();

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your projects...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Header with Sidebar Trigger and Breadcrumbs */}
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem>
              <BreadcrumbPage>Projects</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Projects</h1>
            <p className="text-muted-foreground">
              Manage and track your project performance
            </p>
          </div>

          {/* Create Project Dialog */}
          <CreateProjectDialog
            isCreateDialogOpen={isCreateDialogOpen}
            setIsCreateDialogOpen={setIsCreateDialogOpen}
          />
        </div>

        {/* Filters and Controls */}
        <DashboardFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          sortBy={sortBy}
          onSortByChange={setSortBy}
          sortOrder={sortOrder}
          onSortOrderChange={() =>
            setSortOrder(sortOrder === "asc" ? "desc" : "asc")
          }
          showPublishedOnly={showPublishedOnly}
          onPublishedFilterToggle={() =>
            setShowPublishedOnly(!showPublishedOnly)
          }
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />

        {/* Projects Display */}
        {filteredAndSortedProjects.length === 0 ? (
          <EmptyState
            hasSearchQuery={!!searchQuery || showPublishedOnly}
            onCreateProject={() => setIsCreateDialogOpen(true)}
          />
        ) : (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                : "space-y-4"
            }
          >
            {filteredAndSortedProjects.map((project) =>
              viewMode === "grid" ? (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onDelete={handleDeleteProject}
                  onPublish={handlePublishProject}
                />
              ) : (
                <ProjectListItem
                  key={project.id}
                  project={project}
                  onDelete={handleDeleteProject}
                  onPublish={handlePublishProject}
                />
              ),
            )}
          </div>
        )}

        <DeleteProjectDialog
          open={!!projectToDelete}
          onOpenChange={(open) => !open && setProjectToDelete(null)}
          onConfirm={handleConfirmDelete}
          isDeleting={deleteProjectMutation.isPending}
          projectName={projectToDelete?.name}
        />

        <PublishProjectDialog
          open={!!projectToPublish}
          onOpenChange={(open) => !open && setProjectToPublish(null)}
          onConfirm={handleConfirmPublish}
          isPublishing={publishProjectMutation.isPending}
          projectName={projectToPublish?.name}
          currentlyPublished={!!projectToPublish?.published}
        />
      </div>
    </>
  );
}
