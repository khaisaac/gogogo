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

  const [activeTab, setActiveTab] = useState<string>(() => availablePriceTypes[0]?.value || "");

  if (availablePriceTypes.length === 0) {
    return null;
  }

  const currentType = availablePriceTypes.find((t) => t.value === activeTab) || availablePriceTypes[0];

  const availableTiers = GROUP_TIER_OPTIONS.filter((tier) =>
    getGroupTierPrice(prices, currentType.value, tier.key) !== null
  );

  const availableTotalDays = TOTAL_DAY_OPTIONS.filter((days) =>
    getTotalPackagePrice(prices, currentType.value, days) !== null
  );

  return (
    <div className={styles.pricingTableWrapper}>
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <h3 className={styles.pricingTitle}>Pricing Information</h3>
          <span className={styles.activeLabel}>Showing: <strong>{currentType.label}</strong></span>
        </div>
        {availablePriceTypes.length > 1 && (
          <div className={styles.tabsContainer}>
            {availablePriceTypes.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => setActiveTab(type.value)}
                className={`${styles.tabBtn} ${currentType.value === type.value ? styles.activeTab : ""}`}
              >
                {type.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.pricingTable}>
          <thead>
            <tr>
              <th>Group Size / Duration</th>
              <th>Price ({currentType.label})</th>
            </tr>
          </thead>
          <tbody>
            {availableTiers.length > 0 && (
              <>
                <tr className={styles.sectionRow}>
                  <td colSpan={2}>
                    <strong>Price Per Person (USD)</strong>
                  </td>
                </tr>
                {availableTiers.map((tier) => {
                  const price = getGroupTierPrice(prices, currentType.value, tier.key);
                  return (
                    <tr key={tier.key}>
                      <td>{tier.label}</td>
                      <td className={styles.priceCell}>
                        {price !== null ? (
                          <span className={styles.priceBadge}>${price}</span>
                        ) : (
                          <span className={styles.naBadge}>-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </>
            )}

            {availableTotalDays.length > 0 && (
              <>
                <tr className={styles.sectionRow}>
                  <td colSpan={2}>
                    <strong>Total Package Price (USD)</strong>
                  </td>
                </tr>
                {availableTotalDays.map((days) => {
                  const price = getTotalPackagePrice(prices, currentType.value, days);
                  return (
                    <tr key={days}>
                      <td>{days} Days Package</td>
                      <td className={styles.priceCell}>
                        {price !== null ? (
                          <span className={styles.priceBadge}>${price}</span>
                        ) : (
                          <span className={styles.naBadge}>-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
