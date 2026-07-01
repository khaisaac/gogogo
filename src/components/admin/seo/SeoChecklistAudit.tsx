"use client";

import React from "react";
import { Check, AlertTriangle, ShieldCheck } from "lucide-react";

interface SeoChecklistAuditProps {
  title?: string;
  description?: string;
  canonicalUrl?: string;
  robots?: string;
  ogImage?: string;
  twitterCard?: string;
  h1?: string;
  hasAltImage?: boolean;
  hasSitemap?: boolean;
  hasSchema?: boolean;
}

export default function SeoChecklistAudit({
  title = "",
  description = "",
  canonicalUrl = "",
  robots = "index, follow",
  ogImage = "",
  twitterCard = "",
  h1 = "",
  hasAltImage = true,
  hasSitemap = true,
  hasSchema = true,
}: SeoChecklistAuditProps) {
  const checks = [
    { label: "SEO Title", passed: title.length >= 10 && title.length <= 65, hint: title ? `${title.length} karakter` : "Kosong" },
    { label: "Meta Description", passed: description.length >= 80 && description.length <= 165, hint: description ? `${description.length} karakter` : "Kosong" },
    { label: "Canonical URL", passed: Boolean(canonicalUrl || title), hint: canonicalUrl ? "Dikonfigurasi" : "Default Auto" },
    { label: "Robots Indexing", passed: !robots.includes("noindex"), hint: robots },
    { label: "OG Image (Facebook)", passed: Boolean(ogImage), hint: ogImage ? "Tersedia" : "Gunakan fallback" },
    { label: "Twitter Card", passed: Boolean(twitterCard || ogImage), hint: twitterCard || ogImage ? "Summary Large Image" : "Kosong" },
    { label: "H1 Tag Utama", passed: Boolean(h1 || title), hint: h1 || title ? "Tersedia" : "Hilang" },
    { label: "Alt Image Attribute", passed: hasAltImage, hint: hasAltImage ? "Semua gambar memiliki Alt" : "Ada gambar tanpa Alt" },
    { label: "Sitemap Registration", passed: hasSitemap, hint: hasSitemap ? "Terindeks di /sitemap.xml" : "Belum didaftarkan" },
    { label: "JSON-LD Schema", passed: hasSchema, hint: hasSchema ? "Schema terpasang" : "Belum dipasang" },
  ];

  const passedCount = checks.filter((c) => c.passed).length;
  const overallScore = Math.round((passedCount / checks.length) * 100);

  return (
    <div
      style={{
        padding: "18px",
        backgroundColor: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "10px",
        marginTop: "16px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px", paddingBottom: "10px", borderBottom: "1px solid #f1f5f9" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <ShieldCheck size={20} color="#0f172a" />
          <h4 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "#0f172a" }}>
            Comprehensive SEO Checklist ⭐⭐⭐⭐⭐
          </h4>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "4px 14px",
            borderRadius: "14px",
            backgroundColor: overallScore >= 80 ? "#f0fdf4" : overallScore >= 60 ? "#fefce8" : "#fef2f2",
            color: overallScore >= 80 ? "#166534" : overallScore >= 60 ? "#854d0e" : "#991b1b",
            fontWeight: 800,
            fontSize: "14px",
          }}
        >
          <span>Overall: {overallScore}/100</span>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px" }}>
        {checks.map((c, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "8px 10px",
              backgroundColor: c.passed ? "#f8fafc" : "#fff1f2",
              borderRadius: "6px",
              border: `1px solid ${c.passed ? "#e2e8f0" : "#fecdd3"}`,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              {c.passed ? (
                <Check size={16} color="#16a34a" />
              ) : (
                <AlertTriangle size={16} color="#e11d48" />
              )}
              <span style={{ fontSize: "13px", fontWeight: c.passed ? 600 : 700, color: c.passed ? "#1e293b" : "#991b1b" }}>
                {c.label}
              </span>
            </div>
            <span style={{ fontSize: "11px", color: c.passed ? "#64748b" : "#e11d48" }}>{c.hint}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
