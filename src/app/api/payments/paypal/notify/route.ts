import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { verifyPayPalWebhook } from '@/lib/payments/paypal'

/**
 * PayPal Webhook — receives payment event notifications.
 * This is a backup mechanism. The primary flow uses the capture route.
 * Uses service_role key to bypass RLS.
 */
export async function POST(request: Request) {
  try {
    const body = await request.text()
    const headers = Object.fromEntries(request.headers.entries())

    // Verify PayPal webhook signature
    const webhookId = process.env.PAYPAL_WEBHOOK_ID
    if (webhookId) {
      const isValid = await verifyPayPalWebhook({
        webhookId,
        headers,
        body,
      })

      if (!isValid) {
        console.error('Invalid PayPal webhook signature')
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 401 }
        )
      }
    }

    const event = JSON.parse(body)
    const eventType = event?.event_type

    // Use service_role to bypass RLS
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

    // Handle different event types
    switch (eventType) {
      case 'CHECKOUT.ORDER.APPROVED':
      case 'PAYMENT.CAPTURE.COMPLETED': {
        const orderId =
          event?.resource?.id ||
          event?.resource?.supplementary_data?.related_ids?.order_id

        if (!orderId) break

        const transactionId =
          eventType === 'PAYMENT.CAPTURE.COMPLETED'
            ? event?.resource?.id
            : null

        await supabase
          .from('payments')
          .update({
            status: 'paid',
            provider_transaction_id: transactionId,
            raw_response: event,
            paid_at: new Date().toISOString(),
          })
          .eq('provider_order_id', orderId)

        // Auto-confirm booking
        const { data: payment } = await supabase
          .from('payments')
          .select('booking_id')
          .eq('provider_order_id', orderId)
          .single()

        if (payment) {
          const { data: booking } = await supabase
            .from('bookings')
            .select('payment_type, payment_status')
            .eq('id', payment.booking_id)
            .single();

          let newPaymentStatus = 'fully_paid';
          if (booking?.payment_type === 'deposit' && booking?.payment_status === 'pending') {
            newPaymentStatus = 'deposit_paid';
          }

          await supabase
            .from('bookings')
            .update({ 
              status: 'confirmed',
              payment_status: newPaymentStatus
            })
            .eq('id', payment.booking_id)
        }
        break
      }

      case 'PAYMENT.CAPTURE.DENIED':
      case 'PAYMENT.CAPTURE.REFUNDED': {
        const orderId =
          event?.resource?.supplementary_data?.related_ids?.order_id

        if (!orderId) break

        const status =
          eventType === 'PAYMENT.CAPTURE.REFUNDED' ? 'refunded' : 'failed'

        await supabase
          .from('payments')
          .update({
            status,
            raw_response: event,
          })
          .eq('provider_order_id', orderId)
        break
      }

      default:
        console.log('Unhandled PayPal event type:', eventType)
    }

    return NextResponse.json({ message: 'OK' })
  } catch (err) {
    console.error('PayPal webhook error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
