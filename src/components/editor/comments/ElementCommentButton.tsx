"use client";

import { MessageSquare, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useElementCommentStore } from "@/globalstore/element-comment-store";
import { EditorElement } from "@/types/global.type";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useElementComments } from "@/hooks";
import { motion, AnimatePresence } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ElementCommentButtonProps {
  element: EditorElement;
}

export function ElementCommentButton({ element }: ElementCommentButtonProps) {
  const {
    setActiveCommentElement,
    activeCommentElementId,
    isCommentsVisible,
    setCommentsVisible,
  } = useElementCommentStore();

  const { unresolvedCount } = useElementComments({
    elementId: element.id,
    autoLoad: false,
  });

  const isActive = activeCommentElementId === element.id;
  const hasComments = unresolvedCount > 0;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    if (isActive) {
      setActiveCommentElement(undefined);
    } else {
      setActiveCommentElement(element.id);
      if (!isCommentsVisible) {
        setCommentsVisible(true);
      }
    }
  };

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute -right-3 -top-3 z-30 pointer-events-none"
            style={{
              transform: "translate(50%, -50%)",
            }}
          >
            <Button
              size="sm"
              variant={isActive ? "default" : "outline"}
              className={cn(
                "h-8 px-2.5 gap-1.5 shadow-lg border-border transition-all duration-200 pointer-events-auto",
                "hover:scale-105 hover:shadow-xl active:scale-95",
                isActive
                  ? "bg-primary hover:bg-primary border-primary text-primary-foreground"
                  : "bg-card hover:bg-muted border-border",
                hasComments && !isActive && "border-accent hover:border-accent",
              )}
              onClick={handleClick}
            >
              <motion.div
                animate={
                  hasComments
                    ? {
                        scale: [1, 1.2, 1],
                        rotate: [0, -10, 10, -10, 0],
                      }
                    : {}
                }
                transition={{
                  duration: 0.5,
                  repeat: hasComments ? Infinity : 0,
                  repeatDelay: 3,
                }}
              >
                {hasComments ? (
                  <MessageCircle className="w-4 h-4" />
                ) : (
                  <MessageSquare className="w-4 h-4" />
                )}
              </motion.div>

              <AnimatePresence mode="wait">
                {unresolvedCount > 0 && (
                  <motion.div
                    key="badge"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Badge
                      variant="destructive"
                      className={cn(
                        "h-5 min-w-5 px-1.5 text-[10px] font-bold rounded-full",
                        "flex items-center justify-center",
                        "shadow-md",
                      )}
                    >
                      {unresolvedCount > 9 ? "9+" : unresolvedCount}
                    </Badge>
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>
          </motion.div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">
          <p className="font-medium">
            {isActive ? "Close comments" : "View comments"}
          </p>
          {unresolvedCount > 0 && (
            <p className="text-muted-foreground mt-0.5">
              {unresolvedCount} unresolved{" "}
              {unresolvedCount === 1 ? "comment" : "comments"}
            </p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
