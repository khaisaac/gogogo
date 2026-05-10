import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createDokuPayment } from "@/lib/payments/doku";

export async function POST(request: Request) {
  try {
    const { booking_id } = await request.json();
    if (!booking_id) {
      return NextResponse.json({ error: "booking_id is required" }, { status: 400 });
    }

    const booking = await prisma.booking.findUnique({ where: { id: booking_id } });
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }
    if (!booking.total_price) {
      return NextResponse.json({ error: "Booking has no price set." }, { status: 400 });
    }
    if (booking.payment_status === "fully_paid") {
      return NextResponse.json({ error: "Booking is already fully paid" }, { status: 400 });
    }

    const origin = new URL(request.url).origin;
    const isPayingBalance = booking.payment_status === "deposit_paid" && (booking.balance_amount ?? 0) > 0;
    const amountToPay = isPayingBalance ? (booking.balance_amount ?? 0) : (booking.deposit_amount || booking.total_price);
    let invoiceNumber = `INV-${booking.id.slice(0, 8).toUpperCase()}-${Date.now()}`;
    if (isPayingBalance) invoiceNumber += "-BAL";

    const dokuResponse = await createDokuPayment({
      invoiceNumber, amount: amountToPay,
      customerName: booking.full_name, customerEmail: booking.email,
      callbackUrl: `${origin}/api/payments/doku/notify`,
      redirectUrl: `${origin}/booking/success?booking_id=${booking.id}`,
    });

    if (!dokuResponse?.response?.payment?.url) {
      return NextResponse.json({ error: "Failed to create DOKU payment" }, { status: 500 });
    }

    await prisma.payment.create({
      data: {
        booking_id: booking.id, provider: "doku", provider_order_id: invoiceNumber,
        amount: amountToPay, currency: "USD", status: "pending", raw_response: dokuResponse,
      },
    });

    return NextResponse.json({ payment_url: dokuResponse.response.payment.url, invoice_number: invoiceNumber });
  } catch (err) {
    console.error("DOKU payment error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
