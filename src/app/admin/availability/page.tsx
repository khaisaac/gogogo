import { requireAdmin } from "@/app/admin/_lib";
import { prisma } from "@/lib/db";
import styles from "../admin.module.css";
import AvailabilityClient from "./AvailabilityClient";

export const metadata = {
  title: "Availability Manager — Admin",
};

export default async function AvailabilityPage() {
  await requireAdmin();

  const packages = await prisma.package.findMany({
    where: { is_active: true },
    orderBy: [{ route: "asc" }, { title: "asc" }],
    select: { id: true, title: true, route: true },
  });

  return (
    <section className={styles.main}>
      <div className={styles.card}>
        <div className={styles.row}>
          <div>
            <h2 className={styles.heading}>📅 Availability Manager</h2>
            <p className={styles.helper}>
              Manage trekking available dates for each package. Customers can only select dates you add here during checkout.
            </p>
          </div>
        </div>
      </div>

      <div style={{ marginTop: "20px" }}>
        <AvailabilityClient packages={packages} />
      </div>
    </section>
  );
}
