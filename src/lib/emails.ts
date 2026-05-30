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
        <div style="margin-top: 24px; padding: 24px 16px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; text-align: center;">
          <p style="margin: 0 0 16px 0; color: #475569; font-size: 14px; font-weight: bold;">E-TICKET BARCODE</p>
          
          <!-- Barcode -->
          <img src="https://bwipjs-api.metafloor.com/?bcid=code128&text=${ticket.id}&scale=2" alt="Barcode" style="display: block; margin: 0 auto 16px auto; max-width: 100%; height: 60px;" />
          
          <!-- QR Code -->
          <img src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${ticket.id}" alt="QR Code" style="display: block; margin: 0 auto; border: 1px solid #e2e8f0; padding: 8px; background: white; border-radius: 8px;" />
          
          <div style="margin-top: 24px; text-align: left; border-top: 1px dashed #cbd5e1; padding-top: 16px;">
            <p style="margin: 0; color: #475569; font-size: 14px;">Booking ID: <strong>${ticket.id}</strong></p>
            <p style="margin: 4px 0 0 0; color: #475569; font-size: 14px;">Invoice: <strong>${ticket.doku_invoice || "-"}</strong></p>
          </div>
        </div>
        <p style="margin-top: 24px; color: #666; font-size: 14px;">Please present this email along with your ID/Passport at the entrance gate.</p>
      </div>`,
    });

    // Send admin notification
    await resend.emails.send({
      from: "Trekking Mount Rinjani <noreply@trekkingmountrinjani.com>",
      to: "trekkingmrinjani@gmail.com",
      subject: `✅ Ticket Booking Paid: ${ticket.full_name} (${ticket.number_of_pax} Pax)`,
      html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Payment Received for Ticket Booking</h2>
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
          <tr><td style="padding: 8px; border-bottom: 1px solid #eee; color: #666;">Booking ID</td><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>${ticket.id}</strong></td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #eee; color: #666;">Guest Name</td><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>${ticket.full_name}</strong></td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #eee; color: #666;">Email</td><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>${ticket.email}</strong></td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #eee; color: #666;">WhatsApp</td><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>${ticket.whatsapp}</strong></td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #eee; color: #666;">Entrance Gate</td><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>${ticket.entrance_gate}</strong></td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #eee; color: #666;">Exit Gate</td><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>${ticket.exit_gate}</strong></td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #eee; color: #666;">Check-in</td><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>${new Date(ticket.check_in).toLocaleDateString()}</strong></td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #eee; color: #666;">Check-out</td><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>${new Date(ticket.check_out).toLocaleDateString()}</strong></td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #eee; color: #666;">Pax</td><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>${ticket.number_of_pax} Person(s)</strong></td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #eee; color: #666;">Insurance</td><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>${ticket.insurance_type}</strong></td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #eee; color: #666;">Total Price</td><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Rp ${ticket.total_price?.toLocaleString('id-ID')}</strong></td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #eee; color: #666;">Invoice</td><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>${ticket.doku_invoice || "-"}</strong></td></tr>
        </table>
        ${ticket.member_data ? `<div style="margin-top: 24px;">
          <h3 style="color: #475569;">Member Details:</h3>
          <pre style="background: #f8fafc; padding: 16px; border-radius: 8px; font-family: monospace; white-space: pre-wrap; font-size: 13px; border: 1px solid #e2e8f0; color: #333;">${ticket.member_data}</pre>
        </div>` : ''}
      </div>`,
    });

    return true;
  } catch (err) {
    console.error("Failed to send ticket email", err);
    return false;
  }
}
