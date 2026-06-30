"use client";

import { useRef } from "react";
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
  const tableRef = useRef<HTMLDivElement>(null);
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

  if (availablePriceTypes.length === 0) {
    return null;
  }

  const scroll = (offset: number) => {
    if (tableRef.current) {
      tableRef.current.scrollBy({ left: offset, behavior: "smooth" });
    }
  };

  const availableTiers = GROUP_TIER_OPTIONS.filter((tier) =>
    availablePriceTypes.some((type) => getGroupTierPrice(prices, type.value, tier.key) !== null)
  );

  const availableTotalDays = TOTAL_DAY_OPTIONS.filter((days) =>
    availablePriceTypes.some((type) => getTotalPackagePrice(prices, type.value, days) !== null)
  );

  return (
    <div className={styles.pricingTableWrapper}>
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <h3 className={styles.pricingTitle}>Pricing Information</h3>
          <span className={styles.activeLabel}>
            Showing: <strong>All Service Options</strong>
          </span>
        </div>
        {availablePriceTypes.length > 1 && (
          <div className={styles.sliderHintBox}>
            <div className={styles.hintText}>
              {/* <span className={styles.swipeIcon}>↔️</span> */}
              <span>
                <strong>Slide the table to the side</strong> to view all service options
              </span>
            </div>
            <div className={styles.sliderControls}>
              <button type="button" onClick={() => scroll(-250)} className={styles.slideBtn}>
                ◀ Slide
              </button>
              <button type="button" onClick={() => scroll(250)} className={styles.slideBtn}>
                Slide ▶
              </button>
            </div>
          </div>
        )}
      </div>

      <div className={styles.tableContainer} ref={tableRef}>
        <table className={styles.pricingTable}>
          <thead>
            <tr>
              <th>Group Size / Duration</th>
              {availablePriceTypes.map((type) => (
                <th key={type.value}>{type.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {availableTiers.length > 0 && (
              <>
                <tr className={styles.sectionRow}>
                  <td colSpan={availablePriceTypes.length + 1}>
                    <strong>Price Per Person (USD)</strong>
                  </td>
                </tr>
                {availableTiers.map((tier) => (
                  <tr key={tier.key}>
                    <td>{tier.label}</td>
                    {availablePriceTypes.map((type) => {
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
                  <td colSpan={availablePriceTypes.length + 1}>
                    <strong>Total Package Price (USD)</strong>
                  </td>
                </tr>
                {availableTotalDays.map((days) => (
                  <tr key={days}>
                    <td>{days} Days Package</td>
                    {availablePriceTypes.map((type) => {
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
