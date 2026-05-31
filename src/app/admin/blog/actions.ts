"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin, requireAdminContext } from "@/app/admin/_lib";
import { prisma } from "@/lib/db";
import { uploadImage } from "@/lib/storage";

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
  revalidatePath("/admin/blog");
  redirect("/admin/blog");
}

export async function updatePost(id: string, formData: FormData) {
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
    },
  });

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
  revalidatePath("/admin/blog");
  redirect("/admin/blog");
}

export async function deletePost(id: string) {
  await requireAdmin();
  await prisma.post.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/admin/blog");
}
