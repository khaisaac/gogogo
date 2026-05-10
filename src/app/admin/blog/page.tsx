import Link from "next/link";
import { requireAdmin } from "@/app/admin/_lib";
import { prisma } from "@/lib/db";
import { deletePost } from "./actions";
import styles from "../admin.module.css";

export default async function AdminBlogPage() {
  await requireAdmin();
  const posts = await prisma.post.findMany({
    select: {
      id: true,
      title: true,
      slug: true,
      is_published: true,
      published_at: true,
      created_at: true,
    },
    orderBy: { created_at: "desc" },
  });

  return (
    <section className={styles.card}>
      <div className={styles.row}>
        <h2 className={styles.heading}>All Posts</h2>
        <div className={styles.actions}>
          <Link href="/admin/blog/categories" className={styles.outlineLink}>
            Categories
          </Link>
          <Link href="/admin/blog/new" className={styles.primaryLink}>
            Add New
          </Link>
        </div>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Title</th>
              <th>Slug</th>
              <th>Status</th>
              <th>Published At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {posts?.map((post) => {
              const deleteAction = deletePost.bind(null, post.id);
              return (
                <tr key={post.id}>
                  <td>{post.title}</td>
                  <td>{post.slug}</td>
                  <td>
                    <span
                      className={`${styles.badge} ${
                        post.is_published ? styles.active : styles.inactive
                      }`}
                    >
                      {post.is_published ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td>
                    {post.published_at
                      ? new Date(post.published_at).toLocaleString()
                      : "-"}
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <Link
                        href={`/admin/blog/${post.id}/edit`}
                        className={styles.outlineLink}
                      >
                        Edit
                      </Link>
                      <form action={deleteAction}>
                        <button type="submit" className={styles.dangerBtn}>
                          Delete
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
