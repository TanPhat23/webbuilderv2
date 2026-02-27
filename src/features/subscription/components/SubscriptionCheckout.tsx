"use client";

import { cn } from "@/lib/utils";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@clerk/nextjs";
import { useSearchParams, useRouter } from "next/navigation";
import { LandingPagePricing } from "@/features/landing";
import { PaymentMethodSelector, type PaymentMethod } from "./PaymentMethod";
import { CheckoutForm } from "./CheckoutForm";
import { OrderSummary } from "./OrderSummary";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Check,
  Loader2,
  Sparkles,
  Menu,
  X,
  AlertCircle,
  User,
  LayoutDashboard,
} from "lucide-react";
import {
  pricingPlans,
  getNumericPrice,
  requiresAuthentication,
  type PricingPlan,
} from "../constants/pricing";
import type {
  BillingPeriod,
  PlanId,
} from "../interfaces/subscription.interface";
import Link from "next/link";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import {
  useSubscriptionStatus,
  useCreatePayment,
  useCancelSubscription,
} from "../hooks/useSubscription";
import { toast } from "sonner";

// Use the same interface as pricing plans for consistency
export interface Plan extends PricingPlan {
  monthlyPrice: number;
  yearlyPrice: number;
}

type CheckoutStep = "plans" | "payment-method" | "checkout";

// Convert pricing plan to checkout plan format
function convertToCheckoutPlan(pricingPlan: PricingPlan): Plan {
  return {
    ...pricingPlan,
    monthlyPrice: getNumericPrice(pricingPlan, "monthly"),
    yearlyPrice: getNumericPrice(pricingPlan, "yearly"),
  };
}

