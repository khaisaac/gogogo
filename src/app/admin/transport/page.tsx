import { requireAdmin } from "@/app/admin/_lib";
import { prisma } from "@/lib/db";
import TransportAdminClient from "./TransportAdminClient";
import styles from "../bookings/bookings.module.css";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Manage Transport Bookings — Admin",
};

export default async function AdminTransportPage() {
  await requireAdmin();

  // Fetch transport bookings
  const bookings = await prisma.transportBooking.findMany({
    orderBy: { created_at: "desc" },
    include: {
      payments: true,
    },
  });

  // Fetch transport options
  const options = await prisma.transportOption.findMany({
    orderBy: { created_at: "desc" },
  });

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>🚗 Senaru Transport Management</h1>
        <p>Manage transport options/routes, pricing, cover images, and view bookings log.</p>
      </div>

      <div className={styles.content}>
        <TransportAdminClient 
          initialBookings={bookings || []} 
          initialOptions={options || []} 
        />
      </div>
    </div>
  );
}
