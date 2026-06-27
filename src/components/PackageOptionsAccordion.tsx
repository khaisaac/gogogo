"use client";

import { useState } from "react";
import styles from "@/app/packages/[slug]/PackageDetailPage.module.css";

type OptionItem = {
  id: string;
  title: string;
  content: string;
};

type Props = {
  options?: any;
};

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
    <article className={styles.detailCard}>
      <h2 className={styles.sectionTitle}>Package Options</h2>
      <div style={{ display: "grid", gap: "12px", marginTop: "16px" }}>
        {validOptions.map((item) => {
          const isExpanded = expandedId === item.id;
          return (
            <div
              key={item.id}
              style={{
                background: isExpanded ? "#111827" : "#18181b",
                border: isExpanded ? "1px solid #10b981" : "1px solid #27272a",
                borderRadius: "14px",
                overflow: "hidden",
                transition: "all 0.25s ease",
              }}
            >
              <button
                type="button"
                onClick={() => toggle(item.id)}
                style={{
                  width: "100%",
                  padding: "16px 20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: "transparent",
                  border: "none",
                  color: "#ffffff",
                  fontSize: "1rem",
                  fontWeight: 600,
                  textAlign: "left",
                  cursor: "pointer",
                }}
              >
                <span>{item.title}</span>
                <span
                  style={{
                    transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.25s ease",
                    fontSize: "1.2rem",
                    color: isExpanded ? "#10b981" : "#a1a1aa",
                  }}
                >
                  ⌄
                </span>
              </button>

              {isExpanded && item.content && (
                <div
                  className="quill-rendered-content"
                  style={{
                    padding: "0 20px 20px",
                    color: "#d1d5db",
                    fontSize: "0.92rem",
                    lineHeight: "1.6",
                    borderTop: "1px solid rgba(255,255,255,0.06)",
                    paddingTop: "16px",
                  }}
                  dangerouslySetInnerHTML={{ __html: item.content }}
                />
              )}
            </div>
          );
        })}
      </div>
      <style jsx>{`
        :global(.quill-rendered-content img) {
          max-width: 100%;
          height: auto;
          border-radius: 10px;
          margin: 12px 0;
        }
        :global(.quill-rendered-content ul),
        :global(.quill-rendered-content ol) {
          padding-left: 20px;
          margin: 8px 0;
        }
        :global(.quill-rendered-content p) {
          margin: 8px 0;
        }
      `}</style>
    </article>
  );
}
