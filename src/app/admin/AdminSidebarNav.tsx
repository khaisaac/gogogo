"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ClipboardList,
  Ticket,
  QrCode,
  Car,
  Calendar,
  FileText,
  PlusCircle,
  Package,
  FolderPlus,
  ExternalLink,
  Globe,
  TrendingUp,
  Layers,
  Repeat,
  AlertOctagon,
  History,
} from "lucide-react";
import styles from "./admin.module.css";

function isActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  if (href === "/admin/blog") return pathname === "/admin/blog";
  if (href === "/admin/packages") return pathname === "/admin/packages";
  if (href === "/admin/availability") return pathname === "/admin/availability";
  if (href === "/admin/seo") return pathname === "/admin/seo";
  return pathname === href || pathname.startsWith(`${href}/`);
}

type NavGroup = {
  category: string;
  items: {
    href: string;
    label: string;
    icon: React.ComponentType<{ className?: string; size?: number }>;
  }[];
};

export default function AdminSidebarNav() {
  const pathname = usePathname();

  const navGroups: NavGroup[] = [
    {
      category: "Overview",
      items: [
        { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
      ],
    },
    {
      category: "Operations",
      items: [
        { href: "/admin/bookings", label: "Trekking Bookings", icon: ClipboardList },
        { href: "/admin/tickets", label: "Ticket Bookings", icon: Ticket },
        { href: "/admin/tickets/gates", label: "Ticket Gates", icon: QrCode },
        { href: "/admin/transport", label: "Transport Bookings", icon: Car },
        { href: "/admin/availability", label: "Availability", icon: Calendar },
      ],
    },
    {
      category: "Content",
      items: [
        { href: "/admin/blog", label: "All Posts", icon: FileText },
        { href: "/admin/blog/new", label: "Add New Post", icon: PlusCircle },
      ],
    },
    {
      category: "Products",
      items: [
        { href: "/admin/packages", label: "All Packages", icon: Package },
        { href: "/admin/packages/new", label: "Add New Package", icon: FolderPlus },
      ],
    },
    {
      category: "Professional SEO Pro ⭐",
      items: [
        { href: "/admin/seo", label: "SEO Dashboard", icon: TrendingUp },
        { href: "/admin/seo/static", label: "Static Pages SEO", icon: Globe },
        { href: "/admin/seo/articles", label: "Article SEO Overview", icon: FileText },
        { href: "/admin/seo/bulk", label: "Bulk SEO Editor", icon: Layers },
        { href: "/admin/seo/redirects", label: "301 Redirects", icon: Repeat },
        { href: "/admin/seo/robots", label: "Robots & Sitemap", icon: Globe },
        { href: "/admin/seo/broken-links", label: "Broken Links 404", icon: AlertOctagon },
        { href: "/admin/seo/tools", label: "Export / Import & Rev", icon: History },
      ],
    },
    {
      category: "System",
      items: [
        { href: "/", label: "View Live Site", icon: ExternalLink },
      ],
    },
  ];

  return (
    <nav className={styles.nav}>
      {navGroups.map((group) => (
        <div key={group.category} className={styles.navGroup}>
          <p className={styles.navCategory}>{group.category}</p>
          <div className={styles.navItems}>
            {group.items.map((item) => {
              const Icon = item.icon;
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`${styles.navLink} ${active ? styles.activeNavLink : ""}`}
                >
                  <Icon size={18} className={styles.navIcon} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}
