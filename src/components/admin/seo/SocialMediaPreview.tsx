"use client";

import React from "react";
import { Share2 } from "lucide-react";

interface SocialMediaPreviewProps {
  title: string;
  description: string;
  image: string;
  url: string;
}

export default function SocialMediaPreview({
  title,
  description,
  image,
  url,
}: SocialMediaPreviewProps) {
  const displayTitle = title.trim() || "Page Title | Trekking Mount Rinjani";
  const displayDesc =
    description.trim() ||
    "Learn more about Trekking Mount Rinjani, official licensed local trekking operator in Lombok Indonesia...";
  const displayImage = image.trim() || "/hero-banner.png";
  const domain = url.replace(/^https?:\/\//, "").split("/")[0] || "trekkingmountrinjani.com";

  return (
    <div
      style={{
        backgroundColor: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "8px",
        overflow: "hidden",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        maxWidth: "500px",
      }}
    >
      <div style={{ padding: "10px 14px", backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0", fontSize: "12px", color: "#64748b", fontWeight: 600, display: "flex", alignItems: "center", gap: "6px" }}>
        <Share2 size={14} />
        <span>⭐ Social Media Open Graph Preview (Facebook / WhatsApp / LinkedIn)</span>
      </div>
      <div
        style={{
          width: "100%",
          height: "240px",
          backgroundColor: "#f1f5f9",
          backgroundImage: `url(${displayImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          borderBottom: "1px solid #e2e8f0",
        }}
      />
      <div style={{ padding: "12px 16px", backgroundColor: "#f8fafc" }}>
        <div style={{ fontSize: "12px", textTransform: "uppercase", color: "#64748b", fontWeight: 600, marginBottom: "4px" }}>
          {domain}
        </div>
        <div
          style={{
            fontSize: "16px",
            fontWeight: 600,
            color: "#0f172a",
            lineHeight: 1.3,
            marginBottom: "6px",
            display: "-webkit-box",
            WebkitLineClamp: 1,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {displayTitle}
        </div>
        <div
          style={{
            fontSize: "13px",
            color: "#475569",
            lineHeight: 1.4,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {displayDesc}
        </div>
      </div>
    </div>
  );
}
