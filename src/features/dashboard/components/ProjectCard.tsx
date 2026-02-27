"use client";

import { useCallback, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
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
  Upload,
  Crown,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CreateMarketplaceItemDialog } from "@/features/marketplace";
import { useDeleteMarketplaceItem, useMarketplaceItems } from "@/hooks";
import { useUserPlan } from "@/features/subscription";
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
  const router = useRouter();
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const deleteItem = useDeleteMarketplaceItem();
  const { data: userPlan } = useUserPlan();

  // Fetch marketplace items using the proper hook
  const { data: marketplaceItems } = useMarketplaceItems();

  // Find associated marketplace item
  const marketplaceItem = useMemo(
    () => marketplaceItems?.find((item) => item.projectId === project.id),
    [marketplaceItems, project.id],
  );

  const canPublish = userPlan?.canPublishToMarketplace ?? false;

  // Memoized handlers
  const handleCardClick = useCallback(() => {
    router.push(`/analytics/${project.id}`);
  }, [router, project.id]);

  const handleEditClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      router.push(`/editor/${project.id}`);
    },
    [router, project.id],
  );

  const handleAnalyticsClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      router.push(`/analytics/${project.id}`);
    },
    [router, project.id],
  );

  const handleSettingsClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      router.push(`/projectsettings/${project.id}`);
    },
    [router, project.id],
  );

  const handlePublishToggle = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onPublish(project.id ?? "", !!project.published);
    },
    [onPublish, project.id, project.published],
  );

  const handleDelete = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onDelete(project.id ?? "");
    },
    [onDelete, project.id],
  );

  const handleMarketplaceDelete = useCallback(async () => {
    if (!marketplaceItem?.id) return;

    try {
      await deleteItem.mutateAsync(marketplaceItem.id);
      setShowDeleteDialog(false);
    } catch (error) {
      console.error("Failed to delete marketplace item:", error);
    }
  }, [deleteItem, marketplaceItem?.id]);

  // Format date
  const formattedDate = useMemo(() => {
    if (!project.updatedAt) return "—";
    return new Date(String(project.updatedAt)).toLocaleDateString();
  }, [project.updatedAt]);

  // Get views count
  const viewsCount = useMemo(() => {
    const views = project.views ?? 0;
    return (views as number).toLocaleString();
  }, [project]);

  return (
    <>
      <Card className="group hover:shadow-lg transition-all duration-200 cursor-pointer p-0">
        <CardHeader className="p-0">
          <div className="relative overflow-hidden rounded-t-lg">
            <Image
              width={400}
              height={200}
              src="/placeholder.svg"
              alt={project.name ?? "Project thumbnail"}
              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
              onClick={handleCardClick}
              unoptimized
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
              className="font-semibold text-lg truncate pr-2 cursor-pointer hover:text-primary"
              onClick={handleCardClick}
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
                <DropdownMenuItem onClick={handleEditClick}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Project
                </DropdownMenuItem>

                <DropdownMenuItem onClick={handleAnalyticsClick}>
                  <BarChart3 className="mr-2 h-4 w-4" />
                  View Analytics
                </DropdownMenuItem>

                <DropdownMenuItem onClick={handleSettingsClick}>
                  <Settings className="mr-2 h-4 w-4" />
                  Project Settings
                </DropdownMenuItem>

                {marketplaceItem ? (
                  <DropdownMenuItem
                    className="text-destructive"
                    disabled={deleteItem.isPending}
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDeleteDialog(true);
                    }}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete from Marketplace
                  </DropdownMenuItem>
                ) : project.published ? (
                  <DropdownMenuItem
                    disabled={!canPublish}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (canPublish) {
                        setShowUploadDialog(true);
                      }
                    }}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Upload to Marketplace
                    {!canPublish && (
                      <Crown className="ml-auto h-4 w-4 text-yellow-500" />
                    )}
                  </DropdownMenuItem>
                ) : null}

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

      <CreateMarketplaceItemDialog
        open={showUploadDialog}
        onOpenChange={setShowUploadDialog}
        defaultProjectId={project.id}
        itemId={marketplaceItem?.id}
      />

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete from Marketplace</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this item from the marketplace?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteItem.isPending}
              onClick={handleMarketplaceDelete}
            >
              {deleteItem.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
