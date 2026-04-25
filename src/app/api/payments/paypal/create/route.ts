import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createPayPalOrder } from '@/lib/payments/paypal'

export async function POST(request: Request) {
  try {
    const { booking_id } = await request.json()

    if (!booking_id) {
      return NextResponse.json(
        { error: 'booking_id is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Fetch the booking
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', booking_id)
      .single()

    if (bookingError || !booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    if (!booking.total_price) {
      return NextResponse.json(
        { error: 'Booking has no price set. Please contact admin.' },
        { status: 400 }
      )
    }

    const origin = new URL(request.url).origin
    const invoiceId = `PP-${booking.id.slice(0, 8).toUpperCase()}-${Date.now()}`

    const amountToPay = booking.deposit_amount || booking.total_price;

    // Create PayPal order
    const paypalOrder = await createPayPalOrder({
      amount: amountToPay,
      currency: 'USD',
      description: booking.package_title || 'Rinjani Trekking Package',
      invoiceId,
      returnUrl: `${origin}/booking/success?booking_id=${booking.id}`,
      cancelUrl: `${origin}/booking/payment?booking_id=${booking.id}&cancelled=true`,
    })

    // Extract the approval link
    const approvalLink = paypalOrder?.links?.find(
      (link: { rel: string; href: string }) => link.rel === 'payer-action' || link.rel === 'approve'
    )?.href

    if (!approvalLink) {
      console.error('PayPal response missing approval link:', paypalOrder)
      return NextResponse.json(
        { error: 'Failed to create PayPal order' },
        { status: 500 }
      )
    }

    // Create payment record
    const { error: paymentError } = await supabase
      .from('payments')
      .insert({
        booking_id: booking.id,
        provider: 'paypal',
        provider_order_id: paypalOrder.id,
        amount: amountToPay,
        currency: 'USD',
        status: 'pending',
        raw_response: paypalOrder,
      })

    if (paymentError) {
      console.error('Payment record error:', paymentError)
    }

    return NextResponse.json({
      order_id: paypalOrder.id,
      approval_url: approvalLink,
    })
  } catch (err) {
    console.error('PayPal create order error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
