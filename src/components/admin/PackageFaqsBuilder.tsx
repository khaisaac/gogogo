"use client";

import { useState } from "react";

type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

type Props = {
  defaultValue?: any;
};

export default function PackageFaqsBuilder({ defaultValue }: Props) {
  const [faqs, setFaqs] = useState<FaqItem[]>(() => {
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
    setFaqs((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).substring(2, 9),
        question: "",
        answer: "",
      },
    ]);
  };

  const handleRemove = (id: string) => {
    setFaqs((prev) => prev.filter((item) => item.id !== id));
  };

  const handleChange = (
    id: string,
    field: "question" | "answer",
    value: string,
  ) => {
    setFaqs((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    );
  };

  return (
    <div
      style={{
        border: "1px solid #cbd5e1",
        borderRadius: "12px",
        padding: "16px",
        background: "#f8fafc",
        display: "grid",
        gap: "16px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <h3
            style={{
              margin: 0,
              fontSize: "1rem",
              fontWeight: 700,
              color: "#1e293b",
            }}
          >
            FAQ Dropdown Dinamis (Pertanyaan & Jawaban)
          </h3>
          <p
            style={{ margin: "4px 0 0", fontSize: "0.8rem", color: "#64748b" }}
          >
            Muncul sebelum &quot;Related Tour&quot; di halaman publik. Jika
            dikosongkan, sistem akan otomatis menampilkan FAQ default Rinjani.
          </p>
        </div>
        <button
          type="button"
          onClick={handleAdd}
          style={{
            padding: "8px 14px",
            background: "#2563eb",
            color: "#fff",
            fontWeight: 700,
            fontSize: "0.82rem",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          + Tambah FAQ ({faqs.length})
        </button>
      </div>

      {faqs.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "24px",
            border: "1px dashed #cbd5e1",
            borderRadius: "8px",
            background: "#fff",
            color: "#94a3b8",
            fontSize: "0.88rem",
          }}
        >
          Belum ada custom FAQ. Klik tombol &quot;+ Tambah FAQ&quot; di atas
          untuk menambahkan.
        </div>
      ) : (
        <div style={{ display: "grid", gap: "16px" }}>
          {faqs.map((item, idx) => (
            <div
              key={item.id}
              style={{
                border: "1px solid #e2e8f0",
                borderRadius: "10px",
                padding: "16px",
                background: "#ffffff",
                display: "grid",
                gap: "12px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  borderBottom: "1px solid #f1f5f9",
                  paddingBottom: "8px",
                }}
              >
                <span
                  style={{
                    fontWeight: 700,
                    color: "#334155",
                    fontSize: "0.9rem",
                  }}
                >
                  FAQ #{idx + 1}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemove(item.id)}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#ef4444",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    cursor: "pointer",
                  }}
                  title="Hapus FAQ"
                >
                  ✕ Hapus
                </button>
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.82rem",
                    fontWeight: 700,
                    color: "#475569",
                    marginBottom: "4px",
                  }}
                >
                  Pertanyaan (Question)
                </label>
                <input
                  type="text"
                  value={item.question}
                  onChange={(e) =>
                    handleChange(item.id, "question", e.target.value)
                  }
                  placeholder="cth: Apakah pemula bisa mendaki Rinjani?"
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    border: "1px solid #cbd5e1",
                    borderRadius: "6px",
                    fontSize: "0.88rem",
                    color: "#0f172a",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.82rem",
                    fontWeight: 700,
                    color: "#475569",
                    marginBottom: "4px",
                  }}
                >
                  Jawaban (Answer)
                </label>
                <textarea
                  value={item.answer}
                  onChange={(e) =>
                    handleChange(item.id, "answer", e.target.value)
                  }
                  placeholder="cth: Ya, mendaki Rinjani bisa dilakukan oleh pemula dengan kondisi fisik sehat dan mental kuat..."
                  style={{
                    width: "100%",
                    minHeight: "80px",
                    padding: "8px 12px",
                    border: "1px solid #cbd5e1",
                    borderRadius: "6px",
                    fontSize: "0.88rem",
                    color: "#0f172a",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      <input type="hidden" name="package_faqs" value={JSON.stringify(faqs)} />
    </div>
  );
}
