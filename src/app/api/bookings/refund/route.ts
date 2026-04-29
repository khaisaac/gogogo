import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/client";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { booking_id, reason } = body;

    if (!booking_id || !reason) {
      return NextResponse.json(
        { error: "booking_id and reason are required" },
        { status: 400 },
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const adminSupabase = createAdminClient();

    // Verify booking exists and belongs to user
    const { data: booking, error: bookingError } = await adminSupabase
      .from("bookings")
      .select("*")
      .eq("id", booking_id)
      .single();

    if (bookingError || !booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Check if user is the booking owner
    if (booking.user_id !== user.id && booking.email !== user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Check if booking can be refunded (must be paid)
    if (
      booking.payment_status !== "fully_paid" &&
      booking.payment_status !== "deposit_paid"
    ) {
      return NextResponse.json(
        { error: "Booking must be paid to request refund" },
        { status: 400 },
      );
    }

    // Check if refund already requested
    if (
      booking.refund_status === "requested" ||
      booking.refund_status === "approved"
    ) {
      return NextResponse.json(
        { error: "Refund request already in progress" },
        { status: 400 },
      );
    }

    const refundAmount = booking.deposit_amount || booking.total_price;

    // Create refund record
    const { data: refund, error: refundError } = await adminSupabase
      .from("refunds")
      .insert({
        booking_id,
        requested_by: user.id,
        amount: refundAmount,
        reason,
        status: "requested",
        payment_method:
          booking.payment_type === "deposit" ? "paypal_deposit" : "paypal_full",
      })
      .select()
      .single();

    if (refundError) {
      console.error("Refund insert error:", refundError);
      return NextResponse.json(
        { error: "Failed to create refund request" },
        { status: 500 },
      );
    }

    // Update booking refund status
    await adminSupabase
      .from("bookings")
      .update({
        refund_status: "requested",
        refund_reason: reason,
        refund_amount: refundAmount,
        refund_requested_at: new Date().toISOString(),
      })
      .eq("id", booking_id);

    // Send notification email to admin
    const Resend = require("resend").Resend;
    const resend = new Resend(process.env.RESEND_API_KEY);

    try {
      await resend.emails.send({
        from: "Trekking Mount Rinjani <noreply@trekkingmountrinjani.com>",
        to: process.env.ADMIN_EMAIL!,
        subject: `⚠️ Refund Request — ${booking.full_name}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Refund Request</h2>
            <p><strong>Guest:</strong> ${booking.full_name}</p>
            <p><strong>Email:</strong> ${booking.email}</p>
            <p><strong>Booking ID:</strong> ${booking_id}</p>
            <p><strong>Package:</strong> ${booking.package_title}</p>
            <p><strong>Trek Date:</strong> ${booking.trekking_date}</p>
            <p><strong>Refund Amount:</strong> $${refundAmount} USD</p>
            <p><strong>Reason:</strong></p>
            <p style="background: #f5f5f5; padding: 12px; border-radius: 4px;">${reason}</p>
            <p><a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin/bookings">View in Admin Dashboard</a></p>
          </div>
        `,
      });
    } catch (emailErr) {
      console.error("Admin email error:", emailErr);
    }

    return NextResponse.json({
      message: "Refund request submitted successfully",
      refund,
    });
  } catch (err: any) {
    console.error("Refund request error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
