"use client";

import React from "react";
import { CheckCircle2, AlertTriangle, XCircle, Award } from "lucide-react";

interface SeoScoreAnalyzerProps {
  seoTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  ogImage?: string;
  twitterImage?: string;
  robots?: string;
}

export default function SeoScoreAnalyzer({
  seoTitle = "",
  metaDescription = "",
  canonicalUrl = "",
  ogImage = "",
  twitterImage = "",
  robots = "index, follow",
}: SeoScoreAnalyzerProps) {
  const checks = [];
  let score = 0;

  // Check 1: SEO Title
  const titleLen = seoTitle.trim().length;
  if (titleLen > 0) {
    if (titleLen <= 60 && titleLen >= 20) {
      checks.push({ status: "success", text: `SEO Title tersedia dan berukuran optimal (${titleLen} karakter)` });
      score += 25;
    } else if (titleLen > 60) {
      checks.push({ status: "warning", text: `SEO Title terlalu panjang (${titleLen} karakter > batas optimal 60)` });
      score += 15;
    } else {
      checks.push({ status: "warning", text: `SEO Title terlalu pendek (${titleLen} karakter < 20)` });
      score += 15;
    }
  } else {
    checks.push({ status: "error", text: "SEO Title belum diisi (akan menggunakan fallback default)" });
  }

  // Check 2: Meta Description
  const descLen = metaDescription.trim().length;
  if (descLen > 0) {
    if (descLen >= 120 && descLen <= 160) {
      checks.push({ status: "success", text: `Meta Description ideal (${descLen} karakter)` });
      score += 25;
    } else if (descLen > 160) {
      checks.push({ status: "warning", text: `Meta Description terlalu panjang (${descLen} karakter > 160)` });
      score += 15;
    } else {
      checks.push({ status: "warning", text: `Meta Description cukup singkat (${descLen} karakter < 120)` });
      score += 15;
    }
  } else {
    checks.push({ status: "error", text: "Meta Description belum diisi" });
  }

  // Check 3: Canonical URL
  if (canonicalUrl.trim().length > 0) {
    checks.push({ status: "success", text: "Canonical URL tersedia" });
    score += 15;
  } else {
    checks.push({ status: "warning", text: "Canonical URL kosong (akan menggunakan URL default halaman)" });
    score += 10;
  }

  // Check 4: Open Graph & Twitter Image
  if (ogImage.trim().length > 0 || twitterImage.trim().length > 0) {
    checks.push({ status: "success", text: "Open Graph / Social Image tersedia" });
    score += 20;
  } else {
    checks.push({ status: "warning", text: "Open Graph Image kosong (akan menggunakan banner hero default)" });
    score += 10;
  }

  // Check 5: Robots
  if (robots.toLowerCase().includes("index")) {
    checks.push({ status: "success", text: `Robots diatur untuk pengindeksan (${robots})` });
    score += 15;
  } else {
    checks.push({ status: "warning", text: `Robots diatur non-indeks (${robots})` });
    score += 5;
  }

  return (
    <div
      style={{
        backgroundColor: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "8px",
        padding: "18px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px", paddingBottom: "12px", borderBottom: "1px solid #f1f5f9" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Award size={20} color="#0f172a" />
          <h4 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#0f172a" }}>SEO Score Analyzer ⭐</h4>
        </div>
        <div
          style={{
            padding: "6px 14px",
            borderRadius: "20px",
            backgroundColor: score >= 85 ? "#f0fdf4" : score >= 60 ? "#fefce8" : "#fef2f2",
            color: score >= 85 ? "#166534" : score >= 60 ? "#854d0e" : "#991b1b",
            fontWeight: 800,
            fontSize: "16px",
            border: `1px solid ${score >= 85 ? "#bbf7d0" : score >= 60 ? "#fde047" : "#fecaca"}`,
          }}
        >
          Overall Score: {score}/100
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {checks.map((chk, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "14px", color: "#334155" }}>
            {chk.status === "success" && <CheckCircle2 size={18} color="#16a34a" />}
            {chk.status === "warning" && <AlertTriangle size={18} color="#ca8a04" />}
            {chk.status === "error" && <XCircle size={18} color="#dc2626" />}
            <span>{chk.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
