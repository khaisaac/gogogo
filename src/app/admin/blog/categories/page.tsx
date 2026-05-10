import Link from "next/link";
import { requireAdmin } from "@/app/admin/_lib";
import { prisma } from "@/lib/db";
import { createCategory, deleteCategory } from "./actions";
import styles from "../../admin.module.css";

export default async function AdminCategoriesPage() {
  await requireAdmin();
  const categories = await prisma.category.findMany({
    select: { id: true, name: true, slug: true, created_at: true },
    orderBy: { created_at: "desc" },
  });

  return (
    <section className={styles.card}>
      <div className={styles.row}>
        <h2 className={styles.heading}>Categories</h2>
        <Link href="/admin/blog" className={styles.outlineLink}>Back to Posts</Link>
      </div>
      <p className={styles.helper}>Kelola category blog seperti WordPress: tambah, edit, dan hapus.</p>
      <form action={createCategory}>
        <div className={styles.formGrid}>
          <div className={styles.field}><label htmlFor="name">Name</label><input id="name" name="name" required /></div>
          <div className={styles.field}><label htmlFor="slug">Slug (optional)</label><input id="slug" name="slug" placeholder="auto-generated" /></div>
        </div>
        <div className={styles.formActions}><button type="submit" className={styles.submitBtn}>Add New Category</button></div>
      </form>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead><tr><th>Name</th><th>Slug</th><th>Created</th><th>Actions</th></tr></thead>
          <tbody>
            {(categories || []).map((category) => {
              const deleteAction = deleteCategory.bind(null, category.id);
              return (
                <tr key={category.id}>
                  <td>{category.name}</td><td>{category.slug}</td>
                  <td>{new Date(category.created_at).toLocaleDateString()}</td>
                  <td>
                    <div className={styles.actions}>
                      <Link href={`/admin/blog/categories/${category.id}/edit`} className={styles.outlineLink}>Edit</Link>
                      <form action={deleteAction}><button type="submit" className={styles.dangerBtn}>Delete</button></form>
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
