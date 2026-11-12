import { MessageSquare, MessageSquareOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useElementCommentStore } from "@/features/editor";
import { cn } from "@/lib/utils";

export default function CommentsToggle() {
  const { showCommentButtons, toggleCommentButtons } = useElementCommentStore();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleCommentButtons}
          aria-pressed={showCommentButtons}
          aria-label="Toggle comments"
          className={cn(
            "h-7 w-7 p-0 transition-colors",
            showCommentButtons
              ? "bg-primary/10 text-primary hover:bg-primary/15"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {showCommentButtons ? (
            <MessageSquare className="h-3.5 w-3.5" />
          ) : (
            <MessageSquareOff className="h-3.5 w-3.5" />
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        {showCommentButtons ? "Hide comments" : "Show comments"}
      </TooltipContent>
    </Tooltip>
  );
}
