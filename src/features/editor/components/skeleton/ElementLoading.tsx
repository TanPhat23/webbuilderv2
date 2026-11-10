import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

type Props = {
  count?: number;
};

const ElementLoading = ({ count = 5 }: Props) => {
  const renderMixedElement = (index: number) => {
    const elementTypes = [
      // Header with text
      <div key={`header-${index}`} className="space-y-3">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>,

      // Button group
      <div key={`buttons-${index}`} className="flex space-x-3">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-20" />
      </div>,

      // Card with avatar
      <div key={`card-${index}`} className="rounded-lg border p-4 space-y-3">
        <div className="flex items-center space-x-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>,

      // Image with caption
      <div key={`image-${index}`} className="space-y-2">
        <Skeleton className="h-32 w-full rounded-md" />
        <Skeleton className="h-4 w-3/4" />
      </div>,

      // Form elements
      <div key={`form-${index}`} className="space-y-3">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-10 w-full rounded-md" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-24 w-full rounded-md" />
      </div>,
    ];

    return elementTypes[index % elementTypes.length];
  };

  return (
    <div className="space-y-6 p-4">
      {Array.from({ length: count }).map((_, index) => renderMixedElement(index))}
    </div>
  );
};

export default ElementLoading;
