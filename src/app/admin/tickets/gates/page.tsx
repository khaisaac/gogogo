import { requireAdmin } from "@/app/admin/_lib";
import { prisma } from "@/lib/db";
import GatesTable from "./GatesTable";
import styles from "../../bookings/bookings.module.css";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Manage Ticket Gates — Admin",
};

export default async function AdminGatesPage() {
  await requireAdmin();

  const correctGates = [
    { name: "Sembalun", image: "/sembalun.jpg" },
    { name: "Torean - Senange", image: "/n.jpg" },
    { name: "Senaru", image: "/senaru.jpg" },
  ];

  for (const g of correctGates) {
    const existing = await prisma.ticketGate.findUnique({
      where: { name: g.name }
    });
    if (!existing) {
      await prisma.ticketGate.create({
        data: {
          name: g.name,
          image: g.image,
          is_active: true
        }
      });
    }
  }

  const gates = await prisma.ticketGate.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Ticket Gates</h1>
        <p>Manage Mt. Rinjani entrance and exit gates</p>
      </div>

      <div className={styles.content}>
        <GatesTable initialGates={gates || []} />
      </div>
    </div>
  );
}
