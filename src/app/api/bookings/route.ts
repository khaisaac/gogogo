import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Resend } from "resend";
import { getPerPaxPrice, getTotalPackagePrice, type PriceType, type TotalDayOption } from "@/lib/pricing";
import { parsePackageContent } from "@/lib/package-content";

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  return new Resend(apiKey);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { package_id, full_name, email, whatsapp, trekking_date, number_of_trekkers, price_type, price_mode, total_days, hotel_pickup_location, special_requirements, order_note, payment_type, passport_number, nationality, gender, birthday, height, weight, arrival_day, promo_code_applied } = body;

    const trekkersCount = Number(number_of_trekkers);
    const selectedPriceType: PriceType = price_type === "private" ? "private" : "standard";
    const selectedPriceMode: "per_pax" | "total_package" = price_mode === "total_package" ? "total_package" : "per_pax";
    const selectedTotalDays: TotalDayOption = total_days === 3 ? 3 : 2;

    if (!full_name || !email || !whatsapp || !trekking_date || !Number.isInteger(trekkersCount) || trekkersCount < 1 || trekkersCount > 10 || !hotel_pickup_location) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const user = await getUser();
    let validUserId = null;
    if (user?.id) {
      const dbUser = await prisma.user.findUnique({ where: { id: user.id }, select: { id: true } });
      if (dbUser) {
        validUserId = dbUser.id;
      }
    }

    let package_title = null;
    let total_price = null;
    let includeHtml = "";
    let excludeHtml = "";

    if (package_id) {
      const pkg = await prisma.package.findUnique({ where: { id: package_id } });
      if (pkg) {
        package_title = pkg.title;
        if (selectedPriceMode === "total_package") {
          const selectedTotalPrice = getTotalPackagePrice(pkg as any, selectedPriceType, selectedTotalDays);
          if (selectedTotalPrice === null) {
            return NextResponse.json({ error: "Selected total package option is unavailable for this service type" }, { status: 422 });
          }
          total_price = selectedTotalPrice * trekkersCount;
        } else {
          const perPaxPrice = getPerPaxPrice(pkg as any, selectedPriceType, trekkersCount);
          if (perPaxPrice === null) {
            return NextResponse.json({ error: "Selected pax count is unavailable for this service type" }, { status: 422 });
          }
          total_price = perPaxPrice * trekkersCount;
        }

        if (pkg.is_direct_promo || (promo_code_applied && pkg.promo_code && promo_code_applied.toUpperCase() === pkg.promo_code.toUpperCase())) {
          const isPromoExhausted = pkg.promo_usage_limit !== null && pkg.promo_usage_count >= pkg.promo_usage_limit;
          
          if (!isPromoExhausted) {
            let discount = 0;
            if (pkg.discount_percentage) {
              discount = Math.round(total_price * (pkg.discount_percentage / 100));
            } else if (pkg.discount_amount) {
              discount = pkg.discount_amount;
            }
            if (discount > 0) {
              total_price = Math.max(0, total_price - discount);
            }
          }
        }

        if (pkg.description) {
          const content = parsePackageContent(pkg.description);
          
          const includeItems = content.include.split("\n").map((i) => i.trim()).filter(Boolean);
          if (includeItems.length > 0) {
            includeHtml = `
              <div style="margin-top: 16px;">
                <h3 style="color: #1a5c2e; font-size: 16px; margin-bottom: 8px;">✅ Include</h3>
                <ul style="margin: 0; padding-left: 20px; color: #444; font-size: 14px;">
                  ${includeItems.map((item) => `<li style="margin-bottom: 4px;">${item}</li>`).join('')}
                </ul>
              </div>
            `;
          }
          
          const excludeItems = content.exclude.split("\n").map((i) => i.trim()).filter(Boolean);
          if (excludeItems.length > 0) {
            excludeHtml = `
              <div style="margin-top: 16px;">
                <h3 style="color: #721c24; font-size: 16px; margin-bottom: 8px;">❌ Exclude</h3>
                <ul style="margin: 0; padding-left: 20px; color: #444; font-size: 14px;">
                  ${excludeItems.map((item) => `<li style="margin-bottom: 4px;">${item}</li>`).join('')}
                </ul>
              </div>
            `;
          }
        }
      }
    }

    let deposit_amount = null;
    let balance_amount = null;
    if (total_price) {
      if (payment_type === "deposit") {
        deposit_amount = Math.round(total_price * 0.3);
        balance_amount = total_price - deposit_amount;
      } else if (payment_type === "pay_later") {
        deposit_amount = 0;
        balance_amount = total_price;
      } else {
        deposit_amount = total_price;
        balance_amount = 0;
      }
    }

    const booking = await prisma.$transaction(async (tx) => {
      let isPromoSuccessfullyApplied = false;

      // Double check quota inside transaction
      if (package_id && (body.promo_code_applied || body.discount_amount_applied)) {
        const pkgForUpdate = await tx.package.findUnique({ where: { id: package_id } });
        if (pkgForUpdate) {
          const isPromoExhausted = pkgForUpdate.promo_usage_limit !== null && pkgForUpdate.promo_usage_count >= pkgForUpdate.promo_usage_limit;
          const isMatchingCode = body.promo_code_applied === "DIRECT_PROMO" || (body.promo_code_applied && pkgForUpdate.promo_code && body.promo_code_applied.toUpperCase() === pkgForUpdate.promo_code.toUpperCase());
          
          if (!isPromoExhausted && isMatchingCode) {
            isPromoSuccessfullyApplied = true;
            await tx.package.update({
              where: { id: package_id },
              data: { promo_usage_count: { increment: 1 } },
            });
          }
        }
      }

      return await tx.booking.create({
        data: {
          user_id: validUserId,
          package_id: package_id || null,
          full_name, email, whatsapp,
          trekking_date: new Date(trekking_date),
          number_of_trekkers: trekkersCount,
          hotel_pickup_location,
          special_requirements: special_requirements || null,
          order_note: order_note || null,
          package_title, total_price,
          payment_type: payment_type || "full",
          deposit_amount, balance_amount,
          payment_status: "pending", status: "pending",
          promo_code_applied: isPromoSuccessfullyApplied ? (promo_code_applied || null) : null,
          discount_amount_applied: isPromoSuccessfullyApplied ? (body.discount_amount_applied || null) : null,
          passport_number: passport_number || null,
          nationality: nationality || null,
          gender: gender || null,
          birthday: birthday ? new Date(birthday) : null,
          height: height ? Number(height) : null,
          weight: weight ? Number(weight) : null,
          arrival_day: arrival_day ? new Date(arrival_day) : null,
        },
      });
    });

    const resend = getResendClient();
    if (resend) {
      try {
        await resend.emails.send({
          from: "Trekking Mount Rinjani <noreply@trekkingmountrinjani.com>",
          to: email,
          subject: `Booking Confirmation — ${package_title || "Rinjani Trek"}`,
          html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;"><h2 style="color: #1a5c2e;">🏔️ Booking Received!</h2><p>Hi <strong>${full_name}</strong>,</p><p>Thank you for booking with Trekking Mount Rinjani.</p><table style="width: 100%; border-collapse: collapse; margin: 16px 0;"><tr><td style="padding: 8px; border-bottom: 1px solid #eee; color: #666;">Package</td><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>${package_title || "Custom"}</strong></td></tr><tr><td style="padding: 8px; border-bottom: 1px solid #eee; color: #666;">Date</td><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>${trekking_date}</strong></td></tr><tr><td style="padding: 8px; border-bottom: 1px solid #eee; color: #666;">Adults</td><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>${trekkersCount}</strong></td></tr>${total_price ? `<tr><td style="padding: 8px; border-bottom: 1px solid #eee; color: #666;">Total</td><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>$${total_price} USD</strong></td></tr>` : ""}</table>${includeHtml}${excludeHtml}<div style="margin-top: 24px;"><p style="color: #666;">Booking ID: <code>${booking.id}</code></p></div></div>`,
        });
      } catch (emailErr) { console.error("Email send error:", emailErr); }

      try {
        const paymentTypeLabel =
          payment_type === "full" ? "Pay in Full (100%)" :
          payment_type === "deposit" ? "Pay Deposit (30%)" :
          payment_type === "pay_later" ? "Pay Later (on arrival)" : payment_type;

        const priceModeLabel =
          price_mode === "total_package"
            ? `Total Package (${total_days} days)`
            : "Per Person";

        const adminHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; color: #222; background: #f4f4f4; margin: 0; padding: 0; }
    .wrapper { max-width: 640px; margin: 24px auto; background: #fff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #1a5c2e, #2e8b57); padding: 28px 32px; }
    .header h1 { margin: 0; color: #fff; font-size: 22px; }
    .header p { margin: 4px 0 0; color: #b6e8c8; font-size: 14px; }
    .body { padding: 28px 32px; }
    .section-title { font-size: 13px; font-weight: 700; color: #1a5c2e; text-transform: uppercase; letter-spacing: 0.8px; margin: 24px 0 10px; border-bottom: 2px solid #e8f5ec; padding-bottom: 6px; }
    table { width: 100%; border-collapse: collapse; }
    td { padding: 9px 12px; font-size: 14px; border-bottom: 1px solid #f0f0f0; vertical-align: top; }
    td:first-child { color: #666; width: 40%; font-weight: 600; }
    td:last-child { color: #222; }
    .badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: 700; }
    .badge-full { background: #d4edda; color: #155724; }
    .badge-deposit { background: #fff3cd; color: #856404; }
    .badge-later { background: #f8d7da; color: #721c24; }
    .pre-text { white-space: pre-wrap; background: #f9f9f9; border: 1px solid #e5e5e5; border-radius: 6px; padding: 12px; font-size: 13px; line-height: 1.6; font-family: monospace; }
    .booking-id { background: #eef7f1; border: 1px solid #c3e6cb; border-radius: 6px; padding: 10px 14px; font-family: monospace; font-size: 13px; color: #155724; margin-top: 8px; }
    .footer { background: #f9f9f9; padding: 16px 32px; font-size: 12px; color: #999; text-align: center; border-top: 1px solid #eee; }
  </style>
</head>
<body>
<div class="wrapper">
  <div class="header">
    <h1>🏔️ New Booking Received!</h1>
    <p>A guest has just completed a booking on Trekking Mount Rinjani.</p>
  </div>
  <div class="body">

    <div class="section-title">👤 Guest Information</div>
    <table>
      <tr><td>Full Name</td><td>${full_name}</td></tr>
      <tr><td>Email</td><td>${email}</td></tr>
      <tr><td>WhatsApp</td><td>${whatsapp}</td></tr>
    </table>

    <div class="section-title">🎒 Booking Details</div>
    <table>
      <tr><td>Package</td><td><strong>${package_title || "Custom / No Package"}</strong></td></tr>
      <tr><td>Trekking Date</td><td>${trekking_date}</td></tr>
      <tr><td>Arrival / Pickup Date</td><td>${arrival_day || "—"}</td></tr>
      <tr><td>Number of Trekkers</td><td>${trekkersCount} person(s)</td></tr>
      <tr><td>Service Type</td><td style="text-transform:capitalize">${price_type || "—"}</td></tr>
      <tr><td>Pricing Mode</td><td>${priceModeLabel}</td></tr>
      <tr><td>Hotel Pickup Location</td><td>${hotel_pickup_location}</td></tr>
    </table>

    <div class="section-title">💳 Payment Information</div>
    <table>
      <tr>
        <td>Payment Option</td>
        <td>
          <span class="badge ${payment_type === "full" ? "badge-full" : payment_type === "deposit" ? "badge-deposit" : "badge-later"}">
            ${paymentTypeLabel}
          </span>
        </td>
      </tr>
      ${total_price ? `<tr><td>Total Price</td><td><strong>$${total_price} USD</strong></td></tr>` : ""}
      ${deposit_amount != null ? `<tr><td>Amount Due Now</td><td><strong>$${deposit_amount} USD</strong></td></tr>` : ""}
      ${balance_amount != null && balance_amount > 0 ? `<tr><td>Remaining Balance</td><td>$${balance_amount} USD</td></tr>` : ""}
    </table>

    ${special_requirements ? `
    <div class="section-title">👥 Members Data & Special Requirements</div>
    <div class="pre-text">${special_requirements.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}</div>
    ` : ""}

    ${order_note ? `
    <div class="section-title">📝 Order Note</div>
    <div class="pre-text">${order_note.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}</div>
    ` : ""}

    <div class="section-title">🔖 Booking ID</div>
    <div class="booking-id">${booking.id}</div>

  </div>
  <div class="footer">
    This is an automated notification from Trekking Mount Rinjani booking system.<br>
    Please log in to the admin dashboard to manage this booking.
  </div>
</div>
</body>
</html>`;

        await resend.emails.send({
          from: "Trekking Mount Rinjani <noreply@trekkingmountrinjani.com>",
          to: "trekkingmrinjani@gmail.com",
          subject: `🆕 New Booking — ${full_name} | ${package_title || "Custom"} | ${payment_type === "pay_later" ? "Pay Later" : `$${total_price} USD`}`,
          html: adminHtml,
        });
      } catch (emailErr) { console.error("Admin email error:", emailErr); }
    }

    return NextResponse.json({ message: "Booking created successfully", booking });
  } catch (error: any) {
    console.error("Booking Error:", error);
    return NextResponse.json({ error: "Internal server error", details: error.message || String(error) }, { status: 500 });
  }
}

export async function GET() {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const bookings = await prisma.booking.findMany({
      where: { user_id: user.id },
      include: { payments: true },
      orderBy: { created_at: "desc" },
    });

    return NextResponse.json({ bookings });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
