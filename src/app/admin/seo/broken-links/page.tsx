"use client";

import React, { useState } from "react";
import { AlertOctagon, Repeat, Trash2, CheckCircle } from "lucide-react";
import styles from "../../admin.module.css";

const INITIAL_LOGS = [
  { id: "1", url: "/blog/abc", referer: "https://google.com", hits: 14, last_accessed: "2026-07-01 19:20" },
  { id: "2", url: "/tour/sembalun-old", referer: "https://facebook.com", hits: 8, last_accessed: "2026-07-01 16:45" },
  { id: "3", url: "/packages/rinjani-promos", referer: "Direct", hits: 3, last_accessed: "2026-06-30 21:10" },
];

export default function BrokenLinksPage() {
  const [logs, setLogs] = useState(INITIAL_LOGS);
  const [redirectingUrl, setRedirectingUrl] = useState<string | null>(null);
  const [targetUrl, setTargetUrl] = useState("");

  const handleDelete = (id: string) => {
    setLogs((prev) => prev.filter((l) => l.id !== id));
  };

  const handleQuickRedirect = async (source: string) => {
    if (!targetUrl) return;
    try {
      await fetch("/api/admin/seo/redirects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source_url: source, target_url: targetUrl, status_code: 301 }),
      });
      alert(`✓ Berhasil membuat 301 Redirect dari ${source} ke ${targetUrl}`);
      setLogs((prev) => prev.filter((l) => l.url !== source));
      setRedirectingUrl(null);
      setTargetUrl("");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className={styles.container}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "24px" }}>
        <AlertOctagon size={28} color="#e11d48" />
        <div>
          <h1 className={styles.title} style={{ margin: 0 }}>Broken Link Checker (404 Audit) ⭐⭐⭐⭐⭐</h1>
          <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>
            Pantau rute 404 yang rusak dan alihkan ke halaman aktif dengan 301 Redirect agar tidak menurunkan SEO.
          </p>
        </div>
      </div>

      <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
        {logs.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#16a34a", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
            <CheckCircle size={20} />
            <span>Sempurna! Tidak ada tautan rusak (Broken Links 404) yang terdeteksi di situs Anda.</span>
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #e2e8f0", backgroundColor: "#f8fafc", color: "#475569" }}>
                <th style={{ padding: "12px" }}>Broken URL (404)</th>
                <th style={{ padding: "12px" }}>Referer / Sumber</th>
                <th style={{ padding: "12px" }}>Hits</th>
                <th style={{ padding: "12px" }}>Terakhir Akses</th>
                <th style={{ padding: "12px", textAlign: "right" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <React.Fragment key={log.id}>
                  <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "12px", fontWeight: 700, color: "#e11d48" }}>{log.url}</td>
                    <td style={{ padding: "12px", color: "#64748b" }}>{log.referer}</td>
                    <td style={{ padding: "12px" }}>
                      <span style={{ padding: "2px 8px", borderRadius: "10px", backgroundColor: "#fef2f2", color: "#991b1b", fontWeight: 700 }}>
                        {log.hits}x
                      </span>
                    </td>
                    <td style={{ padding: "12px", color: "#64748b" }}>{log.last_accessed}</td>
                    <td style={{ padding: "12px", textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: "8px" }}>
                        <button
                          type="button"
                          onClick={() => {
                            setRedirectingUrl(log.url);
                            setTargetUrl("/packages/sembalun");
                          }}
                          style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "6px 12px", borderRadius: "6px", border: "1px solid #bfdbfe", backgroundColor: "#eff6ff", color: "#2563eb", fontWeight: 600, cursor: "pointer" }}
                        >
                          <Repeat size={14} />
                          <span>Fix Redirect</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(log.id)}
                          style={{ padding: "6px 10px", borderRadius: "6px", border: "1px solid #cbd5e1", backgroundColor: "#ffffff", color: "#64748b", cursor: "pointer" }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {redirectingUrl === log.url && (
                    <tr style={{ backgroundColor: "#f8fafc" }}>
                      <td colSpan={5} style={{ padding: "14px 12px", borderBottom: "1px solid #e2e8f0" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <span style={{ fontWeight: 600, fontSize: "13px" }}>Alihkan {log.url} ke:</span>
                          <input
                            type="text"
                            placeholder="/packages/sembalun atau /blog"
                            value={targetUrl}
                            onChange={(e) => setTargetUrl(e.target.value)}
                            style={{ flex: 1, padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "14px" }}
                          />
                          <button
                            type="button"
                            onClick={() => handleQuickRedirect(log.url)}
                            style={{ padding: "8px 16px", borderRadius: "6px", border: "none", backgroundColor: "#16a34a", color: "#ffffff", fontWeight: 700, cursor: "pointer" }}
                          >
                            Buat 301 Redirect
                          </button>
                          <button
                            type="button"
                            onClick={() => setRedirectingUrl(null)}
                            style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", backgroundColor: "#ffffff", color: "#64748b", cursor: "pointer" }}
                          >
                            Batal
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
