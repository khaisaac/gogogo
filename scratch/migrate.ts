import { createClient } from "@supabase/supabase-js";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const prisma = new PrismaClient();

async function migrate() {
  console.log("Starting migration from Supabase to Hostinger MySQL...");

  // 1. Migrate Users
  console.log("Fetching users from Supabase Auth...");
  const { data: { users }, error: userError } = await supabase.auth.admin.listUsers();
  if (userError) console.error("Error fetching users:", userError);
  
  if (users) {
    for (const u of users) {
      // Check if user has metadata for full_name
      const fullName = u.user_metadata?.full_name || null;
      
      // Upsert to avoid duplicates
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
    }
    console.log(`Migrated ${users.length} users.`);
  }

  // 2. Migrate Packages
  console.log("Fetching packages...");
  const { data: packages, error: pkgError } = await supabase.from("packages").select("*");
  if (pkgError) console.error("Error fetching packages:", pkgError);
  
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
    console.log(`Migrated ${packages.length} packages.`);
  }

  // 3. Migrate Categories
  console.log("Fetching categories...");
  const { data: categories, error: catError } = await supabase.from("categories").select("*");
  if (catError) console.error("Error fetching categories:", catError);
  
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
    console.log(`Migrated ${categories.length} categories.`);
  }

  // 4. Migrate Posts
  console.log("Fetching posts...");
  const { data: posts, error: postError } = await supabase.from("posts").select("*");
  if (postError) console.error("Error fetching posts:", postError);
  
  if (posts) {
    for (const post of posts) {
      // Find a matching user for author_id or default to the first user
      let author_id = post.author_id;
      if (author_id) {
        const userExists = await prisma.user.findUnique({ where: { id: author_id } });
        if (!userExists) author_id = null;
      }

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
          author_id: author_id,
          category_id: post.category_id,
        }
      });
    }
    console.log(`Migrated ${posts.length} posts.`);
  }

  console.log("Migration complete!");
}

migrate()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
