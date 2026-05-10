import { requireAdmin } from "@/app/admin/_lib";
import { prisma } from "@/lib/db";
import BookingsTable from "./BookingsTable";
import styles from "./bookings.module.css";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Manage Bookings — Admin",
};

export default async function AdminBookingsPage() {
  await requireAdmin();

  const bookings = await prisma.booking.findMany({
    include: {
      payments: true,
      refunds: true,
    },
    orderBy: { created_at: "desc" },
  });

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Bookings Management</h1>
        <p>View and manage all customer bookings and payment statuses</p>
      </div>

      <div className={styles.content}>
        <BookingsTable bookings={bookings || []} />
      </div>
    </div>
  );
}
