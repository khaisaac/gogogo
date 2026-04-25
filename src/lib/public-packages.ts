import { createAdminClient } from "@/lib/supabase/admin";
import { getStartingPrice, type PackagePricingFields } from "@/lib/pricing";

export type PublicPackage = {
  id: string;
  slug: string;
  title: string;
  route: "sembalun" | "senaru";
  duration: string;
  price_1pax?: number | null;
  price_2_3pax?: number | null;
  price_4_5pax?: number | null;
  price_6plus?: number | null;
  difficulty: number;
  image: string | null;
  description: string | null;
  is_active: boolean;
  displayPrice: number;
} & PackagePricingFields;

export function slugifyPackageTitle(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function getDisplayPrice(pkg: PackagePricingFields) {
  return getStartingPrice(pkg);
}

type DBPackage = Omit<PublicPackage, "slug" | "displayPrice">;

function mapPackage(pkg: DBPackage): PublicPackage {
  return {
    ...pkg,
    slug: slugifyPackageTitle(pkg.title),
    displayPrice: getDisplayPrice(pkg),
  };
}

/** Fetch all active packages, split by route */
export async function getPublicPackages() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("packages")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: true });

  if (error || !data) {
    console.error("Failed to fetch packages:", error?.message);
    return { sembalun: [] as PublicPackage[], senaru: [] as PublicPackage[] };
  }

  const all = (data as DBPackage[]).map(mapPackage);

  return {
    sembalun: all.filter((p) => p.route === "sembalun"),
    senaru: all.filter((p) => p.route === "senaru"),
  };
}

/** Fetch a single active package by its generated slug */
export async function getPublicPackageBySlug(slug: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("packages")
    .select("*")
    .eq("is_active", true);

  if (error || !data) {
    return null;
  }

  const mapped = (data as DBPackage[]).map(mapPackage);
  return mapped.find((pkg) => pkg.slug === slug) || null;
}
