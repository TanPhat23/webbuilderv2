"use client";

import { MarketplaceItemDetail } from "@/features/marketplace";
import { useMarketplaceItem } from "@/hooks";

interface MarketplaceItemDetailWrapperProps {
  id: string;
}

export function MarketplaceItemDetailWrapper({ id }: MarketplaceItemDetailWrapperProps) {
  const { data: item, error } = useMarketplaceItem(id);

  if (error || !item) {
    return (
      <div className="min-h-screen min-w-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Template Not Found</h1>
          <p className="text-muted-foreground mb-4">
            The template you're looking for doesn't exist or has been removed.
          </p>
          <a
            href="/marketplace"
            className="text-primary hover:underline"
          >
            Back to Marketplace
          </a>
        </div>
      </div>
    );
  }

  return <MarketplaceItemDetail item={item} />;
}