"use client";

import { Button } from "@/components/ui/button";
import { Plus, BarChart3 } from "lucide-react";

interface EmptyStateProps {
  hasSearchQuery: boolean;
  onCreateProject: () => void;
}

export function EmptyState({
  hasSearchQuery,
  onCreateProject,
}: EmptyStateProps) {
  return (
    <div className="text-center py-12">
      <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
        <BarChart3 className="h-12 w-12 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">No projects found</h3>
      <p className="text-muted-foreground mb-4">
        {hasSearchQuery
          ? "Try adjusting your search terms or filters"
          : "Create your first project to get started"}
      </p>
      {!hasSearchQuery && (
        <Button onClick={onCreateProject}>
          <Plus className="mr-2 h-4 w-4" />
          Create Project
        </Button>
      )}
    </div>
  );
}
