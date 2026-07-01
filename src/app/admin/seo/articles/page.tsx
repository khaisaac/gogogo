"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { FileText, Edit, ExternalLink, Award } from "lucide-react";
import styles from "../../admin.module.css";

export default function ArticlesSeoOverviewPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/blog");
      if (res.ok) {
        const data = await res.json();
        setPosts(Array.isArray(data) ? data : data.posts || []);
      }
    } catch (err) {
      console.error("Failed to fetch blog posts for SEO:", err);
    } finally {
      setLoading(false);
    }
  };

  const getQuickScore = (post: any) => {
    let score = 0;
    const titleLen = (post.seo_title || post.title || "").length;
    if (titleLen > 0 && titleLen <= 65) score += 40;
    else if (titleLen > 0) score += 25;

    const descLen = (post.meta_description || post.excerpt || "").length;
    if (descLen >= 100 && descLen <= 165) score += 40;
    else if (descLen > 0) score += 25;

    if (post.og_image || post.featured_image) score += 20;
    return score;
  };

  return (
    <div className={styles.container}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "24px" }}>
        <FileText size={28} color="#0f172a" />
        <div>
          <h1 className={styles.title} style={{ margin: 0 }}>Articles SEO Overview</h1>
          <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>
            Pantau dan kelola metadata SEO untuk seluruh artikel blog yang terbit maupun draf.
          </p>
        </div>
      </div>

      <div
        style={{
          backgroundColor: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: "10px",
          padding: "20px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        }}
      >
        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>Memuat daftar artikel...</div>
        ) : posts.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>Belum ada artikel blog.</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "14px" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #e2e8f0", backgroundColor: "#f8fafc", color: "#475569" }}>
                  <th style={{ padding: "12px 14px" }}>Judul Artikel & Slug</th>
                  <th style={{ padding: "12px 14px" }}>Custom SEO Title</th>
                  <th style={{ padding: "12px 14px" }}>Robots Index</th>
                  <th style={{ padding: "12px 14px" }}>Est. SEO Score</th>
                  <th style={{ padding: "12px 14px", textAlign: "right" }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => {
                  const score = getQuickScore(post);
                  return (
                    <tr key={post.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "14px" }}>
                        <div style={{ fontWeight: 700, color: "#0f172a", marginBottom: "2px" }}>{post.title}</div>
                        <code style={{ fontSize: "12px", color: "#64748b" }}>/blog/{post.slug}</code>
                      </td>
                      <td style={{ padding: "14px", color: post.seo_title ? "#15803d" : "#94a3b8" }}>
                        {post.seo_title || <i>Default (Judul Artikel)</i>}
                      </td>
                      <td style={{ padding: "14px" }}>
                        <span
                          style={{
                            padding: "4px 10px",
                            borderRadius: "12px",
                            fontSize: "12px",
                            fontWeight: 600,
                            backgroundColor: (post.robots || "").includes("noindex") ? "#fee2e2" : "#dcfce7",
                            color: (post.robots || "").includes("noindex") ? "#991b1b" : "#166534",
                          }}
                        >
                          {post.robots || "index, follow"}
                        </span>
                      </td>
                      <td style={{ padding: "14px" }}>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                            padding: "4px 10px",
                            borderRadius: "12px",
                            fontSize: "12px",
                            fontWeight: 700,
                            backgroundColor: score >= 80 ? "#f0fdf4" : score >= 60 ? "#fefce8" : "#fef2f2",
                            color: score >= 80 ? "#166534" : score >= 60 ? "#854d0e" : "#991b1b",
                          }}
                        >
                          <Award size={14} />
                          {score}/100
                        </span>
                      </td>
                      <td style={{ padding: "14px", textAlign: "right" }}>
                        <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                          <Link
                            href={`/admin/blog/edit/${post.id}`}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "6px",
                              padding: "6px 12px",
                              borderRadius: "6px",
                              backgroundColor: "#0f172a",
                              color: "#ffffff",
                              fontSize: "13px",
                              fontWeight: 600,
                              textDecoration: "none",
                            }}
                          >
                            <Edit size={14} />
                            <span>Edit SEO</span>
                          </Link>
                          {post.is_published && (
                            <a
                              href={`/blog/${post.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                padding: "6px",
                                borderRadius: "6px",
                                border: "1px solid #cbd5e1",
                                color: "#475569",
                              }}
                              title="Lihat Live"
                            >
                              <ExternalLink size={14} />
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
