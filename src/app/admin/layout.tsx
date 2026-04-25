import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAdminClient } from "./_lib";
import AdminSidebarNav from "./AdminSidebarNav";
import styles from "./admin.module.css";

export const dynamic = "force-dynamic";

async function logout() {
  "use server";

  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin-login");
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdminClient();

  return (
    <div className={styles.adminPage}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div>
            <p className={styles.kicker}>Site Admin</p>
            <h1 className={styles.title}>Rinjani Dashboard</h1>
          </div>
          <AdminSidebarNav />
          <form action={logout}>
            <button type="submit" className={styles.logoutBtn}>
              Log Out
            </button>
          </form>
        </div>
      </header>
      <main className={styles.main}>{children}</main>
    </div>
  );
}
