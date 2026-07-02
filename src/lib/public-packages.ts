import { prisma } from "@/lib/db";
import { getStartingPrice, type PackagePricingFields } from "@/lib/pricing";

export type PublicPackage = {
  id: string;
  slug: string;
  title: string;
  route: string;
  duration: string;
  difficulty: number | null;
  image: string | null;
  description: string | null;
  is_active: boolean;
  displayPrice: number;
  originalDisplayPrice?: number;
  is_direct_promo?: boolean;
  promo_code?: string | null;
  discount_percentage?: number | null;
  discount_amount?: number | null;
  promo_usage_limit?: number | null;
  promo_usage_count?: number;
  options?: any;
  faqs?: any;
} & PackagePricingFields;

export function slugifyPackageTitle(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function getDisplayPrice(pkg: any) {
  return getStartingPrice(pkg);
}

function mapPackage(pkg: any): PublicPackage {
  // If slug is not in DB, generate one dynamically
  let slug = pkg.slug || slugifyPackageTitle(pkg.title);
  
  // Prevent collision with Next.js static routes
  if (["torean", "sembalun", "senaru"].includes(slug)) {
    slug = `${slug}-trekking-package`;
  }

  let originalDisplayPrice = getDisplayPrice(pkg);
  let displayPrice = originalDisplayPrice;

  const effectiveDirectPromo = Boolean(pkg.is_direct_promo && (!pkg.promo_code || pkg.promo_code.trim() === ""));

  if (effectiveDirectPromo) {
    if (pkg.discount_percentage) {
      displayPrice = Math.round(originalDisplayPrice * (1 - pkg.discount_percentage / 100));
    } else if (pkg.discount_amount) {
      displayPrice = Math.max(0, originalDisplayPrice - pkg.discount_amount);
    }
  }

  return {
    ...pkg,
    slug,
    displayPrice,
    originalDisplayPrice: effectiveDirectPromo ? originalDisplayPrice : undefined,
    is_direct_promo: effectiveDirectPromo,
  };
}

export async function getPublicPackages() {
  const packages = await prisma.package.findMany({
    where: { is_active: true },
    select: {
      id: true,
      slug: true,
      title: true,
      route: true,
      duration: true,
      difficulty: true,
      image: true,
      is_active: true,
      is_direct_promo: true,
      promo_code: true,
      discount_percentage: true,
      discount_amount: true,
      promo_usage_limit: true,
      promo_usage_count: true,
      options: true,
      faqs: true,
      price_1pax: true,
      price_2_3pax: true,
      price_4_5pax: true,
      price_6plus: true,
      private_price_1pax: true,
      private_price_2pax: true,
      private_price_3pax: true,
      private_price_4pax: true,
      private_price_5pax: true,
      private_price_6pax: true,
      private_price_7pax: true,
      private_price_8pax: true,
      private_price_9pax: true,
      private_price_10pax: true,
      standard_price_1pax: true,
      standard_price_2pax: true,
      standard_price_3pax: true,
      standard_price_4pax: true,
      standard_price_5pax: true,
      standard_price_6pax: true,
      standard_price_7pax: true,
      standard_price_8pax: true,
      standard_price_9pax: true,
      standard_price_10pax: true,
      private_total_2_days: true,
      private_total_3_days: true,
      standard_total_2_days: true,
      standard_total_3_days: true,
    },
    orderBy: { created_at: "asc" },
  });

  const all = packages.map(mapPackage);

  return {
    sembalun: all.filter((p) => p.route === "sembalun"),
    senaru: all.filter((p) => p.route === "senaru"),
    torean: all.filter((p) => p.route === "torean"),
  };
}

export async function getPublicPackageBySlug(slug: string): Promise<PublicPackage | null> {
  const pkg = await prisma.package.findFirst({
    where: { slug, is_active: true },
  });

  if (!pkg) {
    // Fallback: search all and match dynamically generated slug
    const packages = await prisma.package.findMany({ where: { is_active: true } });
    const all = packages.map(mapPackage);
    return all.find((p) => p.slug === slug) || null;
  }

  return mapPackage(pkg);
}
