import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/db";

const DOKU_SECRET_KEY = process.env.DOKU_SECRET_KEY || "";

function verifySignature(headers: Headers, rawBody: string, secretKey: string): boolean {
  const clientId = headers.get("client-id") || "";
  const requestId = headers.get("request-id") || "";
  const requestTimestamp = headers.get("request-timestamp") || "";
  const requestTarget = headers.get("request-target") || "/api/doku/webhook";
  const signatureHeader = headers.get("signature") || "";
  const digestHash = crypto.createHash("sha256").update(rawBody).digest("base64");
  const digest = `SHA256=${digestHash}`;
  const componentSignature = `Client-Id:${clientId}\nRequest-Id:${requestId}\nRequest-Timestamp:${requestTimestamp}\nRequest-Target:${requestTarget}\nDigest:${digest}`;
  const hmac = crypto.createHmac("sha256", secretKey);
  hmac.update(componentSignature);
  const calculatedSignature = `HMACSHA256=${hmac.digest("base64")}`;
  return signatureHeader === calculatedSignature;
}

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const headers = req.headers;
    if (!verifySignature(headers, rawBody, DOKU_SECRET_KEY)) {
      return NextResponse.json({ error: "Invalid Signature" }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    const transactionStatus = payload.transaction?.status;
    const invoiceNumber = payload.order?.invoice_number;
    if (!invoiceNumber) {
      return NextResponse.json({ error: "No invoice number found" }, { status: 400 });
    }

    let newStatus = "pending";
    if (transactionStatus === "SUCCESS") { newStatus = "success"; }
    else if (transactionStatus === "FAILED") { newStatus = "failed"; }
    else { return NextResponse.json({ message: "Status ignored" }, { status: 200 }); }

    const paymentRecord = await prisma.payment.findFirst({ where: { invoice: invoiceNumber } });
    if (!paymentRecord) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    let finalStatusToSave = newStatus;
    if (newStatus === "success" && paymentRecord.payment_type === "dp") {
      finalStatusToSave = "paid_dp";
    }

    await prisma.payment.updateMany({ where: { invoice: invoiceNumber }, data: { status: finalStatusToSave } });

    // Also update TicketBooking if this invoice belongs to one
    if (newStatus === "success") {
      await prisma.ticketBooking.updateMany({
        where: { doku_invoice: invoiceNumber },
        data: { payment_status: "paid" },
      });
    } else if (newStatus === "failed") {
      await prisma.ticketBooking.updateMany({
        where: { doku_invoice: invoiceNumber },
        data: { payment_status: "failed" },
      });
    }

    // Also update TransportBooking if this invoice belongs to one
    if (paymentRecord.transport_booking_id || invoiceNumber.startsWith("TRP-")) {
      if (newStatus === "success") {
        const transportBooking = await prisma.transportBooking.findFirst({
          where: {
            OR: [
              { id: paymentRecord.transport_booking_id || undefined },
              { doku_invoice: invoiceNumber }
            ]
          }
        });
        const newPaymentStatus = transportBooking?.payment_type === "deposit" ? "deposit_paid" : "fully_paid";
        
        await prisma.transportBooking.updateMany({
          where: {
            OR: [
              { id: paymentRecord.transport_booking_id || undefined },
              { doku_invoice: invoiceNumber }
            ]
          },
          data: { payment_status: newPaymentStatus },
        });
      } else if (newStatus === "failed") {
        await prisma.transportBooking.updateMany({
          where: {
            OR: [
              { id: paymentRecord.transport_booking_id || undefined },
              { doku_invoice: invoiceNumber }
            ]
          },
          data: { payment_status: "failed" },
        });
      }
    }

    if (finalStatusToSave === "paid_dp") {
      console.log(`DP paid for ${invoiceNumber}.`);
    }

    return NextResponse.json({ message: "Webhook processed successfully" }, { status: 200 });
  } catch (error: any) {
    console.error("Webhook processing error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
