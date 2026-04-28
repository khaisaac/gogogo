import { createAdminClient } from "@/lib/supabase/admin";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import styles from "./blog.module.css";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Blog & Guides — Trekking Mount Rinjani",
  description: "Read our latest guides, tips, and stories to prepare for your Rinjani adventure.",
};

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const params = await searchParams;
  const currentPage = Math.max(1, parseInt(params.page || "1", 10));
  const limit = 8;
  const from = (currentPage - 1) * limit;
  const to = from + limit - 1;
  const supabase = createAdminClient();

  const { data: posts, error, count } = await supabase
    .from("posts")
    .select("id, title, slug, excerpt, featured_image, published_at, categories(name)", { count: "exact" })
    .eq("is_published", true)
    .order("published_at", { ascending: false })
    .range(from, to);

  const totalPages = Math.ceil((count || 0) / limit);

  return (
    <>
      <Navbar />
      <main className={styles.page}>
        <section className={styles.header}>
          <div className={styles.container}>
            <span className={styles.label}>Travel Tips & Guides</span>
            <h1 className={styles.title}>Our Blog</h1>
            <p className={styles.subtitle}>
              Everything you need to know before your climb.
            </p>
          </div>
        </section>

        <section className={styles.content}>
          <div className={styles.container}>
            {error ? (
              <p className={styles.error}>Failed to load articles. Please try again later.</p>
            ) : posts && posts.length > 0 ? (
              <>
                <div className={styles.grid}>
                {posts.map((post) => {
                  const categoryName = post.categories?.[0]?.name || "Uncategorized";
                  return (
                    <Link key={post.id} href={`/blog/${post.slug}`} className={styles.card}>
                      <div className={styles.imageWrapper}>
                        <img 
                          src={post.featured_image || "/hero-banner.png"} 
                          alt={post.title} 
                          className={styles.image} 
                        />
                        <span className={styles.categoryBadge}>{categoryName}</span>
                      </div>
                      <div className={styles.cardContent}>
                        <span className={styles.date}>
                          {new Date(post.published_at || new Date()).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </span>
                        <h3 className={styles.cardTitle}>{post.title}</h3>
                        <p className={styles.excerpt}>{post.excerpt || ""}</p>
                        <span className={styles.readMore}>Read More →</span>
                      </div>
                    </Link>
                  );
                })}
                </div>
                
                {totalPages > 1 && (
                  <div className={styles.pagination}>
                    <Link 
                      href={`/blog?page=${currentPage - 1}`}
                      className={`${styles.pageBtn} ${currentPage === 1 ? styles.disabled : ""}`}
                    >
                      &laquo;
                    </Link>
                    
                    {Array.from({ length: totalPages }).map((_, i) => {
                      const pageNum = i + 1;
                      return (
                        <Link 
                          key={pageNum}
                          href={`/blog?page=${pageNum}`}
                          className={`${styles.pageBtn} ${currentPage === pageNum ? styles.active : ""}`}
                        >
                          {pageNum}
                        </Link>
                      );
                    })}

                    <Link 
                      href={`/blog?page=${currentPage + 1}`}
                      className={`${styles.pageBtn} ${currentPage === totalPages ? styles.disabled : ""}`}
                    >
                      &raquo;
                    </Link>
                  </div>
                )}
              </>
            ) : (
              <p className={styles.empty}>No articles found. Check back soon!</p>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
