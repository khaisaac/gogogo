"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { requireAdmin, requireAdminContext } from "@/app/admin/_lib";
import { prisma } from "@/lib/db";
import { uploadImage } from "@/lib/storage";

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return "Failed to save post";
}

function compactErrorMessage(raw: string) {
  const cleaned = raw.replace(/\s+/g, " ").trim();
  if (!cleaned) return "Failed to save post";
  return cleaned.length > 180 ? `${cleaned.slice(0, 177)}...` : cleaned;
}

type BlogPayload = {
  title: string;
  slug: string;
  category_id: string | null;
  excerpt: string | null;
  content: string | null;
  featured_image: string | null;
  cover_image_alignment: string;
  is_published: boolean;
  published_at: string | null;
  seo_title?: string | null;
  meta_description?: string | null;
  meta_keywords?: string | null;
  canonical_url?: string | null;
  robots?: string | null;
  og_title?: string | null;
  og_description?: string | null;
  og_image?: string | null;
  twitter_title?: string | null;
  twitter_description?: string | null;
  twitter_image?: string | null;
  focus_keyword?: string | null;
  schema_type?: string | null;
  seo_status?: string | null;
};

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function getPayload(formData: FormData): BlogPayload {
  const title = String(formData.get("title") || "").trim();
  const slugRaw = String(formData.get("slug") || "").trim();
  const isPublished = formData.get("is_published") === "on";
  const categoryId = String(formData.get("category_id") || "").trim();

  return {
    title,
    slug: slugify(slugRaw || title),
    category_id: categoryId || null,
    excerpt: String(formData.get("excerpt") || "").trim() || null,
    content: String(formData.get("content") || "").trim() || null,
    featured_image:
      String(formData.get("current_featured_image") || "").trim() || null,
    cover_image_alignment:
      String(formData.get("cover_image_alignment") || "center").trim(),
    is_published: isPublished,
    published_at: isPublished ? new Date().toISOString() : null,
    seo_title: String(formData.get("seo_title") || "").trim() || null,
    meta_description: String(formData.get("meta_description") || "").trim() || null,
    meta_keywords: String(formData.get("meta_keywords") || "").trim() || null,
    canonical_url: String(formData.get("canonical_url") || "").trim() || null,
    robots: String(formData.get("robots") || "index, follow").trim() || "index, follow",
    og_title: String(formData.get("og_title") || "").trim() || null,
    og_description: String(formData.get("og_description") || "").trim() || null,
    og_image: String(formData.get("og_image") || "").trim() || null,
    twitter_title: String(formData.get("twitter_title") || "").trim() || null,
    twitter_description: String(formData.get("twitter_description") || "").trim() || null,
    twitter_image: String(formData.get("twitter_image") || "").trim() || null,
    focus_keyword: String(formData.get("focus_keyword") || "").trim() || null,
    schema_type: String(formData.get("schema_type") || "Article").trim() || "Article",
    seo_status: String(formData.get("seo_status") || "published").trim() || "published",
  };
}

async function resolveCategoryId(
  formData: FormData,
  fallbackCategoryId: string | null = null,
) {
  const newCategoryName = String(formData.get("new_category") || "").trim();

  if (!newCategoryName) {
    return fallbackCategoryId;
  }

  const categorySlug = slugify(newCategoryName);

  const category = await prisma.category.upsert({
    where: { slug: categorySlug },
    update: { name: newCategoryName },
    create: { name: newCategoryName, slug: categorySlug },
  });

  return category.id;
}

async function resolveTagIds(formData: FormData) {
  const selectedTagIds = formData
    .getAll("tag_ids")
    .map((value) => String(value))
    .filter(Boolean);

  const newTagsRaw = String(formData.get("new_tags") || "").trim();
  if (!newTagsRaw) {
    return selectedTagIds;
  }

  const names = newTagsRaw
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  if (names.length === 0) {
    return selectedTagIds;
  }

  const newTagIds: string[] = [];
  for (const name of names) {
    const slug = slugify(name);
    const tag = await prisma.tag.upsert({
      where: { slug },
      update: { name },
      create: { name, slug },
    });
    newTagIds.push(tag.id);
  }

  return Array.from(new Set([...selectedTagIds, ...newTagIds]));
}

