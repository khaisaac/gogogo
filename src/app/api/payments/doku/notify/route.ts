import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyDokuNotification } from "@/lib/payments/doku";

/**
 * DOKU Webhook — receives payment status notifications.
 */
export async function POST(request: Request) {
  try {
    const body = await request.text();
    const headers = Object.fromEntries(request.headers.entries());

    const isValid = verifyDokuNotification({
      requestId: headers["request-id"] || "",
      requestTimestamp: headers["request-timestamp"] || "",
      requestTarget: "/api/payments/doku/notify",
      body,
      receivedSignature: headers["signature"] || "",
    });

    if (!isValid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const notification = JSON.parse(body);
    const invoiceNumber = notification?.order?.invoice_number;
    const transactionStatus = notification?.transaction?.status;
    const transactionId = notification?.transaction?.identifier?.[0]?.value;

    if (!invoiceNumber) {
      return NextResponse.json({ error: "Missing invoice number" }, { status: 400 });
    }

    let paymentStatus: string;
    switch (transactionStatus?.toUpperCase()) {
      case "SUCCESS": paymentStatus = "paid"; break;
      case "FAILED": paymentStatus = "failed"; break;
      case "EXPIRED": paymentStatus = "expired"; break;
      default: paymentStatus = "pending";
    }

    await prisma.payment.updateMany({
      where: { provider_order_id: invoiceNumber },
      data: {
        status: paymentStatus,
        provider_transaction_id: transactionId || null,
        raw_response: notification,
        paid_at: paymentStatus === "paid" ? new Date() : null,
      },
    });

    if (paymentStatus === "paid") {
      const payment = await prisma.payment.findFirst({
        where: { provider_order_id: invoiceNumber },
        select: { booking_id: true },
      });

      if (payment && payment.booking_id) {
        const booking = await prisma.booking.findUnique({
          where: { id: payment.booking_id! },
          select: { payment_type: true, payment_status: true },
        });

        let newPaymentStatus = "fully_paid";
        if (booking?.payment_type === "deposit" && booking?.payment_status === "pending") {
          newPaymentStatus = "deposit_paid";
        }

        await prisma.booking.update({
          where: { id: payment.booking_id! },
          data: { status: "confirmed", payment_status: newPaymentStatus },
        });
      }
    }

    return NextResponse.json({ message: "OK" });
  } catch (err) {
    console.error("DOKU webhook error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
