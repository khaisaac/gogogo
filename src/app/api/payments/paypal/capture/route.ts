import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
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

    // Use service_role to bypass RLS — the user may not own the payment row
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          getAll() { return [] },
          setAll() {},
        },
      }
    )

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
        const { data: booking } = await supabase
          .from('bookings')
          .select('payment_type, payment_status')
          .eq('id', payment.booking_id)
          .single()

        let newPaymentStatus = 'fully_paid'
        if (
          booking?.payment_type === 'deposit' &&
          booking?.payment_status === 'pending'
        ) {
          newPaymentStatus = 'deposit_paid'
        }

        await supabase
          .from('bookings')
          .update({
            status: 'confirmed',
            payment_status: newPaymentStatus,
          })
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
