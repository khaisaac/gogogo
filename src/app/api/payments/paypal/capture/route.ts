import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { capturePayPalOrder } from '@/lib/payments/paypal'

export async function POST(request: Request) {
  try {
    const { order_id } = await request.json()

    if (!order_id) {
      return NextResponse.json(
        { error: 'order_id is required' },
        { status: 400 }
      )
    }

    // Capture the PayPal order
    const captureData = await capturePayPalOrder(order_id)

    const captureStatus = captureData?.status
    const transactionId =
      captureData?.purchase_units?.[0]?.payments?.captures?.[0]?.id

    // Map PayPal status to our status
    let paymentStatus: string
    switch (captureStatus) {
      case 'COMPLETED':
        paymentStatus = 'paid'
        break
      case 'DECLINED':
        paymentStatus = 'failed'
        break
      default:
        paymentStatus = 'pending'
    }

    const supabase = await createClient()

    // Update payment record
    const { error: paymentError } = await supabase
      .from('payments')
      .update({
        status: paymentStatus,
        provider_transaction_id: transactionId || null,
        raw_response: captureData,
        paid_at: paymentStatus === 'paid' ? new Date().toISOString() : null,
      })
      .eq('provider_order_id', order_id)

    if (paymentError) {
      console.error('Failed to update payment:', paymentError)
    }

    // If payment is successful, update booking status
    if (paymentStatus === 'paid') {
      const { data: payment } = await supabase
        .from('payments')
        .select('booking_id')
        .eq('provider_order_id', order_id)
        .single()

      if (payment) {
        await supabase
          .from('bookings')
          .update({ status: 'confirmed' })
          .eq('id', payment.booking_id)
      }
    }

    return NextResponse.json({
      status: paymentStatus,
      transaction_id: transactionId,
      capture: captureData,
    })
  } catch (err) {
    console.error('PayPal capture error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
