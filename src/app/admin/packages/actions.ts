"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { requireAdmin } from "@/app/admin/_lib";
import { prisma } from "@/lib/db";
import { difficultyValueToScore } from "@/lib/difficulty";
import {
  GROUP_TIER_OPTIONS,
  PRICE_TYPES,
  TOTAL_DAY_OPTIONS,
  groupPriceFieldName,
  priceFieldName,
  totalPriceFieldName,
  type LegacyPriceFieldName,
  type PriceFieldName,
  type GroupTierKey,
  type TotalPriceFieldName,
} from "@/lib/pricing";
import {
  parseItineraryInput,
  serializePackageContent,
} from "@/lib/package-content";
import { uploadImage, uploadImages } from "@/lib/storage";

const MAX_GALLERY_IMAGES = 10;

type PackagePayload = {
  title: string;
  route: "sembalun" | "senaru" | "torean";
  duration: string;
  difficulty: number;
  image: string | null;
  description: string | null;
  itinerary: ReturnType<typeof parseItineraryInput>;
  is_active: boolean;
  is_direct_promo: boolean;
  promo_code: string | null;
  discount_percentage: number | null;
  discount_amount: number | null;
  promo_usage_limit: number | null;
  options: any;
  faqs: any;
  [key: string]: any;
};

function parseOptionalNumber(value: FormDataEntryValue | null) {
  if (!value) return null;
  const text = String(value).trim();
  if (!text) return null;
  const parsed = Number(text);
  return Number.isFinite(parsed) ? parsed : null;
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Failed to save package";
}

function compactErrorMessage(raw: string) {
  const cleaned = raw.replace(/\s+/g, " ").trim();
  if (!cleaned) {
    return "Failed to save package";
  }

  return cleaned.length > 180 ? `${cleaned.slice(0, 177)}...` : cleaned;
}

function parsePricingFields(
  formData: FormData,
  options?: any[] | null,
): Record<string, number | null> {
  const pricing: Record<string, number | null> = {};

  for (const typeDef of ["private", "standard"] as const) {
    for (const pax of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const) {
      pricing[`${typeDef}_price_${pax}pax`] = null;
    }
    for (const days of [2, 3] as const) {
      pricing[`${typeDef}_total_${days}_days`] = null;
    }
  }
  pricing.price_1pax = null;
  pricing.price_2_3pax = null;
  pricing.price_4_5pax = null;
  pricing.price_6plus = null;

  if (Array.isArray(options) && options.length > 0) {
    const parseNum = (v: any) =>
      v === null || v === undefined || v === "" || isNaN(Number(v)) || Number(v) <= 0
        ? null
        : Number(v);

    const privateOpt =
      options.find(
        (o: any) =>
          o.id === "private" || o.title?.toLowerCase().includes("private"),
      ) || options[0];
    if (privateOpt?.pricing) {
      const p = privateOpt.pricing;
      const p1 = parseNum(p.price_1pax);
      const p23 = parseNum(p.price_2_3pax);
      const p45 = parseNum(p.price_4_5pax);
      const p68 = parseNum(p.price_6_8pax);
      const p910 = parseNum(p.price_9_10pax) ?? p68;

      pricing.private_price_1pax = p1;
      pricing.private_price_2pax = p23;
      pricing.private_price_3pax = p23;
      pricing.private_price_4pax = p45;
      pricing.private_price_5pax = p45;
      pricing.private_price_6pax = p68;
      pricing.private_price_7pax = p68;
      pricing.private_price_8pax = p68;
      pricing.private_price_9pax = p910;
      pricing.private_price_10pax = p910;
      pricing.private_total_2_days = parseNum(p.total_2_days);
      pricing.private_total_3_days = parseNum(p.total_3_days);

      pricing.price_1pax = p1;
      pricing.price_2_3pax = p23;
      pricing.price_4_5pax = p45;
      pricing.price_6plus = p68 ?? p910;
    }

    const standardOpt =
      options.find(
        (o: any) =>
          o.id === "standard" || o.title?.toLowerCase().includes("standard"),
      ) || (options.length > 1 ? options[1] : null);
    if (standardOpt?.pricing) {
      const p = standardOpt.pricing;
      const p1 = parseNum(p.price_1pax);
      const p23 = parseNum(p.price_2_3pax);
      const p45 = parseNum(p.price_4_5pax);
      const p68 = parseNum(p.price_6_8pax);
      const p910 = parseNum(p.price_9_10pax) ?? p68;

      pricing.standard_price_1pax = p1;
      pricing.standard_price_2pax = p23;
      pricing.standard_price_3pax = p23;
      pricing.standard_price_4pax = p45;
      pricing.standard_price_5pax = p45;
      pricing.standard_price_6pax = p68;
      pricing.standard_price_7pax = p68;
      pricing.standard_price_8pax = p68;
      pricing.standard_price_9pax = p910;
      pricing.standard_price_10pax = p910;
      pricing.standard_total_2_days = parseNum(p.total_2_days);
      pricing.standard_total_3_days = parseNum(p.total_3_days);
    }
  } else {
    for (const typeDef of PRICE_TYPES) {
      for (const tier of GROUP_TIER_OPTIONS) {
        const field = groupPriceFieldName(typeDef.value, tier.key as GroupTierKey);
        const groupPrice = parseOptionalNumber(formData.get(field));
        for (const pax of tier.paxValues) {
          pricing[priceFieldName(typeDef.value, pax)] = groupPrice;
        }
      }
      for (const days of TOTAL_DAY_OPTIONS) {
        const field = totalPriceFieldName(typeDef.value, days);
        pricing[field] = parseOptionalNumber(formData.get(field));
      }
    }
  }

  return pricing;
}

