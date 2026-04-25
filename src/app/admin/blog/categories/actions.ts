"use server";

import { revalidatePath } from "next/cache";
import { requireAdminClient } from "@/app/admin/_lib";

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export async function createCategory(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const slugRaw = String(formData.get("slug") || "").trim();
  const slug = slugify(slugRaw || name);

  if (!name || !slug) {
    throw new Error("Name and slug are required");
  }

  const supabase = await requireAdminClient();
  const { error } = await supabase
    .from("categories")
    .insert({ name, slug });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/blog/categories");
  revalidatePath("/admin/blog");
}

export async function updateCategory(id: string, formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const slugRaw = String(formData.get("slug") || "").trim();
  const slug = slugify(slugRaw || name);

  if (!name || !slug) {
    throw new Error("Name and slug are required");
  }

  const supabase = await requireAdminClient();
  const { error } = await supabase
    .from("categories")
    .update({ name, slug })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/blog/categories");
  revalidatePath("/admin/blog");
}

export async function deleteCategory(id: string) {
  const supabase = await requireAdminClient();
  const { error } = await supabase
    .from("categories")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/blog/categories");
  revalidatePath("/admin/blog");
}
