"use client";

import { useState } from "react";
import styles from "@/app/packages/[slug]/PackageDetailPage.module.css";

type OptionItem = {
  id: string;
  title: string;
  content: string;
  include?: string;
  exclude?: string;
};

type Props = {
  options?: any;
};

const COLOR_THEMES = [
  {
    border: "#10b981", // Emerald
    bg: "#ecfdf5",
    iconColor: "#059669",
    badgeBg: "#10b981",
    badgeColor: "#ffffff",
    titleColor: "#065f46",
    boxShadow: "0 4px 15px rgba(16, 185, 129, 0.15)",
  },
  {
    border: "#3b82f6", // Blue Sapphire
    bg: "#eff6ff",
    iconColor: "#2563eb",
    badgeBg: "#3b82f6",
    badgeColor: "#ffffff",
    titleColor: "#1e40af",
    boxShadow: "0 4px 15px rgba(59, 130, 246, 0.15)",
  },
  {
    border: "#f59e0b", // Sunset Amber
    bg: "#fffbeb",
    iconColor: "#d97706",
    badgeBg: "#f59e0b",
    badgeColor: "#ffffff",
    titleColor: "#92400e",
    boxShadow: "0 4px 15px rgba(245, 158, 11, 0.15)",
  },
  {
    border: "#8b5cf6", // Royal Purple
    bg: "#f5f3ff",
    iconColor: "#7c3aed",
    badgeBg: "#8b5cf6",
    badgeColor: "#ffffff",
    titleColor: "#5b21b6",
    boxShadow: "0 4px 15px rgba(139, 92, 246, 0.15)",
  },
];

