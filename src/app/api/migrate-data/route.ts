import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createClient } from "@supabase/supabase-js";

export async function GET(request: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://pvhtohzmttglkuauibhg.supabase.co";
    const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2aHRvaHptdHRnbGt1YXVpYmhnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjYwNDQzMywiZXhwIjoyMDkyMTgwNDMzfQ.aIh_5jAqB9fj4Rj59yVztSlpk3fLdky3oj2xXsE2ATo"; // Service Role Key

    const supabase = createClient(supabaseUrl, supabaseKey);
    const errors: any[] = [];

    // 0. Users (from auth.users)
    const { data: { users }, error: userError } = await supabase.auth.admin.listUsers();
    if (userError) errors.push({ entity: "users", error: userError });
    const migratedUserIds = new Set<string>();
    if (users) {
      for (const u of users) {
        const fullName = u.user_metadata?.full_name || null;
        await prisma.user.upsert({
          where: { email: u.email || "" },
          update: { full_name: fullName },
          create: {
            id: u.id,
            email: u.email || "",
            full_name: fullName,
            role: u.user_metadata?.role === "admin" ? "admin" : "client",
            created_at: new Date(u.created_at),
          }
        });
        migratedUserIds.add(u.id);
      }
    }

    // 1. Packages
    const { data: packages, error: pkgError } = await supabase.from("packages").select("*");
    if (pkgError) errors.push({ entity: "packages", error: pkgError });
    const migratedPackageIds = new Set<string>();
    if (packages) {
      for (const pkg of packages) {
        await prisma.package.upsert({
          where: { id: pkg.id },
          update: pkg,
          create: {
            ...pkg,
            difficulty: pkg.difficulty || 3,
            created_at: new Date(pkg.created_at),
          }
        });
        migratedPackageIds.add(pkg.id);
      }
    }

    // 2. Categories
    const { data: categories, error: catError } = await supabase.from("categories").select("*");
    if (catError) errors.push({ entity: "categories", error: catError });
    const migratedCategoryIds = new Set<string>();
    if (categories) {
      for (const cat of categories) {
        await prisma.category.upsert({
          where: { id: cat.id },
          update: cat,
          create: {
            id: cat.id,
            name: cat.name,
            slug: cat.slug,
            created_at: new Date(cat.created_at),
          }
        });
        migratedCategoryIds.add(cat.id);
      }
    }

    // 3. Posts
    const { data: posts, error: postError } = await supabase.from("posts").select("*");
    if (postError) errors.push({ entity: "posts", error: postError });
    if (posts) {
      for (const post of posts) {
        const validAuthorId = migratedUserIds.has(post.author_id) ? post.author_id : null;
        const validCategoryId = migratedCategoryIds.has(post.category_id) ? post.category_id : null;

        await prisma.post.upsert({
          where: { id: post.id },
          update: { ...post, author_id: validAuthorId, category_id: validCategoryId },
          create: {
            id: post.id,
            title: post.title,
            slug: post.slug,
            excerpt: post.excerpt,
            content: post.content,
            featured_image: post.featured_image,
            is_published: post.is_published,
            published_at: post.published_at ? new Date(post.published_at) : null,
            created_at: new Date(post.created_at),
            author_id: validAuthorId,
            category_id: validCategoryId,
          }
        });
      }
    }

    // 4. Bookings
    const { data: bookings, error: bookingError } = await supabase.from("bookings").select("*");
    if (bookingError) errors.push({ entity: "bookings", error: bookingError });
    const migratedBookingIds = new Set<string>();
    if (bookings) {
      for (const booking of bookings) {
        const validPackageId = migratedPackageIds.has(booking.package_id) ? booking.package_id : null;
        const validUserId = migratedUserIds.has(booking.user_id) ? booking.user_id : null;
        
        await prisma.booking.upsert({
          where: { id: booking.id },
          update: { ...booking, package_id: validPackageId, user_id: validUserId },
          create: {
            ...booking,
            package_id: validPackageId,
            user_id: validUserId,
            created_at: new Date(booking.created_at),
            updated_at: booking.updated_at ? new Date(booking.updated_at) : new Date(booking.created_at),
            trekking_date: new Date(booking.trekking_date),
            birthday: booking.birthday ? new Date(booking.birthday) : null,
            arrival_day: booking.arrival_day ? new Date(booking.arrival_day) : null,
            refund_requested_at: booking.refund_requested_at ? new Date(booking.refund_requested_at) : null,
            refund_processed_at: booking.refund_processed_at ? new Date(booking.refund_processed_at) : null,
            deposit_reminder_sent_at: booking.deposit_reminder_sent_at ? new Date(booking.deposit_reminder_sent_at) : null,
          }
        });
        migratedBookingIds.add(booking.id);
      }
    }

    // 5. Payments
    const { data: payments, error: paymentError } = await supabase.from("payments").select("*");
    if (paymentError) errors.push({ entity: "payments", error: paymentError });
    if (payments) {
      for (const payment of payments) {
        const validBookingId = migratedBookingIds.has(payment.booking_id) ? payment.booking_id : null;

        await prisma.payment.upsert({
          where: { id: payment.id },
          update: { ...payment, booking_id: validBookingId },
          create: {
            ...payment,
            booking_id: validBookingId,
            created_at: new Date(payment.created_at),
            updated_at: payment.updated_at ? new Date(payment.updated_at) : new Date(payment.created_at),
            paid_at: payment.paid_at ? new Date(payment.paid_at) : null,
          }
        });
      }
    }

    return NextResponse.json({
      message: "FULL Migration completed successfully!",
      usersMigrated: users?.length || 0,
      packagesMigrated: packages?.length || 0,
      categoriesMigrated: categories?.length || 0,
      postsMigrated: posts?.length || 0,
      bookingsMigrated: bookings?.length || 0,
      paymentsMigrated: payments?.length || 0,
      errors
    });
  } catch (error: any) {
    console.error("Migration error:", error);
    return NextResponse.json({ 
      error: "Migration failed", 
      details: error?.message || String(error),
      stack: error?.stack
    }, { status: 500 });
  }
}
