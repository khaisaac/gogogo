import Link from "next/link";
import { requireAdminClient } from "@/app/admin/_lib";
import ImageUploadField from "@/components/admin/ImageUploadField";
import { createPost } from "../actions";
import styles from "../../admin.module.css";

export default async function AdminNewPostPage() {
  const supabase = await requireAdminClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("id, name")
    .order("name", { ascending: true });

  const { data: tags } = await supabase
    .from("tags")
    .select("id, name")
    .order("name", { ascending: true });

  return (
    <section className={styles.card}>
      <div className={styles.row}>
        <h2 className={styles.heading}>Create Blog Post</h2>
        <Link href="/admin/blog" className={styles.outlineLink}>
          Back to list
        </Link>
      </div>

      <form action={createPost}>
        <div className={styles.formGrid}>
          <div className={styles.field}>
            <label htmlFor="title">Title</label>
            <input id="title" name="title" required />
          </div>

          <div className={styles.field}>
            <label htmlFor="slug">Slug (optional)</label>
            <input
              id="slug"
              name="slug"
              placeholder="auto-generated jika kosong"
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="category_id">Category</label>
            <select id="category_id" name="category_id" defaultValue="">
              <option value="">No category</option>
              {categories?.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <label htmlFor="new_category">New Category (optional)</label>
            <input
              id="new_category"
              name="new_category"
              placeholder="e.g. Travel Tips"
            />
          </div>

          <div className={`${styles.field} ${styles.full}`}>
            <label>Tags</label>
            <div className={styles.chipGrid}>
              {tags?.map((tag) => (
                <label key={tag.id} className={styles.inlineCheck}>
                  <input type="checkbox" name="tag_ids" value={tag.id} />
                  {tag.name}
                </label>
              ))}
            </div>
          </div>

          <div className={`${styles.field} ${styles.full}`}>
            <label htmlFor="new_tags">New Tags (comma separated)</label>
            <input
              id="new_tags"
              name="new_tags"
              placeholder="rinjani, trekking, summit"
            />
          </div>

          <div className={`${styles.field} ${styles.full}`}>
            <label htmlFor="excerpt">Excerpt</label>
            <textarea id="excerpt" name="excerpt" />
          </div>

          <div className={`${styles.field} ${styles.full}`}>
            <label htmlFor="content">Content</label>
            <textarea id="content" name="content" required />
          </div>

          <div className={`${styles.field} ${styles.full}`}>
            <label htmlFor="featured_image_file">Featured Image</label>
            <ImageUploadField
              id="featured_image_file"
              name="featured_image_file"
            />
          </div>
        </div>

        <label className={styles.inlineCheck}>
          <input type="checkbox" name="is_published" />
          Publish now
        </label>

        <div className={styles.formActions}>
          <button type="submit" className={styles.submitBtn}>
            Save Post
          </button>
        </div>
      </form>
    </section>
  );
}
