import apiClient from "./apiclient";
import { API_ENDPOINTS } from "@/constants/endpoints";
import { URLBuilder } from "@/lib/utils/urlbuilder";
import type {
  SubscriptionStatus,
  CreatePaymentRequest,
  CreatePaymentResponse,
  CancelSubscriptionRequest,
  CancelSubscriptionResponse,
} from "@/interfaces/subscription.interface";

interface ISubscriptionService {
  getSubscriptionStatus: () => Promise<SubscriptionStatus>;
  getAllSubscriptions: () => Promise<any>;
  createPayment: (data: CreatePaymentRequest) => Promise<CreatePaymentResponse>;
  cancelSubscription: (
    data: CancelSubscriptionRequest,
  ) => Promise<CancelSubscriptionResponse>;
}

export const subscriptionService: ISubscriptionService = {
  getSubscriptionStatus: async (): Promise<SubscriptionStatus> => {
    const url = new URLBuilder("api")
      .setPath(API_ENDPOINTS.SUBSCRIPTION.STATUS)
      .build();
    return apiClient.get<SubscriptionStatus>(url);
  },

  getAllSubscriptions: async (): Promise<any> => {
    const url = new URLBuilder("api")
      .setPath(API_ENDPOINTS.SUBSCRIPTION.GET)
      .build();
    return apiClient.get(url);
  },

  createPayment: async (
    data: CreatePaymentRequest,
  ): Promise<CreatePaymentResponse> => {
    const url = new URLBuilder("api")
      .setPath(API_ENDPOINTS.VNPAY.CREATE_PAYMENT)
      .build();
    return apiClient.post<CreatePaymentResponse>(url, data);
  },

  cancelSubscription: async (
    data: CancelSubscriptionRequest,
  ): Promise<CancelSubscriptionResponse> => {
    const url = new URLBuilder("api")
      .setPath(API_ENDPOINTS.SUBSCRIPTION.CANCEL)
      .build();
    return apiClient.post<CancelSubscriptionResponse>(url, data);
  },
};