function getPayload(formData: FormData): PackagePayload {
  const title = String(formData.get("title") || "").trim();
  const routeValue = String(formData.get("route") || "sembalun");
  const duration = String(formData.get("duration") || "").trim();
  const imageValue = String(formData.get("current_image") || "").trim();
  const detailValue = String(formData.get("detail") || "").trim();
  const highlightsValue = String(formData.get("highlights") || "").trim();
  const includeValue = String(formData.get("include") || "").trim();
  const excludeValue = String(formData.get("exclude") || "").trim();
  const whatToBringValue = String(formData.get("what_to_bring") || "").trim();
  const notesValue = String(formData.get("notes") || "").trim();
  const itineraryEntry = formData.get("itinerary");
  const itineraryValue = parseItineraryInput(
    typeof itineraryEntry === "string" ? itineraryEntry : null,
  );
  const currentGallery = String(formData.get("current_gallery") || "")
    .split("\n")
    .map((value) => value.trim())
    .filter(Boolean);
  const difficultyRaw = String(formData.get("difficulty") || "moderate");

  let options = null;
  try {
    const rawOptions = formData.get("package_options");
    if (typeof rawOptions === "string" && rawOptions.trim()) {
      options = JSON.parse(rawOptions);
    }
  } catch (err) {
    console.error("Failed to parse package_options:", err);
  }

  const pricing = parsePricingFields(formData, options);

  let route: "sembalun" | "senaru" | "torean" = "sembalun";
  if (routeValue === "senaru") {
    route = "senaru";
  } else if (routeValue === "torean") {
    route = "torean";
  }

  const is_direct_promo = formData.get("is_direct_promo") === "on";
  const promo_code = String(formData.get("promo_code") || "").trim() || null;
  const discount_percentage = parseOptionalNumber(formData.get("discount_percentage"));
  const discount_amount = parseOptionalNumber(formData.get("discount_amount"));
  const promo_usage_limit = parseOptionalNumber(formData.get("promo_usage_limit"));

  let faqs = null;
  try {
    const rawFaqs = formData.get("package_faqs");
    if (typeof rawFaqs === "string" && rawFaqs.trim()) {
      faqs = JSON.parse(rawFaqs);
    }
  } catch (err) {
    console.error("Failed to parse package_faqs:", err);
  }

  return {
    title,
    route,
    duration,
    ...pricing,
    difficulty: difficultyValueToScore(difficultyRaw),
    image: imageValue || null,
    description: serializePackageContent({
      detail: detailValue,
      highlights: highlightsValue,
      itinerary: itineraryValue,
      gallery: currentGallery,
      include: includeValue,
      exclude: excludeValue,
      whatToBring: whatToBringValue,
      notes: notesValue,
    }),
    itinerary: itineraryValue,
    is_active: formData.get("is_active") === "on",
    is_direct_promo,
    promo_code,
    discount_percentage,
    discount_amount,
    promo_usage_limit,
    options,
    faqs,
  };
}

