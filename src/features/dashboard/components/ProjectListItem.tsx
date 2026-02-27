"use client";

import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Eye,
  Calendar,
  BarChart3,
  Trash2,
  Edit,
  Settings,
  Globe,
  EyeOff,
} from "lucide-react";
import type { Project } from "@/features/projects";
import { useRouter } from "next/navigation";

interface ProjectListItemProps {
  project: Project;
  onDelete: (projectId: string) => void;
  onPublish: (projectId: string, currentlyPublished: boolean) => void;
}

export function ProjectListItem({
  project,
  onDelete,
  onPublish,
}: ProjectListItemProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/analytics/${project.id}`);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/editor/${project.id}`);
  };

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-4">
        <div className="flex items-center space-x-4">
          <Image
            src={"/placeholder.svg"}
            alt={project.name ?? "Project thumbnail"}
            width={64}
            height={64}
            className="w-16 h-16 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
            onClick={handleClick}
            unoptimized
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h3
                className="font-semibold truncate pr-2 cursor-pointer hover:text-primary"
                onClick={handleClick}
              >
                {project.name}
              </h3>
              <Badge variant={project.published ? "default" : "secondary"}>
                {project.published ? "Published" : "Draft"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground truncate mb-2">
              {project.description || "No description provided"}
            </p>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center">
                <Eye className="mr-1 h-4 w-4" />
                {(project.views ?? 0).toLocaleString()} views
              </div>
              <div className="flex items-center">
                <Calendar className="mr-1 h-4 w-4" />
                {project.updatedAt
                  ? new Date(String(project.updatedAt)).toLocaleDateString()
                  : "—"}
              </div>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleEditClick}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Project
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/analytics/${project.id}`);
                }}
              >
                <BarChart3 className="mr-2 h-4 w-4" />
                View Analytics
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/projectsettings/${project.id}`);
                }}
              >
                <Settings className="mr-2 h-4 w-4" />
                Project Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onPublish(project.id ?? "", !!project.published);
                }}
              >
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
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(project.id ?? "");
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}
