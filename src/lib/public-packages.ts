import { prisma } from "@/lib/db";

type PackageRow = {
  id: string;
  title: string;
  slug: string;
  route: string;
  duration: string;
  image: string | null;
  description: string | null;
  is_active: boolean;
  difficulty: number | null;
  [key: string]: any;
};

export async function getActivePackages(route?: string): Promise<PackageRow[]> {
  const where: any = { is_active: true };
  if (route) {
    where.route = route;
  }

  const packages = await prisma.package.findMany({
    where,
    orderBy: { created_at: "desc" },
  });

  return packages as unknown as PackageRow[];
}

export async function getPackageBySlug(slug: string): Promise<PackageRow | null> {
  const pkg = await prisma.package.findFirst({
    where: { slug, is_active: true },
  });

  return pkg as unknown as PackageRow | null;
}
