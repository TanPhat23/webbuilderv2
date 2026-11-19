import { useQuery } from "@tanstack/react-query";
import { subscriptionService } from "@/features/subscription";
import type { PlanId } from "@/features/subscription";

export const userPlanKeys = {
  all: ["user-plan"] as const,
  detail: () => [...userPlanKeys.all] as const,
};

export interface UserPlan {
  plan: PlanId;
  hasActiveSubscription: boolean;
  subscriptionEndDate?: string;
  daysUntilExpiry?: number;
}

export function useUserPlan() {
  return useQuery<UserPlan>({
    queryKey: userPlanKeys.detail(),
    queryFn: async () => {
      try {
        const data = await subscriptionService.getSubscriptionStatus();

        if (!data.hasActiveSubscription || !data.subscription) {
          return {
            plan: "hobby" as PlanId,
            hasActiveSubscription: false,
          };
        }

        const planId = data.subscription.planId as PlanId;
        return {
          plan: planId,
          hasActiveSubscription: true,
          subscriptionEndDate: data.subscription.endDate,
          daysUntilExpiry: data.subscription.daysUntilExpiry,
        };
      } catch {
        return {
          plan: "hobby" as PlanId,
          hasActiveSubscription: false,
        };
      }
    },
  });
}
