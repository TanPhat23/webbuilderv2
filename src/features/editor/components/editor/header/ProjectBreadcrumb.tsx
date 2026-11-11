import { ChevronRight, Search } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useCurrentProject, useCurrentPage } from "@/features/projects/hooks/useProjects";

interface ProjectBreadcrumbProps {
  onNavigate?: () => void;
}

export default function ProjectBreadcrumb({ onNavigate }: ProjectBreadcrumbProps) {
  const { data: project } = useCurrentProject();
  const currentPage = useCurrentPage();

  if (!project) return null;

  return (
    <div className="flex items-center gap-1.5 min-w-0">
      <span
        className="text-sm font-semibold text-foreground truncate max-w-[130px] sm:max-w-[180px]"
        title={project.name}
      >
        {project.name}
      </span>
      {currentPage && (
        <>
          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0" />
          <span
            className="text-sm text-muted-foreground truncate max-w-[100px] sm:max-w-[140px]"
            title={currentPage.Name || "Home"}
          >
            {currentPage.Name || "Home"}
          </span>
        </>
      )}
      {onNavigate && (
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={onNavigate}
              aria-label="Open page navigation (Cmd+K)"
              className="inline-flex items-center justify-center h-7 w-7 text-muted-foreground rounded-md hover:bg-muted hover:text-foreground transition-all duration-150 shrink-0"
            >
              <Search className="w-3.5 h-3.5" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            Pages <kbd className="font-mono opacity-60 text-[10px] ml-1">⌘K</kbd>
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}
