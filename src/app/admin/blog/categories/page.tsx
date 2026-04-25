import Link from "next/link";
import { requireAdminClient } from "@/app/admin/_lib";
import { createCategory, deleteCategory } from "./actions";
import styles from "../../admin.module.css";

export default async function AdminCategoriesPage() {
  const supabase = await requireAdminClient();
  const { data: categories, error } = await supabase
    .from("categories")
    .select("id, name, slug, created_at")
    .order("created_at", { ascending: false });

  return (
    <section className={styles.card}>
      <div className={styles.row}>
        <h2 className={styles.heading}>Categories</h2>
        <Link href="/admin/blog" className={styles.outlineLink}>
          Back to Posts
        </Link>
      </div>

      <p className={styles.helper}>
        Kelola category blog seperti WordPress: tambah, edit, dan hapus.
      </p>

      <form action={createCategory}>
        <div className={styles.formGrid}>
          <div className={styles.field}>
            <label htmlFor="name">Name</label>
            <input id="name" name="name" required />
          </div>
          <div className={styles.field}>
            <label htmlFor="slug">Slug (optional)</label>
            <input id="slug" name="slug" placeholder="auto-generated" />
          </div>
        </div>
        <div className={styles.formActions}>
          <button type="submit" className={styles.submitBtn}>
            Add New Category
          </button>
        </div>
      </form>

      {error ? (
        <p className={styles.helper}>Gagal membaca category: {error.message}</p>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Slug</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {(categories || []).map((category) => {
                const deleteAction = deleteCategory.bind(null, category.id);

                return (
                  <tr key={category.id}>
                    <td>{category.name}</td>
                    <td>{category.slug}</td>
                    <td>
                      {new Date(category.created_at).toLocaleDateString()}
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <Link
                          href={`/admin/blog/categories/${category.id}/edit`}
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
      )}
    </section>
  );
}
