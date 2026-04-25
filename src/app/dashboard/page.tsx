import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DashboardClient from "./DashboardClient";
import styles from "@/components/dashboard/dashboard.module.css";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "My Dashboard — Trekking Mount Rinjani",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <>
      <Navbar />
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Welcome back!</h1>
          <p className={styles.subtitle}>Manage your bookings and account details.</p>
        </div>
        <DashboardClient user={user} />
      </div>
      <Footer />
    </>
  );
}
