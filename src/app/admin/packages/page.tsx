import Link from "next/link";
import { requireAdminClient } from "@/app/admin/_lib";
import { difficultyScoreToLabel } from "@/lib/difficulty";
import { deletePackage } from "./actions";
import styles from "../admin.module.css";

export default async function AdminPackagesPage() {
  const supabase = await requireAdminClient();
  const { data: packages, error } = await supabase
    .from("packages")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <section className={styles.card}>
      <div className={styles.row}>
        <h2 className={styles.heading}>All Packages</h2>
        <Link href="/admin/packages/new" className={styles.primaryLink}>
          Add New
        </Link>
      </div>

      <p className={styles.helper}>
        Kelola package route Sembalun dan Senaru lengkap dengan detail,
        highlights, dan itinerary.
      </p>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Title</th>
              <th>Route</th>
              <th>Duration</th>
              <th>Private 1 Person</th>
              <th>Standard 1 Person</th>
              <th>Difficulty</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {packages?.map((pkg) => {
              const deleteAction = deletePackage.bind(null, pkg.id);
              const privatePrice = pkg.private_price_1pax ?? pkg.price_1pax;
              const standardPrice = pkg.standard_price_1pax ?? pkg.price_1pax;

              return (
                <tr key={pkg.id}>
                  <td>{pkg.title}</td>
                  <td>{pkg.route}</td>
                  <td>{pkg.duration}</td>
                  <td>{privatePrice ? `$${privatePrice}` : "-"}</td>
                  <td>{standardPrice ? `$${standardPrice}` : "-"}</td>
                  <td>{difficultyScoreToLabel(pkg.difficulty)}</td>
                  <td>
                    <span
                      className={`${styles.badge} ${
                        pkg.is_active ? styles.active : styles.inactive
                      }`}
                    >
                      {pkg.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <Link
                        href={`/admin/packages/${pkg.id}/edit`}
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
