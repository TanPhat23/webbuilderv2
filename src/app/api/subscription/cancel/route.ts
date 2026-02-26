import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { subscriptionDAL } from '@/features/subscription/data/subscription'
import prisma from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { subscriptionId } = body

    if (!subscriptionId) {
      return NextResponse.json(
        { error: 'Subscription ID is required' },
        { status: 400 }
      )
    }

    // Verify ownership by getting the subscription
    const subscription = await subscriptionDAL.getSubscriptionById(subscriptionId)

    if (!subscription) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      )
    }

    // Verify ownership
    if (subscription.UserId !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized to cancel this subscription' },
        { status: 403 }
      )
    }

    // Check if already cancelled
    if (subscription.Status === 'cancelled') {
      return NextResponse.json(
        { error: 'Subscription is already cancelled' },
        { status: 400 }
      )
    }

    // Cancel the subscription using DAL
    await subscriptionDAL.cancelSubscription(subscriptionId)
    
    // Create notification for subscription cancellation
    await prisma?.notification.create({
      data: {
        UserId: userId,
        Type: 'alert',
        Title: 'Subscription Cancelled',
        Description: `Your ${subscription.PlanId} plan subscription (${subscription.BillingPeriod}) has been cancelled. You can re-subscribe anytime from our pricing page.`,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Subscription cancelled successfully',
    })
  } catch (error) {
    console.error('Error cancelling subscription:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
