"use client";

import { useMemo, useRef, useState } from "react";
import {
  GROUP_TIER_OPTIONS,
  PAX_OPTIONS,
  getGroupTierForPaxCount,
  PRICE_TYPES,
  TOTAL_DAY_OPTIONS,
  getPerPaxPrice,
  getTotalPackagePrice,
  type GroupTierKey,
  type PaxNumber,
  type PriceType,
  type TotalDayOption,
  type PackagePricingFields,
} from "@/lib/pricing";
import styles from "./PackageDetailPage.module.css";

type PackagePricingSelectorProps = {
  packageId: string;
  prices: PackagePricingFields;
  fallbackDisplayPrice: number;
};

export default function PackagePricingSelector({
  packageId,
  prices,
  fallbackDisplayPrice,
}: PackagePricingSelectorProps) {
  const [priceType, setPriceType] = useState<PriceType>("private");
  const [pax, setPax] = useState<PaxNumber>(1);
  const [pricingMode, setPricingMode] = useState<"per_pax" | "total_package">(
    "per_pax",
  );
  const [totalDays, setTotalDays] = useState<TotalDayOption>(2);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const dateInputRef = useRef<HTMLInputElement>(null);

  // Get today's date in YYYY-MM-DD format based on local timezone
  const getTodayDateString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const minDate = getTodayDateString();

  const availableServiceTypes = useMemo(() => {
    return PRICE_TYPES.filter((typeDef) => {
      const hasPerPax = PAX_OPTIONS.some(
        (option) => getPerPaxPrice(prices, typeDef.value, option) !== null,
      );
      const hasTotalPackage = TOTAL_DAY_OPTIONS.some(
        (days) => getTotalPackagePrice(prices, typeDef.value, days) !== null,
      );

      return hasPerPax || hasTotalPackage;
    });
  }, [prices]);

  const resolvedPriceType =
    availableServiceTypes.some((typeDef) => typeDef.value === priceType) ||
    availableServiceTypes.length === 0
      ? priceType
      : availableServiceTypes[0].value;

  const availablePerPaxOptions = useMemo(
    () =>
      PAX_OPTIONS.filter(
        (option) => getPerPaxPrice(prices, resolvedPriceType, option) !== null,
      ),
    [prices, resolvedPriceType],
  );

  const availableTierOptions = useMemo(
    () =>
      GROUP_TIER_OPTIONS.filter((tier) =>
        tier.paxValues.some((value) => availablePerPaxOptions.includes(value)),
      ),
    [availablePerPaxOptions],
  );

  const hasPerPaxPrices = availablePerPaxOptions.length > 0;

  const availableTotalDays = useMemo(
    () =>
      TOTAL_DAY_OPTIONS.filter(
        (days) =>
          getTotalPackagePrice(prices, resolvedPriceType, days) !== null,
      ),
    [prices, resolvedPriceType],
  );

  const hasTotalPackagePrices = availableTotalDays.length > 0;
  const resolvedPricingMode =
    pricingMode === "per_pax"
      ? hasPerPaxPrices || !hasTotalPackagePrices
        ? "per_pax"
        : "total_package"
      : hasTotalPackagePrices || !hasPerPaxPrices
        ? "total_package"
        : "per_pax";
  const resolvedPax = availablePerPaxOptions.includes(pax)
    ? pax
    : (availablePerPaxOptions[0] ?? pax);
  const resolvedTier = getGroupTierForPaxCount(resolvedPax);
  const resolvedTotalDays = availableTotalDays.includes(totalDays)
    ? totalDays
    : (availableTotalDays[0] ?? totalDays);

  const perPaxPrice = useMemo(
    () => getPerPaxPrice(prices, resolvedPriceType, resolvedPax),
    [prices, resolvedPriceType, resolvedPax],
  );

  const totalPackagePrice = useMemo(
    () => getTotalPackagePrice(prices, resolvedPriceType, resolvedTotalDays),
    [prices, resolvedPriceType, resolvedTotalDays],
  );

  const totalPerPaxPrice = perPaxPrice;
  const displayedPrice =
    resolvedPricingMode === "total_package"
      ? (totalPackagePrice ?? fallbackDisplayPrice)
      : (perPaxPrice ?? fallbackDisplayPrice);
  const safeDisplayedPrice = displayedPrice > 0 ? displayedPrice : null;
  const serviceLabel =
    PRICE_TYPES.find((item) => item.value === resolvedPriceType)?.label ||
    "Private";
  const hasModeChoice = hasPerPaxPrices && hasTotalPackagePrices;
  const activeGroupTier = resolvedTier;
  const decrementAdult = () =>
    setPax((current) => Math.max(1, current - 1) as PaxNumber);
  const incrementAdult = () =>
    setPax((current) => Math.min(10, current + 1) as PaxNumber);

  return (
    <>
      <p className={styles.fromLabel}>From</p>
      <p className={styles.bookingPrice}>
        {safeDisplayedPrice !== null
          ? `$${safeDisplayedPrice}`
          : "Price unavailable"}{" "}
        <span>
          {safeDisplayedPrice !== null
            ? resolvedPricingMode === "total_package"
              ? "total package"
              : "per person"
            : ""}
        </span>
      </p>

      <p className={styles.bookingSummary}>
        {resolvedPricingMode === "total_package"
          ? `${serviceLabel} service, ${resolvedTotalDays} days total (${resolvedPax} persons)`
          : `${serviceLabel} service, ${activeGroupTier.label}`}
        {resolvedPricingMode === "total_package"
          ? totalPackagePrice !== null
            ? ` - Total $${totalPackagePrice * resolvedPax}`
            : " - Price unavailable"
          : totalPerPaxPrice !== null
            ? ` - Total $${totalPerPaxPrice * resolvedPax}`
            : " - Price unavailable"}
      </p>

      <div className={styles.selector}>
        <select
          className={styles.bookingSelect}
          value={resolvedPriceType}
          onChange={(event) => setPriceType(event.target.value as PriceType)}
          aria-label="Select service type"
        >
          {availableServiceTypes.map((typeDef) => (
            <option key={typeDef.value} value={typeDef.value}>
              {typeDef.label}
            </option>
          ))}
        </select>
      </div>

      {hasModeChoice ? (
        <div className={styles.selector}>
          <select
            className={styles.bookingSelect}
            value={resolvedPricingMode}
            onChange={(event) =>
              setPricingMode(event.target.value as "per_pax" | "total_package")
            }
            aria-label="Select pricing mode"
          >
            <option value="per_pax">Per Person</option>
            <option value="total_package">Total Package</option>
          </select>
        </div>
      ) : null}

      {resolvedPricingMode === "total_package" ? (
        <div className={styles.selector}>
          <select
            className={styles.bookingSelect}
            value={resolvedTotalDays}
            onChange={(event) =>
              setTotalDays(Number(event.target.value) as TotalDayOption)
            }
            aria-label="Select package duration"
          >
            {availableTotalDays.map((days) => (
              <option key={days} value={days}>
                Total {days} Days
              </option>
            ))}
          </select>
        </div>
      ) : (
        <div className={styles.selector}>
          <select
            className={styles.bookingSelect}
            value={resolvedTier.key}
            onChange={(event) =>
              setPax(
                (GROUP_TIER_OPTIONS.find(
                  (tier) => tier.key === (event.target.value as GroupTierKey),
                )?.paxValues[0] ?? 1) as PaxNumber,
              )
            }
            aria-label="Select group size"
          >
            {availableTierOptions.map((tier) => (
              <option key={tier.key} value={tier.key}>
                {tier.label}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className={styles.adultStepper}>
        <span className={styles.adultStepperLabel}>Persons</span>
        <div className={styles.adultStepperControls}>
          <button
            type="button"
            className={styles.adultStepperButton}
            onClick={decrementAdult}
            aria-label="Decrease persons"
            disabled={resolvedPax <= 1}
          >
            −
          </button>
          <span className={styles.adultStepperValue}>{resolvedPax}</span>
          <button
            type="button"
            className={styles.adultStepperButton}
            onClick={incrementAdult}
            aria-label="Increase persons"
            disabled={resolvedPax >= 10}
          >
            +
          </button>
        </div>
      </div>

      <div 
        className={styles.selector}
        onClick={() => {
          try {
            if (dateInputRef.current && 'showPicker' in HTMLInputElement.prototype) {
              dateInputRef.current.showPicker();
            }
          } catch (e) {
            // ignore
          }
        }}
      >
        <span className={styles.dateTrigger} aria-hidden="true">
          {selectedDate || "Select date"}
        </span>
        <input
          ref={dateInputRef}
          id="trek-start-date"
          type="date"
          className={styles.datePickerInput}
          value={selectedDate}
          onChange={(event) => setSelectedDate(event.target.value)}
          onClick={(e) => {
            try {
              if ('showPicker' in HTMLInputElement.prototype) {
                e.currentTarget.showPicker();
              }
            } catch (err) {
              // ignore
            }
          }}
          min={minDate}
          aria-label="Select trek start date"
        />
      </div>
      
      <a 
        href={`/checkout?package_id=${packageId}&price_type=${resolvedPriceType}&price_mode=${resolvedPricingMode}&pax=${resolvedPax}&total_days=${resolvedTotalDays}&date=${selectedDate}`} 
        className={styles.availabilityBtn}
        onClick={(e) => {
          if (!selectedDate) {
            e.preventDefault();
            alert("Please select a trekking date first.");
            dateInputRef.current?.focus();
          }
        }}
      >
        Book Now
      </a>
      {/* <div className={styles.selector}>English</div> */}
    </>
  );
}