export async function createPackage(formData: FormData) {
  try {
    const payload = getPayload(formData);

    if (!payload.title || !payload.duration) {
      throw new Error("Title and duration are required");
    }

    await requireAdmin();
    const imageFile = formData.get("image_file");
    const galleryFiles = formData
      .getAll("gallery_files")
      .filter((entry): entry is File => entry instanceof File);

    if (imageFile instanceof File && imageFile.size > 0) {
      payload.image = await uploadImage(imageFile, "packages");
    }

    if (galleryFiles.length > 0) {
      const existingGallery = String(formData.get("current_gallery") || "")
        .split("\n")
        .map((value) => value.trim())
        .filter(Boolean)
        .slice(0, MAX_GALLERY_IMAGES);
      const remainingSlots = Math.max(
        0,
        MAX_GALLERY_IMAGES - existingGallery.length,
      );
      const galleryUrls = await uploadImages(
        galleryFiles.slice(0, remainingSlots),
        "packages",
      );
      payload.description = serializePackageContent({
        detail: String(formData.get("detail") || "").trim(),
        highlights: String(formData.get("highlights") || "").trim(),
        itinerary: payload.itinerary,
        gallery: [...existingGallery, ...galleryUrls].slice(
          0,
          MAX_GALLERY_IMAGES,
        ),
        include: String(formData.get("include") || "").trim(),
        exclude: String(formData.get("exclude") || "").trim(),
        whatToBring: String(formData.get("what_to_bring") || "").trim(),
        notes: String(formData.get("notes") || "").trim(),
      });
    }

    const { itinerary: _itinerary, ...databasePayload } = payload;
    await prisma.package.create({ data: databasePayload as any });

    revalidatePath("/");
    revalidatePath("/admin/packages");
    redirect("/admin/packages");
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    const message = compactErrorMessage(getErrorMessage(error));
    console.error("❌ createPackage failed:", error);
    redirect(`/admin/packages/new?error=${encodeURIComponent(message)}`);
  }
}

export async function updatePackage(id: string, formData: FormData) {
  try {
    const payload = getPayload(formData);

    if (!payload.title || !payload.duration) {
      throw new Error("Title and duration are required");
    }

    await requireAdmin();
    const imageFile = formData.get("image_file");
    const galleryFiles = formData
      .getAll("gallery_files")
      .filter((entry): entry is File => entry instanceof File);

    if (imageFile instanceof File && imageFile.size > 0) {
      payload.image = await uploadImage(imageFile, "packages");
    }

    const uploadedGallery = await uploadImages(galleryFiles, "packages");
    if (uploadedGallery.length > 0) {
      const existingGallery = String(formData.get("current_gallery") || "")
        .split("\n")
        .map((value) => value.trim())
        .filter(Boolean)
        .slice(0, MAX_GALLERY_IMAGES);

      payload.description = serializePackageContent({
        detail: String(formData.get("detail") || "").trim(),
        highlights: String(formData.get("highlights") || "").trim(),
        itinerary: payload.itinerary,
        gallery: [...existingGallery, ...uploadedGallery].slice(
          0,
          MAX_GALLERY_IMAGES,
        ),
        include: String(formData.get("include") || "").trim(),
        exclude: String(formData.get("exclude") || "").trim(),
        whatToBring: String(formData.get("what_to_bring") || "").trim(),
        notes: String(formData.get("notes") || "").trim(),
      });
    }

    const { itinerary: _itinerary, ...databasePayload } = payload;
    await prisma.package.update({
      where: { id },
      data: databasePayload as any,
    });

    revalidatePath("/");
    revalidatePath("/admin/packages");
    redirect("/admin/packages");
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    const message = compactErrorMessage(getErrorMessage(error));
    console.error("❌ updatePackage failed:", error);
    redirect(`/admin/packages/${id}/edit?error=${encodeURIComponent(message)}`);
  }
}

export async function deletePackage(id: string) {
  await requireAdmin();
  await prisma.package.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/admin/packages");
}
