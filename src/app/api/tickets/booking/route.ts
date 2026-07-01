import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUser } from "@/lib/auth";
import { createDokuIdrPayment } from "@/lib/payments/doku";

function calculateBasePrice(
  citizenType: string,
  entranceGateName: string,
  checkInDateStr: string,
  checkOutDateStr: string
): number {
  if (!checkInDateStr || !checkOutDateStr) return 0;

  const isClass1 = (name: string) => {
    const n = name.toLowerCase();
    return n.includes("sembalun") || n.includes("senaru") || n.includes("torean");
  };

  const start = new Date(checkInDateStr);
  const end = new Date(checkOutDateStr);

  let totalBasePrice = 0;
  const current = new Date(start);
  while (current <= end) {
    const dayOfWeek = current.getDay(); // 0: Sunday, 6: Saturday
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    let pricePerDay = 0;
    if (citizenType === "foreign") {
      pricePerDay = 250000;
    } else {
      // Local (WNI)
      if (isClass1(entranceGateName)) {
        pricePerDay = isWeekend ? 75000 : 50000;
      } else {
        pricePerDay = isWeekend ? 15000 : 10000;
      }
    }
    totalBasePrice += pricePerDay;

    // Move to next day
    current.setDate(current.getDate() + 1);
  }

  return totalBasePrice;
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      full_name,
      email,
      whatsapp,
      entrance_gate,
      exit_gate,
      check_in,
      check_out,
      number_of_pax,
      insurance_type,
      member_data,
    } = body;

    // Validation
    if (!full_name || !email || !whatsapp || !entrance_gate || !exit_gate || !check_in || !check_out || !number_of_pax) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Calculate price
    const checkInDate = new Date(check_in);
    const checkOutDate = new Date(check_out);
    const isLocal = member_data?.toLowerCase().includes("local") || member_data?.toLowerCase().includes("wni");
    const citizenType = isLocal ? "local" : "foreign";

    const totalBasePrice = calculateBasePrice(
      citizenType,
      entrance_gate,
      check_in,
      check_out
    );

    const insurancePrice = insurance_type === "regular" ? 10000 : 290000;
    const totalPrice = (totalBasePrice * number_of_pax) + (insurancePrice * number_of_pax);

    // Create booking in DB
    const booking = await prisma.ticketBooking.create({
      data: {
        user_id: user.id,
        full_name,
        email,
        whatsapp,
        entrance_gate,
        exit_gate,
        check_in: checkInDate,
        check_out: checkOutDate,
        number_of_pax,
        insurance_type,
        insurance_price: insurancePrice,
        base_price: totalBasePrice,
        total_price: totalPrice,
        member_data,
        payment_status: "pending",
      },
    });

    // Create DOKU Invoice
    const invoiceNumber = `TKT-${booking.id.slice(0, 8).toUpperCase()}-${Date.now()}`;
    
    // Update booking with invoice
    await prisma.ticketBooking.update({
      where: { id: booking.id },
      data: { doku_invoice: invoiceNumber },
    });

    // Create Payment record
    await prisma.payment.create({
      data: {
        ticket_booking_id: booking.id,
        provider: "doku",
        invoice: invoiceNumber,
        amount: totalPrice,
        currency: "IDR",
        status: "pending",
        payment_type: "full",
      },
    });

    const forwardedHost = req.headers.get("x-forwarded-host") || req.headers.get("host");
    const protocol = req.headers.get("x-forwarded-proto") || "https";
    let origin = process.env.NEXT_PUBLIC_BASE_URL || (forwardedHost ? `${protocol}://${forwardedHost}` : new URL(req.url).origin);
    origin = origin.replace("0.0.0.0", "localhost");
    const callbackUrl = `${origin}/api/doku/webhook`;
    const redirectUrl = `${origin}/booking-ticket/success?booking_id=${booking.id}`;

    const dokuResponse = await createDokuIdrPayment({
      invoiceNumber,
      amountIdr: totalPrice,
      customerName: full_name,
      customerEmail: email,
      callbackUrl,
      redirectUrl,
    });

    if (dokuResponse.response && dokuResponse.response.payment && dokuResponse.response.payment.url) {
      return NextResponse.json({ 
        booking, 
        payment_url: dokuResponse.response.payment.url 
      });
    } else {
      console.error("DOKU error:", dokuResponse);
      return NextResponse.json({ 
        error: "Failed to create DOKU payment", 
        details: dokuResponse 
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error("Error creating ticket booking:", error);
    return NextResponse.json({ error: error.message || "Failed to create booking" }, { status: 500 });
  }
}
