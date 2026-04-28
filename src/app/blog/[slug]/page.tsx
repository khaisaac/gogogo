import { createAdminClient } from "@/lib/supabase/admin";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { notFound } from "next/navigation";
import styles from "./blog-post.module.css";

export const dynamic = "force-dynamic";

export default async function BlogPostPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const resolvedParams = await params;
  const { slug } = resolvedParams;
  const supabase = createAdminClient();

  // Get current post
  const { data: post, error } = await supabase
    .from("posts")
    .select("*, categories(name), profiles(full_name), post_tags(tags(name))")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (error || !post) {
    notFound();
  }

  // Pagination for the sidebar new articles
  const resolvedSearchParams = await searchParams;
  const currentPage = Math.max(1, parseInt(resolvedSearchParams.page || "1", 10));
  const limit = 5; // 5 cards per page
  const from = (currentPage - 1) * limit;
  const to = from + limit - 1;

  const { data: recentPosts, count } = await supabase
    .from("posts")
    .select("id, title, slug, featured_image, published_at", { count: "exact" })
    .eq("is_published", true)
    .neq("id", post.id) // Exclude current post
    .order("published_at", { ascending: false })
    .range(from, to);

  const totalPages = Math.ceil((count || 0) / limit);

  // Author
  const authorName = post.profiles?.full_name || "Trekking Mount Rinjani";
  
  // Format dates
  const publishDate = new Date(post.published_at || new Date());
  const dateString = publishDate.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric"
  });
  const timeString = publishDate.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  });

  const categoryName = post.categories?.[0]?.name || "Uncategorized";
  const tagsList = (post.post_tags || [])
    .map((item: any) => item.tags?.name || item.tags?.[0]?.name)
    .filter(Boolean);

  return (
    <>
      <Navbar />
      <main className={styles.page}>
        <div className={styles.container}>
          {/* Main Content (Left) */}
          <article className={styles.mainContent}>
            <h1 className={styles.title}>{post.title}</h1>
            
            <div className={styles.meta}>
              <span className={styles.metaItem}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                {authorName}
              </span>
              <span className={styles.metaItem}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                {dateString}
              </span>
              <span className={styles.metaItem}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                {timeString}
              </span>
              <span className={styles.metaItem}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                {categoryName}
              </span>
              {tagsList.length > 0 && (
                <span className={styles.metaItem}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
                  {tagsList.join(", ")}
                </span>
              )}
            </div>

            {post.featured_image && (
              <div 
                className={styles.coverImageWrapper}
                style={{ 
                  textAlign: post.cover_image_alignment === 'left' ? 'left' : 
                             post.cover_image_alignment === 'right' ? 'right' : 'center' 
                }}
              >
                <img 
                  src={post.featured_image} 
                  alt={post.title} 
                  className={styles.coverImage}
                  style={{
                    marginLeft: post.cover_image_alignment === 'right' ? 'auto' : 
                                post.cover_image_alignment === 'center' ? 'auto' : '0',
                    marginRight: post.cover_image_alignment === 'left' ? 'auto' : 
                                 post.cover_image_alignment === 'center' ? 'auto' : '0',
                  }}
                />
              </div>
            )}

            <div 
              className={`${styles.postBody} wysiwyg-content`}
              dangerouslySetInnerHTML={{ __html: post.content || "" }} 
            />
          </article>

          {/* Sidebar (Right) */}
          <aside className={styles.sidebar}>
            <div className={styles.sidebarHeader}>
              <h2>New Article</h2>
            </div>
            
            <div className={styles.articleList}>
              {recentPosts?.map((rp) => (
                <div key={rp.id} className={styles.articleCard}>
                  <img src={rp.featured_image || "/hero-banner.png"} alt={rp.title} className={styles.articleImage} />
                  <div className={styles.articleInfo}>
                    <Link href={`/blog/${rp.slug}`} className={styles.articleTitle}>
                      {rp.title}
                    </Link>
                    <div className={styles.articleDate}>
                      {new Date(rp.published_at || new Date()).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric"
                      })}
                    </div>
                    <Link href={`/blog/${rp.slug}`} className={styles.readMore}>
                      Read More »
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className={styles.pagination}>
                <Link 
                  href={`/blog/${slug}?page=${currentPage - 1}`}
                  className={`${styles.pageBtn} ${currentPage === 1 ? styles.disabled : ""}`}
                >
                  &laquo; Previous
                </Link>
                
                {Array.from({ length: totalPages }).map((_, i) => {
                  const pageNum = i + 1;
                  return (
                    <Link 
                      key={pageNum}
                      href={`/blog/${slug}?page=${pageNum}`}
                      className={`${styles.pageBtn} ${currentPage === pageNum ? styles.active : ""}`}
                    >
                      {pageNum}
                    </Link>
                  );
                })}

                <Link 
                  href={`/blog/${slug}?page=${currentPage + 1}`}
                  className={`${styles.pageBtn} ${currentPage === totalPages ? styles.disabled : ""}`}
                >
                  Next &raquo;
                </Link>
              </div>
            )}
          </aside>
        </div>
      </main>
      <Footer />
    </>
  );
}