export function SubscriptionCheckout() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [step, setStep] = useState<CheckoutStep>("plans");
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>("yearly");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("vnpay");
  const [discount, setDiscount] = useState<number>(0);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  // Fetch subscription status
  const { data: subscriptionStatus, isLoading: isLoadingSubscription } =
    useSubscriptionStatus();
  const createPayment = useCreatePayment();
  const cancelSubscription = useCancelSubscription();

  useEffect(() => {
    if (!isLoaded) return;

    const planId = searchParams.get("plan");
    const frequency =
      (searchParams.get("frequency") as BillingPeriod) || "yearly";

    if (planId) {
      const pricingPlan = pricingPlans.find((p) => p.id === planId);

      if (!pricingPlan) {
        router.push("/checkout");
        return;
      }

      if (requiresAuthentication(planId as PlanId) && !user) {
        setShowAuthPrompt(true);
        setIsInitializing(false);
        return;
      }

      if (planId === "hobby") {
        if (!user) {
          router.push("/sign-up");
          return;
        }
        router.push("/dashboard");
        return;
      }

      if (planId === "enterprise") {
        router.push("/contact-us");
        return;
      }

      if (user) {
        setSelectedPlan(convertToCheckoutPlan(pricingPlan));
        setBillingPeriod(frequency);
        setStep("payment-method");
      }
    }

    setIsInitializing(false);
  }, [isLoaded, user, searchParams, router]);

  // Handle scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleAuthRequired = () => {
    const currentPlan = searchParams.get("plan");
    const currentFrequency = searchParams.get("frequency");
    const redirectUrl = `/checkout?plan=${currentPlan}&frequency=${currentFrequency}`;

    router.push(`/sign-in?redirect_url=${encodeURIComponent(redirectUrl)}`);
  };

  const handleBack = () => {
    if (step === "checkout") {
      setStep("payment-method");
    } else if (step === "payment-method") {
      setStep("plans");
    }
  };

  const handlePaymentMethodContinue = () => {
    setStep("checkout");
  };

  const handleCompleteCheckout = async (formData: any) => {
    if (!selectedPlan) return;

    createPayment.mutate({
      planId: selectedPlan.id,
      billingPeriod,
      amount: total,
      email: formData.email,
    });
  };

  const currentPrice = selectedPlan
    ? billingPeriod === "monthly"
      ? selectedPlan.monthlyPrice
      : selectedPlan.yearlyPrice
    : 0;

  const subtotal = currentPrice;
  const discountAmount = (subtotal * discount) / 100;
  const total = subtotal - discountAmount;

  const steps = [
    { id: "plans", label: "Choose Plan", completed: step !== "plans" },
    {
      id: "payment-method",
      label: "Payment Method",
      completed: step === "checkout",
    },
    { id: "checkout", label: "Complete Purchase", completed: false },
  ];

  // Show loading screen while initializing
  if (isInitializing || isLoadingSubscription) {
    return (
      <div className="min-h-screen min-w-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen min-w-screen bg-background  ">
      {/* Header */}
      <header
        className={`border-b border-border/50 backdrop-blur-md sticky top-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-background/95 shadow-lg shadow-primary/5"
            : "bg-background/80"
        }`}
      >
        <div className="container mx-auto px-4 lg:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3 group">
            <div className="w-9 h-9 bg-linear-to-br from-primary to-accent rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold bg-linear-to-r from-foreground to-foreground/80 bg-clip-text">
              WebBuilder
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {["Home", "Features", "Pricing"].map((item) => (
              <Link
                key={item}
                href={item === "Home" ? "/" : `/#${item.toLowerCase()}`}
                className="text-muted-foreground hover:text-foreground transition-all duration-300 relative group"
              >
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-linear-to-r from-primary to-accent group-hover:w-full transition-all duration-300"></span>
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <ThemeSwitcher />
            {isLoaded && user ? (
              // Authenticated user - show Dashboard and Profile
              <>
                <Button
                  variant="ghost"
                  className="text-muted-foreground hover:text-foreground transition-all duration-300"
                  asChild
                >
                  <Link href="/profile">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </Button>
                <Button
                  className="bg-linear-to-r from-primary to-accent text-primary-foreground font-semibold hover:shadow-lg hover:shadow-primary/25 transition-all duration-300 hover:scale-105"
                  asChild
                >
                  <Link href="/dashboard">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                  </Link>
                </Button>
              </>
            ) : (
              // Not authenticated - show Sign In and Start Free Trial
              <>
                <Button
                  variant="ghost"
                  className="text-muted-foreground hover:text-foreground transition-all duration-300"
                  asChild
                >
                  <Link href="/sign-in">Sign In</Link>
                </Button>
                <Button
                  className="bg-linear-to-r from-primary to-accent text-primary-foreground font-semibold hover:shadow-lg hover:shadow-primary/25 transition-all duration-300 hover:scale-105"
                  asChild
                >
                  <Link href="/sign-up">Start Free Trial</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden transition-all duration-300 hover:bg-accent/10"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <div className="relative w-5 h-5">
              <Menu
                className={`absolute inset-0 transition-all duration-300 ${mobileMenuOpen ? "opacity-0 rotate-90" : "opacity-100 rotate-0"}`}
              />
              <X
                className={`absolute inset-0 transition-all duration-300 ${mobileMenuOpen ? "opacity-100 rotate-0" : "opacity-0 -rotate-90"}`}
              />
            </div>
          </Button>
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden border-t border-border/50 bg-background/95 backdrop-blur-md transition-all duration-500 ${
            mobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          } overflow-hidden`}
        >
          <div className="container mx-auto px-4 py-6 space-y-4">
            {["Home", "Features", "Pricing"].map((item, index) => (
              <Link
                key={item}
                href={item === "Home" ? "/" : `/#${item.toLowerCase()}`}
                className={`block text-muted-foreground hover:text-foreground transition-all duration-300 transform ${
                  mobileMenuOpen
                    ? "translate-x-0 opacity-100"
                    : "-translate-x-4 opacity-0"
                }`}
                style={{
                  transitionDelay: `${index * 100}ms`,
                }}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item}
              </Link>
            ))}
            <div className="flex flex-col space-y-3 pt-4 border-t border-border/50">
              {isLoaded && user ? (
                // Authenticated user - show Dashboard and Profile
                <>
                  <Button variant="ghost" className="justify-start" asChild>
                    <Link href="/profile">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </Button>
                  <Button
                    className="bg-linear-to-r from-primary to-accent text-primary-foreground font-semibold"
                    asChild
                  >
                    <Link href="/dashboard">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                  </Button>
                </>
              ) : (
                // Not authenticated - show Sign In and Start Free Trial
                <>
                  <Button variant="ghost" className="justify-start" asChild>
                    <Link href="/sign-in">Sign In</Link>
                  </Button>
                  <Button
                    className="bg-linear-to-r from-primary to-accent text-primary-foreground font-semibold"
                    asChild
                  >
                    <Link href="/sign-up">Start Free Trial</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container px-3 sm:px-4 py-6 sm:py-8 md:py-12 max-w-screen-2xl mx-auto">
        {/* Show subscription status if user has active subscription */}
        {subscriptionStatus?.hasActiveSubscription && step !== "plans" && (
          <div className="max-w-3xl mx-auto mb-6">
            <div className="flex flex-col gap-3 p-4 rounded-lg border border-primary/50 bg-primary/5">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <div className="flex-1">
                  <h3 className="font-semibold text-sm mb-1">
                    Gói đăng ký hiện tại
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Bạn đang có gói{" "}
                    <strong className="text-foreground">
                      {subscriptionStatus.subscription?.planId}
                    </strong>{" "}
                    đang hoạt động (còn{" "}
                    <strong className="text-foreground">
                      {subscriptionStatus.subscription?.daysUntilExpiry}
                    </strong>{" "}
                    ngày).
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {selectedPlan?.id ===
                    subscriptionStatus.subscription?.planId
                      ? "Bạn đang chọn cùng gói hiện tại. Chọn gói khác hoặc hủy gói hiện tại để đăng ký lại."
                      : "Việc thanh toán gói mới sẽ tự động hủy và thay thế gói hiện tại."}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCancelDialog(true)}
                  disabled={cancelSubscription.isPending}
                  className="text-xs"
                >
                  {cancelSubscription.isPending
                    ? "Đang hủy..."
                    : "Hủy gói hiện tại"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {step !== "plans" && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto mb-6 sm:mb-8"
          >
            <div className="flex justify-start pl-6 sm:justify-center overflow-x-auto pb-2 sm:pb-0 scrollbar-hide px-2">
              {steps.map((s, index) => (
                <div key={s.id} className="flex items-center flex-1 min-w-0">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div
                      className={cn(
                        "w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold transition-all duration-300 shrink-0",
                        s.completed
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : step === s.id
                            ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                            : "bg-secondary text-muted-foreground",
                      )}
                    >
                      {s.completed ? (
                        <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                      ) : (
                        index + 1
                      )}
                    </div>
                    <span
                      className={cn(
                        "text-xs sm:text-sm font-medium hidden sm:block whitespace-nowrap",
                        step === s.id
                          ? "text-foreground"
                          : "text-muted-foreground",
                      )}
                    >
                      {s.label}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={cn(
                        "h-px flex-1 mx-2 sm:mx-4 min-w-5 transition-all duration-300",
                        s.completed ? "bg-primary" : "bg-border",
                      )}
                    />
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {step === "plans" ? (
            <motion.div
              key="plans"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <LandingPagePricing />
            </motion.div>
          ) : step === "payment-method" ? (
            <motion.div
              key="payment-method"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="max-w-6xl mx-auto"
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="mb-4 sm:mb-6"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                <span className="hidden xs:inline">Back to plans</span>
                <span className="xs:hidden">Back</span>
              </Button>

              <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] xl:grid-cols-[1fr_400px] gap-6 lg:gap-8">
                <div className="space-y-4 sm:space-y-6 order-2 lg:order-1">
                  <PaymentMethodSelector
                    selectedMethod={paymentMethod}
                    onMethodChange={setPaymentMethod}
                  />
                  <Button
                    onClick={handlePaymentMethodContinue}
                    size="lg"
                    className="w-full bg-primary hover:bg-primary/90 shadow-md hover:shadow-lg hover:shadow-primary/20"
                  >
                    Continue to payment details
                  </Button>
                </div>

                <div className="order-1 lg:order-2">
                  <OrderSummary
                    selectedPlan={selectedPlan!}
                    billingPeriod={billingPeriod}
                    subtotal={subtotal}
                    discount={discount}
                    total={total}
                    onDiscountApply={setDiscount}
                    paymentMethod={paymentMethod}
                  />
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="checkout"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="max-w-7xl mx-auto"
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="mb-4 sm:mb-6"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                <span className="hidden xs:inline">Back to payment method</span>
                <span className="xs:hidden">Back</span>
              </Button>
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] xl:grid-cols-[1fr_400px] gap-6 lg:gap-8">
                <div className="order-2 lg:order-1">
                  <CheckoutForm
                    selectedPlan={selectedPlan!}
                    billingPeriod={billingPeriod}
                    paymentMethod={paymentMethod}
                    onBillingPeriodChange={setBillingPeriod}
                    onSubmit={handleCompleteCheckout}
                  />
                </div>
                <div className="order-1 lg:order-2">
                  <OrderSummary
                    selectedPlan={selectedPlan!}
                    billingPeriod={billingPeriod}
                    subtotal={subtotal}
                    discount={discount}
                    total={total}
                    onDiscountApply={setDiscount}
                    paymentMethod={paymentMethod}
                    onComplete={handleCompleteCheckout}
                    isProcessing={createPayment.isPending}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Dialog open={showAuthPrompt} onOpenChange={setShowAuthPrompt}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Sign in required</DialogTitle>
            <DialogDescription>
              You need to sign in to subscribe to a paid plan. After signing in,
              you'll be redirected back to complete your purchase.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Button onClick={handleAuthRequired} className="w-full" size="lg">
              Sign in
            </Button>
            <Button
              variant="outline"
              className="w-full bg-transparent"
              size="lg"
              onClick={() => router.push("/sign-up")}
            >
              Create account
            </Button>
            <Button
              variant="ghost"
              className="w-full"
              size="sm"
              onClick={() => setShowAuthPrompt(false)}
            >
              Continue browsing plans
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Cancel Subscription Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="w-5 h-5" />
              Hủy gói đăng ký
            </DialogTitle>
            <DialogDescription>
              Bạn có chắc muốn hủy gói{" "}
              <strong>
                {subscriptionStatus?.subscription?.planId?.toUpperCase()}
              </strong>
              ? Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <h4 className="font-medium text-destructive mb-2">
                Điều gì sẽ xảy ra:
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>
                  • Bạn sẽ mất quyền truy cập các tính năng premium ngay lập tức
                </li>
                <li>• Tài khoản sẽ chuyển về gói miễn phí (Hobby)</li>
                <li>• Bạn có thể đăng ký lại bất cứ lúc nào</li>
              </ul>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowCancelDialog(false)}
                className="flex-1"
              >
                Giữ nguyên
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  if (subscriptionStatus?.subscription?.id) {
                    cancelSubscription.mutate(
                      subscriptionStatus.subscription.id,
                    );
                    setShowCancelDialog(false);
                  }
                }}
                disabled={cancelSubscription.isPending}
                className="flex-1"
              >
                {cancelSubscription.isPending ? "Đang hủy..." : "Xác nhận hủy"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Payment Successful!
            </DialogTitle>
            <DialogDescription asChild>
              <div className="space-y-3 pt-4">
                Your subscription to the{" "}
                <strong>{selectedPlan?.name} plan</strong> has been confirmed.
                <div className="p-4 bg-primary/5 rounded-lg space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Plan:</span>
                    <span className="font-semibold">{selectedPlan?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Billing:</span>
                    <span className="font-semibold capitalize">
                      {billingPeriod}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount:</span>
                    <span className="font-semibold">${total.toFixed(2)}</span>
                  </div>
                </div>
                <span className="text-sm text-muted-foreground">
                  You will be redirected to your dashboard in a few seconds...
                </span>
              </div>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4">
            <Button
              onClick={() => router.push("/dashboard")}
              className="w-full"
              size="lg"
            >
              Go to Dashboard
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
