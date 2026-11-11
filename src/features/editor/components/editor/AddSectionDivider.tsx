import React from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface AddSectionDividerProps {
  onAddSection: () => void;
  disabled?: boolean;
  className?: string;
}

export const AddSectionDivider: React.FC<AddSectionDividerProps> = ({
  onAddSection,
  disabled = false,
  className,
}) => {
  return (
    <div
      className={cn(
        "relative flex items-center justify-center py-6 px-4 group my-2",
        disabled && "opacity-50 pointer-events-none",
        className,
      )}
    >
      <div className="absolute inset-0 flex items-center" aria-hidden="true">
        <div className="w-full border-t border-dashed border-border/80 group-hover:border-primary/50 transition-colors" />
      </div>

      <button
        type="button"
        onClick={onAddSection}
        disabled={disabled}
        aria-label="Add new section"
        className={cn(
          "relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full",
          "bg-background border border-dashed border-border/80 group-hover:border-primary/50",
          "text-muted-foreground group-hover:text-foreground text-xs font-medium shadow-xs",
          "hover:bg-muted/60 active:scale-95 transition-all duration-150 cursor-pointer",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        )}
      >
        <Plus className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
        <span>Add section</span>
      </button>
    </div>
  );
};

export default AddSectionDivider;
