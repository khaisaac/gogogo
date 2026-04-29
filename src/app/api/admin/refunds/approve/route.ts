import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Resend } from "resend";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { refund_id, approved, approval_notes } = body;

    if (!refund_id || approved === undefined) {
      return NextResponse.json(
        { error: "refund_id and approved are required" },
        { status: 400 },
      );
    }

    const adminSupabase = createAdminClient();

    // Verify admin user
    const {
      data: { user },
    } = await adminSupabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const { data: profile } = await adminSupabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Get refund record
    const { data: refund, error: refundError } = await adminSupabase
      .from("refunds")
      .select("*")
      .eq("id", refund_id)
      .single();

    if (refundError || !refund) {
      return NextResponse.json({ error: "Refund not found" }, { status: 404 });
    }

    // Get booking
    const { data: booking } = await adminSupabase
      .from("bookings")
      .select("*")
      .eq("id", refund.booking_id)
      .single();

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const newStatus = approved ? "approved" : "rejected";
    const now = new Date().toISOString();

    // Update refund status
    await adminSupabase
      .from("refunds")
      .update({
        status: newStatus,
        approved_by: user.id,
        approved_at: now,
        approval_notes,
      })
      .eq("id", refund_id);

    // Update booking refund status
    if (approved) {
      await adminSupabase
        .from("bookings")
        .update({
          refund_status: "approved",
          refund_approval_notes: approval_notes,
          refund_processed_at: now,
        })
        .eq("id", booking.id);

      // TODO: Process actual PayPal refund via PayPal API
      // For now, mark as approved (manual refund can be processed separately)
    } else {
      await adminSupabase
        .from("bookings")
        .update({
          refund_status: "rejected",
          refund_approval_notes: approval_notes,
        })
        .eq("id", booking.id);
    }

    // Send notification email to customer
    const resend = new Resend(process.env.RESEND_API_KEY);

    try {
      const emailSubject = approved
        ? "✓ Your Refund Request Has Been Approved"
        : "✕ Your Refund Request Has Been Reviewed";

      const emailBody = approved
        ? `
            <p>Hi <strong>${booking.full_name}</strong>,</p>
            <p>Good news! Your refund request has been <strong>approved</strong>.</p>
            <p><strong>Refund Amount:</strong> $${refund.amount} USD</p>
            <p>The funds will be returned to your PayPal account within 3-5 business days.</p>
            <p>If you have any questions, please contact our support team.</p>
          `
        : `
            <p>Hi <strong>${booking.full_name}</strong>,</p>
            <p>We have reviewed your refund request.</p>
            <p><strong>Status:</strong> Refund request was not approved at this time.</p>
            ${approval_notes ? `<p><strong>Reason:</strong> ${approval_notes}</p>` : ""}
            <p>If you have questions or would like to discuss this further, please reach out to us.</p>
          `;

      await resend.emails.send({
        from: "Trekking Mount Rinjani <noreply@trekkingmountrinjani.com>",
        to: booking.email,
        subject: emailSubject,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: ${approved ? "#10b981" : "#ef4444"};">🏔️ Refund Request Update</h2>
            ${emailBody}
            <p style="margin-top: 32px; color: #94a3b8; font-size: 12px; border-top: 1px solid #e2e8f0; padding-top: 16px;">
              Booking Reference: ${booking.id.slice(0, 8).toUpperCase()}
            </p>
          </div>
        `,
      });
    } catch (emailErr) {
      console.error("Customer email error:", emailErr);
    }

    return NextResponse.json({
      message: `Refund ${newStatus} successfully`,
      refund: {
        ...refund,
        status: newStatus,
      },
    });
  } catch (err: any) {
    console.error("Refund approval error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
