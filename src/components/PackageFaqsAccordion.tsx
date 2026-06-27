"use client";

import { useState } from "react";
import styles from "@/app/packages/[slug]/PackageDetailPage.module.css";

type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

const DEFAULT_FAQS: FaqItem[] = [
  {
    id: "default-1",
    question: "Do I need previous trekking experience to climb Mount Rinjani?",
    answer:
      "While Mount Rinjani is a physically demanding trek, previous technical climbing experience is not strictly required. Anyone with a good level of physical fitness, proper preparation, and strong mental determination can complete the trek successfully. Our professional guides will pace the hike to suit your group's stamina.",
  },
  {
    id: "default-2",
    question: "What happens if the weather turns bad during the trek?",
    answer:
      "Safety is our absolute priority. Our guides monitor weather forecasts closely. In case of extreme weather conditions, the itinerary may be adjusted for your group's safety. All camping tents and equipment provided are high-quality, weatherproof, and rated for high mountain environments.",
  },
  {
    id: "default-3",
    question: "Is porter service included for carrying my personal luggage?",
    answer:
      "Our team of porters will carry all communal camping equipment, food, tents, and cooking gear. You only need to carry a small daypack containing your personal items (camera, jacket, sunblock, drinking water). If you require an extra personal porter dedicated to your private luggage, it can be arranged upon request.",
  },
  {
    id: "default-4",
    question: "What dietary requirements can your mountain chefs accommodate?",
    answer:
      "Our trekking chefs prepare fresh, warm, and nutritious meals directly on the mountain. We can easily accommodate vegetarian, vegan, gluten-free, and halal diets. Please inform us of any allergies or special dietary restrictions when submitting your booking.",
  },
];

type Props = {
  faqs?: any;
};

export default function PackageFaqsAccordion({ faqs }: Props) {
  let parsedFaqs: FaqItem[] = [];
  if (Array.isArray(faqs)) {
    parsedFaqs = faqs;
  } else if (typeof faqs === "string" && faqs.trim()) {
    try {
      const parsed = JSON.parse(faqs);
      if (Array.isArray(parsed)) parsedFaqs = parsed;
    } catch {}
  }

  const validFaqs = parsedFaqs.filter(
    (item) => item && item.question && item.answer,
  );
  const displayFaqs = validFaqs.length > 0 ? validFaqs : DEFAULT_FAQS;

  const [expandedId, setExpandedId] = useState<string | null>(
    displayFaqs[0]?.id || null,
  );

  const toggle = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <section
      className={styles.relatedTourSection}
      style={{
        marginTop: "28px",
        paddingTop: "24px",
        borderTop: "1px solid #dce2ea",
        marginBottom: "28px",
      }}
    >
      <h2 className={styles.relatedTourTitle} style={{ marginBottom: "16px" }}>
        Frequently Asked Questions (FAQ)
      </h2>
      <div className={styles.accordionList}>
        {displayFaqs.map((item) => {
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
                    className={styles.summaryIcon}
                    style={{ background: "#e0f2fe", color: "#0284c7" }}
                    aria-hidden
                  >
                    <img
                      src="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/icons/question-circle-fill.svg"
                      alt="FAQ icon"
                    />
                  </span>
                  <span
                    className={styles.sectionSubtitle}
                    style={{ fontWeight: 700 }}
                  >
                    {item.question}
                  </span>
                </span>
                <span className={styles.toggleBadge}>
                  {isExpanded ? "Hide" : "Show"}
                  <span className={styles.summaryArrow} aria-hidden>
                    {isExpanded ? "^" : "v"}
                  </span>
                </span>
              </button>

              {isExpanded && item.answer && (
                <div className={styles.accordionBody}>
                  <p
                    style={{
                      color: "#4f6477",
                      fontSize: "0.95rem",
                      lineHeight: "1.7",
                      margin: 0,
                      paddingTop: "12px",
                      borderTop: "1px dashed #cfd9e4",
                    }}
                  >
                    {item.answer}
                  </p>
                </div>
              )}
            </section>
          );
        })}
      </div>
    </section>
  );
}
