import { Resend } from "resend";

export function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  return new Resend(apiKey);
}

export async function sendTicketConfirmationEmail(ticket: any) {
  const resend = getResendClient();
  if (!resend || !ticket.email) return false;

  try {
    await resend.emails.send({
      from: "Trekking Mount Rinjani <noreply@trekkingmountrinjani.com>",
      to: ticket.email,
      subject: `E-Ticket Confirmation — Rinjani National Park`,
      html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a5c2e;">🎫 E-Ticket Confirmed!</h2>
        <p>Hi <strong>${ticket.full_name}</strong>,</p>
        <p>Your payment has been successfully verified. Here are your ticket details:</p>
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
          <tr><td style="padding: 8px; border-bottom: 1px solid #eee; color: #666;">Entrance Gate</td><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>${ticket.entrance_gate}</strong></td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #eee; color: #666;">Exit Gate</td><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>${ticket.exit_gate}</strong></td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #eee; color: #666;">Check-in</td><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>${new Date(ticket.check_in).toLocaleDateString()}</strong></td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #eee; color: #666;">Check-out</td><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>${new Date(ticket.check_out).toLocaleDateString()}</strong></td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #eee; color: #666;">Pax</td><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>${ticket.number_of_pax} Person(s)</strong></td></tr>
        </table>
        <div style="margin-top: 24px; padding: 16px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">
          <p style="margin: 0; color: #475569; font-size: 14px;">Booking ID: <strong>${ticket.id}</strong></p>
          <p style="margin: 4px 0 0 0; color: #475569; font-size: 14px;">Invoice: <strong>${ticket.doku_invoice || "-"}</strong></p>
        </div>
        <p style="margin-top: 24px; color: #666; font-size: 14px;">Please present this email along with your ID/Passport at the entrance gate.</p>
      </div>`,
    });
    return true;
  } catch (err) {
    console.error("Failed to send ticket email", err);
    return false;
  }
}
