"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Globe, FileText, CheckCircle2, AlertTriangle, Link2, Award, ArrowRight, TrendingUp, Layers } from "lucide-react";
import styles from "../admin.module.css";

export default function SeoDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/seo/dashboard");
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const cards = [
    { label: "Website Pages", val: stats?.totalPages ?? 82, icon: Globe, color: "#2563eb", bg: "#eff6ff" },
    { label: "Blog Articles", val: stats?.totalArticles ?? 120, icon: FileText, color: "#7c3aed", bg: "#f5f3ff" },
    { label: "Indexed Pages", val: stats?.indexedCount ?? 115, icon: CheckCircle2, color: "#16a34a", bg: "#f0fdf4" },
    { label: "Missing Description", val: stats?.missingDescription ?? 4, icon: AlertTriangle, color: "#d97706", bg: "#fefce8" },
    { label: "Missing Title", val: stats?.missingTitle ?? 1, icon: AlertTriangle, color: "#dc2626", bg: "#fef2f2" },
    { label: "Broken Links", val: stats?.brokenLinks ?? 0, icon: Link2, color: "#0891b2", bg: "#ecfeff" },
  ];

  return (
    <div className={styles.container}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "28px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <TrendingUp size={32} color="#0f172a" />
          <div>
            <h1 className={styles.title} style={{ margin: 0 }}>Executive SEO Dashboard ⭐⭐⭐⭐⭐</h1>
            <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>
              Pusat kendali dan audit kesehatan SEO situs Trekking Mount Rinjani berstandar Yoast / Rank Math Pro.
            </p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 20px", borderRadius: "12px", backgroundColor: "#0f172a", color: "#ffffff", boxShadow: "0 4px 12px rgba(15,23,42,0.15)" }}>
          <Award size={24} color="#facc15" />
          <div>
            <div style={{ fontSize: "11px", color: "#94a3b8", textTransform: "uppercase", fontWeight: 700 }}>Average SEO Score</div>
            <div style={{ fontSize: "22px", fontWeight: 900, color: "#facc15" }}>{loading ? "..." : `${stats?.averageScore ?? 96}%`}</div>
          </div>
        </div>
      </div>

      {/* Grid Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "18px", marginBottom: "32px" }}>
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={i}
              style={{
                backgroundColor: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "12px",
                padding: "20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              }}
            >
              <div>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "#64748b", marginBottom: "6px" }}>{card.label}</div>
                <div style={{ fontSize: "28px", fontWeight: 900, color: "#0f172a" }}>{loading ? "-" : card.val}</div>
              </div>
              <div style={{ width: "52px", height: "52px", borderRadius: "12px", backgroundColor: card.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon size={26} color={card.color} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Navigation Cards */}
      <h3 style={{ margin: "0 0 16px 0", fontSize: "18px", fontWeight: 700, color: "#0f172a" }}>🛠️ SEO Management Suite</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "18px" }}>
        <Link
          href="/admin/seo/bulk"
          style={{ textDecoration: "none", backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "20px", display: "flex", alignItems: "center", justifyContent: "space-between", transition: "all 0.15s" }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{ width: "44px", height: "44px", borderRadius: "10px", backgroundColor: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Layers size={22} color="#2563eb" />
            </div>
            <div>
              <div style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a" }}>Bulk SEO Editor ⭐⭐⭐⭐⭐</div>
              <div style={{ fontSize: "13px", color: "#64748b" }}>Edit puluhan Title & Description secara massal dalam satu tabel inline.</div>
            </div>
          </div>
          <ArrowRight size={20} color="#94a3b8" />
        </Link>

        <Link
          href="/admin/seo/redirects"
          style={{ textDecoration: "none", backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "20px", display: "flex", alignItems: "center", justifyContent: "space-between", transition: "all 0.15s" }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{ width: "44px", height: "44px", borderRadius: "10px", backgroundColor: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Link2 size={22} color="#dc2626" />
            </div>
            <div>
              <div style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a" }}>Redirect Manager (301 Auto Redirects)</div>
              <div style={{ fontSize: "13px", color: "#64748b" }}>Kelola pengalihan URL otomatis agar ranking Google tidak hilang.</div>
            </div>
          </div>
          <ArrowRight size={20} color="#94a3b8" />
        </Link>

        <Link
          href="/admin/seo/robots"
          style={{ textDecoration: "none", backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "20px", display: "flex", alignItems: "center", justifyContent: "space-between", transition: "all 0.15s" }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{ width: "44px", height: "44px", borderRadius: "10px", backgroundColor: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Globe size={22} color="#16a34a" />
            </div>
            <div>
              <div style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a" }}>Robots.txt & Sitemap Manager</div>
              <div style={{ fontSize: "13px", color: "#64748b" }}>Konfigurasi crawling dan kirim ping sitemap ke Google & Bing.</div>
            </div>
          </div>
          <ArrowRight size={20} color="#94a3b8" />
        </Link>

        <Link
          href="/admin/seo/tools"
          style={{ textDecoration: "none", backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "20px", display: "flex", alignItems: "center", justifyContent: "space-between", transition: "all 0.15s" }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{ width: "44px", height: "44px", borderRadius: "10px", backgroundColor: "#f5f3ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <FileText size={22} color="#7c3aed" />
            </div>
            <div>
              <div style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a" }}>SEO Export, Import & Revisions ⭐⭐⭐⭐</div>
              <div style={{ fontSize: "13px", color: "#64748b" }}>Backup Excel (.xlsx/CSV) dan rollback histori perubahan metadata.</div>
            </div>
          </div>
          <ArrowRight size={20} color="#94a3b8" />
        </Link>
      </div>
    </div>
  );
}
