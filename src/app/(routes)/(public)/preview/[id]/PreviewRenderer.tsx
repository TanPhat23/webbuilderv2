"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { projectService } from "@/features/projects";
import { elementService } from "@/features/editor";
import PreviewElementLoader from "@/features/preview/components/PreviewElementLoader";

interface PreviewRendererProps {
  projectId: string;
}

export default function PreviewRenderer({ projectId }: PreviewRendererProps) {
  const {
    data: project,
    isLoading: projectLoading,
    error: projectError,
  } = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => projectService.getProjectPublic(projectId),
  });

  const {
    data: elements,
    isLoading: elementsLoading,
    error: elementsError,
  } = useQuery({
    queryKey: ["elements", projectId],
    queryFn: () => elementService.getElementsPublic(projectId),
  });

  if (projectLoading || elementsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen min-w-screen">
        <div className="text-lg">Loading preview...</div>
      </div>
    );
  }

  if (projectError || elementsError) {
    return (
      <div className="flex items-center justify-center min-h-screen min-w-screen">
        <div className="text-lg text-destructive">
          Error loading preview:{" "}
          {projectError?.message || elementsError?.message}
        </div>
      </div>
    );
  }

  if (!project || !elements) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Project not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen min-w-screen bg-white">
      <style
        dangerouslySetInnerHTML={{
          __html: (project.styles?.css as string) || "",
        }}
      />
      <PreviewElementLoader elements={elements} />
    </div>
  );
}
