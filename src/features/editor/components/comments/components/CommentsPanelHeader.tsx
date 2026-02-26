"use client";

import React from "react";
import {
  MessageSquare,
  EyeOff,
  X,
  SortDesc,
  Check,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ViewMode, SortOrder } from "@/features/comments/utils/comments";

interface CommentsPanelHeaderProps {
  title: string;
  description: string;
  showAllComments: boolean;
  totalComments: number;
  unresolvedCount: number;
  viewMode: ViewMode;
  sortOrder: SortOrder;
  onViewModeChange: (mode: ViewMode) => void;
  onSortOrderChange: (order: SortOrder) => void;
  onClose: () => void;
  onShowAll?: () => void;
  onClearSelection?: () => void;
}

export function CommentsPanelHeader({
  title,
  description,
  showAllComments,
  totalComments,
  unresolvedCount,
  viewMode,
  sortOrder,
  onViewModeChange,
  onSortOrderChange,
  onClose,
  onShowAll,
  onClearSelection,
}: CommentsPanelHeaderProps) {
  return (
    <CardHeader className="pb-3 space-y-3">
      {/* Header with title and actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-full bg-accent flex items-center justify-center">
            <MessageSquare className="h-5 w-5 text-accent-foreground" />
          </div>
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            <CardDescription className="text-xs">{description}</CardDescription>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            size="icon"
            variant="ghost"
            onClick={onClose}
            className="h-8 w-8 hover:bg-muted"
            title="Hide comments"
          >
            <EyeOff className="h-4 w-4" />
          </Button>
          {!showAllComments && (
            <Button
              size="icon"
              variant="ghost"
              onClick={onClearSelection}
              className="h-8 w-8 hover:bg-muted"
              title="Show all comments"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Filters and sorting */}
      <div className="flex items-center gap-2">
        <Tabs
          value={viewMode}
          onValueChange={(value) => onViewModeChange(value as ViewMode)}
          className="flex-1"
        >
          <TabsList className="grid w-full grid-cols-3 h-9">
            <TabsTrigger value="all" className="text-xs">
              All{" "}
              {showAllComments
                ? totalComments > 0 && `(${totalComments})`
                : ""}
            </TabsTrigger>
            <TabsTrigger value="unresolved" className="text-xs">
              Active{" "}
              {unresolvedCount > 0 && (
                <Badge
                  variant="secondary"
                  className="ml-1 h-4 px-1 text-[10px]"
                >
                  {unresolvedCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="resolved" className="text-xs">
              Done
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <DropdownMenu defaultOpen={false}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-9 px-2"
              title="Sort options"
            >
              <SortDesc className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onSortOrderChange("newest")}>
              <Check
                className={cn(
                  "h-4 w-4 mr-2",
                  sortOrder === "newest" ? "opacity-100" : "opacity-0",
                )}
              />
              Newest first
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSortOrderChange("oldest")}>
              <Check
                className={cn(
                  "h-4 w-4 mr-2",
                  sortOrder === "oldest" ? "opacity-100" : "opacity-0",
                )}
              />
              Oldest first
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </CardHeader>
  );
}
