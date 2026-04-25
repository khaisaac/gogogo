import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdminClient } from "@/app/admin/_lib";
import { updateCategory } from "../../actions";
import styles from "../../../../admin.module.css";

export default async function AdminEditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await requireAdminClient();

  const { data: category, error } = await supabase
    .from("categories")
    .select("id, name, slug")
    .eq("id", id)
    .single();

  if (error || !category) {
    notFound();
  }

  const updateAction = updateCategory.bind(null, id);

  return (
    <section className={styles.card}>
      <div className={styles.row}>
        <h2 className={styles.heading}>Edit Category</h2>
        <Link href="/admin/blog/categories" className={styles.outlineLink}>
          Back to Categories
        </Link>
      </div>

      <form action={updateAction}>
        <div className={styles.formGrid}>
          <div className={styles.field}>
            <label htmlFor="name">Name</label>
            <input id="name" name="name" defaultValue={category.name} required />
          </div>
          <div className={styles.field}>
            <label htmlFor="slug">Slug</label>
            <input id="slug" name="slug" defaultValue={category.slug} required />
          </div>
        </div>

        <div className={styles.formActions}>
          <button type="submit" className={styles.submitBtn}>
            Update Category
          </button>
        </div>
      </form>
    </section>
  );
}
