import { useQuery } from "@tanstack/react-query";
import { getPlanLimits } from "@/constants/pricing";
import { subscriptionService } from "@/services/subscription";
import type { PlanId } from "@/interfaces/subscription.interface";

export const userPlanKeys = {
  all: ["user-plan"] as const,
  detail: () => [...userPlanKeys.all] as const,
};

export interface UserPlan {
  plan: PlanId;
  hasActiveSubscription: boolean;
  subscriptionEndDate?: string;
  daysUntilExpiry?: number;
  canPublishToMarketplace: boolean;
}

export function useUserPlan() {
  return useQuery<UserPlan>({
    queryKey: userPlanKeys.detail(),
    queryFn: async () => {
      try {
        const data = await subscriptionService.getSubscriptionStatus();

        if (!data.hasActiveSubscription || !data.subscription) {
          const limits = getPlanLimits("hobby");
          return {
            plan: "hobby" as PlanId,
            hasActiveSubscription: false,
            ...limits,
          };
        }

        const planId = data.subscription.planId as PlanId;
        const limits = getPlanLimits(planId);
        return {
          plan: planId,
          hasActiveSubscription: true,
          subscriptionEndDate: data.subscription.endDate,
          daysUntilExpiry: data.subscription.daysUntilExpiry,
          ...limits,
        };
      } catch {
        const limits = getPlanLimits("hobby");
        return {
          plan: "hobby" as PlanId,
          hasActiveSubscription: false,
          ...limits,
        };
      }
    },
  });
}
