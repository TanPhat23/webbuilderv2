import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { subscriptionService } from "@/services/subscription";
import type {
  SubscriptionStatus,
  CreatePaymentRequest,
} from "@/interfaces/subscription.interface";
import {
  showErrorToast,
  showSuccessToast,
} from "@/lib/utils/errors/errorToast";

/** Hook to get the current user's subscription status. */
export function useSubscriptionStatus() {
  return useQuery<SubscriptionStatus>({
    queryKey: ["subscription-status"],
    queryFn: async () => {
      return subscriptionService.getSubscriptionStatus();
    },
  });
}

/** Hook to get all subscriptions. */
export function useAllSubscriptions() {
  return useQuery({
    queryKey: ["all-subscriptions"],
    queryFn: async () => {
      return subscriptionService.getAllSubscriptions();
    },
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
      queryClient.invalidateQueries({ queryKey: ["subscription-status"] });
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
      queryClient.invalidateQueries({ queryKey: ["subscription-status"] });
      queryClient.invalidateQueries({ queryKey: ["user-plan"] });
    },
  });
}
