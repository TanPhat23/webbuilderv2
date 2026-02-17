import React from "react";
import { motion } from "framer-motion";
import { ArrowRightLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import type { EditorElement } from "@/types/global.type";

interface ElementDropIndicatorProps {
  /**
   * Whether this area should be shown as an active drop target.
   */
  isDropTarget: boolean;

  /**
   * If a dragging element exists, the indicator will show 'Swap Here' instead
   * of 'Insert Here'. This is typically the currently dragged element (if any).
   */
  draggingElement?: EditorElement | null;

  /**
   * Optional drag handlers to attach to the indicator.
   */
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;

  /**
   * Allows consumer to extend/override classes.
   */
  className?: string;
}

/**
 * Small presentational component that renders the drop zone animation and
 * copyable message (Swap Here / Insert Here). Kept intentionally dumb so it
 * can be used both inside list rendering and reorder flows.
 */
export default function ElementDropIndicator({
  isDropTarget,
  draggingElement,
  onDragOver,
  onDrop,
  className,
}: ElementDropIndicatorProps) {
  return (
    <motion.div
      onDragOver={onDragOver}
      onDrop={onDrop}
      animate={{
        height: isDropTarget ? 60 : 0,
        opacity: isDropTarget ? 1 : 0,
      }}
      transition={{ duration: 0.15 }}
      className={cn(
        "relative flex items-center justify-center overflow-hidden rounded-lg",
        "bg-primary/20 border-2 border-dashed border-primary/50",
        className,
      )}
    >
      {isDropTarget && (
        <div className="flex items-center gap-2 text-primary font-semibold text-sm">
          <ArrowRightLeft className="w-4 h-4 text-primary" />
          <span>{draggingElement ? "Swap Here" : "Insert Here"}</span>
        </div>
      )}
    </motion.div>
  );
}

export { ElementDropIndicator };
