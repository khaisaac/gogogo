"use client";

import React, { useEffect, useState } from "react";
import { Layers, Save, CheckCircle2, Search } from "lucide-react";
import styles from "../../admin.module.css";

export default function BulkSeoEditorPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/seo/bulk");
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (index: number, field: "seo_title" | "meta_description", val: string) => {
    const updated = [...items];
    updated[index][field] = val;
    setItems(updated);
  };

  const handleSaveAll = async () => {
    setSaving(true);
    setSaveSuccess(false);
    try {
      const res = await fetch("/api/admin/seo/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });
      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        alert("Gagal menyimpan pembaruan massal");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const filteredItems = items.filter((it) =>
    it.title.toLowerCase().includes(search.toLowerCase()) || it.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={styles.container}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Layers size={28} color="#0f172a" />
          <div>
            <h1 className={styles.title} style={{ margin: 0 }}>Bulk SEO Editor ⭐⭐⭐⭐⭐</h1>
            <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>
              Edit massal Title & Description seluruh halaman dan artikel langsung dalam satu tampilan layar tanpa membuka satu per satu.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSaveAll}
          disabled={saving || loading}
          style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 20px", borderRadius: "8px", border: "none", backgroundColor: "#0f172a", color: "#ffffff", fontSize: "14px", fontWeight: 700, cursor: "pointer", boxShadow: "0 2px 6px rgba(15,23,42,0.15)" }}
        >
          <Save size={18} />
          <span>{saving ? "Menyimpan Massal..." : "Simpan Semua Perubahan"}</span>
        </button>
      </div>

      {saveSuccess && (
        <div style={{ marginBottom: "20px", padding: "12px 16px", borderRadius: "8px", backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", color: "#166534", fontWeight: 700, display: "flex", alignItems: "center", gap: "8px" }}>
          <CheckCircle2 size={18} />
          <span>✓ Seluruh perubahan metadata SEO berhasil disimpan!</span>
        </div>
      )}

      {/* Search Filter */}
      <div style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", backgroundColor: "#ffffff", borderRadius: "8px", border: "1px solid #cbd5e1" }}>
        <Search size={18} color="#64748b" />
        <input
          type="text"
          placeholder="Cari berdasarkan judul halaman atau slug..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ border: "none", outline: "none", width: "100%", fontSize: "14px", color: "#0f172a" }}
        />
      </div>

      <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "10px", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>Memuat tabel editor massal...</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #e2e8f0", backgroundColor: "#f8fafc", color: "#475569" }}>
                <th style={{ padding: "12px 14px", width: "220px" }}>Page / Post Name</th>
                <th style={{ padding: "12px 14px" }}>SEO Title (Maks 60 Karakter)</th>
                <th style={{ padding: "12px 14px" }}>Meta Description (Maks 160 Karakter)</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => {
                const actualIdx = items.findIndex((it) => it.id === item.id);
                return (
                  <tr key={item.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "12px 14px", verticalAlign: "top" }}>
                      <div style={{ fontWeight: 700, color: "#0f172a", marginBottom: "4px" }}>{item.title}</div>
                      <div style={{ fontSize: "11px", color: "#64748b", fontFamily: "monospace" }}>{item.slug}</div>
                      <span style={{ display: "inline-block", marginTop: "6px", padding: "2px 6px", borderRadius: "4px", backgroundColor: item.type === "page" ? "#eff6ff" : "#f5f3ff", color: item.type === "page" ? "#2563eb" : "#7c3aed", fontSize: "10px", fontWeight: 700, textTransform: "uppercase" }}>
                        {item.type}
                      </span>
                    </td>
                    <td style={{ padding: "12px 14px", verticalAlign: "top" }}>
                      <input
                        type="text"
                        placeholder="Masukkan SEO Title..."
                        value={item.seo_title}
                        onChange={(e) => handleFieldChange(actualIdx, "seo_title", e.target.value)}
                        style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px", boxSizing: "border-box" }}
                      />
                      <div style={{ marginTop: "4px", fontSize: "11px", color: item.seo_title.length > 60 ? "#dc2626" : "#64748b", fontWeight: item.seo_title.length > 60 ? 700 : 400 }}>
                        {item.seo_title.length} / 60 karakter
                      </div>
                    </td>
                    <td style={{ padding: "12px 14px", verticalAlign: "top" }}>
                      <textarea
                        rows={2}
                        placeholder="Masukkan Meta Description..."
                        value={item.meta_description}
                        onChange={(e) => handleFieldChange(actualIdx, "meta_description", e.target.value)}
                        style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px", resize: "vertical", boxSizing: "border-box" }}
                      />
                      <div style={{ marginTop: "4px", fontSize: "11px", color: item.meta_description.length > 160 ? "#dc2626" : "#64748b", fontWeight: item.meta_description.length > 160 ? 700 : 400 }}>
                        {item.meta_description.length} / 160 karakter
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
