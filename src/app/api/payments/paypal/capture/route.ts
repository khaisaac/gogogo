import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { capturePayPalOrder } from "@/lib/payments/paypal";

export async function POST(request: Request) {
  try {
    const { order_id } = await request.json();
    if (!order_id) {
      return NextResponse.json({ error: "order_id is required" }, { status: 400 });
    }

    const captureData = await capturePayPalOrder(order_id);
    const captureStatus = captureData?.status;
    const transactionId = captureData?.purchase_units?.[0]?.payments?.captures?.[0]?.id;

    let paymentStatus: string;
    switch (captureStatus) {
      case "COMPLETED": paymentStatus = "paid"; break;
      case "DECLINED": paymentStatus = "failed"; break;
      default: paymentStatus = "pending";
    }

    await prisma.payment.updateMany({
      where: { provider_order_id: order_id },
      data: {
        status: paymentStatus,
        provider_transaction_id: transactionId || null,
        raw_response: captureData,
        paid_at: paymentStatus === "paid" ? new Date() : null,
      },
    });

    if (paymentStatus === "paid") {
      const payment = await prisma.payment.findFirst({
        where: { provider_order_id: order_id },
        select: { booking_id: true },
      });

      if (payment) {
        const booking = await prisma.booking.findUnique({
          where: { id: payment.booking_id },
          select: { payment_type: true, payment_status: true },
        });

        let newPaymentStatus = "fully_paid";
        if (booking?.payment_type === "deposit" && booking?.payment_status === "pending") {
          newPaymentStatus = "deposit_paid";
        }

        await prisma.booking.update({
          where: { id: payment.booking_id },
          data: { status: "confirmed", payment_status: newPaymentStatus },
        });
      }
    }

    return NextResponse.json({ status: paymentStatus, transaction_id: transactionId, capture: captureData });
  } catch (err) {
    console.error("PayPal capture error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
