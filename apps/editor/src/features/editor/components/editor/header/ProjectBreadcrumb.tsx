import { ChevronsUpDown } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  useCurrentProject,
  useCurrentPage,
} from "@/features/projects/hooks/useProjects";

interface ProjectBreadcrumbProps {
  /** Opens page navigation. */
  onNavigate?: () => void;
}

export default function ProjectBreadcrumb({ onNavigate }: ProjectBreadcrumbProps) {
  const { data: project } = useCurrentProject();
  const currentPage = useCurrentPage();

  if (!project) return null;

  const pageName = currentPage ? currentPage.Name || "Home" : "Select page";

  return (
    <div className="flex min-w-0 items-center gap-1.5">
      <span
        className="max-w-[130px] truncate text-sm font-semibold text-foreground sm:max-w-[180px]"
        title={project.name}
      >
        {project.name}
      </span>
      <span className="text-muted-foreground/50">/</span>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={onNavigate}
            aria-label={`Current page: ${pageName}. Switch page`}
            className="inline-flex h-7 min-w-0 items-center gap-1 rounded-md px-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <span className="max-w-[140px] truncate">{pageName}</span>
            <ChevronsUpDown className="h-3 w-3 shrink-0 opacity-60" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          Switch page <kbd className="ml-1 font-mono text-[10px] opacity-60">⌘K</kbd>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
