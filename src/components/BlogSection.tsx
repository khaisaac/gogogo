import { prisma } from "@/lib/db";
import Link from "next/link";
import styles from "./BlogSection.module.css";
import ClientSlider from "./ClientSlider";

export default async function BlogSection() {
  const articles = await prisma.post.findMany({
    where: { is_published: true },
    select: { id: true, title: true, slug: true, excerpt: true, featured_image: true, published_at: true, category: { select: { name: true } } },
    orderBy: { published_at: "desc" },
    take: 4,
  });

  const formattedArticles = articles.map((a) => ({
    ...a,
    categories: a.category ? [{ name: a.category.name }] : null,
    published_at: a.published_at?.toISOString() || new Date().toISOString(),
  }));

  return (
    <section className={styles.blogSection}>
      <div className="container">
        <span className={styles.label}>Travel Tips &amp; Guides</span>
        <h2 className="section-title">Our Top Articles</h2>
        <p className="section-subtitle">Read our latest guides to prepare for your Rinjani adventure.</p>
        <ClientSlider items={formattedArticles} />
        <div className={styles.actions}>
          <Link href="/blog" className="btn-outline">See All Articles</Link>
        </div>
      </div>
    </section>
  );
}
