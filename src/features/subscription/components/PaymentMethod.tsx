"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Wallet } from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"

export type PaymentMethod = "vnpay"

interface PaymentMethodSelectorProps {
  selectedMethod: PaymentMethod
  onMethodChange: (method: PaymentMethod) => void
}

const paymentMethods = [
  {
    id: "vnpay" as PaymentMethod,
    name: "VNPay",
    description: "Thanh toán qua VNPay - Hỗ trợ thẻ ATM, Visa, Mastercard, QR Code",
    icon: Wallet,
    processingTime: "Ngay lập tức",
  },
]

export function PaymentMethodSelector({ selectedMethod, onMethodChange }: PaymentMethodSelectorProps) {
  return (
    <Card className="p-4 sm:p-6 bg-card/50 backdrop-blur-sm">
      <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 flex items-center gap-2">
        <Wallet className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
        Select payment method
      </h2>

      <RadioGroup value={selectedMethod} onValueChange={(value) => onMethodChange(value as PaymentMethod)}>
        <div className="space-y-2 sm:space-y-3">
          {paymentMethods.map((method, index) => {
            const Icon = method.icon
            const isSelected = selectedMethod === method.id

            return (
              <motion.label
                key={method.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className={cn(
                  "flex items-center gap-3 sm:gap-4 p-3 sm:p-4 border rounded-lg cursor-pointer transition-all duration-200",
                  isSelected
                    ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20"
                    : "border-border hover:border-primary/50 hover:bg-secondary/50",
                )}
              >
                <RadioGroupItem value={method.id} id={method.id} className="shrink-0" />
                <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                  <div
                    className={cn(
                      "flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full transition-colors shrink-0",
                      isSelected ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground",
                    )}
                  >
                    <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-foreground text-sm sm:text-base">{method.name}</div>
                    <div className="text-xs sm:text-sm text-muted-foreground truncate">{method.description}</div>
                  </div>
                  <div className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block">{method.processingTime}</div>
                </div>
              </motion.label>
            )
          })}
        </div>
      </RadioGroup>

      <div className="mt-3 sm:mt-4 p-2.5 sm:p-3 bg-secondary/50 rounded-lg border border-border/50">
        <p className="text-[10px] sm:text-xs text-muted-foreground leading-relaxed">
          All payment methods are secured with industry-standard encryption. Your payment information is never stored on
          our servers.
        </p>
      </div>
    </Card>
  )
}
