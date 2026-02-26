import { Suspense } from "react";
import { SubscriptionCheckout } from "@/features/subscription";
import { Loader2 } from "lucide-react";

function CheckoutLoading() {
  return (
    <div className="min-h-screen min-w-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading checkout...</p>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<CheckoutLoading />}>
      <SubscriptionCheckout />
    </Suspense>
  );
}