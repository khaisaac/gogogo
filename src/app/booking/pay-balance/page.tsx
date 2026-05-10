import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PayBalanceClient from "./PayBalanceClient";
import styles from "./payBalance.module.css";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Pay Balance — Trekking Mount Rinjani",
};

export default async function PayBalancePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const params = await searchParams;
  const bookingId = params.booking_id;
  if (!bookingId) redirect("/");

  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking) redirect("/");

  return (
    <>
      <Navbar />
      <main className={styles.page}>
        <div className="container">
          <PayBalanceClient booking={booking} />
        </div>
      </main>
      <Footer />
    </>
  );
}
