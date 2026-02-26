"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useSubscriptionStatus, useCancelSubscription } from "@/features/subscription"
import { Loader2, Calendar, CreditCard, AlertCircle, CheckCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { useState } from "react"

export function SubscriptionCard() {
  const router = useRouter()
  const { data: subscriptionStatus, isLoading } = useSubscriptionStatus()
  const cancelSubscription = useCancelSubscription()
  const [showCancelDialog, setShowCancelDialog] = useState(false)

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      </Card>
    )
  }

  if (!subscriptionStatus?.hasActiveSubscription) {
    return (
      <Card className="p-6 border-dashed">
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <AlertCircle className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Chưa có gói đăng ký</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Bạn đang sử dụng gói miễn phí (Hobby). Nâng cấp để mở khóa thêm tính năng.
          </p>
          <Button onClick={() => router.push('/checkout')}>
            Xem các gói đăng ký
          </Button>
        </div>
      </Card>
    )
  }

  const { subscription } = subscriptionStatus
  const isExpiringSoon = subscription && subscription.daysUntilExpiry <= 7

  return (
    <>
      <Card className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold mb-1">Gói đăng ký hiện tại</h3>
            <div className="flex items-center gap-2">
              <Badge variant="default" className="text-xs">
                {subscription?.planId.toUpperCase()}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {subscription?.billingPeriod === 'monthly' ? 'Hàng tháng' : 'Hàng năm'}
              </Badge>
            </div>
          </div>
          <CheckCircle className="w-6 h-6 text-green-600" />
        </div>

        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">Ngày hết hạn:</span>
            <span className="font-medium">
              {subscription?.endDate && format(new Date(subscription.endDate), 'dd/MM/yyyy')}
            </span>
          </div>

          {isExpiringSoon && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 shrink-0" />
              <div className="text-xs">
                <p className="font-medium text-yellow-600 mb-1">Sắp hết hạn!</p>
                <p className="text-muted-foreground">
                  Gói của bạn sẽ hết hạn trong {subscription?.daysUntilExpiry} ngày. 
                  Gia hạn ngay để tiếp tục sử dụng.
                </p>
              </div>
            </div>
          )}

          {!isExpiringSoon && (
            <div className="text-xs text-muted-foreground">
              Còn <strong className="text-foreground">{subscription?.daysUntilExpiry}</strong> ngày
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/checkout')}
            className="flex-1"
          >
            <CreditCard className="w-4 h-4 mr-2" />
            Đổi gói
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCancelDialog(true)}
            disabled={cancelSubscription.isPending}
            className="flex-1 text-destructive hover:text-destructive"
          >
            {cancelSubscription.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Đang hủy...
              </>
            ) : (
              'Hủy gói'
            )}
          </Button>
        </div>
      </Card>

      {/* Cancel Subscription Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="w-5 h-5" />
              Hủy gói đăng ký
            </DialogTitle>
            <DialogDescription>
              Bạn có chắc muốn hủy gói <strong>{subscription?.planId?.toUpperCase()}</strong>?
              Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <h4 className="font-medium text-destructive mb-2">Điều gì sẽ xảy ra:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Bạn sẽ mất quyền truy cập các tính năng premium ngay lập tức</li>
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
                  if (subscription?.id) {
                    cancelSubscription.mutate(subscription.id)
                    setShowCancelDialog(false)
                  }
                }}
                disabled={cancelSubscription.isPending}
                className="flex-1"
              >
                {cancelSubscription.isPending ? 'Đang hủy...' : 'Xác nhận hủy'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
