import { MetadataRoute } from "next";
import { prisma } from "@/lib/db";

const SITE_URL = "https://trekkingmountrinjani.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await prisma.post.findMany({
    where: { is_published: true },
    select: { slug: true, updated_at: true, published_at: true },
    orderBy: { published_at: "desc" },
  });

  const packages = await prisma.package.findMany({
    where: { is_active: true },
    select: { slug: true, updated_at: true },
  });

  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/packages/sembalun`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/packages/senaru`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/blog`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE_URL}/why-choose-us`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
  ];

  const blogPages: MetadataRoute.Sitemap = (posts ?? []).map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.updated_at || post.published_at || new Date()),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const packagePages: MetadataRoute.Sitemap = (packages ?? []).map((pkg) => ({
    url: `${SITE_URL}/packages/${pkg.slug}`,
    lastModified: new Date(pkg.updated_at || new Date()),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...staticPages, ...blogPages, ...packagePages];
}
