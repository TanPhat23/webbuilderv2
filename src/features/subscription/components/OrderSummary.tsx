"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Tag, Shield, Sparkles, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Plan } from "./SubscriptionCheckout";
import type { BillingPeriod } from "../interfaces/subscription.interface";
import type { PaymentMethod } from "./PaymentMethod";

interface OrderSummaryProps {
  selectedPlan: Plan;
  billingPeriod: BillingPeriod;
  subtotal: number;
  discount: number;
  total: number;
  onDiscountApply: (discount: number) => void;
  paymentMethod?: PaymentMethod;
  onComplete?: (data: any) => void; // Optional callback for completing purchase
  isProcessing?: boolean; // Loading state for payment processing
}

const paymentMethodIcons = {
  vnpay: Wallet,
};

export function OrderSummary({
  selectedPlan,
  billingPeriod,
  subtotal,
  discount,
  total,
  onDiscountApply,
  paymentMethod,
  onComplete,
  isProcessing = false,
}: OrderSummaryProps) {
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState("");

  const handleApplyCoupon = () => {
    if (couponCode.toUpperCase() === "SAVE20") {
      onDiscountApply(20);
      setCouponApplied(true);
      setCouponError("");
    } else if (couponCode.toUpperCase() === "SAVE10") {
      onDiscountApply(10);
      setCouponApplied(true);
      setCouponError("");
    } else if (couponCode) {
      setCouponError("Invalid coupon code");
      setCouponApplied(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode("");
    setCouponApplied(false);
    setCouponError("");
    onDiscountApply(0);
  };

  const PaymentIcon = paymentMethod
    ? paymentMethodIcons[paymentMethod]
    : Wallet;

  return (
    <div className="space-y-4 sm:space-y-6">
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="p-4 sm:p-6 bg-card/50 backdrop-blur-sm relative overflow-hidden lg:sticky lg:top-8">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />

          <div className="relative">
            <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 flex items-center gap-2">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              Order summary
            </h2>

            {/* Selected Plan */}
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-secondary/50 rounded-lg border border-border/50">
              <div className="flex items-start justify-between mb-2 sm:mb-3">
                <div>
                  <h3 className="font-semibold text-sm sm:text-base text-foreground">
                    {selectedPlan.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {billingPeriod === "monthly"
                      ? "Monthly subscription"
                      : "Annual subscription"}
                  </p>
                </div>
              </div>

              {/* Key Features */}
              <div className="space-y-1.5 sm:space-y-2">
                {selectedPlan.features.slice(0, 4).map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
                    className="flex items-center gap-2 text-xs sm:text-sm"
                  >
                    <div className="flex h-4 w-4 items-center justify-center rounded-full bg-primary/10 shrink-0">
                      <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-primary" />
                    </div>
                    <span className="text-foreground/90 line-clamp-1">
                      {feature}
                    </span>
                  </motion.div>
                ))}
                {selectedPlan.features.length > 4 && (
                  <p className="text-xs sm:text-sm text-muted-foreground pl-6">
                    +{selectedPlan.features.length - 4} more features
                  </p>
                )}
              </div>
            </div>

            {paymentMethod && (
              <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-secondary/50 rounded-lg border border-border/50">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-primary/10 shrink-0">
                    <PaymentIcon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-medium">
                      Phương thức thanh toán
                    </p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">
                      VNPay
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="mb-4 sm:mb-6">
              <label className="text-xs sm:text-sm font-medium mb-2 flex items-center gap-2">
                <Tag className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                Mã giảm giá
              </label>
              <AnimatePresence mode="wait">
                {!couponApplied ? (
                  <motion.div
                    key="input"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex gap-2"
                  >
                    <Input
                      type="text"
                      placeholder="Nhập mã"
                      value={couponCode}
                      onChange={(e) => {
                        setCouponCode(e.target.value);
                        setCouponError("");
                      }}
                      className="flex-1 h-9 sm:h-10 text-sm"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleApplyCoupon}
                      disabled={!couponCode}
                      className="hover:bg-primary/5 hover:text-primary hover:border-primary/50 bg-transparent h-9 sm:h-10 px-3 sm:px-4 text-xs sm:text-sm"
                    >
                      Áp dụng
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="applied"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex items-center justify-between p-2.5 sm:p-3 bg-primary/10 border border-primary/20 rounded-lg"
                  >
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <Check className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                      <span className="text-xs sm:text-sm font-medium text-primary">
                        {couponCode}
                      </span>
                      <span className="text-xs sm:text-sm text-muted-foreground">
                        (giảm {discount}%)
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleRemoveCoupon}
                      className="hover:text-destructive h-auto p-1 text-xs"
                    >
                      Xóa
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
              <AnimatePresence>
                {couponError && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-xs sm:text-sm text-destructive mt-1.5"
                  >
                    {couponError}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <div className="space-y-2 sm:space-y-3 py-3 sm:py-4 border-t border-border">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex items-center justify-between text-xs sm:text-sm"
              >
                <span className="text-muted-foreground">Tạm tính</span>
                <span className="font-medium">${subtotal.toFixed(2)}</span>
              </motion.div>
              <AnimatePresence>
                {discount > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center justify-between text-xs sm:text-sm"
                  >
                    <span className="text-muted-foreground">
                      Giảm giá ({discount}%)
                    </span>
                    <span className="font-medium text-primary">
                      -${((subtotal * discount) / 100).toFixed(2)}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex items-center justify-between pt-2 sm:pt-3 border-t border-border"
              >
                <span className="font-semibold text-sm sm:text-base">
                  Tổng cộng
                </span>
                <div className="text-right">
                  <div className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                    ${total.toFixed(2)}
                  </div>
                  <div className="text-[10px] sm:text-xs text-muted-foreground">
                    {billingPeriod === "monthly" ? "mỗi tháng" : "mỗi năm"}
                  </div>
                </div>
              </motion.div>
            </div>

            {onComplete && (
              <Button
                type="submit"
                form="checkout-form"
                size="lg"
                disabled={isProcessing}
                className={cn(
                  "w-full mt-4 sm:mt-6 font-semibold transition-all duration-300 h-11 sm:h-12 text-sm sm:text-base",
                  "bg-primary hover:bg-primary/90",
                  "shadow-md hover:shadow-lg hover:shadow-primary/20",
                  "hover:scale-[1.02] active:scale-[0.98]",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                )}
              >
                {isProcessing ? (
                  <div className="flex items-center gap-2">
                    <svg
                      className="animate-spin h-4 w-4 sm:h-5 sm:w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Processing...
                  </div>
                ) : (
                  "Thanh toán"
                )}
              </Button>
            )}

            {/* Security Notice */}
            <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-secondary/50 rounded-lg border border-border/50">
              <div className="flex items-start gap-2 sm:gap-3">
                <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs sm:text-sm font-medium mb-1">
                    Thanh toán an toàn - Mã hóa SSL
                  </p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground leading-relaxed">
                    Thông tin thanh toán của bạn được xử lý an toàn qua VNPay.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="p-3 sm:p-4 bg-primary/5 border-primary/20 backdrop-blur-sm">
          <div className="flex items-start gap-2 sm:gap-3">
            <div className="flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center rounded-full bg-primary/10 shrink-0 mt-0.5">
              <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-primary" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium mb-1">
                Đảm bảo hoàn tiền trong 14 ngày
              </p>
              <p className="text-[10px] sm:text-xs text-muted-foreground leading-relaxed">
                Không hài lòng? Hoàn tiền 100% trong 14 ngày, không cần lý do.
              </p>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
