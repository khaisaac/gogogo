import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { Resend } from "resend";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      if (process.env.NODE_ENV === "production") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const bookings = await prisma.booking.findMany({
      where: {
        payment_status: "deposit_paid",
        payment_type: "deposit",
        balance_amount: { gt: 0 },
        deposit_reminder_sent: false,
        updated_at: { lt: now, gt: twentyFourHoursAgo },
      },
    });

    if (!bookings || bookings.length === 0) {
      return NextResponse.json({ message: "No reminders to send at this time." });
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      return NextResponse.json({ error: "Missing Resend API Key" }, { status: 500 });
    }
    const resend = new Resend(resendApiKey);
    const origin = new URL(request.url).origin;
    let sentCount = 0;

    for (const booking of bookings) {
      const paymentLink = `${origin}/booking/pay-balance?booking_id=${booking.id}`;
      try {
        await resend.emails.send({
          from: "Trekking Mount Rinjani <noreply@trekkingmountrinjani.com>",
          to: booking.email,
          subject: `Reminder: Complete Payment for ${booking.package_title}`,
          html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; line-height: 1.5;"><h2 style="color: #1a5c2e;">🏔️ Payment Reminder</h2><p>Hi <strong>${booking.full_name}</strong>,</p><p>We noticed you paid a 30% deposit for your booking. To complete your reservation, please pay the remaining balance.</p><div style="background-color: #f8fafc; padding: 16px; border-radius: 8px; margin: 24px 0; border-left: 4px solid #f59e0b;"><p style="margin: 0 0 8px 0; color: #64748b; font-size: 14px;">Remaining Balance Due:</p><p style="margin: 0; font-size: 24px; font-weight: bold; color: #0f172a;">$${booking.balance_amount} USD</p><p style="margin: 8px 0 0 0; color: #64748b; font-size: 14px;">Trek Date: <strong>${booking.trekking_date}</strong></p></div><div style="margin: 32px 0; text-align: center;"><a href="${paymentLink}" style="background-color: #22c55e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; font-size: 16px;">Pay Remaining Balance</a></div><p style="margin-top: 32px; color: #94a3b8; font-size: 12px; border-top: 1px solid #e2e8f0; padding-top: 16px;">Booking Reference: ${booking.id.slice(0, 8).toUpperCase()}</p></div>`,
        });

        await prisma.booking.update({
          where: { id: booking.id },
          data: { deposit_reminder_sent: true, deposit_reminder_sent_at: new Date() },
        });
        sentCount++;
      } catch (emailErr) {
        console.error(`Failed to send reminder to ${booking.email}:`, emailErr);
      }
    }

    return NextResponse.json({ message: `Successfully sent ${sentCount} deposit reminders.`, bookingsProcessed: bookings.length });
  } catch (err) {
    console.error("Cron job error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
