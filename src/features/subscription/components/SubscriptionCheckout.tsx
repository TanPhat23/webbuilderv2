export type Plan = {
  id: string;
  name: string;
  price: { monthly: number | string; yearly: number | string };
  description: string;
  features: string[];
  popular: boolean;
};

export function SubscriptionCheckout() {
  return null;
}