"use client";

import { useMemo, useState } from "react";
import type { ItineraryDay } from "@/lib/package-content";
import styles from "./PackageDetailPage.module.css";

type PackageSectionsAccordionProps = {
  itinerary: ItineraryDay[];
  highlights: string[];
  includeItems: string[];
  excludeItems: string[];
  whatToBringItems: string[];
  notes: string;
};

type SectionKey =
  | "itinerary"
  | "highlights"
  | "include"
  | "exclude"
  | "bring"
  | "notes";

type SectionConfig = {
  key: SectionKey;
  title: string;
  iconUrl: string;
  iconAlt: string;
  iconClassName: string;
};

const SECTION_CONFIG: SectionConfig[] = [
  {
    key: "itinerary",
    title: "Itinerary",
    iconUrl:
      "https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/icons/map.svg",
    iconAlt: "Itinerary icon",
    iconClassName: styles.iconItinerary,
  },
  {
    key: "highlights",
    title: "Tour Highlights",
    iconUrl:
      "https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/icons/star-fill.svg",
    iconAlt: "Highlights icon",
    iconClassName: styles.iconHighlight,
  },
  {
    key: "include",
    title: "Include",
    iconUrl:
      "https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/icons/check-circle-fill.svg",
    iconAlt: "Include icon",
    iconClassName: styles.iconInclude,
  },
  {
    key: "exclude",
    title: "Exclude",
    iconUrl:
      "https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/icons/x-circle-fill.svg",
    iconAlt: "Exclude icon",
    iconClassName: styles.iconExclude,
  },
  {
    key: "bring",
    title: "What to Bring",
    iconUrl:
      "https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/icons/backpack2.svg",
    iconAlt: "What to bring icon",
    iconClassName: styles.iconBring,
  },
  {
    key: "notes",
    title: "Notes",
    iconUrl:
      "https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/icons/journal-text.svg",
    iconAlt: "Notes icon",
    iconClassName: styles.iconNotes,
  },
];

function renderDay(item: ItineraryDay) {
  return (
    <section key={item.title} className={styles.dayCard}>
      <h4 className={styles.dayTitle}>{item.title}</h4>
      {item.schedule.length > 0 ? (
        <ul className={styles.dayList}>
          {item.schedule.map((step, index) => (
            <li key={`${item.title}-schedule-${index}`}>{step}</li>
          ))}
        </ul>
      ) : null}
      {item.overview.length > 0 ? (
        <div className={styles.dayOverview}>
          <p className={styles.dayOverviewTitle}>
            Overview trail at {item.title.toLowerCase()}:
          </p>
          <ul className={styles.dayList}>
            {item.overview.map((step, index) => (
              <li key={`${item.title}-overview-${index}`}>{step}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}

export default function PackageSectionsAccordion({
  itinerary,
  highlights,
  includeItems,
  excludeItems,
  whatToBringItems,
  notes,
}: PackageSectionsAccordionProps) {
  const [openKey, setOpenKey] = useState<SectionKey | null>("itinerary");
  const [showAllDays, setShowAllDays] = useState(false);

  const firstDay = itinerary[0] ?? null;
  const remainingDays = useMemo(() => itinerary.slice(1), [itinerary]);

  return (
    <div className={styles.accordionList}>
      {SECTION_CONFIG.map((section) => {
        const isOpen = openKey === section.key;

        return (
          <section key={section.key} className={styles.accordionItem}>
            <button
              type="button"
              className={styles.accordionSummary}
              onClick={() =>
                setOpenKey((current) =>
                  current === section.key ? null : section.key,
                )
              }
              aria-expanded={isOpen}
            >
              <span className={styles.summaryLeft}>
                <span
                  className={`${styles.summaryIcon} ${section.iconClassName}`}
                  aria-hidden
                >
                  <img src={section.iconUrl} alt={section.iconAlt} />
                </span>
                <span className={styles.sectionSubtitle}>{section.title}</span>
              </span>
              <span className={styles.toggleBadge}>
                {isOpen ? "Hide" : "Show"}
                <span className={styles.summaryArrow} aria-hidden>
                  {isOpen ? "^" : "v"}
                </span>
              </span>
            </button>

            {isOpen ? (
              <div className={styles.accordionBody}>
                {section.key === "itinerary" ? (
                  <>
                    {firstDay ? (
                      renderDay(firstDay)
                    ) : (
                      <p className={styles.emptyText}>
                        Itinerary belum tersedia.
                      </p>
                    )}

                    {remainingDays.length > 0 ? (
                      <div className={styles.moreDays}>
                        <button
                          type="button"
                          className={styles.moreDaysSummary}
                          onClick={() => setShowAllDays((value) => !value)}
                        >
                          {showAllDays ? "Hide all days" : "Show all days"}
                        </button>
                        {showAllDays ? (
                          <div className={styles.itineraryList}>
                            {remainingDays.map((day) => renderDay(day))}
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                  </>
                ) : null}

                {section.key === "highlights" ? (
                  <ul className={styles.highlightList}>
                    {(highlights.length
                      ? highlights
                      : ["Tour highlights belum tersedia."]
                    ).map((item, index) => (
                      <li key={`highlights-${index}`}>{item}</li>
                    ))}
                  </ul>
                ) : null}

                {section.key === "include" ? (
                  <ul className={styles.highlightList}>
                    {(includeItems.length
                      ? includeItems
                      : ["Belum ada data include."]
                    ).map((item, index) => (
                      <li key={`include-${index}`}>{item}</li>
                    ))}
                  </ul>
                ) : null}

                {section.key === "exclude" ? (
                  <ul className={styles.highlightList}>
                    {(excludeItems.length
                      ? excludeItems
                      : ["Belum ada data exclude."]
                    ).map((item, index) => (
                      <li key={`exclude-${index}`}>{item}</li>
                    ))}
                  </ul>
                ) : null}

                {section.key === "bring" ? (
                  <ul className={styles.highlightList}>
                    {(whatToBringItems.length
                      ? whatToBringItems
                      : ["Belum ada data barang bawaan."]
                    ).map((item, index) => (
                      <li key={`bring-${index}`}>{item}</li>
                    ))}
                  </ul>
                ) : null}

                {section.key === "notes" ? (
                  <p className={styles.notesText}>
                    {notes || "Belum ada catatan tambahan."}
                  </p>
                ) : null}
              </div>
            ) : null}
          </section>
        );
      })}
    </div>
  );
}
