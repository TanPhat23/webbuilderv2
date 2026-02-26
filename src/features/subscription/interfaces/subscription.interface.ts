export type PlanId = 'hobby' | 'pro' | 'enterprise';
export type BillingPeriod = 'monthly' | 'yearly';
export type SubscriptionStatusType = 'active' | 'pending' | 'cancelled' | 'expired';

// Subscription model from database
export interface Subscription {
  Id: string;
  UserId: string;
  PlanId: string;
  BillingPeriod: string;
  Status: string;
  StartDate: Date;
  EndDate: Date | null;
  Amount: number;
  Currency: string;
  CreatedAt: Date;
  UpdatedAt: Date;
  BankCode: string | null;
  CardType: string | null;
  Email: string | null;
  PayDate: Date | null;
  TransactionNo: string | null;
}

export interface SubscriptionStatus {
  hasActiveSubscription: boolean;
  plan?: PlanId;
  subscription?: {
    id: string;
    planId: PlanId;
    billingPeriod: BillingPeriod;
    startDate: string;
    endDate: string;
    status: SubscriptionStatusType;
    daysUntilExpiry: number;
    canRenew: boolean;
  };
}

export interface CreatePaymentRequest {
  planId: PlanId;
  billingPeriod: BillingPeriod;
  amount: number;
  email?: string;
}

export interface CreatePaymentResponse {
  paymentUrl: string;
  orderId: string;
  amount: number;
}

export interface CancelSubscriptionRequest {
  subscriptionId: string;
}

export interface CancelSubscriptionResponse {
  success: boolean;
  message: string;
}

export interface SubscriptionListResponse {
  subscriptions: Subscription[];
}