export default function PackageOptionsAccordion({ options }: Props) {
  let parsedOptions: OptionItem[] = [];
  if (Array.isArray(options)) {
    parsedOptions = options;
  } else if (typeof options === "string" && options.trim()) {
    try {
      const parsed = JSON.parse(options);
      if (Array.isArray(parsed)) parsedOptions = parsed;
    } catch {}
  }

  const validOptions = parsedOptions.filter((item) => item && item.title);

  const [expandedId, setExpandedId] = useState<string | null>(
    validOptions[0]?.id || null,
  );

  if (validOptions.length === 0) return null;

  const toggle = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <article className={styles.detailCard} style={{ marginBottom: "24px" }}>
      <h2 className={styles.sectionTitle}>Package Options</h2>
      <div className={styles.accordionList} style={{ display: "grid", gap: "16px" }}>
        {validOptions.map((item, idx) => {
          const isExpanded = expandedId === item.id;
          const theme = COLOR_THEMES[idx % COLOR_THEMES.length];
          return (
            <section
              key={item.id}
              className={styles.accordionItem}
              style={{
                border: `2px solid ${theme.border}`,
                borderRadius: "14px",
                overflow: "hidden",
                boxShadow: isExpanded ? theme.boxShadow : "0 2px 8px rgba(0,0,0,0.04)",
                transition: "all 0.3s ease",
                background: isExpanded ? "#ffffff" : theme.bg,
              }}
            >
              <button
                type="button"
                className={styles.accordionSummary}
                onClick={() => toggle(item.id)}
                aria-expanded={isExpanded}
                style={{
                  background: isExpanded ? theme.bg : "transparent",
                  padding: "16px 20px",
                  borderRadius: isExpanded ? "12px 12px 0 0" : "12px",
                  borderBottom: isExpanded ? `1px solid ${theme.border}40` : "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "100%",
                }}
              >
                <span className={styles.summaryLeft} style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                  <span
                    className={styles.summaryIcon}
                    style={{
                      background: theme.border,
                      color: "#ffffff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "42px",
                      height: "42px",
                      borderRadius: "10px",
                      boxShadow: `0 2px 8px ${theme.border}60`,
                      flexShrink: 0,
                    }}
                    aria-hidden
                  >
                    <img
                      src="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/icons/box-seam-fill.svg"
                      alt="Package option icon"
                      style={{ filter: "brightness(0) invert(1)", width: "20px", height: "20px" }}
                    />
                  </span>
                  <span
                    className={styles.sectionSubtitle}
                    style={{ color: theme.titleColor, fontWeight: 700, fontSize: "1.1rem" }}
                  >
                    {item.title}
                  </span>
                </span>
                <span
                  className={styles.toggleBadge}
                  style={{
                    background: theme.badgeBg,
                    color: theme.badgeColor,
                    padding: "6px 14px",
                    borderRadius: "20px",
                    fontWeight: 600,
                    fontSize: "0.82rem",
                    boxShadow: `0 2px 6px ${theme.border}40`,
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  {isExpanded ? "Hide" : "Show"}
                  <span className={styles.summaryArrow} aria-hidden>
                    {isExpanded ? "▲" : "▼"}
                  </span>
                </span>
              </button>

              {isExpanded && (item.content || item.include || item.exclude) && (
                <div className={styles.accordionBody} style={{ padding: "20px", background: "#ffffff" }}>
                  {item.content && (
                    <div
                      className="quill-rendered-content"
                      style={{
                        color: "#334155",
                        fontSize: "0.95rem",
                        lineHeight: "1.7",
                      }}
                      dangerouslySetInnerHTML={{ __html: item.content }}
                    />
                  )}

                  {item.include && item.include.trim() && (
                    <div
                      style={{
                        marginTop: item.content ? "18px" : "0",
                        paddingTop: item.content ? "18px" : "0",
                        borderTop: item.content ? "1px dashed #cbd5e1" : "none",
                      }}
                    >
                      <h4
                        style={{
                          color: "#059669",
                          fontSize: "0.96rem",
                          fontWeight: 700,
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          margin: "0 0 12px",
                        }}
                      >
                        <img
                          src="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/icons/check-circle-fill.svg"
                          alt=""
                          style={{ width: "18px", height: "18px", filter: "sepia(1) hue-rotate(90deg) saturate(5)" }}
                        />
                        Include
                      </h4>
                      <ul
                        style={{
                          paddingLeft: "24px",
                          margin: 0,
                          color: "#334155",
                          display: "grid",
                          gap: "8px",
                          fontSize: "0.93rem",
                        }}
                      >
                        {item.include
                          .split("\n")
                          .filter(Boolean)
                          .map((inc, i) => (
                            <li key={i}>{inc}</li>
                          ))}
                      </ul>
                    </div>
                  )}

                  {item.exclude && item.exclude.trim() && (
                    <div
                      style={{
                        marginTop: "18px",
                        paddingTop: "18px",
                        borderTop: "1px dashed #cbd5e1",
                      }}
                    >
                      <h4
                        style={{
                          color: "#e11d48",
                          fontSize: "0.96rem",
                          fontWeight: 700,
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          margin: "0 0 12px",
                        }}
                      >
                        <img
                          src="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/icons/x-circle-fill.svg"
                          alt=""
                          style={{ width: "18px", height: "18px", filter: "sepia(1) hue-rotate(300deg) saturate(5)" }}
                        />
                        Exclude
                      </h4>
                      <ul
                        style={{
                          paddingLeft: "24px",
                          margin: 0,
                          color: "#334155",
                          display: "grid",
                          gap: "8px",
                          fontSize: "0.93rem",
                        }}
                      >
                        {item.exclude
                          .split("\n")
                          .filter(Boolean)
                          .map((exc, i) => (
                            <li key={i}>{exc}</li>
                          ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </section>
          );
        })}
      </div>
      <style jsx>{`
        :global(.quill-rendered-content img) {
          max-width: 100%;
          height: auto;
          border-radius: 10px;
          margin: 12px 0;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }
        :global(.quill-rendered-content ul),
        :global(.quill-rendered-content ol) {
          padding-left: 20px;
          margin: 10px 0;
        }
        :global(.quill-rendered-content p) {
          margin: 8px 0;
        }
        :global(.quill-rendered-content a) {
          color: #0f6ddf;
          text-decoration: underline;
        }
      `}</style>
    </article>
  );
}
