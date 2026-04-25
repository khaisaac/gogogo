"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { verifyAdminRole } from "./actions";
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
    const supabase = createClient();

    const loadSession = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setActiveEmail(null);
        setActiveRole(null);
        return;
      }

      setActiveEmail(user.email || null);

      // Use server action to fetch role (bypasses RLS)
      const profile = await verifyAdminRole(user.id);
      setActiveRole(profile?.role || null);
    };

    loadSession();
  }, []);

  useEffect(() => {
    if (message !== "not_admin") {
      return;
    }

    const supabase = createClient();
    supabase.auth.signOut().then(() => {
      setActiveEmail(null);
      setActiveRole(null);
    });
  }, [message]);

  const forceSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setActiveEmail(null);
    setActiveRole(null);
    setError("");
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const supabase = createClient();
      const { data: signInData, error: signInError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (signInError) {
        setError(signInError.message || "Login gagal");
        return;
      }

      // Use server action to verify role (bypasses RLS)
      const profile = await verifyAdminRole(signInData.user.id);

      console.log("Login Debug:", {
        userId: signInData.user.id,
        email: signInData.user.email,
        profile: profile,
      });

      if (profile?.role !== "admin") {
        await supabase.auth.signOut();
        setError("Akun ini bukan admin.");
        return;
      }

      // Wait a moment for session to persist before redirecting
      await new Promise(resolve => setTimeout(resolve, 500));
      
      router.push("/admin/packages");
      router.refresh();
    } catch {
      setError("Terjadi kesalahan saat login");
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
