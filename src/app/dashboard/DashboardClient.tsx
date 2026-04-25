"use client";

import { useState } from "react";
import styles from "@/components/dashboard/dashboard.module.css";
import ProfileSettings from "@/components/dashboard/ProfileSettings";
import BookingHistory from "@/components/dashboard/BookingHistory";

export default function DashboardClient({ user }: { user: any }) {
  const [activeTab, setActiveTab] = useState<"bookings" | "profile">("bookings");

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <button 
          className={`${styles.tabBtn} ${activeTab === "bookings" ? styles.activeTab : ""}`}
          onClick={() => setActiveTab("bookings")}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          My Bookings
        </button>
        <button 
          className={`${styles.tabBtn} ${activeTab === "profile" ? styles.activeTab : ""}`}
          onClick={() => setActiveTab("profile")}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          Profile Settings
        </button>
      </aside>

      <main className={styles.content}>
        {activeTab === "bookings" && <BookingHistory user={user} />}
        {activeTab === "profile" && <ProfileSettings user={user} />}
      </main>
    </div>
  );
}
