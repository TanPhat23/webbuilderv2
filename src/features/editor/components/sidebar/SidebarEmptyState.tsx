import { cn } from "@/lib/utils";
import {
  Empty,
  EmptyContent,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import { Square } from "lucide-react";
import React from "react";

interface SidebarEmptyStateProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}

const SidebarEmptyState: React.FC<SidebarEmptyStateProps> = ({
  title = "Nothing selected yet",
  description = "Pick an element on the canvas to show its settings, styles, or code.",
  icon,
  className,
  children,
}) => {
  return (
    <Empty
      className={cn("h-full min-h-0 bg-transparent border-none p-4", className)}
    >
      <EmptyContent className="gap-6">
        <EmptyHeader className="gap-3">
          <EmptyMedia variant="icon">
            {icon ?? <Square className="h-6 w-6" />}
          </EmptyMedia>
          <EmptyTitle>{title}</EmptyTitle>
          <EmptyDescription>{description}</EmptyDescription>
        </EmptyHeader>
        {children && (
          <div className="flex w-full flex-col items-center gap-2 text-sm text-muted-foreground">
            {children}
          </div>
        )}
      </EmptyContent>
    </Empty>
  );
};

export default SidebarEmptyState;
