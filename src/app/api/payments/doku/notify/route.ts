import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { verifyDokuNotification } from '@/lib/payments/doku'

/**
 * DOKU Webhook — receives payment status notifications.
 * This endpoint is called by DOKU's server, NOT by the user's browser.
 * We use the service_role key to bypass RLS.
 */
export async function POST(request: Request) {
  try {
    const body = await request.text()
    const headers = Object.fromEntries(request.headers.entries())

    // Verify DOKU signature
    const isValid = verifyDokuNotification({
      requestId: headers['request-id'] || '',
      requestTimestamp: headers['request-timestamp'] || '',
      requestTarget: '/api/payments/doku/notify',
      body,
      receivedSignature: headers['signature'] || '',
    })

    if (!isValid) {
      console.error('Invalid DOKU webhook signature')
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      )
    }

    const notification = JSON.parse(body)

    // Extract key fields from DOKU notification
    const invoiceNumber = notification?.order?.invoice_number
    const transactionStatus = notification?.transaction?.status
    const transactionId = notification?.transaction?.identifier?.[0]?.value

    if (!invoiceNumber) {
      return NextResponse.json(
        { error: 'Missing invoice number' },
        { status: 400 }
      )
    }

    // Map DOKU status to our status
    let paymentStatus: string
    switch (transactionStatus?.toUpperCase()) {
      case 'SUCCESS':
        paymentStatus = 'paid'
        break
      case 'FAILED':
        paymentStatus = 'failed'
        break
      case 'EXPIRED':
        paymentStatus = 'expired'
        break
      default:
        paymentStatus = 'pending'
    }

    // Use service_role to bypass RLS for webhook updates
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
        raw_response: notification,
        paid_at: paymentStatus === 'paid' ? new Date().toISOString() : null,
      })
      .eq('provider_order_id', invoiceNumber)

    if (paymentError) {
      console.error('Failed to update payment:', paymentError)
    }

    // If payment is successful, update booking status
    if (paymentStatus === 'paid') {
      // Get the payment to find the booking_id
      const { data: payment } = await supabase
        .from('payments')
        .select('booking_id')
        .eq('provider_order_id', invoiceNumber)
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
    }

    return NextResponse.json({ message: 'OK' })
  } catch (err) {
    console.error('DOKU webhook error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
