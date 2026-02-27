"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Lock, Mail, Wallet, ShieldCheck } from "lucide-react";
import type { Plan } from "./SubscriptionCheckout";
import type { BillingPeriod } from "../interfaces/subscription.interface";
import type { PaymentMethod } from "./PaymentMethod";

interface CheckoutFormProps {
  selectedPlan: Plan;
  billingPeriod: BillingPeriod;
  paymentMethod: PaymentMethod;
  onBillingPeriodChange: (period: BillingPeriod) => void;
  onSubmit: (data: any) => void;
}

export function CheckoutForm({ paymentMethod, onSubmit }: CheckoutFormProps) {
  const [formData, setFormData] = useState({
    email: "",
    acceptTerms: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    const newErrors: Record<string, string> = {};

    if (!formData.email) newErrors.email = "Vui lòng nhập email";
    if (!formData.acceptTerms)
      newErrors.acceptTerms = "Bạn phải chấp nhận điều khoản";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    console.log("[Checkout] Processing VNPay payment...", {
      formData,
      paymentMethod,
    });
    onSubmit(formData);
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const renderPaymentForm = () => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="p-4 sm:p-6 bg-card/50 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="text-lg sm:text-xl font-semibold flex items-center gap-2">
              <Wallet className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              Thanh toán qua VNPay
            </h2>
            <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-muted-foreground">
              <Lock className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
              <span>Bảo mật</span>
            </div>
          </div>

          <div className="space-y-3 sm:space-y-4">
            <div className="p-4 sm:p-6 bg-secondary/50 rounded-lg border border-border">
              <div className="text-center mb-4">
                <Wallet className="w-12 h-12 sm:w-16 sm:h-16 text-primary mx-auto mb-3" />
                <h3 className="font-semibold mb-2">
                  Thanh toán an toàn với VNPay
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Bạn sẽ được chuyển hướng đến cổng thanh toán VNPay để hoàn tất
                  giao dịch một cách an toàn.
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs sm:text-sm">
                  <ShieldCheck className="w-4 h-4 text-green-600" />
                  <span>Hỗ trợ thẻ ATM nội địa</span>
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm">
                  <ShieldCheck className="w-4 h-4 text-green-600" />
                  <span>Thẻ Visa, Mastercard, JCB</span>
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm">
                  <ShieldCheck className="w-4 h-4 text-green-600" />
                  <span>Quét mã QR thanh toán</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-border">
                <div className="flex items-center justify-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-muted-foreground">
                  <Lock className="w-3 h-3" />
                  <span>Mã hóa SSL 256-bit - Được bảo vệ bởi VNPay</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <form
        id="checkout-form"
        onSubmit={handleSubmit}
        className="space-y-4 sm:space-y-6"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="p-4 sm:p-6 bg-card/50 backdrop-blur-sm">
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 flex items-center gap-2">
              <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              Thông tin tài khoản
            </h2>
            <div className="space-y-3 sm:space-y-4">
              <div>
                <Label
                  htmlFor="email"
                  className="text-xs sm:text-sm font-medium"
                >
                  Địa chỉ email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@example.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="mt-1.5 h-9 sm:h-10 text-sm sm:text-base"
                />
                {errors.email && (
                  <p className="text-xs text-destructive mt-1">
                    {errors.email}
                  </p>
                )}
                <p className="text-[10px] sm:text-xs text-muted-foreground mt-1.5">
                  Chúng tôi sẽ gửi hóa đơn và thông tin tài khoản đến email này
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {renderPaymentForm()}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 bg-card/50 backdrop-blur-sm rounded-lg border border-border"
        >
          <Checkbox
            id="terms"
            checked={formData.acceptTerms}
            onCheckedChange={(checked: boolean) =>
              handleInputChange("acceptTerms", checked === true)
            }
            className="mt-0.5 sm:mt-1"
          />
          <div className="flex-1">
            <label
              htmlFor="terms"
              className="text-xs sm:text-sm text-muted-foreground leading-relaxed cursor-pointer"
            >
              Tôi đồng ý với{" "}
              <a
                href="#"
                className="text-primary underline underline-offset-2 hover:text-primary/80 transition-colors"
              >
                Điều khoản dịch vụ
              </a>{" "}
              và{" "}
              <a
                href="#"
                className="text-primary underline underline-offset-2 hover:text-primary/80 transition-colors"
              >
                Chính sách bảo mật
              </a>
              . Gói đăng ký sẽ tự động gia hạn và tôi có thể hủy bất cứ lúc nào.
            </label>
            {errors.acceptTerms && (
              <p className="text-xs text-destructive mt-1">
                {errors.acceptTerms}
              </p>
            )}
          </div>
        </motion.div>
      </form>
    </div>
  );
}
