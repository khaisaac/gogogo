"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import styles from "./Navbar.module.css";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [packagesOpen, setPackagesOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  
  // Auth state
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const forceSolid = pathname !== "/";
  const headerIsSolid = forceSolid || scrolled;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();
        if (profile?.role === "admin") {
          setIsAdmin(true);
        }
      }
    };
    fetchUser();
  }, [pathname]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setIsAdmin(false);
    router.refresh();
  };

  const closeMenu = () => {
    setMenuOpen(false);
    setPackagesOpen(false);
    setProfileOpen(false);
  };

  return (
    <header className={`${styles.header} ${headerIsSolid ? styles.scrolled : ""}`}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo} onClick={closeMenu}>
          <img src="/logo.png" alt="Trekking Mount Rinjani" className={styles.logoImg} />
        </Link>

        <nav className={`${styles.nav} ${menuOpen ? styles.navOpen : ""}`}>
          <a href="#hero" className={styles.navLink} onClick={closeMenu}>Home</a>

          <div
            className={styles.dropdown}
            onMouseEnter={() => setPackagesOpen(true)}
            onMouseLeave={() => setPackagesOpen(false)}
          >
            <button
              className={styles.navLink}
              onClick={() => setPackagesOpen(!packagesOpen)}
              aria-expanded={packagesOpen}
            >
              Packages
              <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
              </svg>
            </button>
            <div className={`${styles.dropdownMenu} ${packagesOpen ? styles.dropdownOpen : ""}`}>
              <a href="#sembalun" className={styles.dropdownItem} onClick={closeMenu}>
                <span className={styles.dropdownIcon}>🏔️</span>
                <div>
                  <strong>Sembalun Route</strong>
                  <small>Path to the Summit — 3,726m</small>
                </div>
              </a>
              <a href="#senaru" className={styles.dropdownItem} onClick={closeMenu}>
                <span className={styles.dropdownIcon}>🌿</span>
                <div>
                  <strong>Senaru Route</strong>
                  <small>The Green Route — Forests & Waterfalls</small>
                </div>
              </a>
            </div>
          </div>

          <a href="#about" className={styles.navLink} onClick={closeMenu}>About</a>
          <a href="#pricing" className={styles.navLink} onClick={closeMenu}>Pricing</a>
          <a href="#contact" className={styles.navLink} onClick={closeMenu}>Contact</a>
        </nav>

        <div className={styles.actions}>
          {user ? (
            <div className={styles.userMenu}>
              <div
                className={styles.dropdown}
                onMouseEnter={() => setProfileOpen(true)}
                onMouseLeave={() => setProfileOpen(false)}
              >
                <button
                  className={styles.loginBtn}
                  onClick={() => setProfileOpen(!profileOpen)}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                  <span className={styles.hideMobile}>My Account</span>
                </button>
                <div className={`${styles.dropdownMenu} ${profileOpen ? styles.dropdownOpen : ""} ${styles.profileDropdown}`}>
                  <div className={styles.dropdownHeader}>
                    <strong>{user.email}</strong>
                    <small>{isAdmin ? "Admin" : "Client"}</small>
                  </div>
                  <Link href={isAdmin ? "/admin" : "/dashboard"} className={styles.dropdownItem} onClick={closeMenu}>
                    <span className={styles.dropdownIcon}>📊</span>
                    <div>
                      <strong>{isAdmin ? "Admin Panel" : "My Dashboard"}</strong>
                    </div>
                  </Link>
                  <button className={`${styles.dropdownItem} ${styles.logoutBtn}`} onClick={handleLogout}>
                    <span className={styles.dropdownIcon}>🚪</span>
                    <div>
                      <strong>Logout</strong>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <Link href="/login" passHref legacyBehavior>
              <button className={styles.loginBtn} id="login-button">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                <span>Login</span>
              </button>
            </Link>
          )}

          <button
            className={styles.hamburger}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span className={`${styles.bar} ${menuOpen ? styles.barOpen : ""}`} />
            <span className={`${styles.bar} ${menuOpen ? styles.barOpen : ""}`} />
            <span className={`${styles.bar} ${menuOpen ? styles.barOpen : ""}`} />
          </button>
        </div>
      </div>
    </header>
  );
}
