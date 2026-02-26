import { NextRequest, NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { subscriptionDAL } from '@/features/subscription/data/subscription'

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all subscriptions for the user
    const subscriptions = await subscriptionDAL.getSubscriptionsByUser(userId)

    return NextResponse.json({
      subscriptions,
    })
  } catch (error) {
    console.error('Error fetching subscriptions:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    const clerkUser = await currentUser()

    if (!userId || !clerkUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { planId, billingPeriod, amount } = body

    if (!planId || !billingPeriod || amount === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: planId, billingPeriod, amount' },
        { status: 400 }
      )
    }

    // Create subscription using DAL
    const subscription = await subscriptionDAL.createSubscription({
      userId,
      planId,
      billingPeriod,
      amount,
    })

    return NextResponse.json({
      success: true,
      subscription,
    })
  } catch (error) {
    console.error('Error creating subscription:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}