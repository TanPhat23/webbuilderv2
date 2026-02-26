import { Star, Zap, Shield, LucideIcon } from 'lucide-react';
import type { PlanId, BillingPeriod } from '@/features/subscription';

export interface PricingPlan {
  id: PlanId;
  name: string;
  icon: LucideIcon;
  price: {
    monthly: number | string;
    yearly: number | string;
  };
  description: string;
  features: string[];
  cta: string;
  popular?: boolean;
  recommended?: boolean;
}

export const pricingPlans: PricingPlan[] = [
  {
    id: 'hobby',
    name: 'Hobby',
    icon: Star,
    price: {
      monthly: 'Free forever',
      yearly: 'Free forever',
    },
    description: 'Perfect for personal projects and trying out WebBuilder.',
    features: [
      '3 websites',
      'Drag & drop builder',
      'Basic components library',
      'Mobile responsive design',
      'Community support',
    ],
    cta: 'Get started for free',
  },
  {
    id: 'pro',
    name: 'Pro',
    icon: Zap,
    price: {
      monthly: 90,
      yearly: 75,
    },
    description: 'Everything you need for professional websites and businesses.',
    features: [
      'Unlimited websites',
      'Advanced components library',
      'Publish to Marketplace',
      'Code export (React/Next.js)',
      'Custom domain hosting',
      'Priority support',
    ],
    cta: 'Subscribe to Pro',
    popular: true,
    recommended: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    icon: Shield,
    price: {
      monthly: 'Get in touch for pricing',
      yearly: 'Get in touch for pricing',
    },
    description: 'Advanced features for agencies and large teams.',
    features: [
      'Everything in Pro',
      'Team collaboration',
      'White-label solution',
      'Advanced integrations',
      'Dedicated account manager',
    ],
    cta: 'Contact us',
  },
];

// Helper function to get numeric price for calculations
export function getNumericPrice(plan: PricingPlan, frequency: BillingPeriod): number {
  const price = plan.price[frequency];
  return typeof price === 'number' ? price : 0;
}

// Helper function to check if plan requires authentication
export function requiresAuthentication(planId: PlanId): boolean {
  return planId !== 'hobby';
}

// Helper function to check if plan is paid
export function isPaidPlan(planId: PlanId): boolean {
  return planId === 'pro';
}

// Helper function to check if plan can publish to marketplace
export function canPublishToMarketplace(planId: PlanId): boolean {
  return planId === 'pro' || planId === 'enterprise';
}

// Helper function to get plan limits
export function getPlanLimits(planId: PlanId) {
  return {
    canPublishToMarketplace: canPublishToMarketplace(planId),
  };
}