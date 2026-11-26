
import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import ConnectCliPanel from '@/features/agent/components/ConnectCliPanel';
import { ProjectSettingsDialog } from '@/features/projectsettings';
import {
  MoreHorizontal,
  Eye,
  Calendar,
  Trash2,
  Edit,
  Settings,
  Globe,
  EyeOff,
  ExternalLink,
} from "lucide-react";
import { buildPublicSiteUrl } from "@webbuilder/site-runtime/routing";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Project } from "@/features/projects";

interface ProjectCardProps {
  project: Project;
  onDelete: (projectId: string) => void;
  onPublish: (projectId: string, currentlyPublished: boolean) => void;
}

export function ProjectCard({
  project,
  onDelete,
  onPublish,
}: ProjectCardProps) {
  const navigate = useNavigate();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const handleNavigate = (path: string) => (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate({ to: path });
  };

  const handlePublishToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPublish(project.id ?? "", !!project.published);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(project.id ?? "");
  };

  const formattedDate = project.updatedAt
    ? new Date(String(project.updatedAt)).toLocaleDateString()
    : "—";

  const viewsCount = ((project.views ?? 0) as number).toLocaleString();

  return (
    <>
      <Card 
        className="group hover:shadow-lg transition-all duration-200 cursor-pointer p-0"
        onClick={() => navigate({ to: `/editor/${project.id}` })}
      >
        <CardHeader className="p-0">
          <div className="relative overflow-hidden rounded-t-lg">
            <img
              src="/placeholder.svg"
              alt={project.name ?? "Project thumbnail"}
              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
            />
            <div className="absolute top-2 right-2">
              <Badge variant={project.published ? "default" : "secondary"}>
                {project.published ? "Published" : "Draft"}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h3
              className="font-semibold text-lg truncate pr-2"
            >
              {project.name}
            </h3>

            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={handleNavigate(`/editor/${project.id}`)}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Project
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    setSettingsOpen(true);
                  }}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Project Settings
                </DropdownMenuItem>

                {project.published && project.subdomain && (
                  <DropdownMenuItem asChild>
                    <a
                      href={buildPublicSiteUrl(project.subdomain)}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Visit Live Site
                    </a>
                  </DropdownMenuItem>
                )}

                <DropdownMenuSeparator />

                <DropdownMenuItem onClick={handlePublishToggle}>
                  {project.published ? (
                    <>
                      <EyeOff className="mr-2 h-4 w-4" />
                      Unpublish
                    </>
                  ) : (
                    <>
                      <Globe className="mr-2 h-4 w-4" />
                      Publish
                    </>
                  )}
                </DropdownMenuItem>

                <DropdownMenuItem
                  className="text-destructive"
                  onClick={handleDelete}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {project.description || "No description provided"}
          </p>

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center">
              <Eye className="mr-1 h-4 w-4" />
              {viewsCount} views
            </div>
            <div className="flex items-center">
              <Calendar className="mr-1 h-4 w-4" />
              {formattedDate}
            </div>
          </div>
        </CardContent>
      </Card>
      <ProjectSettingsDialog
        projectId={project.id ?? ""}
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        mcpConnectPanel={<ConnectCliPanel />}
      />
    </>
  );
}