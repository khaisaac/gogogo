"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";
import {
  GROUP_TIER_OPTIONS,
  PAX_OPTIONS,
  getGroupTierForPaxCount,
  PRICE_TYPES,
  TOTAL_DAY_OPTIONS,
  getPerPaxPrice,
  getGroupTierPrice,
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
  const [selectedTierKey, setSelectedTierKey] = useState<GroupTierKey>("1");
  const [pax, setPax] = useState<PaxNumber>(1);
  const [pricingMode, setPricingMode] = useState<"per_pax" | "total_package">(
    "per_pax",
  );
  const [totalDays, setTotalDays] = useState<TotalDayOption>(2);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [promoCode, setPromoCode] = useState<string>("");
  const [voucherFeedback, setVoucherFeedback] = useState<string>("");

  // Get today's date in YYYY-MM-DD format based on local timezone
  const getTodayDateString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const minDate = getTodayDateString();

  const [availableDates, setAvailableDates] = useState<{date: string, available_pax: number, is_available: boolean, id: string}[]>([]);
  const [loadingDates, setLoadingDates] = useState(true);

  useEffect(() => {
    async function fetchDates() {
      setLoadingDates(true);
      try {
        const res = await fetch(`/api/availability?package_id=${packageId}`);
        const data = await res.json();
        if (data.dates) {
          setAvailableDates(data.dates);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingDates(false);
      }
    }
    fetchDates();
  }, [packageId]);

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
    
  const resolvedTierKey = availableTierOptions.some((t) => t.key === selectedTierKey)
    ? selectedTierKey
    : (availableTierOptions[0]?.key ?? "1");
  
  const activeGroupTier = GROUP_TIER_OPTIONS.find((t) => t.key === resolvedTierKey)!;

  const resolvedTotalDays = availableTotalDays.includes(totalDays)
    ? totalDays
    : (availableTotalDays[0] ?? totalDays);

  const perPaxPrice = useMemo(
    () => getGroupTierPrice(prices, resolvedPriceType, resolvedTierKey),
    [prices, resolvedPriceType, resolvedTierKey],
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
  const decrementAdult = () =>
    setPax((current) => Math.max(1, current - 1) as PaxNumber);
  const incrementAdult = () =>
    setPax((current) => Math.min(10, current + 1) as PaxNumber);

  const filteredDates = availableDates.filter(d => d.is_available && d.available_pax >= resolvedPax);

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
          ? `${serviceLabel} service, ${resolvedTotalDays} days total (${resolvedPax} adults)`
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
            value={resolvedTierKey}
            onChange={(event) =>
              setSelectedTierKey(event.target.value as GroupTierKey)
            }
            aria-label="Select package tier"
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
        <span className={styles.adultStepperLabel}>Adults</span>
        <div className={styles.adultStepperControls}>
          <button
            type="button"
            className={styles.adultStepperButton}
            onClick={decrementAdult}
            aria-label="Decrease adults"
            disabled={resolvedPax <= 1}
          >
            −
          </button>
          <span className={styles.adultStepperValue}>{resolvedPax}</span>
          <button
            type="button"
            className={styles.adultStepperButton}
            onClick={incrementAdult}
            aria-label="Increase adults"
            disabled={resolvedPax >= 10}
          >
            +
          </button>
        </div>
      </div>

      <div className={styles.selector}>
        {loadingDates ? (
          <span className={styles.dateTrigger}>Loading dates...</span>
        ) : (
          <DatePicker
            selected={selectedDate ? new Date(selectedDate + "T00:00:00") : null}
            onChange={(date: Date | null) => {
              if (date) {
                setSelectedDate(format(date, "yyyy-MM-dd"));
              } else {
                setSelectedDate("");
              }
            }}
            includeDates={filteredDates.map((d) => new Date(d.date + "T00:00:00"))}
            placeholderText={
              filteredDates.length > 0
                ? "Select available date"
                : "No dates available"
            }
            className={styles.bookingSelect}
            disabled={filteredDates.length === 0}
            dateFormat="EEE, MMM d, yyyy"
            renderDayContents={(day: number, date: Date) => {
              if (!date) return day;
              const dateStr = format(date, "yyyy-MM-dd");
              const availability = filteredDates.find((d) => d.date === dateStr);
              return (
                <div
                  title={
                    availability
                      ? `${availability.available_pax} slots left`
                      : "Not available"
                  }
                >
                  {day}
                </div>
              );
            }}
          />
        )}
      </div>

      {/* Optional Voucher Code Box */}
      <div className={styles.voucherBox}>
        <div className={styles.voucherHeader}>
          <span className={styles.voucherIcon}>🏷️</span> Have a Voucher Code?
        </div>
        <div className={styles.voucherRow}>
          <input
            type="text"
            className={styles.voucherInput}
            placeholder="ENTER PROMO CODE"
            value={promoCode}
            onChange={(e) => {
              setPromoCode(e.target.value.toUpperCase());
              setVoucherFeedback("");
            }}
          />
          <button
            type="button"
            className={styles.voucherApplyBtn}
            onClick={() => {
              if (!promoCode.trim()) {
                setVoucherFeedback("Please enter a code.");
              } else {
                setVoucherFeedback("✅ Code attached! Will apply at checkout.");
              }
            }}
          >
            Apply
          </button>
        </div>
        {voucherFeedback && (
          <p className={styles.voucherFeedbackText}>{voucherFeedback}</p>
        )}
      </div>
      
      <a 
        href={`/checkout?package_id=${packageId}&price_type=${resolvedPriceType}&price_mode=${resolvedPricingMode}&pax=${resolvedPax}&total_days=${resolvedTotalDays}&date=${selectedDate}&promo_code=${encodeURIComponent(promoCode.trim())}`} 
        className={styles.availabilityBtn}
        onClick={(e) => {
          if (!selectedDate) {
            e.preventDefault();
            alert("Please select a trekking date first.");
          }
        }}
      >
        Book Now
      </a>
      {/* <div className={styles.selector}>English</div> */}
    </>
  );
}
