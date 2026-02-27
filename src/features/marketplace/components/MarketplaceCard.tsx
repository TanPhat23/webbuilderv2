"use client";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, Heart, CheckCircle2, Layers, Eye } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { MarketplaceItemWithRelations } from "@/features/marketplace";
import { useDownloadMarketplaceItem, useIncrementLikes } from "@/hooks";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface MarketplaceCardProps {
  item: MarketplaceItemWithRelations;
}

export function MarketplaceCard({ item }: MarketplaceCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const downloadItem = useDownloadMarketplaceItem();
  const incrementLikes = useIncrementLikes();
  const router = useRouter();

  const getTemplateTypeLabel = (type: string) => {
    switch (type) {
      case "full-site":
        return "Full Site";
      case "page":
        return "Page";
      case "section":
        return "Section";
      case "block":
        return "Block";
      default:
        return type;
    }
  };

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const newProject = await downloadItem.mutateAsync(item.id);
      router.push(`/editor/${newProject.id}`);
    } catch (error) {
      console.error("Failed to download template:", error);
    }
  };

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isLiked) return; // Prevent multiple likes

    try {
      await incrementLikes.mutateAsync(item.id);
      setIsLiked(true);
    } catch (error) {
      console.error("Failed to like item:", error);
    }
  };

  return (
    <Link href={`/marketplace/${item.id}`}>
      <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 border-border bg-card p-0 h-full flex flex-col cursor-pointer">
        <div className="relative aspect-video overflow-hidden bg-muted">
          <Image
            src={item.preview || "/placeholder.svg"}
            alt={item.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300" />
          <div className="absolute top-3 left-3">
            <Badge
              variant="secondary"
              className="text-xs backdrop-blur-sm bg-background/80"
            >
              {getTemplateTypeLabel(item.templateType)}
            </Badge>
          </div>
          <Button
            size="icon"
            variant="secondary"
            onClick={handleDownload}
            disabled={downloadItem.isPending}
            className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-sm bg-background/80 hover:bg-background"
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
        <CardContent className="p-4 flex-1 flex flex-col">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-semibold text-base leading-tight line-clamp-1">
              {item.title}
            </h3>
            {item.featured && (
              <Badge variant="secondary" className="text-xs shrink-0">
                Featured
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {item.description}
          </p>
          {item.pageCount && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
              <Layers className="h-3.5 w-3.5" />
              <span>{item.pageCount} pages included</span>
            </div>
          )}
          {item.tags && item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {item.tags.slice(0, 3).map((tag: any, index: number) => (
                <Badge
                  key={`tag-${typeof tag === "string" ? tag : tag?.name || tag?.id || index}`}
                  variant="outline"
                  className="text-xs"
                >
                  {typeof tag === "string"
                    ? tag
                    : tag?.name || tag?.id || "Unknown"}
                </Badge>
              ))}
              {item.tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{item.tags.length - 3}
                </Badge>
              )}
            </div>
          )}
          {item.categories && item.categories.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-auto">
              {item.categories.slice(0, 2).map((category, index) => (
                <Badge
                  key={`category-${category.id || index}`}
                  variant="secondary"
                  className="text-xs"
                >
                  {category.name}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
        <CardFooter className="p-4 pt-0 flex items-center justify-between border-t border-border/50 mt-auto">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                router.push(`/marketplace/${item.id}`);
              }}
              className="flex items-center gap-1 hover:text-foreground transition-colors"
            >
              <Eye className="h-3.5 w-3.5" />
              <span>View Details</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDownload}
              disabled={downloadItem.isPending}
              className="flex items-center gap-1 hover:text-foreground transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              <span>{(item.downloads || 0).toLocaleString()}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              disabled={incrementLikes.isPending || isLiked}
              className={cn(
                "flex items-center gap-1 hover:text-red-500 transition-colors",
                isLiked && "text-red-500",
              )}
            >
              <Heart className={cn("h-3.5 w-3.5", isLiked && "fill-current")} />
              <span>{(item.likes || 0).toLocaleString()}</span>
            </Button>
          </div>
          {item.author && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <span className="line-clamp-1 text-xs">{item.author.name}</span>
              {item.author.verified && (
                <CheckCircle2 className="h-3.5 w-3.5 text-blue-500 shrink-0" />
              )}
            </div>
          )}
        </CardFooter>
      </Card>
    </Link>
  );
}
