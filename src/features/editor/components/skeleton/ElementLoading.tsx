import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

type Props = {
  count?: number;
  variant?: "text" | "button" | "card" | "form" | "chart" | "image" | "mixed";
};

const ElementLoading = ({ count = 5, variant = "mixed" }: Props) => {
  const renderSkeletonElement = (index: number) => {
    switch (variant) {
      case "text":
        return (
          <div key={index} className="space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        );

      case "button":
        return <Skeleton key={index} className="h-10 w-32 rounded-md" />;

      case "card":
        return (
          <div key={index} className="rounded-lg border p-4 space-y-3">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-8 w-20 rounded-md" />
          </div>
        );

      case "form":
        return (
          <div key={index} className="space-y-4 rounded-lg border p-4">
            <Skeleton className="h-6 w-24" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
            <div className="flex space-x-2">
              <Skeleton className="h-10 w-20 rounded-md" />
              <Skeleton className="h-10 w-20 rounded-md" />
            </div>
          </div>
        );

      case "chart":
        return (
          <div key={index} className="rounded-lg border p-4 space-y-4">
            <Skeleton className="h-6 w-32" />
            <div className="flex items-end space-x-2 h-40">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton
                  key={i}
                  className="w-8 rounded-t-sm"
                  style={{ height: `${Math.random() * 120 + 40}px` }}
                />
              ))}
            </div>
            <div className="flex justify-between">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        );

      case "image":
        return (
          <div key={index} className="space-y-2">
            <Skeleton className="h-48 w-full rounded-lg" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        );

      case "mixed":
      default:
        const variants = ["text", "button", "card", "form", "chart", "image"];
        const randomVariant = variants[
          index % variants.length
        ] as Props["variant"];
        return renderSkeletonElement(index);
    }
  };

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
      {Array.from({ length: count }).map((_, index) =>
        variant === "mixed"
          ? renderMixedElement(index)
          : renderSkeletonElement(index)
      )}
    </div>
  );
};

export default ElementLoading;
