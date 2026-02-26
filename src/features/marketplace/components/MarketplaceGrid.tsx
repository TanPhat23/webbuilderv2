"use client";

import { useState, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { MarketplaceCard } from "./MarketplaceCard";
import { Button } from "@/components/ui/button";
import { MarketplaceFilters } from "@/features/marketplace";
import { useMarketplaceItems } from "@/hooks";
import { Loader2, Search, AlertCircle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
  EmptyMedia,
} from "@/components/ui/empty";
import { MarketplaceCardSkeleton } from "./MarketplaceCardSkeleton";

export function MarketplaceGrid() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [displayCount, setDisplayCount] = useState(12);

  // Build filters from URL params
  const filters: MarketplaceFilters = useMemo(() => {
    const params: MarketplaceFilters = {};

    const templateType = searchParams.get("templateType");
    if (templateType) {
      params.templateType = templateType as
        | "full-site"
        | "page"
        | "section"
        | "block";
    }

    const featured = searchParams.get("featured");
    if (featured !== null) {
      params.featured = featured === "true";
    }

    const categoryId = searchParams.get("categoryId");
    if (categoryId) {
      params.categoryId = categoryId;
    }

    const tags = searchParams.get("tags");
    if (tags) {
      params.tags = tags.split(",").filter(Boolean);
    }

    const search = searchParams.get("search");
    if (search) {
      params.search = search;
    }

    const authorId = searchParams.get("authorId");
    if (authorId) {
      params.authorId = authorId;
    }

    return params;
  }, [searchParams]);

  // Fetch data with React Query
  const {
    data: items,
    isLoading,
    isError,
    error,
  } = useMarketplaceItems(filters);

  // Ensure items is always an array
  const itemsArray = Array.isArray(items) ? items : [];

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    switch (value) {
      case "popular":
        params.set("sortBy", "downloads");
        params.set("sortOrder", "desc");
        break;
      case "recent":
        params.set("sortBy", "createdAt");
        params.set("sortOrder", "desc");
        break;
      case "downloads":
        params.set("sortBy", "downloads");
        params.set("sortOrder", "desc");
        break;
      case "likes":
        params.set("sortBy", "likes");
        params.set("sortOrder", "desc");
        break;
      case "title-asc":
        params.set("sortBy", "title");
        params.set("sortOrder", "asc");
        break;
      case "title-desc":
        params.set("sortBy", "title");
        params.set("sortOrder", "desc");
        break;
      default:
        params.delete("sortBy");
        params.delete("sortOrder");
    }

    router.push(`/marketplace?${params.toString()}`);
  };

  const loadMore = () => {
    setDisplayCount((prev) => prev + 12);
  };

  const getCurrentSort = () => {
    const sortBy = searchParams.get("sortBy");
    const sortOrder = searchParams.get("sortOrder");

    if (sortBy === "downloads" && sortOrder === "desc") return "downloads";
    if (sortBy === "likes" && sortOrder === "desc") return "likes";
    if (sortBy === "createdAt" && sortOrder === "desc") return "recent";
    if (sortBy === "title" && sortOrder === "asc") return "title-asc";
    if (sortBy === "title" && sortOrder === "desc") return "title-desc";

    return "popular";
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Loading templates...</p>
          <div className="w-[180px] h-9 bg-muted rounded-md animate-pulse" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <MarketplaceCardSkeleton key={index} />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <AlertCircle />
          </EmptyMedia>
          <EmptyTitle>Failed to load templates</EmptyTitle>
          <EmptyDescription>
            {error instanceof Error ? error.message : "An error occurred"}
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </EmptyContent>
      </Empty>
    );
  }

  // Empty state
  if (itemsArray.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Search />
          </EmptyMedia>
          <EmptyTitle>No templates found</EmptyTitle>
          <EmptyDescription>
            Try adjusting your filters or search query
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button variant="outline" onClick={() => router.push("/marketplace")}>
            Clear Filters
          </Button>
        </EmptyContent>
      </Empty>
    );
  }

  const displayedItems = itemsArray.slice(0, displayCount);
  const hasMore = displayCount < itemsArray.length;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {displayedItems.length} of {itemsArray.length} templates
        </p>
        <Select value={getCurrentSort()} onValueChange={handleSortChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="popular">Most Popular</SelectItem>
            <SelectItem value="recent">Most Recent</SelectItem>
            <SelectItem value="downloads">Most Downloaded</SelectItem>
            <SelectItem value="likes">Most Liked</SelectItem>
            <SelectItem value="title-asc">Title (A-Z)</SelectItem>
            <SelectItem value="title-desc">Title (Z-A)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayedItems.map((item, index) => (
          <MarketplaceCard key={`item-${item.id || index}`} item={item} />
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center pt-4">
          <Button onClick={loadMore} variant="outline" size="lg">
            Load More Templates
          </Button>
        </div>
      )}
    </div>
  );
}
