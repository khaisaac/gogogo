import Link from "next/link";
import styles from "./admin.module.css";
import {
  ClipboardList,
  FileText,
  Package,
  Car,
  Ticket,
  Calendar,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Users,
  ShieldCheck,
} from "lucide-react";

export default function AdminHomePage() {
  const statCards = [
    {
      title: "Trekking Bookings",
      val: "Manage Orders",
      desc: "Track payments & deposits",
      icon: ClipboardList,
      href: "/admin/bookings",
      color: "#3b82f6",
      bg: "#eff6ff",
    },
    {
      title: "Ticket Bookings",
      val: "Entrance Tickets",
      desc: "Sembalun & Senaru gates",
      icon: Ticket,
      href: "/admin/tickets",
      color: "#10b981",
      bg: "#ecfdf5",
    },
    {
      title: "Transport Orders",
      val: "Pickups & Drops",
      desc: "Airport & hotel shuttles",
      icon: Car,
      href: "/admin/transport",
      color: "#8b5cf6",
      bg: "#f5f3ff",
    },
    {
      title: "Availability Schedule",
      val: "Trek Dates",
      desc: "Open/close trek quotas",
      icon: Calendar,
      href: "/admin/availability",
      color: "#f59e0b",
      bg: "#fffbeb",
    },
  ];

  return (
    <div className={styles.dashboardHome}>
      {/* Welcome Banner */}
      <section className={styles.welcomeBanner}>
        <div className={styles.welcomeContent}>
          <div className={styles.welcomeBadge}>
            <Sparkles size={16} />
            <span>Overview & Analytics</span>
          </div>
          <h1 className={styles.welcomeTitle}>Welcome back, Admin 👋</h1>
          <p className={styles.welcomeSub}>
            Here is your daily command center. Monitor trekking bookings, transport logistics, entrance tickets, and content updates in real-time.
          </p>
        </div>
        <div className={styles.welcomeActions}>
          <Link href="/admin/packages/new" className={styles.bannerBtnPrimary}>
            + New Package
          </Link>
          <Link href="/admin/blog/new" className={styles.bannerBtnSecondary}>
            + Write Post
          </Link>
        </div>
      </section>

      {/* Quick Access Stats / Modules */}
      <div className={styles.sectionHeaderRow}>
        <div>
          <h2 className={styles.sectionTitle}>Operations & Logistics</h2>
          <p className={styles.sectionSub}>Quick access to your active Rinjani trekking services</p>
        </div>
      </div>

      <section className={styles.statsGrid}>
        {statCards.map((st, idx) => {
          const Icon = st.icon;
          return (
            <Link key={idx} href={st.href} className={styles.statCard}>
              <div className={styles.statCardTop}>
                <div className={styles.statIconWrap} style={{ background: st.bg, color: st.color }}>
                  <Icon size={22} />
                </div>
                <span className={styles.statArrow}>
                  <ArrowRight size={18} />
                </span>
              </div>
              <div className={styles.statCardInfo}>
                <p className={styles.statCardLabel}>{st.title}</p>
                <h3 className={styles.statCardVal}>{st.val}</h3>
                <p className={styles.statCardDesc}>{st.desc}</p>
              </div>
            </Link>
          );
        })}
      </section>

      {/* Management Modules */}
      <div className={styles.sectionHeaderRow} style={{ marginTop: "32px" }}>
        <div>
          <h2 className={styles.sectionTitle}>Content & Products</h2>
          <p className={styles.sectionSub}>Manage your website offerings and SEO articles</p>
        </div>
      </div>

      <section className={styles.gridCards}>
        <article className={styles.quickCard}>
          <div className={styles.quickCardIcon} style={{ background: "#f1f5f9", color: "#0f172a" }}>
            <Package size={24} />
          </div>
          <div className={styles.quickCardContent}>
            <div className={styles.quickCardHeader}>
              <span className={styles.kicker}>Catalog</span>
              <span className={styles.statusBadgeGreen}>Active</span>
            </div>
            <h2 className={styles.heading}>Trekking Packages</h2>
            <p className={styles.helper}>
              Configure trekking packages for Sembalun and Senaru routes. Manage pricing matrix, highlights, itineraries, and inclusion items.
            </p>
            <Link href="/admin/packages" className={styles.primaryLink}>
              <span>Manage Packages</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </article>

        <article className={styles.quickCard}>
          <div className={styles.quickCardIcon} style={{ background: "#f1f5f9", color: "#0f172a" }}>
            <FileText size={24} />
          </div>
          <div className={styles.quickCardContent}>
            <div className={styles.quickCardHeader}>
              <span className={styles.kicker}>CMS Blog</span>
              <span className={styles.statusBadgeBlue}>SEO Optimized</span>
            </div>
            <h2 className={styles.heading}>Articles & Posts</h2>
            <p className={styles.helper}>
              Publish trekking guides, tips, and news. Rich WordPress-like editor with categories, tags, cover images, and publishing controls.
            </p>
            <Link href="/admin/blog" className={styles.primaryLink}>
              <span>Manage Posts</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </article>
      </section>
    </div>
  );
}
