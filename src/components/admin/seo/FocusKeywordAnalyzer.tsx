"use client";

import React from "react";
import { CheckCircle2, XCircle, Target, Award } from "lucide-react";

interface FocusKeywordAnalyzerProps {
  focusKeyword: string;
  title?: string;
  description?: string;
  url?: string;
  h1?: string;
  content?: string;
}

export default function FocusKeywordAnalyzer({
  focusKeyword,
  title = "",
  description = "",
  url = "",
  h1 = "",
  content = "",
}: FocusKeywordAnalyzerProps) {
  const kw = (focusKeyword || "").toLowerCase().trim();

  if (!kw) {
    return (
      <div
        style={{
          padding: "16px",
          backgroundColor: "#f8fafc",
          border: "1px dashed #cbd5e1",
          borderRadius: "8px",
          marginTop: "16px",
          textAlign: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", color: "#64748b", fontWeight: 600 }}>
          <Target size={18} />
          <span>Masukkan Focus Keyword untuk melihat checklist analisis otomatis ⭐⭐⭐⭐⭐</span>
        </div>
      </div>
    );
  }

  const cleanContent = content.replace(/<[^>]*>?/gm, " ").toLowerCase();

  const checks = [
    { label: "Keyword ada di SEO Title", passed: title.toLowerCase().includes(kw) },
    { label: "Keyword ada di Meta Description", passed: description.toLowerCase().includes(kw) },
    { label: "Keyword ada di URL Slug", passed: url.toLowerCase().includes(kw) },
    { label: "Keyword ada di H1 / Judul Utama", passed: (h1 || title).toLowerCase().includes(kw) },
    { label: "Keyword muncul pada isi artikel (Content)", passed: cleanContent.includes(kw) },
  ];

  const score = checks.filter((c) => c.passed).length;
  const isPerfect = score === 5;

  return (
    <div
      style={{
        padding: "18px",
        backgroundColor: "#ffffff",
        border: `1px solid ${isPerfect ? "#22c55e" : "#e2e8f0"}`,
        borderRadius: "10px",
        marginTop: "16px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px", paddingBottom: "10px", borderBottom: "1px solid #f1f5f9" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Target size={20} color="#0f172a" />
          <h4 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "#0f172a" }}>
            Focus Keyword Analyzer
          </h4>
          <span style={{ padding: "2px 8px", backgroundColor: "#f1f5f9", borderRadius: "12px", fontSize: "12px", fontWeight: 600, color: "#475569" }}>
            "{focusKeyword}"
          </span>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "4px 12px",
            borderRadius: "14px",
            backgroundColor: isPerfect ? "#f0fdf4" : score >= 3 ? "#fefce8" : "#fef2f2",
            color: isPerfect ? "#166534" : score >= 3 ? "#854d0e" : "#991b1b",
            fontWeight: 700,
            fontSize: "13px",
          }}
        >
          <Award size={16} />
          <span>Score: {score}/5</span>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "10px" }}>
        {checks.map((check, idx) => (
          <div
            key={idx}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              fontSize: "13px",
              color: check.passed ? "#166534" : "#64748b",
            }}
          >
            {check.passed ? (
              <CheckCircle2 size={16} color="#22c55e" style={{ flexShrink: 0 }} />
            ) : (
              <XCircle size={16} color="#ef4444" style={{ flexShrink: 0 }} />
            )}
            <span style={{ fontWeight: check.passed ? 600 : 400 }}>{check.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
