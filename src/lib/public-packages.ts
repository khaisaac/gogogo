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
  const slug = pkg.slug || slugifyPackageTitle(pkg.title);
  return {
    ...pkg,
    slug,
    displayPrice: getDisplayPrice(pkg),
  };
}

export async function getPublicPackages() {
  const packages = await prisma.package.findMany({
    where: { is_active: true },
    orderBy: { created_at: "asc" },
  });

  const all = packages.map(mapPackage);

  return {
    sembalun: all.filter((p) => p.route === "sembalun"),
    senaru: all.filter((p) => p.route === "senaru"),
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
