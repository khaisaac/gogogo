"use client";

import { useState } from "react";
import {
  GROUP_TIER_OPTIONS,
  TOTAL_DAY_OPTIONS,
  getGroupTierPrice,
  getTotalPackagePrice,
  getPackageOptions,
  type PackagePricingFields,
} from "@/lib/pricing";
import styles from "./PackagePricingTable.module.css";

type PackagePricingTableProps = {
  prices: PackagePricingFields;
};

export default function PackagePricingTable({ prices }: PackagePricingTableProps) {
  const options = getPackageOptions(prices);
  const availablePriceTypes = options
    .filter((opt) => {
      const hasTierPrice = GROUP_TIER_OPTIONS.some(
        (tier) => getGroupTierPrice(prices, opt.id, tier.key) !== null
      );
      const hasTotalPackagePrice = TOTAL_DAY_OPTIONS.some(
        (days) => getTotalPackagePrice(prices, opt.id, days) !== null
      );
      return hasTierPrice || hasTotalPackagePrice;
    })
    .map((opt) => ({ value: opt.id, label: opt.title }));

  // Default to selecting the first 2 options so the desktop table looks full and comparative
  const [selectedTabs, setSelectedTabs] = useState<string[]>(() => {
    if (availablePriceTypes.length >= 2) {
      return [availablePriceTypes[0].value, availablePriceTypes[1].value];
    }
    return availablePriceTypes.length > 0 ? [availablePriceTypes[0].value] : [];
  });

  if (availablePriceTypes.length === 0) {
    return null;
  }

  const toggleTab = (value: string) => {
    if (selectedTabs.includes(value)) {
      // Don't unselect if it's the last selected tab so table isn't empty
      if (selectedTabs.length > 1) {
        setSelectedTabs(selectedTabs.filter((t) => t !== value));
      }
    } else {
      setSelectedTabs([...selectedTabs, value]);
    }
  };

  const activeTypes = availablePriceTypes.filter((t) => selectedTabs.includes(t.value));
  if (activeTypes.length === 0 && availablePriceTypes[0]) {
    activeTypes.push(availablePriceTypes[0]);
  }

  const availableTiers = GROUP_TIER_OPTIONS.filter((tier) =>
    activeTypes.some((type) => getGroupTierPrice(prices, type.value, tier.key) !== null)
  );

  const availableTotalDays = TOTAL_DAY_OPTIONS.filter((days) =>
    activeTypes.some((type) => getTotalPackagePrice(prices, type.value, days) !== null)
  );

  return (
    <div className={styles.pricingTableWrapper}>
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <h3 className={styles.pricingTitle}>Pricing Information</h3>
          <span className={styles.activeLabel}>
            Showing: <strong>{activeTypes.map((t) => t.label).join(" & ")}</strong>
          </span>
        </div>
        {availablePriceTypes.length > 1 && (
          <div>
            <p className={styles.subHint}>Klik tombol di bawah untuk membandingkan / menambah kolom harga:</p>
            <div className={styles.tabsContainer}>
              {availablePriceTypes.map((type) => {
                const isActive = selectedTabs.includes(type.value);
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => toggleTab(type.value)}
                    className={`${styles.tabBtn} ${isActive ? styles.activeTab : ""}`}
                    title={isActive ? "Klik untuk sembunyikan kolom ini" : "Klik untuk tampilkan kolom ini"}
                  >
                    <span className={isActive ? styles.checkIcon : styles.plusIcon}>
                      {isActive ? "✓" : "+"}
                    </span>
                    {type.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.pricingTable}>
          <thead>
            <tr>
              <th>Group Size / Duration</th>
              {activeTypes.map((type) => (
                <th key={type.value}>Price ({type.label})</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {availableTiers.length > 0 && (
              <>
                <tr className={styles.sectionRow}>
                  <td colSpan={activeTypes.length + 1}>
                    <strong>Price Per Person (USD)</strong>
                  </td>
                </tr>
                {availableTiers.map((tier) => (
                  <tr key={tier.key}>
                    <td>{tier.label}</td>
                    {activeTypes.map((type) => {
                      const price = getGroupTierPrice(prices, type.value, tier.key);
                      return (
                        <td key={type.value} className={styles.priceCell}>
                          {price !== null ? (
                            <span className={styles.priceBadge}>${price}</span>
                          ) : (
                            <span className={styles.naBadge}>-</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </>
            )}

            {availableTotalDays.length > 0 && (
              <>
                <tr className={styles.sectionRow}>
                  <td colSpan={activeTypes.length + 1}>
                    <strong>Total Package Price (USD)</strong>
                  </td>
                </tr>
                {availableTotalDays.map((days) => (
                  <tr key={days}>
                    <td>{days} Days Package</td>
                    {activeTypes.map((type) => {
                      const price = getTotalPackagePrice(prices, type.value, days);
                      return (
                        <td key={type.value} className={styles.priceCell}>
                          {price !== null ? (
                            <span className={styles.priceBadge}>${price}</span>
                          ) : (
                            <span className={styles.naBadge}>-</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
