import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createClient } from "@supabase/supabase-js";

export async function GET(request: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: "Missing Supabase env vars" }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. Packages
    const { data: packages } = await supabase.from("packages").select("*");
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
    const { data: categories } = await supabase.from("categories").select("*");
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
    const { data: posts } = await supabase.from("posts").select("*");
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
    });
  } catch (error) {
    console.error("Migration error:", error);
    return NextResponse.json({ error: "Migration failed" }, { status: 500 });
  }
}
