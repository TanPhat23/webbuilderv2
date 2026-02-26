import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function MarketplaceCardSkeleton() {
  return (
    <Card className="overflow-hidden border-border bg-card p-0 h-full flex flex-col">
      {/* Preview Image Skeleton */}
      <Skeleton className="aspect-video w-full" />

      <CardContent className="p-4 flex-1 flex flex-col">
        {/* Title Skeleton */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-5 w-16 shrink-0" />
        </div>

        {/* Description Skeleton */}
        <div className="space-y-2 mb-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>

        {/* Page Count Skeleton */}
        <Skeleton className="h-4 w-32 mb-2" />

        {/* Tags Skeleton */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-14" />
        </div>

        {/* Categories Skeleton */}
        <div className="flex flex-wrap gap-1.5 mt-auto">
          <Skeleton className="h-5 w-24" />
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex items-center justify-between border-t border-border/50 mt-auto">
        {/* Stats Skeleton */}
        <div className="flex items-center gap-3">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-12" />
        </div>

        {/* Author Skeleton */}
        <Skeleton className="h-4 w-20" />
      </CardFooter>
    </Card>
  );
}
