"use client";

import React from "react";
import { Globe } from "lucide-react";

interface GoogleSnippetPreviewProps {
  title: string;
  url: string;
  description: string;
}

export default function GoogleSnippetPreview({
  title,
  url,
  description,
}: GoogleSnippetPreviewProps) {
  const displayTitle = title.trim() || "Page Title | Trekking Mount Rinjani";
  const displayUrl = url.trim() || "https://trekkingmountrinjani.com";
  const displayDesc =
    description.trim() ||
    "Learn more about Trekking Mount Rinjani, official licensed local trekking operator in Lombok Indonesia offering premier packages...";

  // Format breadcrumb url
  let formattedUrl = displayUrl.replace(/^https?:\/\//, "");
  formattedUrl = formattedUrl.replace(/\/$/, "");
  const parts = formattedUrl.split("/");
  const domain = parts[0];
  const breadcrumb = parts.slice(1).join(" › ");

  return (
    <div
      style={{
        backgroundColor: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "8px",
        padding: "16px",
        fontFamily: "Arial, sans-serif",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        maxWidth: "600px",
      }}
    >
      <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "8px", fontWeight: 600, display: "flex", alignItems: "center", gap: "6px" }}>
        <span>⭐ Google Search Preview (Desktop / Mobile)</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
        <div
          style={{
            width: "28px",
            height: "28px",
            borderRadius: "50%",
            backgroundColor: "#f1f5f9",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Globe size={16} color="#475569" />
        </div>
        <div style={{ overflow: "hidden" }}>
          <div style={{ fontSize: "14px", color: "#202124", lineHeight: 1.3 }}>
            Trekking Mount Rinjani
          </div>
          <div style={{ fontSize: "12px", color: "#4d5156", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {domain} {breadcrumb ? `› ${breadcrumb}` : ""}
          </div>
        </div>
      </div>
      <div
        style={{
          fontSize: "20px",
          color: "#1a0dab",
          lineHeight: 1.3,
          cursor: "pointer",
          marginBottom: "3px",
          wordBreak: "break-word",
        }}
      >
        {displayTitle}
      </div>
      <div
        style={{
          fontSize: "14px",
          color: "#4d5156",
          lineHeight: 1.58,
          wordBreak: "break-word",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {displayDesc}
      </div>
    </div>
  );
}
