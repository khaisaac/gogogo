import { requireAdmin } from "@/app/admin/_lib";
import { prisma } from "@/lib/db";
import TicketsTable from "./TicketsTable";
import styles from "../bookings/bookings.module.css";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Manage Ticket Bookings — Admin",
};

export default async function AdminTicketsPage() {
  await requireAdmin();

  const tickets = await prisma.ticketBooking.findMany({
    orderBy: { created_at: "desc" },
  });

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Ticket Bookings</h1>
        <p>View and manage all Mt. Rinjani entrance ticket bookings</p>
      </div>

      <div className={styles.content}>
        <TicketsTable tickets={tickets || []} />
      </div>
    </div>
  );
}
