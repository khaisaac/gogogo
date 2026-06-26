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
} from "lucide-react";
import styles from "./admin.module.css";

function isActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  if (href === "/admin/blog") return pathname === "/admin/blog";
  if (href === "/admin/packages") return pathname === "/admin/packages";
  if (href === "/admin/availability") return pathname === "/admin/availability";
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
