import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";
import { Resend } from "resend";
import { getPerPaxPrice, getTotalPackagePrice, type PriceType, type TotalDayOption } from "@/lib/pricing";

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  return new Resend(apiKey);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { package_id, full_name, email, whatsapp, trekking_date, number_of_trekkers, price_type, price_mode, total_days, hotel_pickup_location, special_requirements, order_note, payment_type, passport_number, nationality, gender, birthday, height, weight, arrival_day } = body;

    const trekkersCount = Number(number_of_trekkers);
    const selectedPriceType: PriceType = price_type === "private" ? "private" : "standard";
    const selectedPriceMode: "per_pax" | "total_package" = price_mode === "total_package" ? "total_package" : "per_pax";
    const selectedTotalDays: TotalDayOption = total_days === 3 ? 3 : 2;

    if (!full_name || !email || !whatsapp || !trekking_date || !Number.isInteger(trekkersCount) || trekkersCount < 1 || trekkersCount > 10 || !hotel_pickup_location) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    let package_title = null;
    let total_price = null;

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

    const booking = await prisma.booking.create({
      data: {
        user_id: user?.id || null,
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
        passport_number: passport_number || null,
        nationality: nationality || null,
        gender: gender || null,
        birthday: birthday ? new Date(birthday) : null,
        height: height ? Number(height) : null,
        weight: weight ? Number(weight) : null,
        arrival_day: arrival_day ? new Date(arrival_day) : null,
      },
    });

    const resend = getResendClient();
    if (resend) {
      try {
        await resend.emails.send({
          from: "Trekking Mount Rinjani <noreply@trekkingmountrinjani.com>",
          to: email,
          subject: `Booking Confirmation — ${package_title || "Rinjani Trek"}`,
          html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;"><h2 style="color: #1a5c2e;">🏔️ Booking Received!</h2><p>Hi <strong>${full_name}</strong>,</p><p>Thank you for booking with Trekking Mount Rinjani.</p><table style="width: 100%; border-collapse: collapse; margin: 16px 0;"><tr><td style="padding: 8px; border-bottom: 1px solid #eee; color: #666;">Package</td><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>${package_title || "Custom"}</strong></td></tr><tr><td style="padding: 8px; border-bottom: 1px solid #eee; color: #666;">Date</td><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>${trekking_date}</strong></td></tr><tr><td style="padding: 8px; border-bottom: 1px solid #eee; color: #666;">Adults</td><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>${trekkersCount}</strong></td></tr>${total_price ? `<tr><td style="padding: 8px; border-bottom: 1px solid #eee; color: #666;">Total</td><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>$${total_price} USD</strong></td></tr>` : ""}</table><p style="color: #666;">Booking ID: <code>${booking.id}</code></p></div>`,
        });
      } catch (emailErr) { console.error("Email send error:", emailErr); }

      try {
        await resend.emails.send({
          from: "Trekking Mount Rinjani <noreply@trekkingmountrinjani.com>",
          to: process.env.ADMIN_EMAIL!,
          subject: `🆕 New Booking — ${full_name}`,
          html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;"><h2>New Booking Request</h2><p><strong>Name:</strong> ${full_name}</p><p><strong>Email:</strong> ${email}</p><p><strong>WhatsApp:</strong> ${whatsapp}</p><p><strong>Package:</strong> ${package_title || "Custom"}</p><p><strong>Date:</strong> ${trekking_date}</p><p><strong>Adults:</strong> ${trekkersCount}</p>${total_price ? `<p><strong>Total:</strong> $${total_price} USD</p>` : ""}<p><strong>Booking ID:</strong> ${booking.id}</p></div>`,
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
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
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
