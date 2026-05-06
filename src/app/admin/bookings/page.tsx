import { requireAdminClient } from "@/app/admin/_lib";
import BookingsTable from "./BookingsTable";
import styles from "./bookings.module.css";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Manage Bookings — Admin",
};

export default async function AdminBookingsPage() {
  // requireAdminClient handles checking if the user is logged in and is an admin
  const adminSupabase = await requireAdminClient();

  // Fetch all bookings with payment info
  const { data: bookings, error } = await adminSupabase
    .from("bookings")
    .select("*, payments(*), refunds(*)")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Fetch bookings error:", error);
  }

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
