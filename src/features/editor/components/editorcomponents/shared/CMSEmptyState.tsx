import React from "react";
import { Database } from "lucide-react";
import { cn } from "@/lib/utils";

interface CMSEmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description: string;
}

export function CMSEmptyState({
  title,
  description,
  className,
  ...divProps
}: CMSEmptyStateProps) {
  return (
    <div
      {...divProps}
      className={cn(
        "flex items-center justify-center border-2 border-dashed border-gray-300 bg-gray-50",
        className,
      )}
    >
      <div className="text-center text-gray-500">
        <Database className="w-8 h-8 mx-auto mb-2" />
        <p className="text-sm">{title}</p>
        <p className="text-xs">{description}</p>
      </div>
    </div>
  );
}
