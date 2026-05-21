import { NextResponse } from "next/server";
import crypto from "crypto";
import axios from "axios";
import { prisma } from "@/lib/db";

import { getDokuConfig } from "@/lib/payments/doku";

function generateDokuSignature(clientId: string, requestId: string, requestTimestamp: string, requestTarget: string, digest: string, secretKey: string) {
  const componentSignature = `Client-Id:${clientId}\nRequest-Id:${requestId}\nRequest-Timestamp:${requestTimestamp}\nRequest-Target:${requestTarget}\nDigest:${digest}`;
  const hmac = crypto.createHmac("sha256", secretKey);
  hmac.update(componentSignature);
  return `HMACSHA256=${hmac.digest("base64")}`;
}

export async function POST(req: Request) {
  try {
    const { clientId: DOKU_CLIENT_ID, secretKey: DOKU_SECRET_KEY, baseUrl: DOKU_BASE_URL } = getDokuConfig();
    const body = await req.json();
    const { invoice, reason } = body;
    if (!invoice) {
      return NextResponse.json({ error: "Invoice number is required" }, { status: 400 });
    }

    const paymentRecord = await prisma.payment.findFirst({ where: { invoice } });
    if (!paymentRecord) {
      return NextResponse.json({ error: "Payment record not found" }, { status: 404 });
    }
    if (paymentRecord.status !== "success" && paymentRecord.status !== "paid_dp") {
      return NextResponse.json({ error: "Cannot refund a payment that is not successful" }, { status: 400 });
    }
    if (paymentRecord.refund_status === "refund_success" || paymentRecord.refund_status === "refund_pending") {
      return NextResponse.json({ error: "Refund already processed or is pending" }, { status: 400 });
    }

    await prisma.payment.updateMany({ where: { invoice }, data: { refund_status: "refund_pending" } });

    const dokuRefundPayload = {
      refund: { amount: paymentRecord.amount_idr, invoice_number: invoice, reason: reason || "Customer requested refund", refund_id: `REF-${invoice}-${Date.now()}` },
    };

    const requestBodyString = JSON.stringify(dokuRefundPayload);
    const digestHash = crypto.createHash("sha256").update(requestBodyString).digest("base64");
    const digest = `SHA256=${digestHash}`;
    const requestId = crypto.randomUUID();
    const requestTimestamp = new Date().toISOString().substring(0, 19) + "Z";
    const requestTarget = "/orders/v1/refund";
    const signature = generateDokuSignature(DOKU_CLIENT_ID, requestId, requestTimestamp, requestTarget, digest, DOKU_SECRET_KEY);

    let refundSuccess = false;
    try {
      await axios.post(`${DOKU_BASE_URL}${requestTarget}`, dokuRefundPayload, {
        headers: { "Client-Id": DOKU_CLIENT_ID, "Request-Id": requestId, "Request-Timestamp": requestTimestamp, Signature: signature, "Content-Type": "application/json" },
      });
      refundSuccess = true;
    } catch (apiError: any) {
      console.error("DOKU Refund API Error:", apiError.response?.data || apiError.message);
    }

    const finalRefundStatus = refundSuccess ? "refund_success" : "refund_failed";
    await prisma.payment.updateMany({ where: { invoice }, data: { refund_status: finalRefundStatus } });

    if (!refundSuccess) {
      return NextResponse.json({ error: "Refund request to DOKU failed" }, { status: 500 });
    }
    return NextResponse.json({ success: true, message: "Refund processed successfully", refundId: dokuRefundPayload.refund.refund_id });
  } catch (error: any) {
    console.error("Refund API Error:", error);
    return NextResponse.json({ error: "Internal server error processing refund" }, { status: 500 });
  }
}
