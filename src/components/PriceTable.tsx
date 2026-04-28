"use client";

import { useMemo, useRef, useState } from "react";
import styles from "./PriceTable.module.css";
import type { PublicPackage } from "@/lib/public-packages";
import {
  GROUP_TIER_OPTIONS,
  PRICE_TYPES,
  getGroupTierPrice,
  type PriceType,
} from "@/lib/pricing";

type PriceTableProps = {
  packages: PublicPackage[];
};

export default function PriceTable({ packages }: PriceTableProps) {
  const tableRef = useRef<HTMLDivElement>(null);
  const [priceType, setPriceType] = useState<PriceType>("private");

  const scrollLeft = () => {
    if (tableRef.current) {
      tableRef.current.scrollBy({ left: -200, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (tableRef.current) {
      tableRef.current.scrollBy({ left: 200, behavior: "smooth" });
    }
  };

  const priceData = useMemo(
    () =>
      packages.map((pkg) => ({
        package: pkg.title,
        prices: GROUP_TIER_OPTIONS.map((tier) =>
          getGroupTierPrice(pkg, priceType, tier.key),
        ),
      })),
    [packages, priceType],
  );

  return (
    <section id="pricing" className={styles.pricingSection}>
      <div className="container">
        <span className={styles.label}>Transparent Pricing</span>
        <h2 className="section-title">Global Price</h2>
        <p className="section-subtitle">
          Choose a service type to view the price per person based on group
          sizes of 1, 2-3, 4-5, 6-8, and 9-10+ people.
        </p>

        <div className={styles.priceTypeSwitch}>
          {PRICE_TYPES.map((typeDef) => (
            <button
              key={typeDef.value}
              type="button"
              className={`${styles.typeBtn} ${
                priceType === typeDef.value ? styles.typeBtnActive : ""
              }`}
              onClick={() => setPriceType(typeDef.value)}
            >
              {typeDef.label}
            </button>
          ))}
        </div>

        <div className={styles.tableWrapper} ref={tableRef}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.packageCol}>Packages</th>
                  {GROUP_TIER_OPTIONS.map((tier) => (
                    <th key={`heading-${tier.key}`}>{tier.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {priceData.map((row, i) => (
                <tr key={i}>
                  <td className={styles.packageName}>{row.package}</td>
                  {row.prices.map((price, j) => (
                      <td key={j} className={j === 2 ? styles.popular : ""}>
                      {price ? (
                        <span className={styles.price}>${price}</span>
                      ) : (
                        <span className={styles.na}>—</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Scroll Controls */}
        <div className={styles.mobileControls}>
          <button
            onClick={scrollLeft}
            className={styles.scrollBtn}
            aria-label="Scroll Left"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="square"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
          <span className={styles.scrollText}>Click to see more</span>
          <button
            onClick={scrollRight}
            className={styles.scrollBtn}
            aria-label="Scroll Right"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="square"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Rich Multi-Layered Wavy Separator */}
      <div className={styles.wavySeparator}>
        <svg
          data-name="Layer 1"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          {/* Layer 3 - Background depth */}
          <path
            d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5,73.84-4.36,147.54,16.88,218.32,37.5,110.16,32.07,224.15,37.78,337.08,21.63,83.15-11.89,163.51-40,246.33-41.25V0Z"
            className={styles.layer3}
          ></path>
          {/* Layer 2 - Highlight ridge */}
          <path
            d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28,21.34-10,41.97-21.89,62.11-34.4,26.35-16.37,45.06-44.59,71.22-60.52,43.08-26.24,96.69-26.75,145.49-16.73,30.34,6.23,59,16.29,88,24.3V0Z"
            className={styles.layer2}
          ></path>
          {/* Layer 1 - Solid foreground */}
          <path
            d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z"
            className={styles.layer1}
          ></path>
        </svg>
      </div>
    </section>
  );
}
