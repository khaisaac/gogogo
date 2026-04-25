import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { Resend } from "resend";
import {
  getPerPaxPrice,
  getTotalPackagePrice,
  type PriceType,
  type TotalDayOption,
} from "@/lib/pricing";

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new Resend(apiKey);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      package_id,
      full_name,
      email,
      whatsapp,
      trekking_date,
      number_of_trekkers,
      price_type,
      price_mode,
      total_days,
      hotel_pickup_location,
      special_requirements,
      order_note,
      payment_type,
    } = body;

    const trekkersCount = Number(number_of_trekkers);
    const selectedPriceType: PriceType =
      price_type === "private" ? "private" : "standard";
    const selectedPriceMode: "per_pax" | "total_package" =
      price_mode === "total_package" ? "total_package" : "per_pax";
    const selectedTotalDays: TotalDayOption = total_days === 3 ? 3 : 2;

    // Validate required fields
    if (
      !full_name ||
      !email ||
      !whatsapp ||
      !trekking_date ||
      !Number.isInteger(trekkersCount) ||
      trekkersCount < 1 ||
      trekkersCount > 10 ||
      !hotel_pickup_location
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const supabase = await createClient();

    // Get user if logged in (optional — guest checkout allowed)
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Get package details for pricing
    let package_title = null;
    let total_price = null;

    if (package_id) {
      const { data: pkg } = await supabase
        .from("packages")
        .select("*")
        .eq("id", package_id)
        .single();

      if (pkg) {
        package_title = pkg.title;

        if (selectedPriceMode === "total_package") {
          const selectedTotalPrice = getTotalPackagePrice(
            pkg,
            selectedPriceType,
            selectedTotalDays,
          );

          if (selectedTotalPrice === null) {
            return NextResponse.json(
              {
                error:
                  "Selected total package option is unavailable for this service type",
              },
              { status: 422 },
            );
          }

          total_price = selectedTotalPrice * trekkersCount;
        } else {
          const perPaxPrice = getPerPaxPrice(
            pkg,
            selectedPriceType,
            trekkersCount,
          );

          if (perPaxPrice === null) {
            return NextResponse.json(
              {
                error:
                  "Selected pax count is unavailable for this service type",
              },
              { status: 422 },
            );
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
      } else {
        deposit_amount = total_price;
        balance_amount = 0;
      }
    }

    // Insert booking
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .insert({
        user_id: user?.id || null,
        package_id: package_id || null,
        full_name,
        email,
        whatsapp,
        trekking_date,
        number_of_trekkers: trekkersCount,
        hotel_pickup_location,
        special_requirements: special_requirements || null,
        order_note: order_note || null,
        package_title,
        total_price,
        payment_type: payment_type || "full",
        deposit_amount,
        balance_amount,
        payment_status: "pending",
        status: "pending",
      })
      .select()
      .single();

    if (bookingError) {
      console.error("Booking insert error:", bookingError);
      return NextResponse.json(
        { error: "Failed to create booking" },
        { status: 500 },
      );
    }

    const resend = getResendClient();
    if (!resend) {
      console.warn("RESEND_API_KEY is not set. Skipping booking emails.");
    } else {
      // Send confirmation email to client
      try {
        await resend.emails.send({
          from: "Trekking Mount Rinjani <noreply@trekkingmountrinjani.com>",
          to: email,
          subject: `Booking Confirmation — ${package_title || "Rinjani Trek"}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #1a5c2e;">🏔️ Booking Received!</h2>
              <p>Hi <strong>${full_name}</strong>,</p>
              <p>Thank you for booking with Trekking Mount Rinjani. Here are your booking details:</p>
              <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
                <tr><td style="padding: 8px; border-bottom: 1px solid #eee; color: #666;">Package</td><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>${package_title || "Custom"}</strong></td></tr>
                <tr><td style="padding: 8px; border-bottom: 1px solid #eee; color: #666;">Date</td><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>${trekking_date}</strong></td></tr>
                <tr><td style="padding: 8px; border-bottom: 1px solid #eee; color: #666;">Service Type</td><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>${selectedPriceType}</strong></td></tr>
                 <tr><td style="padding: 8px; border-bottom: 1px solid #eee; color: #666;">Pricing Mode</td><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>${selectedPriceMode === "total_package" ? `Total ${selectedTotalDays} Days` : "Per Person"}</strong></td></tr>
                 <tr><td style="padding: 8px; border-bottom: 1px solid #eee; color: #666;">Adults</td><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>${trekkersCount}</strong></td></tr>
                <tr><td style="padding: 8px; border-bottom: 1px solid #eee; color: #666;">Pickup</td><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>${hotel_pickup_location}</strong></td></tr>
                ${total_price ? `<tr><td style="padding: 8px; border-bottom: 1px solid #eee; color: #666;">Total</td><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>$${total_price} USD</strong></td></tr>` : ""}
              </table>
              <p style="color: #666;">Our team will confirm your booking shortly and reach out via WhatsApp.</p>
              <p style="color: #666;">Booking ID: <code>${booking.id}</code></p>
            </div>
          `,
        });
      } catch (emailErr) {
        console.error("Email send error:", emailErr);
        // Don't fail the booking if email fails
      }

      // Send notification to admin
      try {
        await resend.emails.send({
          from: "Trekking Mount Rinjani <noreply@trekkingmountrinjani.com>",
          to: process.env.ADMIN_EMAIL!,
          subject: `🆕 New Booking — ${full_name}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>New Booking Request</h2>
              <p><strong>Name:</strong> ${full_name}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>WhatsApp:</strong> ${whatsapp}</p>
              <p><strong>Package:</strong> ${package_title || "Custom"}</p>
              <p><strong>Date:</strong> ${trekking_date}</p>
              <p><strong>Service Type:</strong> ${selectedPriceType}</p>
                <p><strong>Pricing Mode:</strong> ${selectedPriceMode === "total_package" ? `Total ${selectedTotalDays} Days` : "Per Person"}</p>
                <p><strong>Adults:</strong> ${trekkersCount}</p>
              <p><strong>Pickup:</strong> ${hotel_pickup_location}</p>
              ${special_requirements ? `<p><strong>Special Req:</strong> ${special_requirements}</p>` : ""}
              ${order_note ? `<p><strong>Note:</strong> ${order_note}</p>` : ""}
              ${total_price ? `<p><strong>Total:</strong> $${total_price} USD</p>` : ""}
              <p><strong>Booking ID:</strong> ${booking.id}</p>
            </div>
          `,
        });
      } catch (emailErr) {
        console.error("Admin email error:", emailErr);
      }
    }

    return NextResponse.json({
      message: "Booking created successfully",
      booking,
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
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

    const { data: bookings, error } = await supabase
      .from("bookings")
      .select("*, payments(*)")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch bookings" },
        { status: 500 },
      );
    }

    return NextResponse.json({ bookings });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
