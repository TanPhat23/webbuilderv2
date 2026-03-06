import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";
import { MarketplaceItemDetail } from "@/features/marketplace";
import { useMarketplaceItem } from "@/hooks";

export const Route = createFileRoute("/_protected/marketplace/$id")({
  component: MarketplaceItemPage,
});

function MarketplaceItemDetailWrapper({ id }: { id: string }) {
  const { data: item, error } = useMarketplaceItem(id);

  if (error || !item) {
    return (
      <div className="min-h-screen min-w-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Template Not Found</h1>
          <p className="text-muted-foreground mb-4">
            The template you're looking for doesn't exist or has been removed.
          </p>
          <a href="/marketplace" className="text-primary hover:underline">
            Back to Marketplace
          </a>
        </div>
      </div>
    );
  }

  return <MarketplaceItemDetail item={item} />;
}

function MarketplaceItemPage() {
  const { id } = Route.useParams();

  return (
    <Suspense
      fallback={
        <div className="min-h-screen min-w-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading template...</p>
          </div>
        </div>
      }
    >
      <MarketplaceItemDetailWrapper id={id} />
    </Suspense>
  );
}