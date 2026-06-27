"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

type OptionItem = {
  id: string;
  title: string;
  content: string;
};

type Props = {
  defaultValue?: any;
};

export default function PackageOptionsBuilder({ defaultValue }: Props) {
  const [options, setOptions] = useState<OptionItem[]>(() => {
    if (Array.isArray(defaultValue)) {
      return defaultValue;
    }
    if (typeof defaultValue === "string" && defaultValue.trim()) {
      try {
        const parsed = JSON.parse(defaultValue);
        if (Array.isArray(parsed)) return parsed;
      } catch {}
    }
    return [];
  });

  const handleAdd = () => {
    if (options.length >= 4) return;
    setOptions((prev) => [
      ...prev,
      { id: Math.random().toString(36).substring(2, 9), title: "", content: "" },
    ]);
  };

  const handleRemove = (id: string) => {
    setOptions((prev) => prev.filter((item) => item.id !== id));
  };

  const handleChange = (id: string, field: "title" | "content", value: string) => {
    setOptions((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
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
          <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "#1e293b" }}>
            Package Options Dropdowns (1-4 Items)
          </h3>
          <p style={{ margin: "4px 0 0", fontSize: "0.8rem", color: "#64748b" }}>
            Muncul opsional setelah &quot;About this activity&quot;. Gunakan Quill untuk ketik keterangan &amp; tambah foto saat ngetik.
          </p>
        </div>
        <button
          type="button"
          onClick={handleAdd}
          disabled={options.length >= 4}
          style={{
            padding: "8px 14px",
            background: options.length >= 4 ? "#94a3b8" : "#2563eb",
            color: "#fff",
            fontWeight: 700,
            fontSize: "0.82rem",
            border: "none",
            borderRadius: "8px",
            cursor: options.length >= 4 ? "not-allowed" : "pointer"
          }}
        >
          + Tambah Option ({options.length}/4)
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
        <div style={{ display: "grid", gap: "16px" }}>
          {options.map((item, idx) => (
            <div key={item.id} style={{
              border: "1px solid #e2e8f0",
              borderRadius: "10px",
              padding: "16px",
              background: "#ffffff",
              display: "grid",
              gap: "12px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.02)"
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #f1f5f9", paddingBottom: "8px" }}>
                <span style={{ fontWeight: 700, color: "#334155", fontSize: "0.9rem" }}>Option #{idx + 1}</span>
                <button
                  type="button"
                  onClick={() => handleRemove(item.id)}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#ef4444",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    cursor: "pointer"
                  }}
                  title="Hapus option"
                >
                  ✕ Hapus
                </button>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#475569", marginBottom: "4px" }}>
                  Judul Dropdown (cth: Private Deluxe Package)
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
            </div>
          ))}
        </div>
      )}

      <input type="hidden" name="package_options" value={JSON.stringify(options)} />
    </div>
  );
}
