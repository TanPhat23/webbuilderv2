import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import CollaborationButton from "../CollaborationButton";
import CollaboratorIndicator from "../CollaboratorIndicator";
import { cn } from "@/lib/utils";

export interface HeaderActionsProps {
  projectId: string;
  className?: string;
}

export default function HeaderActions({ projectId, className }: HeaderActionsProps) {
  const handleViewLive = () => {
    window.open(`http://localhost:3000/preview/${projectId}`, "_blank");
  };

  return (
    <div className={cn("flex items-center gap-2 shrink-0", className)}>
      <CollaboratorIndicator projectId={projectId} />
      <CollaborationButton projectId={projectId} />

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            onClick={handleViewLive}
            aria-label="View live preview"
            className="h-7 px-2.5 gap-1.5 text-xs font-medium text-foreground hover:bg-muted"
          >
            <span className="hidden sm:inline">View Live</span>
            <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">Open live site in new tab</TooltipContent>
      </Tooltip>
    </div>
  );
}
