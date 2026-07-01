"use client";

import React, { useState } from "react";
import SeoFormFields, { SeoFormData } from "./SeoFormFields";

interface ArticleSeoFormSectionProps {
  initialData?: Partial<SeoFormData>;
  postSlug?: string;
}

export default function ArticleSeoFormSection({
  initialData = {},
  postSlug = "new-article-slug",
}: ArticleSeoFormSectionProps) {
  const [data, setData] = useState<SeoFormData>({
    seo_title: initialData.seo_title || "",
    meta_description: initialData.meta_description || "",
    meta_keywords: initialData.meta_keywords || "",
    canonical_url: initialData.canonical_url || "",
    robots: initialData.robots || "index, follow",
    og_title: initialData.og_title || "",
    og_description: initialData.og_description || "",
    og_image: initialData.og_image || "",
    twitter_title: initialData.twitter_title || "",
    twitter_description: initialData.twitter_description || "",
    twitter_image: initialData.twitter_image || "",
    focus_keyword: initialData.focus_keyword || "",
    schema_type: initialData.schema_type || "Article",
    seo_status: initialData.seo_status || "published",
  });

  return (
    <div
      style={{
        marginTop: "28px",
        padding: "20px",
        backgroundColor: "#f8fafc",
        border: "1px solid #cbd5e1",
        borderRadius: "8px",
        gridColumn: "1 / -1",
      }}
    >
      {/* Hidden inputs so FormData submission sends all these fields */}
      <input type="hidden" name="seo_title" value={data.seo_title} />
      <input type="hidden" name="meta_description" value={data.meta_description} />
      <input type="hidden" name="meta_keywords" value={data.meta_keywords} />
      <input type="hidden" name="canonical_url" value={data.canonical_url} />
      <input type="hidden" name="robots" value={data.robots} />
      <input type="hidden" name="og_title" value={data.og_title} />
      <input type="hidden" name="og_description" value={data.og_description} />
      <input type="hidden" name="og_image" value={data.og_image} />
      <input type="hidden" name="twitter_title" value={data.twitter_title} />
      <input type="hidden" name="twitter_description" value={data.twitter_description} />
      <input type="hidden" name="twitter_image" value={data.twitter_image} />
      <input type="hidden" name="focus_keyword" value={data.focus_keyword || ""} />
      <input type="hidden" name="schema_type" value={data.schema_type || "Article"} />
      <input type="hidden" name="seo_status" value={data.seo_status || "published"} />

      <h3 style={{ margin: "0 0 16px 0", fontSize: "18px", fontWeight: 700, color: "#0f172a" }}>
        🌐 Article SEO & Social Media Settings
      </h3>
      <p style={{ margin: "0 0 20px 0", fontSize: "13px", color: "#64748b" }}>
        Jika dibiarkan kosong, sistem akan menggunakan fallback otomatis dari judul artikel dan cuplikan (excerpt).
      </p>

      <SeoFormFields
        data={data}
        onChange={setData}
        defaultUrl={`https://trekkingmountrinjani.com/blog/${postSlug}`}
      />
    </div>
  );
}