export async function createPost(formData: FormData) {
  try {
    const basePayload = getPayload(formData);
    const { user } = await requireAdminContext();
    const categoryId = await resolveCategoryId(formData, basePayload.category_id);
    const payload: BlogPayload = {
      ...basePayload,
      category_id: categoryId,
    };
    const imageFile = formData.get("featured_image_file");
    if (imageFile instanceof File && imageFile.size > 0) {
      payload.featured_image = await uploadImage(imageFile, "blog");
    }

    if (!payload.title || !payload.slug) {
      throw new Error("Title and slug are required");
    }

    const post = await prisma.post.create({
      data: {
        title: payload.title,
        slug: payload.slug,
        category_id: payload.category_id,
        excerpt: payload.excerpt,
        content: payload.content,
        featured_image: payload.featured_image,
        cover_image_alignment: payload.cover_image_alignment,
        is_published: payload.is_published,
        published_at: payload.published_at ? new Date(payload.published_at) : null,
        author_id: user.id,
        seo_title: payload.seo_title,
        meta_description: payload.meta_description,
        meta_keywords: payload.meta_keywords,
        canonical_url: payload.canonical_url,
        robots: payload.robots,
        og_title: payload.og_title,
        og_description: payload.og_description,
        og_image: payload.og_image,
        twitter_title: payload.twitter_title,
        twitter_description: payload.twitter_description,
        twitter_image: payload.twitter_image,
        focus_keyword: payload.focus_keyword,
        schema_type: payload.schema_type,
        seo_status: payload.seo_status,
      },
    });

    const tagIds = await resolveTagIds(formData);
    if (tagIds.length > 0) {
      await prisma.postTag.createMany({
        data: tagIds.map((tagId) => ({
          post_id: post.id,
          tag_id: tagId,
        })),
      });
    }

    revalidatePath("/");
    revalidatePath("/blog");
    revalidatePath("/admin/blog");
    redirect("/admin/blog");
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    const message = compactErrorMessage(getErrorMessage(error));
    console.error("❌ createPost failed:", error);
    redirect(`/admin/blog/new?error=${encodeURIComponent(message)}`);
  }
}

export async function updatePost(id: string, formData: FormData) {
  try {
    const basePayload = getPayload(formData);
    await requireAdmin();
    const categoryId = await resolveCategoryId(formData, basePayload.category_id);
    const payload: BlogPayload = {
      ...basePayload,
      category_id: categoryId,
    };
    const imageFile = formData.get("featured_image_file");
    if (imageFile instanceof File && imageFile.size > 0) {
      payload.featured_image = await uploadImage(imageFile, "blog");
    }

    if (!payload.title || !payload.slug) {
      throw new Error("Title and slug are required");
    }

    const existingPost = await prisma.post.findUnique({ where: { id }, select: { slug: true } });
    if (existingPost && existingPost.slug !== payload.slug) {
      try {
        await prisma.seoRedirect.upsert({
          where: { source_url: `/blog/${existingPost.slug}` },
          update: { target_url: `/blog/${payload.slug}`, status_code: 301 },
          create: { source_url: `/blog/${existingPost.slug}`, target_url: `/blog/${payload.slug}`, status_code: 301 },
        });
      } catch (_) {}
    }

    await prisma.post.update({
      where: { id },
      data: {
        title: payload.title,
        slug: payload.slug,
        category_id: payload.category_id,
        excerpt: payload.excerpt,
        content: payload.content,
        featured_image: payload.featured_image,
        cover_image_alignment: payload.cover_image_alignment,
        is_published: payload.is_published,
        published_at: payload.published_at ? new Date(payload.published_at) : null,
        seo_title: payload.seo_title,
        meta_description: payload.meta_description,
        meta_keywords: payload.meta_keywords,
        canonical_url: payload.canonical_url,
        robots: payload.robots,
        og_title: payload.og_title,
        og_description: payload.og_description,
        og_image: payload.og_image,
        twitter_title: payload.twitter_title,
        twitter_description: payload.twitter_description,
        twitter_image: payload.twitter_image,
        focus_keyword: payload.focus_keyword,
        schema_type: payload.schema_type,
        seo_status: payload.seo_status,
      },
    });

    try {
      await prisma.seoRevision.create({
        data: {
          target_type: "post",
          target_id: id,
          changed_by: "Admin",
          new_title: payload.seo_title || payload.title,
          new_description: payload.meta_description || payload.excerpt,
        },
      });
    } catch (_) {}

    // Clear existing tags
    await prisma.postTag.deleteMany({ where: { post_id: id } });

    const tagIds = await resolveTagIds(formData);
    if (tagIds.length > 0) {
      await prisma.postTag.createMany({
        data: tagIds.map((tagId) => ({
          post_id: id,
          tag_id: tagId,
        })),
      });
    }

    revalidatePath("/");
    revalidatePath("/blog");
    revalidatePath("/admin/blog");
    redirect("/admin/blog");
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    const message = compactErrorMessage(getErrorMessage(error));
    console.error("❌ updatePost failed:", error);
    redirect(`/admin/blog/${id}/edit?error=${encodeURIComponent(message)}`);
  }
}

export async function deletePost(id: string) {
  await requireAdmin();
  await prisma.post.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/blog");
  revalidatePath("/admin/blog");
}
