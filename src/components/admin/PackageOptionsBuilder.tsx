"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";
import { GROUP_TIER_OPTIONS, TOTAL_DAY_OPTIONS } from "@/lib/pricing";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

type OptionItem = {
  id: string;
  title: string;
  content: string;
  include?: string;
  exclude?: string;
  pricing?: {
    price_1pax?: number | string | null;
    price_2_3pax?: number | string | null;
    price_4_5pax?: number | string | null;
    price_6_8pax?: number | string | null;
    price_9_10pax?: number | string | null;
    total_2_days?: number | string | null;
    total_3_days?: number | string | null;
  };
};

type Props = {
  defaultValue?: any;
  packageData?: any;
};

export default function PackageOptionsBuilder({ defaultValue, packageData }: Props) {
  const [options, setOptions] = useState<OptionItem[]>(() => {
    let initial: any[] = [];
    if (Array.isArray(defaultValue)) {
      initial = defaultValue;
    } else if (typeof defaultValue === "string" && defaultValue.trim()) {
      try {
        const parsed = JSON.parse(defaultValue);
        if (Array.isArray(parsed)) initial = parsed;
      } catch {}
    }

    if (initial.length === 0 && packageData) {
      const p1 = packageData.private_price_1pax ?? packageData.price_1pax;
      const s1 = packageData.standard_price_1pax;
      if (p1 || packageData.private_total_2_days || s1 || packageData.standard_total_2_days) {
        if (p1 || packageData.private_total_2_days || !s1) {
          initial.push({
            id: "private",
            title: "Private",
            content: "",
            pricing: {
              price_1pax: p1 ?? "",
              price_2_3pax: packageData.private_price_2pax ?? packageData.price_2_3pax ?? "",
              price_4_5pax: packageData.private_price_4pax ?? packageData.price_4_5pax ?? "",
              price_6_8pax: packageData.private_price_6pax ?? packageData.price_6plus ?? "",
              price_9_10pax: packageData.private_price_9pax ?? packageData.price_6plus ?? "",
              total_2_days: packageData.private_total_2_days ?? "",
              total_3_days: packageData.private_total_3_days ?? "",
            },
          });
        }
        if (s1 || packageData.standard_total_2_days) {
          initial.push({
            id: "standard",
            title: "Standard",
            content: "",
            pricing: {
              price_1pax: s1 ?? "",
              price_2_3pax: packageData.standard_price_2pax ?? "",
              price_4_5pax: packageData.standard_price_4pax ?? "",
              price_6_8pax: packageData.standard_price_6pax ?? "",
              price_9_10pax: packageData.standard_price_9pax ?? "",
              total_2_days: packageData.standard_total_2_days ?? "",
              total_3_days: packageData.standard_total_3_days ?? "",
            },
          });
        }
      }
    }

    if (initial.length === 0 && !packageData) {
      initial = [
        { id: "private", title: "Private", content: "", pricing: {} },
        { id: "standard", label: "Standard", title: "Standard", content: "", pricing: {} },
      ];
    }

    return initial.map((item, idx) => ({
      ...item,
      id: item.id || item.title?.toLowerCase().trim().replace(/[^a-z0-9]+/g, "_") || `option_${idx}`,
      pricing: item.pricing || {},
    }));
  });

  const handleAdd = () => {
    if (options.length >= 6) return;
    setOptions((prev) => [
      ...prev,
      { id: Math.random().toString(36).substring(2, 9), title: "", content: "", include: "", exclude: "", pricing: {} },
    ]);
  };

  const handleRemove = (id: string) => {
    setOptions((prev) => prev.filter((item) => item.id !== id));
  };

  const handleChange = (id: string, field: "title" | "content" | "include" | "exclude", value: string) => {
    setOptions((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    );
  };

  const handlePricingChange = (id: string, fieldKey: string, val: string) => {
    const numVal = val === "" ? null : Number(val);
    setOptions((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            pricing: {
              ...(item.pricing || {}),
              [fieldKey]: numVal !== null && !isNaN(numVal) ? numVal : val === "" ? null : val,
            },
          };
        }
        return item;
      }),
    );
  };

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link", "image"],
      ["clean"],
    ],
  };

  return (
    <div style={{
      border: "1px solid #cbd5e1",
      borderRadius: "12px",
      padding: "16px",
      background: "#f8fafc",
      display: "grid",
      gap: "16px"
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
        <div>
          <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 700, color: "#1e293b" }}>
            Package Options &amp; Pricing Matrix
          </h3>
          <p style={{ margin: "4px 0 0", fontSize: "0.82rem", color: "#64748b" }}>
            Satu input terpadu untuk opsi paket beserta harga dinamisnya. Sekali input otomatis muncul dinamis di tampilan depan!
          </p>
        </div>
        <button
          type="button"
          onClick={handleAdd}
          disabled={options.length >= 6}
          style={{
            padding: "8px 14px",
            background: options.length >= 6 ? "#94a3b8" : "#2563eb",
            color: "#fff",
            fontWeight: 700,
            fontSize: "0.82rem",
            border: "none",
            borderRadius: "8px",
            cursor: options.length >= 6 ? "not-allowed" : "pointer"
          }}
        >
          + Tambah Option ({options.length}/6)
        </button>
      </div>

      {options.length === 0 ? (
        <div style={{
          textAlign: "center",
          padding: "24px",
          border: "1px dashed #cbd5e1",
          borderRadius: "8px",
          background: "#fff",
          color: "#94a3b8",
          fontSize: "0.88rem"
        }}>
          Belum ada Package Option. Klik tombol &quot;+ Tambah Option&quot; di atas.
        </div>
      ) : (
        <div style={{ display: "grid", gap: "22px" }}>
          {options.map((item, idx) => {
            const themes = [
              { border: "#10b981", headerBg: "#ecfdf5", titleColor: "#065f46", badge: "#059669" },
              { border: "#3b82f6", headerBg: "#eff6ff", titleColor: "#1e40af", badge: "#2563eb" },
              { border: "#f59e0b", headerBg: "#fffbeb", titleColor: "#92400e", badge: "#d97706" },
              { border: "#8b5cf6", headerBg: "#f5f3ff", titleColor: "#5b21b6", badge: "#7c3aed" },
            ];
            const theme = themes[idx % themes.length];
            return (
            <div key={item.id} style={{
              border: `2px solid ${theme.border}`,
              borderRadius: "12px",
              overflow: "hidden",
              background: "#ffffff",
              display: "grid",
              gap: "14px",
              boxShadow: `0 4px 12px ${theme.border}20`
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: theme.headerBg, padding: "12px 18px", borderBottom: `1px solid ${theme.border}40` }}>
                <span style={{ fontWeight: 700, color: theme.titleColor, fontSize: "1rem", display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ background: theme.badge, color: "#fff", padding: "2px 8px", borderRadius: "12px", fontSize: "0.78rem" }}>#{idx + 1}</span>
                  {item.title || "Untitled Option"}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemove(item.id)}
                  style={{
                    background: "#fee2e2",
                    border: "1px solid #fca5a5",
                    padding: "4px 10px",
                    borderRadius: "6px",
                    color: "#ef4444",
                    fontWeight: 700,
                    fontSize: "0.8rem",
                    cursor: "pointer"
                  }}
                  title="Hapus option"
                >
                  ✕ Hapus
                </button>
              </div>
              <div style={{ padding: "0 18px 18px", display: "grid", gap: "14px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#475569", marginBottom: "4px" }}>
                  Judul Dropdown (cth: Private Deluxe Package / Sharing Group)
                </label>
                <input
                  type="text"
                  value={item.title}
                  onChange={(e) => handleChange(item.id, "title", e.target.value)}
                  placeholder="Masukkan judul opsi paket..."
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    border: "1px solid #cbd5e1",
                    borderRadius: "6px",
                    fontSize: "0.88rem",
                    color: "#0f172a",
                    boxSizing: "border-box"
                  }}
                />
              </div>

              <div style={{ padding: "14px", background: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                <h4 style={{ margin: "0 0 4px", fontSize: "0.85rem", fontWeight: 700, color: "#0f172a" }}>
                  💰 Pricing Matrix (USD) untuk &quot;{item.title || `Option #${idx+1}`}&quot;
                </h4>
                <p style={{ margin: "0 0 12px", fontSize: "0.78rem", color: "#64748b" }}>
                  Harga per person atau total paket akan dinamis berubah di tampilan depan saat opsi ini dipilih.
                </p>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "10px", marginBottom: "12px" }}>
                  {GROUP_TIER_OPTIONS.map((tier) => {
                    const fieldKey = tier.key === "1" ? "price_1pax" : tier.key === "2_3" ? "price_2_3pax" : tier.key === "4_5" ? "price_4_5pax" : tier.key === "6_8" ? "price_6_8pax" : "price_9_10pax";
                    return (
                      <div key={fieldKey}>
                        <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#334155", marginBottom: "4px" }}>
                          {tier.label}
                        </label>
                        <input
                          type="number"
                          min={0}
                          value={item.pricing?.[fieldKey as keyof typeof item.pricing] ?? ""}
                          onChange={(e) => handlePricingChange(item.id, fieldKey, e.target.value)}
                          placeholder="USD"
                          style={{
                            width: "100%",
                            padding: "6px 10px",
                            border: "1px solid #cbd5e1",
                            borderRadius: "6px",
                            fontSize: "0.85rem",
                            background: "#fff",
                            boxSizing: "border-box"
                          }}
                        />
                      </div>
                    );
                  })}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "10px", borderTop: "1px dashed #cbd5e1", paddingTop: "10px" }}>
                  {TOTAL_DAY_OPTIONS.map((days) => {
                    const fieldKey = `total_${days}_days`;
                    return (
                      <div key={fieldKey}>
                        <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#334155", marginBottom: "4px" }}>
                          Total {days} Days Package
                        </label>
                        <input
                          type="number"
                          min={0}
                          value={item.pricing?.[fieldKey as keyof typeof item.pricing] ?? ""}
                          onChange={(e) => handlePricingChange(item.id, fieldKey, e.target.value)}
                          placeholder="Total USD"
                          style={{
                            width: "100%",
                            padding: "6px 10px",
                            border: "1px solid #cbd5e1",
                            borderRadius: "6px",
                            fontSize: "0.85rem",
                            background: "#fff",
                            boxSizing: "border-box"
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#475569", marginBottom: "4px" }}>
                  Keterangan &amp; Foto (Rich Text Quill)
                </label>
                <div style={{ background: "#fff", color: "#000" }}>
                  <ReactQuill
                    theme="snow"
                    value={item.content}
                    onChange={(val) => handleChange(item.id, "content", val)}
                    modules={modules}
                    placeholder="Ketik keterangan paket, fasilitas, dan klik ikon foto untuk upload gambar..."
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "12px", marginTop: "4px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#0e6d39", marginBottom: "4px" }}>
                    ✓ Include (1 baris per item)
                  </label>
                  <textarea
                    value={item.include || ""}
                    onChange={(e) => handleChange(item.id, "include", e.target.value)}
                    placeholder={"Guide berlisensi\nMakan selama trekking\nTenda & sleeping bag"}
                    style={{
                      width: "100%",
                      minHeight: "80px",
                      padding: "8px 12px",
                      border: "1px solid #86efac",
                      borderRadius: "6px",
                      fontSize: "0.85rem",
                      color: "#0f172a",
                      background: "#f0fdf4",
                      boxSizing: "border-box"
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#8a1f1f", marginBottom: "4px" }}>
                    ✕ Exclude (1 baris per item)
                  </label>
                  <textarea
                    value={item.exclude || ""}
                    onChange={(e) => handleChange(item.id, "exclude", e.target.value)}
                    placeholder={"Tiket pesawat\nAsuransi pribadi\nTip guide"}
                    style={{
                      width: "100%",
                      minHeight: "80px",
                      padding: "8px 12px",
                      border: "1px solid #fca5a5",
                      borderRadius: "6px",
                      fontSize: "0.85rem",
                      color: "#0f172a",
                      background: "#fef2f2",
                      boxSizing: "border-box"
                    }}
                  />
                </div>
              </div>
              </div>
            </div>
            );
          })}
        </div>
      )}

      <input type="hidden" name="package_options" value={JSON.stringify(options)} />
    </div>
  );
}
