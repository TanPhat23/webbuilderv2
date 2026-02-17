"use client"

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, ArrowRight, Sparkles } from 'lucide-react'
import Link from 'next/link'
import ThemeSwitcher from '@/components/ThemeSwitcher'

function SuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [countdown, setCountdown] = useState(5)

  const transactionId = searchParams.get('transactionId')
  const amount = searchParams.get('amount')

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Separate effect for navigation to avoid setState during render
  useEffect(() => {
    if (countdown === 0) {
      router.push('/dashboard')
    }
  }, [countdown, router])

  return (
    <div className="min-h-screen bg-background min-w-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-md bg-background/80">
        <div className="container mx-auto px-4 lg:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3 group">
            <div className="w-9 h-9 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
              WebBuilder
            </span>
          </div>

          <div className="flex items-center gap-4">
            <ThemeSwitcher />
            <Button variant="outline" size="sm" onClick={() => router.push('/dashboard')}>
              Dashboard
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-16 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="p-8 md:p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-transparent to-transparent pointer-events-none" />
            
            <div className="relative">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 mb-6"
              >
                <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
              </motion.div>

              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                Thanh toán thành công!
              </h1>

              <p className="text-lg text-muted-foreground mb-8">
                Cảm ơn bạn đã đăng ký. Tài khoản của bạn đã được kích hoạt thành công.
              </p>

              {transactionId && (
                <div className="mb-8 p-6 bg-secondary/50 rounded-lg border border-border">
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Mã giao dịch:</span>
                      <span className="font-mono font-semibold">{transactionId}</span>
                    </div>
                    {amount && (
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Số tiền:</span>
                        <span className="font-semibold">{parseFloat(amount).toLocaleString('vi-VN')} VND</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Trạng thái:</span>
                      <span className="text-green-600 dark:text-green-400 font-semibold">Thành công</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <Button
                  size="lg"
                  className="w-full bg-primary hover:bg-primary/90"
                  onClick={() => router.push('/dashboard')}
                >
                  Đến Dashboard
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>

                <p className="text-sm text-muted-foreground">
                  Tự động chuyển hướng trong {countdown} giây...
                </p>
              </div>

              <div className="mt-8 pt-8 border-t border-border">
                <h3 className="font-semibold mb-4">Bước tiếp theo</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                  <div className="p-4 rounded-lg bg-secondary/30 border border-border">
                    <h4 className="font-medium mb-2">1. Tạo dự án đầu tiên</h4>
                    <p className="text-sm text-muted-foreground">
                      Bắt đầu xây dựng website của bạn với công cụ kéo thả trực quan
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-secondary/30 border border-border">
                    <h4 className="font-medium mb-2">2. Khám phá tính năng</h4>
                    <p className="text-sm text-muted-foreground">
                      Tìm hiểu các công cụ và thành phần mạnh mẽ của WebBuilder
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 text-sm text-muted-foreground">
                <p>Cần hỗ trợ? <Link href="/help" className="text-primary hover:underline">Liên hệ với chúng tôi</Link></p>
              </div>
            </div>
          </Card>
        </motion.div>
      </main>
    </div>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4 animate-pulse">
            <CheckCircle className="w-10 h-10 text-primary" />
          </div>
          <p className="text-lg text-muted-foreground">Đang xử lý...</p>
        </div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  )
}
