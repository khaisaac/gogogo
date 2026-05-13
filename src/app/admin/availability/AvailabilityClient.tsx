"use client";

import { useState, useEffect, useCallback } from "react";
import styles from "./availability.module.css";
import adminStyles from "../admin.module.css";

type Package = {
  id: string;
  title: string;
  route: string;
};

type AvailableDate = {
  id: string;
  date: string;
  max_pax: number;
  booked_pax: number;
  notes: string | null;
  is_active: boolean;
  package: { id: string; title: string; route: string };
};

export default function AvailabilityClient({ packages }: { packages: Package[] }) {
  const [selectedPackage, setSelectedPackage] = useState<string>(packages[0]?.id || "");
  const [dates, setDates] = useState<AvailableDate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Add form
  const [addMode, setAddMode] = useState<"single" | "range" | "bulk">("single");
  const [newDate, setNewDate] = useState("");
  const [rangeStart, setRangeStart] = useState("");
  const [rangeEnd, setRangeEnd] = useState("");
  const [bulkDates, setBulkDates] = useState("");
  const [maxPax, setMaxPax] = useState(20);
  const [notes, setNotes] = useState("");
  const [adding, setAdding] = useState(false);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editMaxPax, setEditMaxPax] = useState(20);
  const [editNotes, setEditNotes] = useState("");
  const [editActive, setEditActive] = useState(true);

  const fetchDates = useCallback(async () => {
    if (!selectedPackage) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/availability?package_id=${selectedPackage}`);
      const data = await res.json();
      setDates(data.dates || []);
    } catch {
      setError("Failed to load dates");
    } finally {
      setLoading(false);
    }
  }, [selectedPackage]);

  useEffect(() => {
    fetchDates();
  }, [fetchDates]);

  const flash = (msg: string, type: "success" | "error" = "success") => {
    if (type === "success") setSuccess(msg);
    else setError(msg);
    setTimeout(() => {
      setSuccess("");
      setError("");
    }, 3500);
  };

  // Generate date range
  const generateRange = (start: string, end: string): string[] => {
    const result: string[] = [];
    const startDate = new Date(start);
    const endDate = new Date(end);
    const cur = new Date(startDate);
    while (cur <= endDate) {
      result.push(cur.toISOString().split("T")[0]);
      cur.setDate(cur.getDate() + 1);
    }
    return result;
  };

  const handleAdd = async () => {
    setAdding(true);
    setError("");
    try {
      let datesToAdd: string[] = [];
      if (addMode === "single") {
        if (!newDate) { flash("Please select a date", "error"); setAdding(false); return; }
        datesToAdd = [newDate];
      } else if (addMode === "range") {
        if (!rangeStart || !rangeEnd) { flash("Please select start and end dates", "error"); setAdding(false); return; }
        if (rangeStart > rangeEnd) { flash("Start date must be before end date", "error"); setAdding(false); return; }
        datesToAdd = generateRange(rangeStart, rangeEnd);
        if (datesToAdd.length > 365) { flash("Range too large (max 365 days)", "error"); setAdding(false); return; }
      } else {
        datesToAdd = bulkDates
          .split(/[\n,]+/)
          .map((d) => d.trim())
          .filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d));
        if (datesToAdd.length === 0) { flash("No valid dates found (format: YYYY-MM-DD)", "error"); setAdding(false); return; }
      }

      const res = await fetch("/api/admin/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          package_id: selectedPackage,
          dates: datesToAdd,
          max_pax: maxPax,
          notes: notes || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");

      flash(`✅ ${data.created} date(s) added/updated successfully`);
      setNewDate(""); setRangeStart(""); setRangeEnd(""); setBulkDates(""); setNotes("");
      fetchDates();
    } catch (err: any) {
      flash(err.message || "Failed to add dates", "error");
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this date?")) return;
    try {
      const res = await fetch(`/api/admin/availability/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      flash("Date deleted");
      setDates((prev) => prev.filter((d) => d.id !== id));
    } catch {
      flash("Failed to delete", "error");
    }
  };

  const startEdit = (d: AvailableDate) => {
    setEditingId(d.id);
    setEditMaxPax(d.max_pax);
    setEditNotes(d.notes || "");
    setEditActive(d.is_active);
  };

  const handleUpdate = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/availability/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ max_pax: editMaxPax, notes: editNotes || null, is_active: editActive }),
      });
      if (!res.ok) throw new Error("Failed to update");
      flash("Date updated");
      setEditingId(null);
      fetchDates();
    } catch {
      flash("Failed to update", "error");
    }
  };

  const today = new Date().toISOString().split("T")[0];

  const upcomingDates = dates.filter((d) => d.date >= today);
  const pastDates = dates.filter((d) => d.date < today);

  const selectedPkg = packages.find((p) => p.id === selectedPackage);

  return (
    <div className={styles.wrapper}>
      {/* Package Selector */}
      <div className={styles.packageSelector}>
        <label className={styles.selectorLabel}>Select Package</label>
        <div className={styles.packageTabs}>
          {packages.map((pkg) => (
            <button
              key={pkg.id}
              className={`${styles.pkgTab} ${selectedPackage === pkg.id ? styles.pkgTabActive : ""}`}
              onClick={() => setSelectedPackage(pkg.id)}
            >
              <span className={styles.pkgRoute}>{pkg.route}</span>
              <span className={styles.pkgTitle}>{pkg.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Flash Messages */}
      {success && <div className={styles.successAlert}>{success}</div>}
      {error && <div className={styles.errorAlert}>{error}</div>}

      {/* Add Dates Panel */}
      <div className={styles.addPanel}>
        <h3 className={styles.panelTitle}>
          ➕ Add Available Dates
          {selectedPkg && (
            <span className={styles.panelSub}> — {selectedPkg.title}</span>
          )}
        </h3>

        <div className={styles.modeToggle}>
          {(["single", "range", "bulk"] as const).map((m) => (
            <button
              key={m}
              className={`${styles.modeBtn} ${addMode === m ? styles.modeBtnActive : ""}`}
              onClick={() => setAddMode(m)}
            >
              {m === "single" ? "📅 Single Date" : m === "range" ? "📆 Date Range" : "📋 Bulk Paste"}
            </button>
          ))}
        </div>

        <div className={styles.addForm}>
          {addMode === "single" && (
            <div className={styles.formField}>
              <label>Date</label>
              <input type="date" value={newDate} min={today} onChange={(e) => setNewDate(e.target.value)} />
            </div>
          )}

          {addMode === "range" && (
            <div className={styles.rangeRow}>
              <div className={styles.formField}>
                <label>Start Date</label>
                <input type="date" value={rangeStart} min={today} onChange={(e) => setRangeStart(e.target.value)} />
              </div>
              <div className={styles.rangeSep}>→</div>
              <div className={styles.formField}>
                <label>End Date</label>
                <input type="date" value={rangeEnd} min={rangeStart || today} onChange={(e) => setRangeEnd(e.target.value)} />
              </div>
              {rangeStart && rangeEnd && rangeStart <= rangeEnd && (
                <div className={styles.rangeInfo}>
                  {generateRange(rangeStart, rangeEnd).length} days
                </div>
              )}
            </div>
          )}

          {addMode === "bulk" && (
            <div className={styles.formField}>
              <label>Dates (one per line or comma-separated, format: YYYY-MM-DD)</label>
              <textarea
                value={bulkDates}
                onChange={(e) => setBulkDates(e.target.value)}
                placeholder={"2025-06-01\n2025-06-05\n2025-06-10"}
                rows={5}
              />
            </div>
          )}

          <div className={styles.addFormRow}>
            <div className={styles.formField}>
              <label>Max Pax (capacity)</label>
              <input type="number" min={1} max={200} value={maxPax} onChange={(e) => setMaxPax(Number(e.target.value))} />
            </div>
            <div className={`${styles.formField} ${styles.flex2}`}>
              <label>Notes (optional)</label>
              <input type="text" value={notes} placeholder="e.g. Special event, limited slots..." onChange={(e) => setNotes(e.target.value)} />
            </div>
            <button className={styles.addBtn} onClick={handleAdd} disabled={adding || !selectedPackage}>
              {adding ? "Adding..." : "Add Dates"}
            </button>
          </div>
        </div>
      </div>

      {/* Dates Table */}
      <div className={adminStyles.card}>
        <div className={adminStyles.row}>
          <h3 className={adminStyles.heading}>
            Upcoming Dates
            <span className={styles.countBadge}>{upcomingDates.length}</span>
          </h3>
        </div>

        {loading ? (
          <div className={styles.loadingState}>Loading dates...</div>
        ) : upcomingDates.length === 0 ? (
          <div className={styles.emptyState}>
            No upcoming available dates. Add some dates above.
          </div>
        ) : (
          <div className={adminStyles.tableWrap}>
            <table className={adminStyles.table}>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Day</th>
                  <th>Max Pax</th>
                  <th>Booked</th>
                  <th>Available</th>
                  <th>Notes</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {upcomingDates.map((d) => {
                  const dateStr = d.date.split("T")[0];
                  const dateObj = new Date(dateStr + "T00:00:00");
                  const dayName = dateObj.toLocaleDateString("en-US", { weekday: "short" });
                  const available = d.max_pax - d.booked_pax;
                  const isEditing = editingId === d.id;

                  return (
                    <tr key={d.id} className={!d.is_active ? styles.inactiveRow : ""}>
                      <td className={styles.dateCell}>
                        {dateObj.toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td><span className={styles.dayBadge}>{dayName}</span></td>
                      <td>
                        {isEditing ? (
                          <input
                            type="number"
                            className={styles.inlineInput}
                            value={editMaxPax}
                            min={d.booked_pax}
                            max={200}
                            onChange={(e) => setEditMaxPax(Number(e.target.value))}
                          />
                        ) : d.max_pax}
                      </td>
                      <td>{d.booked_pax}</td>
                      <td>
                        <span className={`${styles.availBadge} ${available === 0 ? styles.full : available <= 5 ? styles.low : styles.open}`}>
                          {available === 0 ? "FULL" : `${available} slots`}
                        </span>
                      </td>
                      <td className={styles.notesCell}>
                        {isEditing ? (
                          <input
                            type="text"
                            className={styles.inlineInput}
                            value={editNotes}
                            placeholder="Notes..."
                            onChange={(e) => setEditNotes(e.target.value)}
                          />
                        ) : (d.notes || "—")}
                      </td>
                      <td>
                        {isEditing ? (
                          <label className={styles.toggleLabel}>
                            <input
                              type="checkbox"
                              checked={editActive}
                              onChange={(e) => setEditActive(e.target.checked)}
                            />
                            Active
                          </label>
                        ) : (
                          <span className={`${adminStyles.badge} ${d.is_active ? adminStyles.active : adminStyles.inactive}`}>
                            {d.is_active ? "Active" : "Off"}
                          </span>
                        )}
                      </td>
                      <td>
                        {isEditing ? (
                          <div className={adminStyles.actions}>
                            <button className={adminStyles.primaryLink} onClick={() => handleUpdate(d.id)}>Save</button>
                            <button className={adminStyles.outlineLink} onClick={() => setEditingId(null)}>Cancel</button>
                          </div>
                        ) : (
                          <div className={adminStyles.actions}>
                            <button className={adminStyles.outlineLink} onClick={() => startEdit(d)}>Edit</button>
                            <button className={adminStyles.dangerBtn} onClick={() => handleDelete(d.id)}>Delete</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Past Dates (collapsed) */}
      {pastDates.length > 0 && (
        <details className={styles.pastSection}>
          <summary className={styles.pastSummary}>
            🕐 Past Dates ({pastDates.length})
          </summary>
          <div className={adminStyles.tableWrap}>
            <table className={adminStyles.table}>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Max Pax</th>
                  <th>Booked</th>
                  <th>Notes</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pastDates.map((d) => {
                  const pDateStr = d.date.split("T")[0];
                  return (
                  <tr key={d.id} className={styles.pastRow}>
                    <td>{new Date(pDateStr + "T00:00:00").toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</td>
                    <td>{d.max_pax}</td>
                    <td>{d.booked_pax}</td>
                    <td>{d.notes || "—"}</td>
                    <td>
                      <button className={adminStyles.dangerBtn} onClick={() => handleDelete(d.id)}>Delete</button>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </details>
      )}
    </div>
  );
}
