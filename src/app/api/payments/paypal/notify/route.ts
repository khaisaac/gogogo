import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyPayPalWebhook } from "@/lib/payments/paypal";

/**
 * PayPal Webhook — receives payment event notifications.
 * This is a backup mechanism. The primary flow uses the capture route.
 */
export async function POST(request: Request) {
  try {
    const body = await request.text();
    const headers = Object.fromEntries(request.headers.entries());

    const webhookId = process.env.PAYPAL_WEBHOOK_ID;
    if (webhookId) {
      const isValid = await verifyPayPalWebhook({ webhookId, headers, body });
      if (!isValid) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }
    }

    const event = JSON.parse(body);
    const eventType = event?.event_type;

    switch (eventType) {
      case "CHECKOUT.ORDER.APPROVED":
      case "PAYMENT.CAPTURE.COMPLETED": {
        const orderId = event?.resource?.id || event?.resource?.supplementary_data?.related_ids?.order_id;
        if (!orderId) break;

        const transactionId = eventType === "PAYMENT.CAPTURE.COMPLETED" ? event?.resource?.id : null;

        await prisma.payment.updateMany({
          where: { provider_order_id: orderId },
          data: { status: "paid", provider_transaction_id: transactionId, raw_response: event, paid_at: new Date() },
        });

        const payment = await prisma.payment.findFirst({ where: { provider_order_id: orderId }, select: { booking_id: true } });
        if (payment) {
          const booking = await prisma.booking.findUnique({ where: { id: payment.booking_id }, select: { payment_type: true, payment_status: true } });
          let newPaymentStatus = "fully_paid";
          if (booking?.payment_type === "deposit" && booking?.payment_status === "pending") { newPaymentStatus = "deposit_paid"; }
          await prisma.booking.update({ where: { id: payment.booking_id }, data: { status: "confirmed", payment_status: newPaymentStatus } });
        }
        break;
      }
      case "PAYMENT.CAPTURE.DENIED":
      case "PAYMENT.CAPTURE.REFUNDED": {
        const orderId = event?.resource?.supplementary_data?.related_ids?.order_id;
        if (!orderId) break;
        const status = eventType === "PAYMENT.CAPTURE.REFUNDED" ? "refunded" : "failed";
        await prisma.payment.updateMany({ where: { provider_order_id: orderId }, data: { status, raw_response: event } });
        break;
      }
      default:
        console.log("Unhandled PayPal event type:", eventType);
    }

    return NextResponse.json({ message: "OK" });
  } catch (err) {
    console.error("PayPal webhook error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
