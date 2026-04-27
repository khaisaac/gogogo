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
    
    // 2. Get tomorrow's date in YYYY-MM-DD format
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateString = tomorrow.toISOString().split("T")[0];

    // 3. Fetch bookings that are deposit_paid and trekking_date is tomorrow
    const { data: bookings, error } = await adminSupabase
      .from("bookings")
      .select("*")
      .eq("payment_status", "deposit_paid")
      .eq("trekking_date", dateString);

    if (error) {
      console.error("Failed to fetch bookings for reminder:", error);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    if (!bookings || bookings.length === 0) {
      return NextResponse.json({ message: "No reminders to send today." });
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      return NextResponse.json({ error: "Missing Resend API Key" }, { status: 500 });
    }
    const resend = new Resend(resendApiKey);

    const origin = new URL(request.url).origin;
    let sentCount = 0;

    // 4. Send emails
    for (const booking of bookings) {
      const paymentLink = `${origin}/booking/pay-balance?booking_id=${booking.id}`;
      
      try {
        await resend.emails.send({
          from: "Trekking Mount Rinjani <noreply@trekkingmountrinjani.com>",
          to: booking.email,
          subject: `Action Required: Pay Balance for Rinjani Trekking (${booking.package_title})`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; line-height: 1.5;">
              <h2 style="color: #1a5c2e;">🏔️ Your Trek is Tomorrow!</h2>
              <p>Hi <strong>${booking.full_name}</strong>,</p>
              <p>We are excited to welcome you tomorrow for your <strong>${booking.package_title || "Rinjani Trek"}</strong>!</p>
              <p>Our records show that you have paid a 30% deposit for this booking. The remaining balance is due today.</p>
              
              <div style="background-color: #f8fafc; padding: 16px; border-radius: 8px; margin: 24px 0;">
                <p style="margin: 0 0 8px 0; color: #64748b;">Remaining Balance Due:</p>
                <p style="margin: 0; font-size: 24px; font-weight: bold; color: #0f172a;">$${booking.balance_amount} USD</p>
              </div>

              <p>Please complete your payment securely using DOKU or PayPal by clicking the button below:</p>
              
              <div style="margin: 32px 0; text-align: center;">
                <a href="${paymentLink}" style="background-color: #22c55e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Pay Remaining Balance</a>
              </div>
              
              <p style="color: #64748b; font-size: 14px;">If you have any questions or have already paid, please ignore this email or reply to contact our team.</p>
            </div>
          `,
        });
        sentCount++;
      } catch (emailErr) {
        console.error(`Failed to send reminder to ${booking.email}:`, emailErr);
      }
    }

    return NextResponse.json({
      message: `Successfully sent ${sentCount} reminders.`,
      bookingsProcessed: bookings.length,
    });
  } catch (err) {
    console.error("Cron job error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
