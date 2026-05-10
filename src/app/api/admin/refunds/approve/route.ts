import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { Resend } from "resend";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { refund_id, approved, approval_notes } = body;
    if (!refund_id || approved === undefined) {
      return NextResponse.json({ error: "refund_id and approved are required" }, { status: 400 });
    }

    // Note: Admin auth is handled by requireAdmin in the admin layout.
    // This API could add its own auth check if needed.

    const refund = await prisma.refund.findUnique({ where: { id: refund_id } });
    if (!refund) {
      return NextResponse.json({ error: "Refund not found" }, { status: 404 });
    }

    const booking = await prisma.booking.findUnique({ where: { id: refund.booking_id } });
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const newStatus = approved ? "approved" : "rejected";
    const now = new Date();

    await prisma.refund.update({
      where: { id: refund_id },
      data: { status: newStatus, approved_at: now, approval_notes },
    });

    if (approved) {
      await prisma.booking.update({
        where: { id: booking.id },
        data: { refund_status: "approved", refund_approval_notes: approval_notes, refund_processed_at: now },
      });
    } else {
      await prisma.booking.update({
        where: { id: booking.id },
        data: { refund_status: "rejected", refund_approval_notes: approval_notes },
      });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    try {
      const emailSubject = approved ? "✓ Your Refund Request Has Been Approved" : "✕ Your Refund Request Has Been Reviewed";
      const emailBody = approved
        ? `<p>Hi <strong>${booking.full_name}</strong>,</p><p>Good news! Your refund request has been <strong>approved</strong>.</p><p><strong>Refund Amount:</strong> $${refund.amount} USD</p><p>The funds will be returned within 3-5 business days.</p>`
        : `<p>Hi <strong>${booking.full_name}</strong>,</p><p>We have reviewed your refund request.</p><p><strong>Status:</strong> Refund request was not approved at this time.</p>${approval_notes ? `<p><strong>Reason:</strong> ${approval_notes}</p>` : ""}`;

      await resend.emails.send({
        from: "Trekking Mount Rinjani <noreply@trekkingmountrinjani.com>",
        to: booking.email,
        subject: emailSubject,
        html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;"><h2 style="color: ${approved ? "#10b981" : "#ef4444"};">🏔️ Refund Request Update</h2>${emailBody}</div>`,
      });
    } catch (emailErr) { console.error("Customer email error:", emailErr); }

    return NextResponse.json({ message: `Refund ${newStatus} successfully`, refund: { ...refund, status: newStatus } });
  } catch (err: any) {
    console.error("Refund approval error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
