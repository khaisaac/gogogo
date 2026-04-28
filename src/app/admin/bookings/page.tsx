import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import BookingsTable from "./BookingsTable";
import styles from "./bookings.module.css";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Manage Bookings — Admin",
};

export default async function AdminBookingsPage() {
  const adminSupabase = createAdminClient();

  // Verify user is admin
  const { data: { user } } = await adminSupabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const { data: profile } = await adminSupabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    redirect("/");
  }

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
