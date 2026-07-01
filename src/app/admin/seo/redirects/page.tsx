"use client";

import React, { useEffect, useState } from "react";
import { Repeat, Plus, Trash2, ArrowRight } from "lucide-react";
import styles from "../../admin.module.css";

export default function RedirectsManagerPage() {
  const [redirects, setRedirects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState("");
  const [target, setTarget] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchRedirects();
  }, []);

  const fetchRedirects = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/seo/redirects");
      if (res.ok) {
        const data = await res.json();
        setRedirects(data.redirects || []);
      }
    } catch (err) {
      console.error("Error loading redirects:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!source || !target) return;

    setSaving(true);
    try {
      const res = await fetch("/api/admin/seo/redirects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source_url: source, target_url: target, status_code: 301 }),
      });
      if (res.ok) {
        setSource("");
        setTarget("");
        fetchRedirects();
      } else {
        alert("Gagal menambahkan redirect");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus redirect ini?")) return;
    try {
      const res = await fetch(`/api/admin/seo/redirects?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setRedirects((prev) => prev.filter((r) => r.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className={styles.container}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "24px" }}>
        <Repeat size={28} color="#0f172a" />
        <div>
          <h1 className={styles.title} style={{ margin: 0 }}>Redirect Manager (301 Auto Redirects) ⭐⭐⭐⭐⭐</h1>
          <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>
            Atur pengalihan URL (301 Permanent Redirect) agar ranking SEO Google tidak hilang saat URL berubah.
          </p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: "24px", alignItems: "start" }}>
        {/* Add Redirect Form */}
        <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          <h3 style={{ margin: "0 0 16px 0", fontSize: "16px", color: "#0f172a" }}>Tambah 301 Redirect</h3>
          <form onSubmit={handleAdd} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>Source URL (Lama)</label>
              <input
                type="text"
                placeholder="/about-us"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                required
                style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "14px", boxSizing: "border-box" }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>Target URL (Baru)</label>
              <input
                type="text"
                placeholder="/about-trekking-mount-rinjani"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                required
                style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "14px", boxSizing: "border-box" }}
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", padding: "10px", borderRadius: "6px", border: "none", backgroundColor: "#0f172a", color: "#ffffff", fontSize: "14px", fontWeight: 700, cursor: "pointer" }}
            >
              <Plus size={16} />
              <span>{saving ? "Menyimpan..." : "Simpan Redirect"}</span>
            </button>
          </form>
        </div>

        {/* Redirects List */}
        <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          <h3 style={{ margin: "0 0 16px 0", fontSize: "16px", color: "#0f172a" }}>Daftar Redirect Aktif ({redirects.length})</h3>
          {loading ? (
            <div style={{ padding: "30px", textAlign: "center", color: "#64748b" }}>Memuat redirects...</div>
          ) : redirects.length === 0 ? (
            <div style={{ padding: "30px", textAlign: "center", color: "#64748b" }}>Belum ada redirect dikonfigurasi.</div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #e2e8f0", backgroundColor: "#f8fafc", color: "#475569" }}>
                  <th style={{ padding: "10px 12px" }}>Source (Lama)</th>
                  <th style={{ padding: "10px 12px" }}>Status</th>
                  <th style={{ padding: "10px 12px" }}>Target (Baru)</th>
                  <th style={{ padding: "10px 12px", textAlign: "right" }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {redirects.map((r) => (
                  <tr key={r.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "12px", fontWeight: 600, color: "#ef4444" }}>{r.source_url}</td>
                    <td style={{ padding: "12px" }}>
                      <span style={{ padding: "2px 8px", borderRadius: "10px", backgroundColor: "#fef9c3", color: "#854d0e", fontSize: "12px", fontWeight: 700 }}>
                        {r.status_code}
                      </span>
                    </td>
                    <td style={{ padding: "12px", fontWeight: 600, color: "#16a34a" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <ArrowRight size={14} color="#64748b" />
                        <span>{r.target_url}</span>
                      </div>
                    </td>
                    <td style={{ padding: "12px", textAlign: "right" }}>
                      <button
                        type="button"
                        onClick={() => handleDelete(r.id)}
                        style={{ padding: "6px 10px", borderRadius: "6px", border: "1px solid #fecdd3", backgroundColor: "#fff1f2", color: "#e11d48", cursor: "pointer" }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
