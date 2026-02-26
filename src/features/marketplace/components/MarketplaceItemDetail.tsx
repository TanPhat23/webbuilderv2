"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Download, Heart, Eye, ArrowLeft, Star, Share2, Code2, Zap, TrendingUp, Loader2 } from "lucide-react"
import type { MarketplaceItemWithRelations } from "@/features/marketplace"
import { useDownloadMarketplaceItem, useIncrementLikes } from "@/hooks"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { CommentSection } from "./CommentSection"

interface MarketplaceItemDetailProps {
  item: MarketplaceItemWithRelations
}

export function MarketplaceItemDetail({ item }: MarketplaceItemDetailProps) {
  const router = useRouter()
  const [isLiked, setIsLiked] = useState(false)
  const downloadItem = useDownloadMarketplaceItem()
  const incrementLikes = useIncrementLikes()

  const getTemplateTypeLabel = (type: string) => {
    switch (type) {
      case "full-site":
        return "Full Site"
      case "page":
        return "Page"
      case "section":
        return "Section"
      case "block":
        return "Block"
      default:
        return type
    }
  }

  const handleDownload = async () => {
    try {
      const newProject = await downloadItem.mutateAsync(item.id)
      router.push(`/editor/${newProject.id}`)
    } catch (error) {
      console.error("Failed to download template:", error)
    }
  }

  const handleLike = async () => {
    if (isLiked) return
    try {
      await incrementLikes.mutateAsync(item.id)
      setIsLiked(true)
    } catch (error) {
      console.error("Failed to like item:", error)
    }
  }

  return (
    <div className="min-h-screen min-w-screen bg-background">
      <div className="sticky top-0 z-40 border-b border-border/30 bg-background/95 backdrop-blur-md">
        <div className="container mx-auto px-4 py-3 max-w-screen flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => router.push("/marketplace")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Marketplace
          </Button>
          <div className="flex items-center gap-2">
            {item.featured && (
              <Badge
                variant="secondary"
                className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-200/30 dark:border-amber-900/30"
              >
                <Star className="h-3 w-3 mr-1.5 fill-current" />
                Featured
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16 max-w-screen">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-12">
            {/* Hero iframe with enhanced styling */}
            <div className="relative rounded-2xl overflow-hidden border border-border/40 bg-muted/20 shadow-lg">
              <div className="relative aspect-video bg-gradient-to-br from-muted/50 to-muted/20">
                <iframe
                  src={`/preview/${item.projectId}`}
                  className="w-full h-full border-0"
                  title={`${item.title} preview`}
                  loading="lazy"
                  sandbox="allow-same-origin"
                />
              </div>
              <div className="absolute top-6 right-6">
                <Badge className="bg-background/95 text-foreground border border-border/50 backdrop-blur-sm font-medium">
                  {getTemplateTypeLabel(item.templateType)}
                </Badge>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h1 className="text-5xl font-bold text-foreground mb-4 leading-tight">{item.title}</h1>
                <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">{item.description}</p>
              </div>

              <div className="grid grid-cols-3 gap-6 pt-8 border-t border-border/30">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Eye className="h-5 w-5" />
                    <span className="text-sm font-medium">Views</span>
                  </div>
                  <p className="text-4xl font-bold text-foreground">{(item.downloads || 0).toLocaleString()}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Download className="h-5 w-5" />
                    <span className="text-sm font-medium">Downloads</span>
                  </div>
                  <p className="text-4xl font-bold text-foreground">{(item.downloads || 0).toLocaleString()}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Heart className="h-5 w-5" />
                    <span className="text-sm font-medium">Likes</span>
                  </div>
                  <p className="text-4xl font-bold text-foreground">{(item.likes || 0).toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Technical Details Card */}
              <Card className="border border-border/40 bg-card/40 backdrop-blur-sm hover:border-border/60 transition-colors">
                <CardContent className="p-8 space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Code2 className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground text-lg">Technical Details</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-3 border-b border-border/20">
                      <span className="text-sm text-muted-foreground font-medium">Type</span>
                      <Badge variant="outline" className="text-xs font-medium">
                        {getTemplateTypeLabel(item.templateType)}
                      </Badge>
                    </div>
                    {item.pageCount && (
                      <div className="flex justify-between items-center py-3 border-b border-border/20">
                        <span className="text-sm text-muted-foreground font-medium">Pages</span>
                        <span className="font-semibold text-foreground">{item.pageCount}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center py-3 border-b border-border/20">
                      <span className="text-sm text-muted-foreground font-medium">Downloads</span>
                      <span className="font-semibold text-foreground">{(item.downloads || 0).toLocaleString()}</span>
                    </div>
                    {item.createdAt && (
                      <div className="flex justify-between items-center py-3">
                        <span className="text-sm text-muted-foreground font-medium">Created</span>
                        <span className="font-semibold text-foreground">
                          {new Date(item.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Tags & Categories Card */}
              <Card className="border border-border/40 bg-card/40 backdrop-blur-sm hover:border-border/60 transition-colors">
                <CardContent className="p-8 space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Zap className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground text-lg">Tags & Categories</h3>
                  </div>
                  {item.categories && item.categories.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                        Categories
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {item.categories.map((category, index) => (
                          <Badge key={category.id || `category-${index}`} variant="secondary" className="text-xs font-medium">
                            {category.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {item.tags && item.tags.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                        Tags
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {item.tags.map((tag: any, index: number) => (
                          <Badge key={`tag-${typeof tag === 'string' ? tag : tag?.name || tag?.id || index}`} variant="outline" className="text-xs font-medium">
                            {typeof tag === 'string' ? tag : tag?.name || tag?.id || 'Unknown'}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="space-y-6 sticky top-24">
              {/* Author Card */}
              {item.author && (
                <Card className="border border-border/40 bg-card/40 backdrop-blur-sm">
                  <CardContent className="p-8">
                    <div className="text-center space-y-4">
                      <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mx-auto border border-primary/20">
                        <span className="text-2xl font-bold text-primary">
                          {item.author.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-foreground text-base">{item.author.name}</p>
                        <p className="text-xs text-muted-foreground font-medium">Template Creator</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="space-y-3">
                <Button
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-6 rounded-lg transition-all duration-200 text-base"
                  size="lg"
                  onClick={handleDownload}
                  disabled={downloadItem.isPending}
                >
                  {downloadItem.isPending ? (
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  ) : (
                    <Download className="h-5 w-5 mr-2" />
                  )}
                  {downloadItem.isPending ? "Creating Project..." : "Download Template"}
                </Button>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className={cn(
                      "flex-1 py-6 rounded-lg transition-all duration-200 font-medium",
                      incrementLikes.isPending
                        ? "border-red-500/50 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20"
                        : "border-border/40 hover:border-red-300/50 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50/50 dark:hover:bg-red-950/10",
                    )}
                    size="lg"
                    onClick={handleLike}
                    disabled={incrementLikes.isPending}
                  >
                    {incrementLikes.isPending ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Heart className="h-5 w-5 transition-all" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 py-6 rounded-lg border-border/40 bg-transparent hover:bg-muted/50 transition-colors font-medium"
                    size="lg"
                  >
                    <Share2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              <Card className="border border-border/40 bg-card/40 backdrop-blur-sm">
                <CardContent className="p-8">
                  <div className="flex items-center gap-2 mb-6">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Performance
                    </h3>
                  </div>
                  <div className="space-y-5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground font-medium">Downloads</span>
                      <span className="font-bold text-2xl text-foreground">
                        {(item.downloads || 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground font-medium">Likes</span>
                      <span className="font-bold text-2xl text-foreground">{(item.likes || 0).toLocaleString()}</span>
                    </div>
                    {item.pageCount && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground font-medium">Pages</span>
                        <span className="font-bold text-2xl text-foreground">{item.pageCount}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
              {/* Comments Section */}
              <div className="space-y-4">
                <CommentSection itemId={item.id} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
