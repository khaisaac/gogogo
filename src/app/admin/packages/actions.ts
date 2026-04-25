"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminClient } from "@/app/admin/_lib";
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
import { uploadAdminImage, uploadAdminImages } from "@/lib/supabase/storage";

const MAX_GALLERY_IMAGES = 10;

const MISSING_COLUMN_PATTERN = /Could not find the '([^']+)' column/i;

type PackagePayload = {
  title: string;
  route: "sembalun" | "senaru";
  duration: string;
  difficulty: number;
  image: string | null;
  description: string | null;
  itinerary: ReturnType<typeof parseItineraryInput>;
  is_active: boolean;
} & Record<PriceFieldName, number | null>;

function parseOptionalNumber(value: FormDataEntryValue | null) {
  if (!value) return null;
  const text = String(value).trim();
  if (!text) return null;
  const parsed = Number(text);
  return Number.isFinite(parsed) ? parsed : null;
}

function getMissingColumnName(message: string) {
  const match = message.match(MISSING_COLUMN_PATTERN);
  return match ? match[1] : null;
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Failed to save package";
}

async function insertWithSchemaFallback(
  supabase: Awaited<ReturnType<typeof requireAdminClient>>,
  payload: Record<string, unknown>,
) {
  const candidatePayload = { ...payload };

  while (true) {
    const { error, data } = await supabase
      .from("packages")
      .insert(candidatePayload);

    if (!error) {
      return { data };
    }

    const missingColumn = getMissingColumnName(error.message || "");
    if (!missingColumn || !(missingColumn in candidatePayload)) {
      throw new Error(
        `Failed to save package: ${error.message} (${error.code})`,
      );
    }

    delete candidatePayload[missingColumn];
  }
}

async function updateWithSchemaFallback(
  supabase: Awaited<ReturnType<typeof requireAdminClient>>,
  id: string,
  payload: Record<string, unknown>,
) {
  const candidatePayload = { ...payload };

  while (true) {
    const { error } = await supabase
      .from("packages")
      .update(candidatePayload)
      .eq("id", id);

    if (!error) {
      return;
    }

    const missingColumn = getMissingColumnName(error.message || "");
    if (!missingColumn || !(missingColumn in candidatePayload)) {
      throw new Error(error.message);
    }

    delete candidatePayload[missingColumn];
  }
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

  return {
    title,
    route: routeValue === "senaru" ? "senaru" : "sembalun",
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
  };
}

export async function createPackage(formData: FormData) {
  try {
    const payload = getPayload(formData);
    console.log("📦 Payload to save:", JSON.stringify(payload, null, 2));

    if (!payload.title || !payload.duration) {
      throw new Error("Title and duration are required");
    }

    const supabase = await requireAdminClient();
    const imageFile = formData.get("image_file");
    const galleryFiles = formData
      .getAll("gallery_files")
      .filter((entry): entry is File => entry instanceof File);

    if (imageFile instanceof File && imageFile.size > 0) {
      console.log("📸 Uploading main image...");
      payload.image = await uploadAdminImage(supabase, imageFile, "packages");
      console.log("✅ Main image uploaded:", payload.image);
    }

    if (galleryFiles.length > 0) {
      console.log("🖼️ Uploading gallery files...", galleryFiles.length);
      const existingGallery = String(formData.get("current_gallery") || "")
        .split("\n")
        .map((value) => value.trim())
        .filter(Boolean)
        .slice(0, MAX_GALLERY_IMAGES);
      const remainingSlots = Math.max(
        0,
        MAX_GALLERY_IMAGES - existingGallery.length,
      );
      const galleryUrls = await uploadAdminImages(
        supabase,
        galleryFiles.slice(0, remainingSlots),
        "packages",
      );
      console.log("✅ Gallery uploaded:", galleryUrls);
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

    console.log("📦 Final payload:", JSON.stringify(payload, null, 2));
    console.log("💾 Inserting into Supabase...");
    const { itinerary: _itinerary, ...databasePayload } = payload;
    const { data } = await insertWithSchemaFallback(supabase, databasePayload);

    console.log("✅ Package saved successfully:", data);
    revalidatePath("/admin/packages");
    redirect("/admin/packages");
  } catch (error) {
    const message = getErrorMessage(error);
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

    const supabase = await requireAdminClient();
    const imageFile = formData.get("image_file");
    const galleryFiles = formData
      .getAll("gallery_files")
      .filter((entry): entry is File => entry instanceof File);

    if (imageFile instanceof File && imageFile.size > 0) {
      payload.image = await uploadAdminImage(supabase, imageFile, "packages");
    }

    const uploadedGallery = await uploadAdminImages(
      supabase,
      galleryFiles,
      "packages",
    );
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
    await updateWithSchemaFallback(supabase, id, databasePayload);

    revalidatePath("/admin/packages");
    redirect("/admin/packages");
  } catch (error) {
    const message = getErrorMessage(error);
    console.error("❌ updatePackage failed:", error);
    redirect(`/admin/packages/${id}/edit?error=${encodeURIComponent(message)}`);
  }
}

export async function deletePackage(id: string) {
  const supabase = await requireAdminClient();
  const { error } = await supabase.from("packages").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/packages");
}
