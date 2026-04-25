import Link from "next/link";
import styles from "./admin.module.css";

export default function AdminHomePage() {
  return (
    <section className={styles.gridCards}>
      <article className={styles.quickCard}>
        <p className={styles.kicker}>Content</p>
        <h2 className={styles.heading}>Posts</h2>
        <p className={styles.helper}>
          Kelola artikel seperti WordPress: tulis, edit, publish/unpublish,
          kategori, dan tags.
        </p>
        <Link href="/admin/blog" className={styles.primaryLink}>
          Manage Posts
        </Link>
      </article>

      <article className={styles.quickCard}>
        <p className={styles.kicker}>Products</p>
        <h2 className={styles.heading}>Packages</h2>
        <p className={styles.helper}>
          Kelola paket trekking Sembalun dan Senaru lengkap dengan detail,
          highlights, itinerary, dan status aktif.
        </p>
        <Link href="/admin/packages" className={styles.primaryLink}>
          Manage Packages
        </Link>
      </article>
    </section>
  );
}
