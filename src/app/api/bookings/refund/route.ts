import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { booking_id, reason } = body;
    if (!booking_id || !reason) {
      return NextResponse.json({ error: "booking_id and reason are required" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const booking = await prisma.booking.findUnique({ where: { id: booking_id } });
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (booking.user_id !== user.id && booking.email !== user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    if (booking.payment_status !== "fully_paid" && booking.payment_status !== "deposit_paid") {
      return NextResponse.json({ error: "Booking must be paid to request refund" }, { status: 400 });
    }

    if (booking.refund_status === "requested" || booking.refund_status === "approved") {
      return NextResponse.json({ error: "Refund request already in progress" }, { status: 400 });
    }

    const refundAmount = booking.deposit_amount || booking.total_price || 0;

    const refund = await prisma.refund.create({
      data: {
        booking_id,
        requested_by: user.id,
        amount: refundAmount,
        reason,
        status: "requested",
        payment_method: booking.payment_type === "deposit" ? "paypal_deposit" : "paypal_full",
      },
    });

    await prisma.booking.update({
      where: { id: booking_id },
      data: {
        refund_status: "requested",
        refund_reason: reason,
        refund_amount: refundAmount,
        refund_requested_at: new Date(),
      },
    });

    const Resend = require("resend").Resend;
    const resend = new Resend(process.env.RESEND_API_KEY);
    try {
      await resend.emails.send({
        from: "Trekking Mount Rinjani <noreply@trekkingmountrinjani.com>",
        to: process.env.ADMIN_EMAIL!,
        subject: `⚠️ Refund Request — ${booking.full_name}`,
        html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;"><h2>Refund Request</h2><p><strong>Guest:</strong> ${booking.full_name}</p><p><strong>Booking ID:</strong> ${booking_id}</p><p><strong>Refund Amount:</strong> $${refundAmount} USD</p><p><strong>Reason:</strong></p><p style="background: #f5f5f5; padding: 12px; border-radius: 4px;">${reason}</p></div>`,
      });
    } catch (emailErr) { console.error("Admin email error:", emailErr); }

    return NextResponse.json({ message: "Refund request submitted successfully", refund });
  } catch (err: any) {
    console.error("Refund request error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
