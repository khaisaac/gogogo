import type { Metadata } from "next";
import { prisma } from "@/lib/db";

const SITE_URL = "https://trekkingmountrinjani.com";
const DEFAULT_TITLE = "Trekking Mount Rinjani — #1 Local Lombok Trekking Agency";
const DEFAULT_DESC = "Trekking Mount Rinjani is a local & licensed Rinjani trekking agency in Lombok, Indonesia. Book Mount Rinjani trekking packages via Sembalun, Senaru & Torean routes.";
const DEFAULT_IMAGE = `${SITE_URL}/hero-banner.png`;

export interface SeoData {
  seo_title?: string | null;
  meta_description?: string | null;
  meta_keywords?: string | null;
  canonical_url?: string | null;
  robots?: string | null;
  og_title?: string | null;
  og_description?: string | null;
  og_image?: string | null;
  twitter_title?: string | null;
  twitter_description?: string | null;
  twitter_image?: string | null;
}

export async function getPageSEO(
  pageSlug: string,
  defaults?: {
    title?: string;
    description?: string;
    image?: string;
    canonical?: string;
  }
): Promise<Metadata> {
  let seo: SeoData | null = null;
  try {
    seo = await prisma.seoPage.findUnique({
      where: { page_slug: pageSlug },
    });
  } catch (error) {
    console.warn(`[SEO Helper] Could not fetch seoPage for slug: ${pageSlug}`, error);
  }

  const title = seo?.seo_title || defaults?.title || `${formatPageName(pageSlug)} | Trekking Mount Rinjani`;
  const description = seo?.meta_description || defaults?.description || DEFAULT_DESC;
  const canonical = seo?.canonical_url || defaults?.canonical || `${SITE_URL}/${pageSlug === "home" ? "" : pageSlug}`;
  const image = seo?.og_image || seo?.twitter_image || defaults?.image || DEFAULT_IMAGE;
  const keywords = seo?.meta_keywords
    ? seo.meta_keywords.split(",").map((k) => k.trim())
    : ["trekking mount rinjani", "mount rinjani trekking", "rinjani trekking package", "lombok adventure"];

  const robotsStr = seo?.robots || "index, follow";
  const index = robotsStr.toLowerCase().includes("index") && !robotsStr.toLowerCase().includes("noindex");
  const follow = robotsStr.toLowerCase().includes("follow") && !robotsStr.toLowerCase().includes("nofollow");

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical,
    },
    robots: {
      index,
      follow,
      googleBot: {
        index,
        follow,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    openGraph: {
      title: seo?.og_title || title,
      description: seo?.og_description || description,
      url: canonical,
      siteName: "Trekking Mount Rinjani",
      type: "website",
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: seo?.twitter_title || seo?.og_title || title,
      description: seo?.twitter_description || seo?.og_description || description,
      images: [seo?.twitter_image || image],
    },
  };
}

export async function getArticleSEO(
  post: {
    title: string;
    slug: string;
    excerpt?: string | null;
    content?: string | null;
    featured_image?: string | null;
    seo_title?: string | null;
    meta_description?: string | null;
    meta_keywords?: string | null;
    canonical_url?: string | null;
    robots?: string | null;
    og_title?: string | null;
    og_description?: string | null;
    og_image?: string | null;
    twitter_title?: string | null;
    twitter_description?: string | null;
    twitter_image?: string | null;
    published_at?: Date | null;
    created_at?: Date;
  }
): Promise<Metadata> {
  const fallbackTitle = `${post.title} | Trekking Mount Rinjani`;
  let fallbackDesc = post.excerpt || "";
  if (!fallbackDesc && post.content) {
    fallbackDesc = post.content.replace(/<[^>]*>?/gm, "").substring(0, 160).trim() + "...";
  }

  const title = post.seo_title || fallbackTitle;
  const description = post.meta_description || fallbackDesc || DEFAULT_DESC;
  const canonical = post.canonical_url || `${SITE_URL}/blog/${post.slug}`;
  const image = post.og_image || post.featured_image || DEFAULT_IMAGE;
  const keywords = post.meta_keywords
    ? post.meta_keywords.split(",").map((k) => k.trim())
    : [post.title.toLowerCase(), "mount rinjani blog", "lombok trekking guide"];

  const robotsStr = post.robots || "index, follow";
  const index = robotsStr.toLowerCase().includes("index") && !robotsStr.toLowerCase().includes("noindex");
  const follow = robotsStr.toLowerCase().includes("follow") && !robotsStr.toLowerCase().includes("nofollow");

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical,
    },
    robots: {
      index,
      follow,
      googleBot: {
        index,
        follow,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    openGraph: {
      title: post.og_title || title,
      description: post.og_description || description,
      url: canonical,
      siteName: "Trekking Mount Rinjani",
      type: "article",
      publishedTime: post.published_at?.toISOString() || post.created_at?.toISOString(),
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.twitter_title || post.og_title || title,
      description: post.twitter_description || post.og_description || description,
      images: [post.twitter_image || image],
    },
  };
}

function formatPageName(slug: string): string {
  if (slug === "home") return "Home";
  if (slug === "faq") return "FAQ";
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function generateStructuredJsonLd(data: Record<string, any>): string {
  return JSON.stringify(data);
}
