import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { subscriptionService } from "@/features/subscription";
import { userPlanKeys } from "./useUserPlan";
import type {
  SubscriptionStatus,
  CreatePaymentRequest,
} from "@/features/subscription";
import {
  showErrorToast,
  showSuccessToast,
} from "@/utils/errors/errorToast";

export const subscriptionKeys = {
  all: ["subscriptions"] as const,
  status: () => [...subscriptionKeys.all, "status"] as const,
  list: () => [...subscriptionKeys.all, "list"] as const,
};

/** Hook to get the current user's subscription status. */
export function useSubscriptionStatus() {
  return useQuery<SubscriptionStatus>({
    queryKey: subscriptionKeys.status(),
    queryFn: () => subscriptionService.getSubscriptionStatus(),
  });
}

/** Hook to get all subscriptions. */
export function useAllSubscriptions() {
  return useQuery({
    queryKey: subscriptionKeys.list(),
    queryFn: () => subscriptionService.getAllSubscriptions(),
  });
}

/** Hook to create a payment and redirect to VNPay. */
export function useCreatePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreatePaymentRequest) => {
      return subscriptionService.createPayment(data);
    },
    onSuccess: (data) => {
      // Redirect to VNPay
      window.location.href = data.paymentUrl;
    },
    onError: (error: Error) => {
      if (error.message.includes("đã có gói đăng ký")) {
        showErrorToast("Bạn đã có gói đăng ký này");
      } else {
        showErrorToast(`Không thể tạo thanh toán: ${error.message}`);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.status() });
    },
  });
}

/** Hook to cancel a subscription. */
export function useCancelSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (subscriptionId: string) => {
      return subscriptionService.cancelSubscription({ subscriptionId });
    },
    onSuccess: () => {
      showSuccessToast("Hủy subscription thành công");
    },
    onError: (error: Error) => {
      showErrorToast(`Không thể hủy subscription: ${error.message}`);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.status() });
      queryClient.invalidateQueries({ queryKey: userPlanKeys.detail() });
    },
  });
}
