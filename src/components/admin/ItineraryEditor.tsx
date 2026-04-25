"use client";

import { useState } from "react";
import type { ItineraryDay } from "@/lib/package-content";
import styles from "./ItineraryEditor.module.css";

type DraftDay = {
  id: string;
  title: string;
  scheduleText: string;
  overviewText: string;
};

type ItineraryEditorProps = {
  name: string;
  defaultValue?: ItineraryDay[];
  helperText?: string;
};

function toDraftDay(
  day: ItineraryDay | undefined,
  index: number,
  id: string,
): DraftDay {
  return {
    id,
    title: day?.title || `Day ${index + 1}`,
    scheduleText: day?.schedule.join("\n") || "",
    overviewText: day?.overview.join("\n") || "",
  };
}

function splitLines(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function toSerializedDays(days: DraftDay[]): ItineraryDay[] {
  return days
    .map((day, index) => ({
      title: day.title.trim() || `Day ${index + 1}`,
      schedule: splitLines(day.scheduleText),
      overview: splitLines(day.overviewText),
    }))
    .filter(
      (day) =>
        day.title.length > 0 ||
        day.schedule.length > 0 ||
        day.overview.length > 0,
    );
}

export default function ItineraryEditor({
  name,
  defaultValue = [],
  helperText = "Tambah, edit, atau hapus blok itinerary per hari.",
}: ItineraryEditorProps) {
  const [days, setDays] = useState<DraftDay[]>(() => {
    return defaultValue.length > 0
      ? defaultValue.map((day, index) =>
          toDraftDay(day, index, `day-${index + 1}`),
        )
      : [toDraftDay(undefined, 0, "day-1")];
  });
  const [nextId, setNextId] = useState(() =>
    defaultValue.length > 0 ? defaultValue.length + 1 : 2,
  );

  const serializedValue = JSON.stringify(toSerializedDays(days));

  return (
    <div className={styles.wrapper}>
      <div className={styles.toolbar}>
        <p className={styles.helpText}>{helperText}</p>
        <button
          type="button"
          className={styles.addBtn}
          onClick={() => {
            setDays((current) => [
              ...current,
              toDraftDay(undefined, current.length, `day-${nextId}`),
            ]);
            setNextId((current) => current + 1);
          }}
        >
          Add day
        </button>
      </div>

      <input type="hidden" name={name} value={serializedValue} />

      {days.length > 0 ? (
        <div className={styles.list}>
          {days.map((day, index) => (
            <section key={day.id} className={styles.dayCard}>
              <div className={styles.dayHeader}>
                <span className={styles.dayTitle}>Day {index + 1}</span>
                <button
                  type="button"
                  className={styles.removeBtn}
                  onClick={() =>
                    setDays((current) =>
                      current.filter((item) => item.id !== day.id),
                    )
                  }
                >
                  Remove day
                </button>
              </div>

              <div className={styles.fieldGrid}>
                <div className={styles.field}>
                  <label htmlFor={`itinerary-title-${day.id}`}>Day title</label>
                  <input
                    id={`itinerary-title-${day.id}`}
                    className={styles.input}
                    value={day.title}
                    onChange={(event) => {
                      const value = event.target.value;
                      setDays((current) =>
                        current.map((item) =>
                          item.id === day.id ? { ...item, title: value } : item,
                        ),
                      );
                    }}
                    placeholder={`Day ${index + 1}`}
                  />
                </div>

                <div className={styles.field}>
                  <label htmlFor={`itinerary-schedule-${day.id}`}>
                    Schedule / activities
                  </label>
                  <textarea
                    id={`itinerary-schedule-${day.id}`}
                    className={styles.textarea}
                    value={day.scheduleText}
                    onChange={(event) => {
                      const value = event.target.value;
                      setDays((current) =>
                        current.map((item) =>
                          item.id === day.id
                            ? { ...item, scheduleText: value }
                            : item,
                        ),
                      );
                    }}
                    placeholder={
                      "06.00-06.30: Breakfast in the hotel\n07.00-07.30: Transfer to Sembalun Village"
                    }
                  />
                </div>

                <div className={styles.field}>
                  <label htmlFor={`itinerary-overview-${day.id}`}>
                    Overview / highlights
                  </label>
                  <textarea
                    id={`itinerary-overview-${day.id}`}
                    className={styles.textarea}
                    value={day.overviewText}
                    onChange={(event) => {
                      const value = event.target.value;
                      setDays((current) =>
                        current.map((item) =>
                          item.id === day.id
                            ? { ...item, overviewText: value }
                            : item,
                        ),
                      );
                    }}
                    placeholder={
                      "Distance: 10 KM\nWalk duration: 6-7 Hours\nDifficulty: Moderate"
                    }
                  />
                </div>
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <p>Belum ada itinerary day yang ditambahkan.</p>
          <button
            type="button"
            className={styles.addBtn}
            onClick={() => {
              setDays([toDraftDay(undefined, 0, `day-${nextId}`)]);
              setNextId((current) => current + 1);
            }}
          >
            Add first day
          </button>
        </div>
      )}
    </div>
  );
}
