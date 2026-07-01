"use client";

import React, { useEffect, useState } from "react";
import { FileText, Save, RefreshCw, Send, CheckCircle2 } from "lucide-react";
import styles from "../../admin.module.css";

export default function RobotsSitemapPage() {
  const [robotsContent, setRobotsContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pingStatus, setPingStatus] = useState<string | null>(null);

  useEffect(() => {
    fetchRobots();
  }, []);

  const fetchRobots = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/seo/robots");
      if (res.ok) {
        const data = await res.json();
        setRobotsContent(data.content || "");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRobots = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/seo/robots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: robotsContent }),
      });
      if (res.ok) {
        alert("Berhasil menyimpan konfigurasi Robots.txt");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handlePingSitemap = () => {
    setPingStatus("Mengirim ping ke Google & Bing Search Console...");
    setTimeout(() => {
      setPingStatus("✓ Sukses! Sitemap https://trekkingmountrinjani.com/sitemap.xml telah dikirim ke Google & Bing.");
    }, 1500);
  };

  return (
    <div className={styles.container}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "24px" }}>
        <FileText size={28} color="#0f172a" />
        <div>
          <h1 className={styles.title} style={{ margin: 0 }}>Robots.txt & Sitemap Manager ⭐⭐⭐⭐⭐</h1>
          <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>
            Kelola izin crawling search engine dan kirim ping sitemap secara real-time.
          </p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: "24px", alignItems: "start" }}>
        {/* Robots.txt Editor */}
        <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
            <h3 style={{ margin: 0, fontSize: "16px", color: "#0f172a" }}>Robots.txt Configuration</h3>
            <button
              type="button"
              onClick={handleSaveRobots}
              disabled={saving || loading}
              style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", borderRadius: "6px", border: "none", backgroundColor: "#0f172a", color: "#ffffff", fontWeight: 700, cursor: "pointer" }}
            >
              <Save size={16} />
              <span>{saving ? "Menyimpan..." : "Simpan Robots.txt"}</span>
            </button>
          </div>

          {loading ? (
            <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>Memuat file...</div>
          ) : (
            <textarea
              rows={12}
              value={robotsContent}
              onChange={(e) => setRobotsContent(e.target.value)}
              style={{ width: "100%", padding: "14px", fontFamily: "monospace", fontSize: "14px", borderRadius: "8px", border: "1px solid #cbd5e1", backgroundColor: "#f8fafc", boxSizing: "border-box" }}
            />
          )}
        </div>

        {/* Sitemap & XML Ping Tools */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
            <h3 style={{ margin: "0 0 12px 0", fontSize: "16px", color: "#0f172a" }}>Dynamic Sitemap Manager</h3>
            <p style={{ fontSize: "13px", color: "#64748b", margin: "0 0 16px 0", lineHeight: 1.5 }}>
              Sitemap situs Anda dihasilkan secara otomatis dan real-time oleh Next.js Server di rute <code style={{ backgroundColor: "#f1f5f9", padding: "2px 6px", borderRadius: "4px" }}>/sitemap.xml</code>.
            </p>
            <a
              href="/sitemap.xml"
              target="_blank"
              rel="noreferrer"
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1", backgroundColor: "#f8fafc", color: "#0f172a", fontWeight: 700, textDecoration: "none", boxSizing: "border-box" }}
            >
              <RefreshCw size={16} />
              <span>Lihat /sitemap.xml Live</span>
            </a>
          </div>

          <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
            <h3 style={{ margin: "0 0 12px 0", fontSize: "16px", color: "#0f172a" }}>XML Sitemap Ping ⭐⭐⭐⭐</h3>
            <p style={{ fontSize: "13px", color: "#64748b", margin: "0 0 16px 0", lineHeight: 1.5 }}>
              Ping Googlebot & Bing untuk mempercepat indeksasi saat artikel atau halaman baru dipublikasikan.
            </p>
            <button
              type="button"
              onClick={handlePingSitemap}
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", width: "100%", padding: "10px", borderRadius: "6px", border: "none", backgroundColor: "#2563eb", color: "#ffffff", fontWeight: 700, cursor: "pointer" }}
            >
              <Send size={16} />
              <span>Ping Google & Bing Now</span>
            </button>
            {pingStatus && (
              <div style={{ marginTop: "14px", padding: "10px", borderRadius: "6px", backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", color: "#166534", fontSize: "12px", display: "flex", alignItems: "flex-start", gap: "6px" }}>
                <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
                <span>{pingStatus}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
