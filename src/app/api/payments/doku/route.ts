import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createDokuPayment } from '@/lib/payments/doku'

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

    // Generate invoice number
    const invoiceNumber = `INV-${booking.id.slice(0, 8).toUpperCase()}-${Date.now()}`

    const origin = new URL(request.url).origin

    const amountToPay = booking.deposit_amount || booking.total_price;

    // Create DOKU payment
    const dokuResponse = await createDokuPayment({
      invoiceNumber,
      amount: amountToPay,
      customerName: booking.full_name,
      customerEmail: booking.email,
      callbackUrl: `${origin}/api/payments/doku/notify`,
      redirectUrl: `${origin}/booking/success?booking_id=${booking.id}`,
    })

    if (!dokuResponse?.response?.payment?.url) {
      console.error('DOKU response error:', dokuResponse)
      return NextResponse.json(
        { error: 'Failed to create DOKU payment' },
        { status: 500 }
      )
    }

    // Create payment record in DB (using service role for insert)
    const { error: paymentError } = await supabase
      .from('payments')
      .insert({
        booking_id: booking.id,
        provider: 'doku',
        provider_order_id: invoiceNumber,
        amount: amountToPay,
        currency: 'USD',
        status: 'pending',
        raw_response: dokuResponse,
      })

    if (paymentError) {
      console.error('Payment record error:', paymentError)
      // Don't block the user — payment page still works
    }

    return NextResponse.json({
      payment_url: dokuResponse.response.payment.url,
      invoice_number: invoiceNumber,
    })
  } catch (err) {
    console.error('DOKU payment error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
