"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/app/admin/_lib";
import { prisma } from "@/lib/db";

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

  await requireAdmin();
  await prisma.category.create({ data: { name, slug } });

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

  await requireAdmin();
  await prisma.category.update({
    where: { id },
    data: { name, slug },
  });

  revalidatePath("/admin/blog/categories");
  revalidatePath("/admin/blog");
}

export async function deleteCategory(id: string) {
  await requireAdmin();
  await prisma.category.delete({ where: { id } });

  revalidatePath("/admin/blog/categories");
  revalidatePath("/admin/blog");
}
