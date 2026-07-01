"use client";

import React, { useState } from "react";
import GoogleSnippetPreview from "./GoogleSnippetPreview";
import SocialMediaPreview from "./SocialMediaPreview";
import SeoScoreAnalyzer from "./SeoScoreAnalyzer";
import FocusKeywordAnalyzer from "./FocusKeywordAnalyzer";
import SeoChecklistAudit from "./SeoChecklistAudit";
import ReadabilityAnalyzer from "./ReadabilityAnalyzer";
import InternalLinkSuggestor from "./InternalLinkSuggestor";
import { Sparkles, Wand2, ShieldCheck, Share2, Globe, FileCode } from "lucide-react";

export interface SeoFormData {
  seo_title: string;
  meta_description: string;
  meta_keywords: string;
  canonical_url: string;
  robots: string;
  og_title: string;
  og_description: string;
  og_image: string;
  twitter_title: string;
  twitter_description: string;
  twitter_image: string;
  focus_keyword?: string;
  schema_type?: string;
  seo_status?: string;
}

interface SeoFormFieldsProps {
  data: SeoFormData;
  onChange: (data: SeoFormData) => void;
  defaultUrl?: string;
  articleContent?: string;
}

export default function SeoFormFields({
  data,
  onChange,
  defaultUrl = "https://trekkingmountrinjani.com",
  articleContent = "",
}: SeoFormFieldsProps) {
  const [activeTab, setActiveTab] = useState<"general" | "social" | "audit" | "preview">("general");
  const [aiGenerating, setAiGenerating] = useState(false);

  const handleChange = (field: keyof SeoFormData, val: string) => {
    onChange({ ...data, [field]: val });
  };

  const handleAutoGenerate = () => {
    setAiGenerating(true);
    setTimeout(() => {
      // Clean content fallback
      const cleanText = articleContent
        ? articleContent.replace(/<[^>]*>?/gm, " ").replace(/\s+/g, " ").trim()
        : "Trekking Mount Rinjani is a premier local trekking agency in Senaru & Sembalun Lombok.";
      
      const autoTitle = data.seo_title || "Trekking Mount Rinjani Package & Guide";
      const autoDesc = data.meta_description || cleanText.substring(0, 155).trim() + "...";
      const autoKw = data.focus_keyword || "mount rinjani trekking";

      onChange({
        ...data,
        seo_title: autoTitle,
        meta_description: autoDesc,
        focus_keyword: autoKw,
        og_title: data.og_title || autoTitle,
        og_description: data.og_description || autoDesc,
        twitter_title: data.twitter_title || autoTitle,
        twitter_description: data.twitter_description || autoDesc,
        schema_type: data.schema_type || "Article",
      });
      setAiGenerating(false);
    }, 600);
  };

  const titleLen = (data.seo_title || "").length;
  const descLen = (data.meta_description || "").length;

  const getTitleBadgeColor = () => {
    if (titleLen === 0) return { bg: "#f1f5f9", text: "#64748b" };
    if (titleLen <= 60) return { bg: "#dcfce7", text: "#15803d" };
    if (titleLen <= 70) return { bg: "#fef9c3", text: "#854d0e" };
    return { bg: "#fee2e2", text: "#b91c1c" };
  };

  const getDescBadgeColor = () => {
    if (descLen === 0) return { bg: "#f1f5f9", text: "#64748b" };
    if (descLen >= 120 && descLen <= 160) return { bg: "#dcfce7", text: "#15803d" };
    if (descLen < 120 || descLen <= 170) return { bg: "#fef9c3", text: "#854d0e" };
    return { bg: "#fee2e2", text: "#b91c1c" };
  };

  const tColor = getTitleBadgeColor();
  const dColor = getDescBadgeColor();

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: "6px",
    border: "1px solid #cbd5e1",
    fontSize: "14px",
    color: "#0f172a",
    backgroundColor: "#ffffff",
    outline: "none",
    boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "13px",
    fontWeight: 700,
    color: "#334155",
    marginBottom: "6px",
  };

  return (
    <div>
      {/* AI Assistant & Quick Action Bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px", padding: "12px 16px", backgroundColor: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "8px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Sparkles size={20} color="#2563eb" />
          <div>
            <div style={{ fontSize: "14px", fontWeight: 700, color: "#1e3a8a" }}>AI SEO Assistant & Auto Generate</div>
            <div style={{ fontSize: "12px", color: "#3b82f6" }}>Isi otomatis metadata dan saran Focus Keyword dalam sekali klik ⭐⭐⭐⭐⭐</div>
          </div>
        </div>
        <button
          type="button"
          onClick={handleAutoGenerate}
          disabled={aiGenerating}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "8px 16px",
            borderRadius: "6px",
            border: "none",
            backgroundColor: "#2563eb",
            color: "#ffffff",
            fontSize: "13px",
            fontWeight: 700,
            cursor: aiGenerating ? "wait" : "pointer",
            transition: "all 0.15s",
          }}
        >
          <Wand2 size={16} />
          <span>{aiGenerating ? "Generating..." : "✨ Auto Generate SEO"}</span>
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "8px", borderBottom: "2px solid #e2e8f0", marginBottom: "20px" }}>
        <button
          type="button"
          onClick={() => setActiveTab("general")}
          style={{
            padding: "10px 16px",
            border: "none",
            borderBottom: activeTab === "general" ? "2px solid #0f172a" : "2px solid transparent",
            backgroundColor: "transparent",
            color: activeTab === "general" ? "#0f172a" : "#64748b",
            fontWeight: activeTab === "general" ? 700 : 500,
            fontSize: "14px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            marginBottom: "-2px",
          }}
        >
          <Globe size={16} />
          <span>General SEO</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("social")}
          style={{
            padding: "10px 16px",
            border: "none",
            borderBottom: activeTab === "social" ? "2px solid #0f172a" : "2px solid transparent",
            backgroundColor: "transparent",
            color: activeTab === "social" ? "#0f172a" : "#64748b",
            fontWeight: activeTab === "social" ? 700 : 500,
            fontSize: "14px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            marginBottom: "-2px",
          }}
        >
          <Share2 size={16} />
          <span>Social Media (OG/Twitter)</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("audit")}
          style={{
            padding: "10px 16px",
            border: "none",
            borderBottom: activeTab === "audit" ? "2px solid #0f172a" : "2px solid transparent",
            backgroundColor: "transparent",
            color: activeTab === "audit" ? "#0f172a" : "#64748b",
            fontWeight: activeTab === "audit" ? 700 : 500,
            fontSize: "14px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            marginBottom: "-2px",
          }}
        >
          <ShieldCheck size={16} />
          <span>Professional Audit ⭐⭐⭐⭐⭐</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("preview")}
          style={{
            padding: "10px 16px",
            border: "none",
            borderBottom: activeTab === "preview" ? "2px solid #0f172a" : "2px solid transparent",
            backgroundColor: "transparent",
            color: activeTab === "preview" ? "#0f172a" : "#64748b",
            fontWeight: activeTab === "preview" ? 700 : 500,
            fontSize: "14px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            marginBottom: "-2px",
          }}
        >
          <FileCode size={16} />
          <span>Live Previews</span>
        </button>
      </div>

      {/* Tab 1: General SEO */}
      {activeTab === "general" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: "14px" }}>
            <div>
              <label style={labelStyle}>Focus Keyword ⭐⭐⭐⭐⭐</label>
              <input
                type="text"
                placeholder="e.g. mount rinjani trekking"
                value={data.focus_keyword || ""}
                onChange={(e) => handleChange("focus_keyword", e.target.value)}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Schema Type ⭐⭐⭐⭐⭐</label>
              <select
                value={data.schema_type || "Article"}
                onChange={(e) => handleChange("schema_type", e.target.value)}
                style={inputStyle}
              >
                <option value="Article">Article</option>
                <option value="Website">Website</option>
                <option value="Tour">Tour Package</option>
                <option value="FAQ">FAQ Page</option>
                <option value="LocalBusiness">LocalBusiness</option>
                <option value="Contact">Contact Page</option>
                <option value="Breadcrumb">Breadcrumb</option>
                <option value="Organization">Organization</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>SEO Status ⭐⭐⭐⭐</label>
              <select
                value={data.seo_status || "published"}
                onChange={(e) => handleChange("seo_status", e.target.value)}
                style={inputStyle}
              >
                <option value="published">Published (Live)</option>
                <option value="draft">Draft (Review)</option>
              </select>
            </div>
          </div>

          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
              <label style={{ ...labelStyle, margin: 0 }}>SEO Title Tag</label>
              <span style={{ fontSize: "12px", padding: "2px 8px", borderRadius: "10px", backgroundColor: tColor.bg, color: tColor.text, fontWeight: 700 }}>
                {titleLen} / 60 karakter
              </span>
            </div>
            <input
              type="text"
              placeholder="e.g. Mount Rinjani Trekking Packages | Licensed Lombok Agency"
              value={data.seo_title || ""}
              onChange={(e) => handleChange("seo_title", e.target.value)}
              style={inputStyle}
            />
          </div>

          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
              <label style={{ ...labelStyle, margin: 0 }}>Meta Description</label>
              <span style={{ fontSize: "12px", padding: "2px 8px", borderRadius: "10px", backgroundColor: dColor.bg, color: dColor.text, fontWeight: 700 }}>
                {descLen} / 160 karakter
              </span>
            </div>
            <textarea
              rows={3}
              placeholder="Tulis ringkasan menarik yang memuat Focus Keyword untuk meningkatkan CTR di Google..."
              value={data.meta_description || ""}
              onChange={(e) => handleChange("meta_description", e.target.value)}
              style={{ ...inputStyle, resize: "vertical" }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <label style={labelStyle}>Canonical URL</label>
              <input
                type="text"
                placeholder="https://trekkingmountrinjani.com/..."
                value={data.canonical_url || ""}
                onChange={(e) => handleChange("canonical_url", e.target.value)}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Robots Indexing</label>
              <select
                value={data.robots || "index, follow"}
                onChange={(e) => handleChange("robots", e.target.value)}
                style={inputStyle}
              >
                <option value="index, follow">index, follow (Default - Direkomendasikan)</option>
                <option value="noindex, follow">noindex, follow</option>
                <option value="index, nofollow">index, nofollow</option>
                <option value="noindex, nofollow">noindex, nofollow (Sembunyikan dari Google)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Social Media */}
      {activeTab === "social" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <div style={{ padding: "12px", backgroundColor: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
            <h4 style={{ margin: "0 0 12px 0", fontSize: "14px", color: "#0f172a" }}>OpenGraph (Facebook / WhatsApp)</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label style={labelStyle}>OG Title</label>
                <input
                  type="text"
                  placeholder="Kosongkan untuk menggunakan SEO Title"
                  value={data.og_title || ""}
                  onChange={(e) => handleChange("og_title", e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>OG Description</label>
                <textarea
                  rows={2}
                  placeholder="Kosongkan untuk menggunakan Meta Description"
                  value={data.og_description || ""}
                  onChange={(e) => handleChange("og_description", e.target.value)}
                  style={{ ...inputStyle, resize: "vertical" }}
                />
              </div>
              <div>
                <label style={labelStyle}>OG Image URL</label>
                <input
                  type="text"
                  placeholder="https://trekkingmountrinjani.com/..."
                  value={data.og_image || ""}
                  onChange={(e) => handleChange("og_image", e.target.value)}
                  style={inputStyle}
                />
              </div>
            </div>
          </div>

          <div style={{ padding: "12px", backgroundColor: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
            <h4 style={{ margin: "0 0 12px 0", fontSize: "14px", color: "#0f172a" }}>Twitter / X Card</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label style={labelStyle}>Twitter Title</label>
                <input
                  type="text"
                  placeholder="Kosongkan untuk menggunakan OG Title / SEO Title"
                  value={data.twitter_title || ""}
                  onChange={(e) => handleChange("twitter_title", e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Twitter Description</label>
                <textarea
                  rows={2}
                  placeholder="Kosongkan untuk menggunakan OG Description"
                  value={data.twitter_description || ""}
                  onChange={(e) => handleChange("twitter_description", e.target.value)}
                  style={{ ...inputStyle, resize: "vertical" }}
                />
              </div>
              <div>
                <label style={labelStyle}>Twitter Image URL</label>
                <input
                  type="text"
                  placeholder="Kosongkan untuk menggunakan OG Image"
                  value={data.twitter_image || ""}
                  onChange={(e) => handleChange("twitter_image", e.target.value)}
                  style={inputStyle}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Professional Audit ⭐⭐⭐⭐⭐ */}
      {activeTab === "audit" && (
        <div>
          <FocusKeywordAnalyzer
            focusKeyword={data.focus_keyword || ""}
            title={data.seo_title}
            description={data.meta_description}
            url={defaultUrl}
            content={articleContent}
          />

          <SeoChecklistAudit
            title={data.seo_title}
            description={data.meta_description}
            canonicalUrl={data.canonical_url}
            robots={data.robots}
            ogImage={data.og_image}
            twitterCard={data.twitter_image || data.og_image}
          />

          <ReadabilityAnalyzer content={articleContent} />

          <InternalLinkSuggestor content={articleContent} focusKeyword={data.focus_keyword} />
        </div>
      )}

      {/* Tab 4: Live Previews */}
      {activeTab === "preview" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div>
            <h4 style={{ margin: "0 0 12px 0", fontSize: "15px", color: "#0f172a" }}>Google SERP Snippet Preview</h4>
            <GoogleSnippetPreview
              title={data.seo_title || "Judul Halaman"}
              description={data.meta_description || "Deskripsi meta akan muncul di sini pada hasil pencarian Google..."}
              url={defaultUrl}
            />
          </div>

          <div>
            <h4 style={{ margin: "0 0 12px 0", fontSize: "15px", color: "#0f172a" }}>Social Media Share Preview</h4>
            <SocialMediaPreview
              title={data.og_title || data.seo_title || "Judul Halaman"}
              description={data.og_description || data.meta_description || "Deskripsi penjelas halaman..."}
              url={defaultUrl}
              image={data.og_image || "/hero-banner.png"}
            />
          </div>
        </div>
      )}
    </div>
  );
}
