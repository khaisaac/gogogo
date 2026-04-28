import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdminClient } from "@/app/admin/_lib";
import ImageUploadField from "@/components/admin/ImageUploadField";
import RichTextEditor from "@/components/admin/RichTextEditor";
import { updatePost } from "../../actions";
import styles from "../../../admin.module.css";

export default async function AdminEditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await requireAdminClient();
  const { data: post, error } = await supabase
    .from("posts")
    .select("*")
    .eq("id", id)
    .single();

  const { data: categories } = await supabase
    .from("categories")
    .select("id, name")
    .order("name", { ascending: true });

  const { data: tags } = await supabase
    .from("tags")
    .select("id, name")
    .order("name", { ascending: true });

  const { data: tagRelations } = await supabase
    .from("post_tags")
    .select("tag_id")
    .eq("post_id", id);

  if (error || !post) {
    notFound();
  }

  const updateAction = updatePost.bind(null, id);
  const selectedTagIds = new Set(
    (tagRelations || []).map((row) => String(row.tag_id)),
  );

  return (
    <section className={styles.card}>
      <div className={styles.row}>
        <h2 className={styles.heading}>Edit Blog Post</h2>
        <Link href="/admin/blog" className={styles.outlineLink}>
          Back to list
        </Link>
      </div>

      <form action={updateAction}>
        <div className={styles.formGrid}>
          <div className={styles.field}>
            <label htmlFor="title">Title</label>
            <input
              id="title"
              name="title"
              defaultValue={post.title || ""}
              required
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="slug">Slug</label>
            <input
              id="slug"
              name="slug"
              defaultValue={post.slug || ""}
              required
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="category_id">Category</label>
            <select
              id="category_id"
              name="category_id"
              defaultValue={post.category_id || ""}
            >
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
              placeholder="e.g. Gear"
            />
          </div>

          <div className={`${styles.field} ${styles.full}`}>
            <label>Tags</label>
            <div className={styles.chipGrid}>
              {tags?.map((tag) => (
                <label key={tag.id} className={styles.inlineCheck}>
                  <input
                    type="checkbox"
                    name="tag_ids"
                    value={tag.id}
                    defaultChecked={selectedTagIds.has(String(tag.id))}
                  />
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
              placeholder="adventure, route, guide"
            />
          </div>

          <div className={`${styles.field} ${styles.full}`}>
            <label htmlFor="excerpt">Excerpt</label>
            <textarea
              id="excerpt"
              name="excerpt"
              defaultValue={post.excerpt || ""}
            />
          </div>

          <div className={`${styles.field} ${styles.full}`}>
            <label htmlFor="content">Content</label>
            <RichTextEditor
              id="content"
              name="content"
              defaultValue={post.content || ""}
              required
            />
          </div>

          <div className={`${styles.field} ${styles.full}`}>
            <label htmlFor="featured_image_file">Featured Image</label>
            <ImageUploadField
              id="featured_image_file"
              name="featured_image_file"
              currentImage={post.featured_image || ""}
              currentImageFieldName="current_featured_image"
              folder="blog"
            />
          </div>

          <div className={`${styles.field} ${styles.full}`}>
            <label htmlFor="cover_image_alignment">Cover Image Alignment</label>
            <select
              id="cover_image_alignment"
              name="cover_image_alignment"
              defaultValue={post.cover_image_alignment || "center"}
            >
              <option value="center">Center</option>
              <option value="left">Left Edge</option>
              <option value="right">Right Edge</option>
            </select>
          </div>
        </div>

        <label className={styles.inlineCheck}>
          <input
            type="checkbox"
            name="is_published"
            defaultChecked={Boolean(post.is_published)}
          />
          Publish now
        </label>

        <div className={styles.formActions}>
          <button type="submit" className={styles.submitBtn}>
            Update Post
          </button>
        </div>
      </form>
    </section>
  );
}
