import { createAdminClient } from "@/lib/supabase/admin";
import Link from "next/link";
import styles from "./BlogSection.module.css";
import ClientSlider from "./ClientSlider";

export default async function BlogSection() {
  const supabase = createAdminClient();
  const { data: articles = [], error } = await supabase
    .from("posts")
    .select(
      "id, title, slug, excerpt, featured_image, published_at, categories(name)",
    )
    .eq("is_published", true)
    .order("published_at", { ascending: false })
    .limit(4);

  return (
    <section className={styles.blogSection}>
      <div className="container">
        <span className={styles.label}>Travel Tips &amp; Guides</span>
        <h2 className="section-title">Our Top Articles</h2>
        <p className="section-subtitle">
          Read our latest guides to prepare for your Rinjani adventure.
        </p>
        {error ? (
          <p>Failed to load articles.</p>
        ) : (
          <ClientSlider items={articles} />
        )}
        <div className={styles.actions}>
          <Link href="/blog" className="btn-outline">
            See All Articles
          </Link>
        </div>
      </div>
    </section>
  );
}
