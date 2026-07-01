"use client";

import React, { useEffect, useState } from "react";
import SeoFormFields, { SeoFormData } from "@/components/admin/seo/SeoFormFields";
import { Globe, Save, Check } from "lucide-react";
import styles from "../../admin.module.css";

const STATIC_PAGES = [
  { slug: "home", name: "Home" },
  { slug: "about", name: "About" },
  { slug: "contact", name: "Contact" },
  { slug: "destination", name: "Destination" },
  { slug: "packages", name: "Tour Package" },
  { slug: "faq", name: "FAQ" },
  { slug: "privacy", name: "Privacy Policy" },
  { slug: "terms", name: "Terms" },
  { slug: "booking-ticket", name: "E-Rinjani Entrance Ticket" },
  { slug: "booking-transport", name: "Private Transport" },
  { slug: "why-choose-us", name: "Why Choose Us" },
];

export default function StaticPagesSeoPage() {
  const [selectedSlug, setSelectedSlug] = useState("home");
  const [pagesData, setPagesData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [formData, setFormData] = useState<SeoFormData>({
    seo_title: "",
    meta_description: "",
    meta_keywords: "",
    canonical_url: "",
    robots: "index, follow",
    og_title: "",
    og_description: "",
    og_image: "",
    twitter_title: "",
    twitter_description: "",
    twitter_image: "",
  });

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/seo/pages");
      if (res.ok) {
        const data = await res.json();
        const map: Record<string, any> = {};
        if (Array.isArray(data.pages)) {
          data.pages.forEach((p: any) => {
            map[p.page_slug] = p;
          });
        }
        setPagesData(map);
        loadIntoForm("home", map);
      }
    } catch (err) {
      console.error("Failed to load SEO pages:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadIntoForm = (slug: string, map = pagesData) => {
    const existing = map[slug] || {};
    setFormData({
      seo_title: existing.seo_title || "",
      meta_description: existing.meta_description || "",
      meta_keywords: existing.meta_keywords || "",
      canonical_url: existing.canonical_url || "",
      robots: existing.robots || "index, follow",
      og_title: existing.og_title || "",
      og_description: existing.og_description || "",
      og_image: existing.og_image || "",
      twitter_title: existing.twitter_title || "",
      twitter_description: existing.twitter_description || "",
      twitter_image: existing.twitter_image || "",
    });
    setSavedSuccess(false);
  };

  const handleSelectPage = (slug: string) => {
    setSelectedSlug(slug);
    loadIntoForm(slug);
  };

  const handleSave = async () => {
    setSaving(true);
    setSavedSuccess(false);
    try {
      const res = await fetch("/api/admin/seo/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          page_slug: selectedSlug,
          ...formData,
        }),
      });

      if (res.ok) {
        const result = await res.json();
        setPagesData((prev) => ({
          ...prev,
          [selectedSlug]: result.page,
        }));
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      } else {
        alert("Gagal menyimpan data SEO");
      }
    } catch (err) {
      console.error("Error saving SEO:", err);
      alert("Terjadi kesalahan saat menyimpan SEO");
    } finally {
      setSaving(false);
    }
  };

  const defaultUrl = `https://trekkingmountrinjani.com${selectedSlug === "home" ? "" : "/" + selectedSlug}`;

  return (
    <div className={styles.container}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "24px" }}>
        <Globe size={28} color="#0f172a" />
        <div>
          <h1 className={styles.title} style={{ margin: 0 }}>Static Pages SEO Management</h1>
          <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>
            Kelola metadata SEO secara terpisah untuk setiap halaman statis tanpa perlu deploy ulang.
          </p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: "24px", alignItems: "start" }}>
        {/* Page List Sidebar */}
        <div
          style={{
            backgroundColor: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "10px",
            padding: "12px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          }}
        >
          <div style={{ fontSize: "12px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", padding: "6px 10px", marginBottom: "6px" }}>
            Pilih Halaman
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            {STATIC_PAGES.map((page) => {
              const active = selectedSlug === page.slug;
              const hasData = !!pagesData[page.slug]?.seo_title;
              return (
                <button
                  key={page.slug}
                  type="button"
                  onClick={() => handleSelectPage(page.slug)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 12px",
                    borderRadius: "6px",
                    border: "none",
                    backgroundColor: active ? "#0f172a" : "transparent",
                    color: active ? "#ffffff" : "#1e293b",
                    fontSize: "14px",
                    fontWeight: active ? 700 : 500,
                    textAlign: "left",
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  <span>{page.name}</span>
                  {hasData && (
                    <span
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        backgroundColor: active ? "#4ade80" : "#16a34a",
                      }}
                      title="SEO dikonfigurasi"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* SEO Editor Main Area */}
        <div
          style={{
            backgroundColor: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "10px",
            padding: "24px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px", paddingBottom: "16px", borderBottom: "1px solid #f1f5f9" }}>
            <div>
              <h2 style={{ margin: 0, fontSize: "20px", fontWeight: 700, color: "#0f172a" }}>
                Edit SEO: {STATIC_PAGES.find((p) => p.slug === selectedSlug)?.name}
              </h2>
              <code style={{ fontSize: "13px", color: "#64748b" }}>URL: {defaultUrl}</code>
            </div>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || loading}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 20px",
                borderRadius: "8px",
                border: "none",
                backgroundColor: savedSuccess ? "#16a34a" : "#0f172a",
                color: "#ffffff",
                fontSize: "14px",
                fontWeight: 700,
                cursor: saving ? "not-allowed" : "pointer",
                transition: "all 0.2s",
              }}
            >
              {savedSuccess ? (
                <>
                  <Check size={18} />
                  <span>Tersimpan!</span>
                </>
              ) : (
                <>
                  <Save size={18} />
                  <span>{saving ? "Menyimpan..." : "Save SEO"}</span>
                </>
              )}
            </button>
          </div>

          {loading ? (
            <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>Memuat konfigurasi SEO...</div>
          ) : (
            <SeoFormFields data={formData} onChange={setFormData} defaultUrl={defaultUrl} />
          )}
        </div>
      </div>
    </div>
  );
}
