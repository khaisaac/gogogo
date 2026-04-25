"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminClient, requireAdminContext } from "@/app/admin/_lib";
import { uploadAdminImage } from "@/lib/supabase/storage";

type BlogPayload = {
  title: string;
  slug: string;
  category_id: string | null;
  excerpt: string | null;
  content: string | null;
  featured_image: string | null;
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
    is_published: isPublished,
    published_at: isPublished ? new Date().toISOString() : null,
  };
}

async function resolveCategoryId(
  supabase: Awaited<ReturnType<typeof requireAdminClient>>,
  formData: FormData,
  fallbackCategoryId: string | null = null,
) {
  const newCategoryName = String(formData.get("new_category") || "").trim();

  if (!newCategoryName) {
    return fallbackCategoryId;
  }

  const categorySlug = slugify(newCategoryName);

  const { data, error } = await supabase
    .from("categories")
    .upsert(
      { name: newCategoryName, slug: categorySlug },
      { onConflict: "slug" },
    )
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data.id as string;
}

async function resolveTagIds(
  supabase: Awaited<ReturnType<typeof requireAdminClient>>,
  formData: FormData,
) {
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

  const tagRows = names.map((name) => ({
    name,
    slug: slugify(name),
  }));

  const { data, error } = await supabase
    .from("tags")
    .upsert(tagRows, { onConflict: "slug" })
    .select("id");

  if (error) {
    throw new Error(error.message);
  }

  const newTagIds = (data || []).map((row) => String(row.id));
  return Array.from(new Set([...selectedTagIds, ...newTagIds]));
}

export async function createPost(formData: FormData) {
  const basePayload = getPayload(formData);
  const { adminSupabase: supabase, user } = await requireAdminContext();
  const categoryId = await resolveCategoryId(
    supabase,
    formData,
    basePayload.category_id,
  );
  const payload: BlogPayload = {
    ...basePayload,
    category_id: categoryId,
  };
  const imageFile = formData.get("featured_image_file");
  if (imageFile instanceof File && imageFile.size > 0) {
    payload.featured_image = await uploadAdminImage(supabase, imageFile, "blog");
  }

  if (!payload.title || !payload.slug) {
    throw new Error("Title and slug are required");
  }

  const { data: post, error } = await supabase
    .from("posts")
    .insert({
      ...payload,
      author_id: user.id,
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  const tagIds = await resolveTagIds(supabase, formData);
  if (tagIds.length > 0) {
    const relations = tagIds.map((tagId) => ({
      post_id: post.id,
      tag_id: tagId,
    }));
    const { error: tagRelError } = await supabase
      .from("post_tags")
      .insert(relations);
    if (tagRelError) {
      throw new Error(tagRelError.message);
    }
  }

  revalidatePath("/admin/blog");
  redirect("/admin/blog");
}

export async function updatePost(id: string, formData: FormData) {
  const basePayload = getPayload(formData);
  const supabase = await requireAdminClient();
  const categoryId = await resolveCategoryId(
    supabase,
    formData,
    basePayload.category_id,
  );
  const payload: BlogPayload = {
    ...basePayload,
    category_id: categoryId,
  };
  const imageFile = formData.get("featured_image_file");
  if (imageFile instanceof File && imageFile.size > 0) {
    payload.featured_image = await uploadAdminImage(supabase, imageFile, "blog");
  }

  if (!payload.title || !payload.slug) {
    throw new Error("Title and slug are required");
  }

  const { error } = await supabase.from("posts").update(payload).eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  const { error: clearTagError } = await supabase
    .from("post_tags")
    .delete()
    .eq("post_id", id);
  if (clearTagError) {
    throw new Error(clearTagError.message);
  }

  const tagIds = await resolveTagIds(supabase, formData);
  if (tagIds.length > 0) {
    const relations = tagIds.map((tagId) => ({
      post_id: id,
      tag_id: tagId,
    }));
    const { error: tagRelError } = await supabase
      .from("post_tags")
      .insert(relations);
    if (tagRelError) {
      throw new Error(tagRelError.message);
    }
  }

  revalidatePath("/admin/blog");
  redirect("/admin/blog");
}

export async function deletePost(id: string) {
  const supabase = await requireAdminClient();
  const { error } = await supabase.from("posts").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/blog");
}
