import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUser } from "@/lib/auth";
import { createDokuIdrPayment } from "@/lib/payments/doku";

export async function POST(req: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      full_name,
      email,
      whatsapp,
      entrance_gate,
      exit_gate,
      check_in,
      check_out,
      number_of_pax,
      insurance_type,
      member_data,
    } = body;

    // Validation
    if (!full_name || !email || !whatsapp || !entrance_gate || !exit_gate || !check_in || !check_out || !number_of_pax) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Calculate price
    const insurancePrice = insurance_type === "regular" ? 10000 : 280000;
    const basePricePerPersonPerDay = 150000;
    const checkInDate = new Date(check_in);
    const checkOutDate = new Date(check_out);
    const durationInDays = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    const totalPrice = (basePricePerPersonPerDay * durationInDays * number_of_pax) + (insurancePrice * number_of_pax);

    // Create booking in DB
    const booking = await prisma.ticketBooking.create({
      data: {
        user_id: user.id,
        full_name,
        email,
        whatsapp,
        entrance_gate,
        exit_gate,
        check_in: checkInDate,
        check_out: checkOutDate,
        number_of_pax,
        insurance_type,
        insurance_price: insurancePrice,
        base_price: basePricePerPersonPerDay,
        total_price: totalPrice,
        member_data,
        payment_status: "pending",
      },
    });

    // Create DOKU Invoice
    const invoiceNumber = `TKT-${booking.id.slice(0, 8).toUpperCase()}-${Date.now()}`;
    
    // Update booking with invoice
    await prisma.ticketBooking.update({
      where: { id: booking.id },
      data: { doku_invoice: invoiceNumber },
    });

    // Create Payment record
    await prisma.payment.create({
      data: {
        ticket_booking_id: booking.id,
        provider: "doku",
        invoice: invoiceNumber,
        amount: totalPrice,
        currency: "IDR",
        status: "pending",
        payment_type: "full",
      },
    });

    const callbackUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/doku/webhook`;
    const redirectUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/booking-ticket/success?booking_id=${booking.id}`;

    const dokuResponse = await createDokuIdrPayment({
      invoiceNumber,
      amountIdr: totalPrice,
      customerName: full_name,
      customerEmail: email,
      callbackUrl,
      redirectUrl,
    });

    if (dokuResponse.response && dokuResponse.response.payment && dokuResponse.response.payment.url) {
      return NextResponse.json({ 
        booking, 
        payment_url: dokuResponse.response.payment.url 
      });
    } else {
      console.error("DOKU error:", dokuResponse);
      return NextResponse.json({ 
        error: "Failed to create DOKU payment", 
        details: dokuResponse 
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error("Error creating ticket booking:", error);
    return NextResponse.json({ error: error.message || "Failed to create booking" }, { status: 500 });
  }
}
