import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createClient } from "@supabase/supabase-js";

export async function GET(request: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://pvhtohzmttglkuauibhg.supabase.co";
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2aHRvaHptdHRnbGt1YXVpYmhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2MDQ0MzMsImV4cCI6MjA5MjE4MDQzM30.qQdWcExJmdQoTJkefPcQ4QfX-ZN7Ya8w9W5mKxErOLo";

    const supabase = createClient(supabaseUrl, supabaseKey);
    const errors: any[] = [];

    // 1. Packages
    const { data: packages, error: pkgError } = await supabase.from("packages").select("*");
    if (pkgError) errors.push({ entity: "packages", error: pkgError });
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
      }
    }

    // 2. Categories
    const { data: categories, error: catError } = await supabase.from("categories").select("*");
    if (catError) errors.push({ entity: "categories", error: catError });
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
      }
    }

    // 3. Posts
    const { data: posts, error: postError } = await supabase.from("posts").select("*");
    if (postError) errors.push({ entity: "posts", error: postError });
    if (posts) {
      for (const post of posts) {
        await prisma.post.upsert({
          where: { id: post.id },
          update: post,
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
            author_id: null,
            category_id: post.category_id,
          }
        });
      }
    }

    return NextResponse.json({
      message: "Migration completed successfully!",
      packagesMigrated: packages?.length || 0,
      categoriesMigrated: categories?.length || 0,
      postsMigrated: posts?.length || 0,
      errors
    });
  } catch (error) {
    console.error("Migration error:", error);
    return NextResponse.json({ error: "Migration failed" }, { status: 500 });
  }
}
