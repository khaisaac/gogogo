import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Resend } from "resend";

export const dynamic = "force-dynamic"; // never cache this route

export async function GET(request: Request) {
  try {
    // 1. Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      // In development, allow bypassing if CRON_SECRET is not set
      if (process.env.NODE_ENV === "production") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const adminSupabase = createAdminClient();

    // 2. Calculate timestamp for 24 hours ago
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // 3. Fetch bookings that have:
    //    - payment_status = 'deposit_paid'
    //    - payment_type = 'deposit'
    //    - balance_amount > 0
    //    - NOT already sent reminder (deposit_reminder_sent = false)
    //    - updated_at is between 24-48 hours ago (to catch the 24 hour mark)
    const { data: bookings, error } = await adminSupabase
      .from("bookings")
      .select("*")
      .eq("payment_status", "deposit_paid")
      .eq("payment_type", "deposit")
      .gt("balance_amount", 0)
      .eq("deposit_reminder_sent", false)
      .lt("updated_at", now.toISOString())
      .gt("updated_at", twentyFourHoursAgo.toISOString());

    if (error) {
      console.error("Failed to fetch bookings for reminder:", error);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    if (!bookings || bookings.length === 0) {
      return NextResponse.json({
        message: "No reminders to send at this time.",
      });
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      return NextResponse.json(
        { error: "Missing Resend API Key" },
        { status: 500 },
      );
    }
    const resend = new Resend(resendApiKey);

    const origin = new URL(request.url).origin;
    let sentCount = 0;

    // 4. Send emails and mark as sent
    for (const booking of bookings) {
      const paymentLink = `${origin}/booking/pay-balance?booking_id=${booking.id}`;

      try {
        await resend.emails.send({
          from: "Trekking Mount Rinjani <noreply@trekkingmountrinjani.com>",
          to: booking.email,
          subject: `Reminder: Complete Payment for ${booking.package_title}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; line-height: 1.5;">
              <h2 style="color: #1a5c2e;">🏔️ Payment Reminder</h2>
              <p>Hi <strong>${booking.full_name}</strong>,</p>
              <p>We hope you're excited for your upcoming <strong>${booking.package_title || "Rinjani Trek"}</strong>!</p>
              <p>We noticed you paid a 30% deposit for your booking. To complete your reservation, please pay the remaining balance at your earliest convenience.</p>
              
              <div style="background-color: #f8fafc; padding: 16px; border-radius: 8px; margin: 24px 0; border-left: 4px solid #f59e0b;">
                <p style="margin: 0 0 8px 0; color: #64748b; font-size: 14px;">Remaining Balance Due:</p>
                <p style="margin: 0; font-size: 24px; font-weight: bold; color: #0f172a;">$${booking.balance_amount} USD</p>
                <p style="margin: 8px 0 0 0; color: #64748b; font-size: 14px;">Trek Date: <strong>${booking.trekking_date}</strong></p>
              </div>

              <p>Secure your spot by completing the payment using PayPal:</p>
              
              <div style="margin: 32px 0; text-align: center;">
                <a href="${paymentLink}" style="background-color: #22c55e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; font-size: 16px;">Pay Remaining Balance</a>
              </div>
              
              <p style="color: #64748b; font-size: 14px;">Our team will also reach out to you via WhatsApp at <strong>${booking.whatsapp}</strong> with additional details.</p>
              <p style="color: #64748b; font-size: 14px;">Questions? Reply to this email or contact us directly.</p>
              <p style="margin-top: 32px; color: #94a3b8; font-size: 12px; border-top: 1px solid #e2e8f0; padding-top: 16px;">
                Booking Reference: ${booking.id.slice(0, 8).toUpperCase()}
              </p>
            </div>
          `,
        });

        // Mark reminder as sent
        await adminSupabase
          .from("bookings")
          .update({
            deposit_reminder_sent: true,
            deposit_reminder_sent_at: new Date().toISOString(),
          })
          .eq("id", booking.id);

        sentCount++;
      } catch (emailErr) {
        console.error(`Failed to send reminder to ${booking.email}:`, emailErr);
      }
    }

    return NextResponse.json({
      message: `Successfully sent ${sentCount} deposit reminders.`,
      bookingsProcessed: bookings.length,
    });
  } catch (err) {
    console.error("Cron job error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
