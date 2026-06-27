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
      <div className={styles.accordionList}>
        {validOptions.map((item) => {
          const isExpanded = expandedId === item.id;
          return (
            <section key={item.id} className={styles.accordionItem}>
              <button
                type="button"
                className={styles.accordionSummary}
                onClick={() => toggle(item.id)}
                aria-expanded={isExpanded}
              >
                <span className={styles.summaryLeft}>
                  <span
                    className={`${styles.summaryIcon} ${styles.iconItinerary}`}
                    aria-hidden
                  >
                    <img
                      src="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/icons/box-seam-fill.svg"
                      alt="Package option icon"
                    />
                  </span>
                  <span className={styles.sectionSubtitle}>{item.title}</span>
                </span>
                <span className={styles.toggleBadge}>
                  {isExpanded ? "Hide" : "Show"}
                  <span className={styles.summaryArrow} aria-hidden>
                    {isExpanded ? "^" : "v"}
                  </span>
                </span>
              </button>

              {isExpanded && (item.content || item.include || item.exclude) && (
                <div className={styles.accordionBody}>
                  {item.content && (
                    <div
                      className="quill-rendered-content"
                      style={{
                        color: "#4f6477",
                        fontSize: "0.94rem",
                        lineHeight: "1.7",
                        borderTop: "1px dashed #cfd9e4",
                        paddingTop: "16px",
                        marginTop: "4px",
                      }}
                      dangerouslySetInnerHTML={{ __html: item.content }}
                    />
                  )}

                  {item.include && item.include.trim() && (
                    <div
                      style={{
                        marginTop: "16px",
                        paddingTop: "16px",
                        borderTop: "1px dashed #cfd9e4",
                      }}
                    >
                      <h4
                        style={{
                          color: "#0e6d39",
                          fontSize: "0.95rem",
                          fontWeight: 700,
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          margin: "0 0 10px",
                        }}
                      >
                        <img
                          src="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/icons/check-circle-fill.svg"
                          alt=""
                          style={{ width: "16px", height: "16px" }}
                        />
                        Include
                      </h4>
                      <ul
                        style={{
                          paddingLeft: "24px",
                          margin: 0,
                          color: "#4f6477",
                          display: "grid",
                          gap: "6px",
                          fontSize: "0.92rem",
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
                        marginTop: "16px",
                        paddingTop: "16px",
                        borderTop: "1px dashed #cfd9e4",
                      }}
                    >
                      <h4
                        style={{
                          color: "#8a1f1f",
                          fontSize: "0.95rem",
                          fontWeight: 700,
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          margin: "0 0 10px",
                        }}
                      >
                        <img
                          src="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/icons/x-circle-fill.svg"
                          alt=""
                          style={{ width: "16px", height: "16px" }}
                        />
                        Exclude
                      </h4>
                      <ul
                        style={{
                          paddingLeft: "24px",
                          margin: 0,
                          color: "#4f6477",
                          display: "grid",
                          gap: "6px",
                          fontSize: "0.92rem",
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
