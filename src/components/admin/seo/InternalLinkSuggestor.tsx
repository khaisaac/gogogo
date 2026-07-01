"use client";

import React, { useState } from "react";
import { Link2, Plus, Sparkles } from "lucide-react";

interface InternalLinkSuggestorProps {
  content?: string;
  focusKeyword?: string;
}

const DEFAULT_SUGGESTIONS = [
  { title: "Mount Rinjani Trekking Tips & Preparation", url: "/blog/mount-rinjani-trekking-tips", match: "Mount Rinjani Tips" },
  { title: "Best Time to Climb Mount Rinjani Lombok", url: "/blog/best-time-to-climb-rinjani", match: "Best Time" },
  { title: "Sembalun 2 Days 1 Night Summit Package", url: "/packages/sembalun-2-days-1-night", match: "Summit Package" },
  { title: "Torean Route Scenic Waterfall Adventure", url: "/packages/torean-3-days-2-nights", match: "Torean Route" },
  { title: "E-Rinjani Entrance Ticket Information", url: "/booking-ticket", match: "Entrance Ticket" },
];

export default function InternalLinkSuggestor({ content = "", focusKeyword = "" }: InternalLinkSuggestorProps) {
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const handleCopyHtml = (url: string, anchor: string) => {
    const htmlSnippet = `<a href="${url}" title="${anchor}">${anchor}</a>`;
    navigator.clipboard.writeText(htmlSnippet);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  return (
    <div
      style={{
        padding: "18px",
        backgroundColor: "#f8fafc",
        border: "1px solid #cbd5e1",
        borderRadius: "10px",
        marginTop: "16px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Sparkles size={18} color="#2563eb" />
          <h4 style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "#0f172a" }}>
            Internal Link Suggestions ⭐⭐⭐⭐
          </h4>
        </div>
        <span style={{ fontSize: "11px", color: "#64748b" }}>Klik untuk salin tag HTML &lt;a&gt;</span>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
        {DEFAULT_SUGGESTIONS.map((item, idx) => {
          const isCopied = copiedUrl === item.url;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => handleCopyHtml(item.url, item.match)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 12px",
                borderRadius: "20px",
                border: "1px solid #cbd5e1",
                backgroundColor: isCopied ? "#dcfce7" : "#ffffff",
                color: isCopied ? "#166534" : "#1e293b",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              <Link2 size={13} />
              <span>{isCopied ? "Tersalin!" : `✓ ${item.match}`}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
