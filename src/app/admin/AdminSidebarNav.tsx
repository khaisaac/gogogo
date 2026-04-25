"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./admin.module.css";

function isActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  if (href === "/admin/blog") return pathname === "/admin/blog";
  if (href === "/admin/packages") return pathname === "/admin/packages";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function AdminSidebarNav() {
  const pathname = usePathname();

  const links = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/blog", label: "Posts" },
    { href: "/admin/blog/categories", label: "Categories" },
    { href: "/admin/blog/new", label: "Add New Post" },
    { href: "/admin/packages", label: "All Packages" },
    { href: "/admin/packages/new", label: "Add New Package" },
    { href: "/", label: "View Site" },
  ];

  return (
    <nav className={styles.nav}>
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={`${styles.navLink} ${
            isActive(pathname, link.href) ? styles.activeNavLink : ""
          }`}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
