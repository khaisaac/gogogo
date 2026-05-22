import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUser } from "@/lib/auth";
import { createDokuIdrPayment } from "@/lib/payments/doku";

export async function POST(req: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized. Please log in first." }, { status: 401 });
    }

    const body = await req.json();
    const {
      full_name,
      whatsapp,
      passport,
      route_id,
      booking_date,
      pickup_time,
      pickup_location,
      dropoff_location,
      number_of_pax,
      payment_type, // "full" or "deposit"
    } = body;

    // Validation
    if (!full_name || !whatsapp || !passport || !route_id || !booking_date || !payment_type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Fetch the route/option
    const option = await prisma.transportOption.findUnique({
      where: { id: route_id },
    });

    if (!option) {
      return NextResponse.json({ error: "Selected transport route not found" }, { status: 404 });
    }

    const totalPrice = option.price;
    let depositAmount = totalPrice;
    let balanceAmount = 0;

    if (payment_type === "deposit") {
      depositAmount = Math.round(totalPrice * 0.3);
      balanceAmount = totalPrice - depositAmount;
    }

    // Create booking in database
    const booking = await prisma.transportBooking.create({
      data: {
        user_id: user.id,
        full_name,
        whatsapp,
        passport,
        booking_date: new Date(booking_date),
        pickup_time,
        pickup_location,
        dropoff_location,
        number_of_pax: parseInt(number_of_pax) || 1,
        route_title: option.route,
        total_price: totalPrice,
        payment_type,
        deposit_amount: payment_type === "deposit" ? depositAmount : null,
        balance_amount: payment_type === "deposit" ? balanceAmount : null,
        payment_status: "pending",
      },
    });

    // Generate unique invoice number
    const invoiceNumber = `TRP-${booking.id.slice(0, 8).toUpperCase()}-${Date.now()}`;

    // Update booking with the invoice number
    await prisma.transportBooking.update({
      where: { id: booking.id },
      data: { doku_invoice: invoiceNumber },
    });

    // Create Payment record
    // The amount is the amount to be paid NOW (depositAmount or totalPrice)
    const amountToPay = payment_type === "deposit" ? depositAmount : totalPrice;

    await prisma.payment.create({
      data: {
        transport_booking_id: booking.id,
        provider: "doku",
        invoice: invoiceNumber,
        provider_order_id: invoiceNumber,
        amount: amountToPay,
        currency: "IDR",
        status: "pending",
        payment_type: payment_type === "deposit" ? "dp" : "full",
      },
    });

    const origin = new URL(req.url).origin;
    const callbackUrl = `${origin}/api/doku/webhook`;
    const redirectUrl = `${origin}/booking-transport/success?booking_id=${booking.id}`;

    const dokuResponse = await createDokuIdrPayment({
      invoiceNumber,
      amountIdr: amountToPay,
      customerName: full_name,
      customerEmail: user.email,
      callbackUrl,
      redirectUrl,
    });

    if (dokuResponse.response && dokuResponse.response.payment && dokuResponse.response.payment.url) {
      return NextResponse.json({
        booking,
        payment_url: dokuResponse.response.payment.url,
      });
    } else {
      console.error("Doku Transport payment error:", dokuResponse);
      return NextResponse.json({
        error: "Failed to initialize Doku checkout",
        details: dokuResponse,
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error("Error creating transport booking:", error);
    return NextResponse.json({ error: error.message || "Failed to create booking" }, { status: 500 });
  }
}
