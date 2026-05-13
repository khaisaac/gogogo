"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { adminLogin, verifyAdminRole } from "./actions";
import styles from "./page.module.css";

function AdminLoginContent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeEmail, setActiveEmail] = useState<string | null>(null);
  const [activeRole, setActiveRole] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const message = searchParams.get("error");
  const redirectedEmail = searchParams.get("email");

  useEffect(() => {
    // Basic API call to check if we are already logged in
    const checkSession = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setActiveEmail(data.user.email);
            setActiveRole(data.user.role);
          }
        }
      } catch (err) {
        // ignore
      }
    };
    checkSession();
  }, []);

  useEffect(() => {
    if (message !== "not_admin") {
      return;
    }
    // Sign out API call
    fetch("/api/auth/signout", { method: "POST" }).then(() => {
      setActiveEmail(null);
      setActiveRole(null);
    });
  }, [message]);

  const forceSignOut = async () => {
    await fetch("/api/auth/signout", { method: "POST" });
    setActiveEmail(null);
    setActiveRole(null);
    setError("");
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await adminLogin(email, password);

      if (result?.error) {
        setError(result.error);
        return;
      }

      // Success
      await new Promise((resolve) => setTimeout(resolve, 500));
      router.push("/admin/packages");
      router.refresh();
    } catch (err: any) {
      setError(`Network/Action error: ${err.message || "Failed to contact server"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <p className={styles.kicker}>Admin Access</p>
        <h1 className={styles.title}>Admin Login</h1>
        <p className={styles.subtitle}>
          Login menggunakan email dan password admin, tanpa verification code.
        </p>

        {activeEmail && (
          <div className={styles.sessionInfo}>
            <p>
              Session aktif: <strong>{activeEmail}</strong>
            </p>
            <p>Role saat ini: {activeRole || "unknown"}</p>
            <button
              type="button"
              onClick={forceSignOut}
              className={styles.signOutBtn}
            >
              Logout session ini
            </button>
          </div>
        )}

        {message === "not_admin" && (
          <p className={styles.warn}>
            Akun ini bukan admin.
            {redirectedEmail ? ` (yang terbaca: ${redirectedEmail})` : ""}
          </p>
        )}

        {error && <p className={styles.error}>{error}</p>}

        <form onSubmit={onSubmit} className={styles.form}>
          <label className={styles.field}>
            <span>Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          <label className={styles.field}>
            <span>Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>

          <button type="submit" className={styles.submit} disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </section>
    </main>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <AdminLoginContent />
    </Suspense>
  );
}
