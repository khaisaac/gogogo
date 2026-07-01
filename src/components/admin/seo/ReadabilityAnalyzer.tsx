"use client";

import React from "react";
import { BookOpen, CheckCircle, AlertCircle, Info } from "lucide-react";

interface ReadabilityAnalyzerProps {
  content?: string;
}

export default function ReadabilityAnalyzer({ content = "" }: ReadabilityAnalyzerProps) {
  if (!content || content.trim().length < 50) {
    return (
      <div
        style={{
          padding: "16px",
          backgroundColor: "#f8fafc",
          border: "1px dashed #cbd5e1",
          borderRadius: "8px",
          marginTop: "16px",
          textAlign: "center",
          fontSize: "13px",
          color: "#64748b",
        }}
      >
        Tulis minimal 50 karakter pada konten untuk menganalisis keterbacaan (Readability Analyzer ⭐⭐⭐⭐).
      </div>
    );
  }

  // Strip HTML
  const rawText = content.replace(/<[^>]*>?/gm, " ").replace(/\s+/g, " ").trim();
  const words = rawText.split(" ").filter(Boolean);
  const wordCount = words.length;

  // Paragraph check
  const paragraphs = content
    .split(/<\/?p[^>]*>/gi)
    .map((p) => p.replace(/<[^>]*>?/gm, "").trim())
    .filter((p) => p.length > 0);
  const longParagraphs = paragraphs.filter((p) => p.split(" ").length > 150);

  // Sentence check
  const sentences = rawText.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  const longSentences = sentences.filter((s) => s.trim().split(" ").length > 25);
  const longSentenceRatio = sentences.length > 0 ? (longSentences.length / sentences.length) * 100 : 0;

  // Heading check
  const hasHeadings = /<h[2-4][^>]*>/i.test(content);

  // List check
  const hasList = /<(ul|ol)[^>]*>/i.test(content);

  const items = [
    {
      label: "Easy to Read (Panjang Kalimat)",
      passed: longSentenceRatio <= 25,
      text: longSentenceRatio <= 25
        ? "✓ Easy to Read — Panjang kalimat sangat baik dan mudah dicerna pembaca."
        : `⚠ Sentence too long — ${Math.round(longSentenceRatio)}% kalimat terlalu panjang (> 25 kata). Disarankan dipecah.`,
    },
    {
      label: "Good Paragraph (Panjang Paragraf)",
      passed: longParagraphs.length === 0,
      text: longParagraphs.length === 0
        ? "✓ Good Paragraph — Semua paragraf ringkas (< 150 kata per paragraf)."
        : `⚠ Paragraph too long — Terdapat ${longParagraphs.length} paragraf yang terlalu panjang.`,
    },
    {
      label: "Subheadings Structure (H2 / H3)",
      passed: hasHeadings || wordCount < 300,
      text: hasHeadings || wordCount < 300
        ? "✓ Subheadings terdistribusi dengan baik untuk memecah blok teks."
        : "⚠ Disarankan menambahkan heading H2 atau H3 untuk membagi artikel panjang.",
    },
    {
      label: "Bullet / Numbered Lists",
      passed: hasList,
      text: hasList
        ? "✓ Terdapat poin daftar (bullet list) sehingga mata pembaca tidak lelah."
        : "ℹ Pertimbangkan menambahkan bullet list untuk merangkum poin penting.",
    },
  ];

  const passedCount = items.filter((i) => i.passed).length;
  const score = Math.round((passedCount / items.length) * 100);

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
          <BookOpen size={20} color="#0f172a" />
          <h4 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "#0f172a" }}>
            Readability Analyzer (Yoast Style) ⭐⭐⭐⭐
          </h4>
        </div>

        <div
          style={{
            padding: "4px 14px",
            borderRadius: "14px",
            backgroundColor: score >= 75 ? "#f0fdf4" : score >= 50 ? "#fefce8" : "#fef2f2",
            color: score >= 75 ? "#166534" : score >= 50 ? "#854d0e" : "#991b1b",
            fontWeight: 800,
            fontSize: "14px",
          }}
        >
          Score: {score}/100
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {items.map((item, idx) => (
          <div key={idx} style={{ display: "flex", alignItems: "flex-start", gap: "10px", fontSize: "13px" }}>
            {item.passed ? (
              <CheckCircle size={16} color="#16a34a" style={{ flexShrink: 0, marginTop: "2px" }} />
            ) : item.text.startsWith("⚠") ? (
              <AlertCircle size={16} color="#e11d48" style={{ flexShrink: 0, marginTop: "2px" }} />
            ) : (
              <Info size={16} color="#3b82f6" style={{ flexShrink: 0, marginTop: "2px" }} />
            )}
            <span style={{ color: item.passed ? "#1e293b" : item.text.startsWith("⚠") ? "#991b1b" : "#334155", fontWeight: item.passed ? 500 : 600 }}>
              {item.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
