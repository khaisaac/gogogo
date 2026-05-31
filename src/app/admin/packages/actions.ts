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
} & Record<PriceFieldName, number | null>;

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
): Record<PriceFieldName | TotalPriceFieldName | LegacyPriceFieldName, number | null> {
  const pricing = {} as Record<
    PriceFieldName | TotalPriceFieldName | LegacyPriceFieldName,
    number | null
  >;

  const privateGroupTierPrices: Partial<Record<GroupTierKey, number | null>> = {};

  for (const typeDef of PRICE_TYPES) {
    for (const tier of GROUP_TIER_OPTIONS) {
      const field = groupPriceFieldName(typeDef.value, tier.key as GroupTierKey);
      const groupPrice = parseOptionalNumber(formData.get(field));

      if (typeDef.value === "private") {
        privateGroupTierPrices[tier.key] = groupPrice;
      }

      for (const pax of tier.paxValues) {
        pricing[priceFieldName(typeDef.value, pax)] = groupPrice;
      }
    }

    for (const days of TOTAL_DAY_OPTIONS) {
      const field = totalPriceFieldName(typeDef.value, days);
      pricing[field] = parseOptionalNumber(formData.get(field));
    }
  }

  pricing.price_1pax = privateGroupTierPrices["1"] ?? null;
  pricing.price_2_3pax = privateGroupTierPrices["2_3"] ?? null;
  pricing.price_4_5pax = privateGroupTierPrices["4_5"] ?? null;
  pricing.price_6plus =
    privateGroupTierPrices["6_8"] ?? privateGroupTierPrices["9_10"] ?? null;

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
  const pricing = parsePricingFields(formData);

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
  revalidatePath("/admin/packages");
}
