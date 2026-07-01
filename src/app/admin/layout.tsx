import Link from "next/link";
import { redirect } from "next/navigation";
import { clearSessionCookie } from "@/lib/auth";
import { requireAdmin } from "./_lib";
import AdminSidebarNav from "./AdminSidebarNav";
import styles from "./admin.module.css";
import { Mountain, LogOut } from "lucide-react";

export const dynamic = "force-dynamic";

async function logout() {
  "use server";

  await clearSessionCookie();
  redirect("/admin-login");
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div className={styles.adminPage}>
      <aside className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.brandArea}>
            <div className={styles.brandLogo}>
              <Mountain size={24} className={styles.logoIcon} />
            </div>
            <div>
              <div className={styles.brandTitleRow}>
                <h1 className={styles.brandTitle}>Rinjani Trek</h1>
                <span className={styles.brandBadge}>PRO</span>
              </div>
              <p className={styles.kicker}>Admin Portal v2.0</p>
            </div>
          </div>

          <AdminSidebarNav />

          <div className={styles.sidebarFooter}>
            <form action={logout} className={styles.logoutForm}>
              <button type="submit" className={styles.logoutBtn}>
                <LogOut size={18} />
                <span>Log Out</span>
              </button>
            </form>
          </div>
        </div>
      </aside>
      <main className={styles.main}>
        <div className={styles.mainContainer}>
          {children}
        </div>
      </main>
    </div>
  );
}
