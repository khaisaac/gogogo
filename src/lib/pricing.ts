export const PAX_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;
export const TOTAL_DAY_OPTIONS = [2, 3] as const;

export const GROUP_TIER_OPTIONS = [
  { key: "1", label: "1 person", paxValues: [1] as const },
  { key: "2_3", label: "2-3 persons", paxValues: [2, 3] as const },
  { key: "4_5", label: "4-5 persons", paxValues: [4, 5] as const },
  { key: "6_8", label: "6-8 persons", paxValues: [6, 7, 8] as const },
  { key: "9_10", label: "9-10+ persons", paxValues: [9, 10] as const },
] as const;

export type PaxNumber = (typeof PAX_OPTIONS)[number];
export type TotalDayOption = (typeof TOTAL_DAY_OPTIONS)[number];
export type GroupTierOption = (typeof GROUP_TIER_OPTIONS)[number];
export type GroupTierKey = GroupTierOption["key"];

export const PRICE_TYPES = [
  { value: "private", label: "Private" },
  { value: "standard", label: "Standard" },
] as const;

export type PriceType = (typeof PRICE_TYPES)[number]["value"];

export type PriceFieldName = `${PriceType}_price_${PaxNumber}pax`;
export type TotalPriceFieldName = `${PriceType}_total_${TotalDayOption}_days`;
export type GroupPriceFieldName = `${PriceType}_group_price_${GroupTierKey}`;

export type LegacyPriceFieldName =
  | "price_1pax"
  | "price_2_3pax"
  | "price_4_5pax"
  | "price_6plus";

export type PackagePricingFields = Partial<
  Record<
    PriceFieldName | TotalPriceFieldName | LegacyPriceFieldName,
    number | null
  >
>;

export function priceFieldName(
  type: PriceType,
  pax: PaxNumber,
): PriceFieldName {
  return `${type}_price_${pax}pax`;
}

export function groupPriceFieldName(
  type: PriceType,
  tier: GroupTierKey,
): GroupPriceFieldName {
  return `${type}_group_price_${tier}`;
}

export function totalPriceFieldName(
  type: PriceType,
  days: TotalDayOption,
): TotalPriceFieldName {
  return `${type}_total_${days}_days`;
}

function toFiniteNumber(value: unknown): number | null {
  if (typeof value !== "number" || Number.isNaN(value) || value <= 0) return null;
  return value;
}

function hasAnyPerPaxMatrixPrice(pkg: PackagePricingFields) {
  for (const typeDef of PRICE_TYPES) {
    for (const pax of PAX_OPTIONS) {
      if (toFiniteNumber(pkg[priceFieldName(typeDef.value, pax)]) !== null) {
        return true;
      }
    }
  }

  return false;
}

export function getLegacyPerPaxPrice(
  pkg: PackagePricingFields,
  pax: number,
): number | null {
  if (pax <= 1) return toFiniteNumber(pkg.price_1pax);
  if (pax <= 3) return toFiniteNumber(pkg.price_2_3pax);
  if (pax <= 5) return toFiniteNumber(pkg.price_4_5pax);
  return toFiniteNumber(pkg.price_6plus);
}

export function getPerPaxPrice(
  pkg: PackagePricingFields,
  type: PriceType,
  pax: number,
): number | null {
  if (pax < 1 || pax > 10) return null;

  const normalizedPax = pax as PaxNumber;
  let directPrice = toFiniteNumber(pkg[priceFieldName(type, normalizedPax)]);

  // If matrix pricing already exists, treat 0 or null as unavailable.
  if (hasAnyPerPaxMatrixPrice(pkg)) {
    if (directPrice === null || directPrice === 0) return null;
    return directPrice;
  }

  if (directPrice !== null) return directPrice;

  // Backward compatibility with legacy tiered columns.
  return getLegacyPerPaxPrice(pkg, pax);
}

export function getPerPaxMatrixPrice(
  pkg: PackagePricingFields,
  type: PriceType,
  pax: number,
): number | null {
  if (pax < 1 || pax > 10) return null;

  const normalizedPax = pax as PaxNumber;
  const directPrice = toFiniteNumber(pkg[priceFieldName(type, normalizedPax)]);

  if (directPrice === null || directPrice === 0) return null;
  return directPrice;
}

export function getGroupTierPrice(
  pkg: PackagePricingFields,
  type: PriceType,
  tier: GroupTierKey,
  options?: { fallbackToLegacy?: boolean },
): number | null {
  const tierOption = GROUP_TIER_OPTIONS.find((option) => option.key === tier);
  if (!tierOption) return null;
  const fallbackToLegacy = options?.fallbackToLegacy ?? true;

  for (const pax of tierOption.paxValues) {
    const price = fallbackToLegacy
      ? getPerPaxPrice(pkg, type, pax)
      : getPerPaxMatrixPrice(pkg, type, pax);
    if (typeof price === "number") {
      return price;
    }
  }

  return null;
}

export function getGroupTierForPaxCount(pax: number): GroupTierOption {
  if (pax <= 1) return GROUP_TIER_OPTIONS[0];
  if (pax <= 3) return GROUP_TIER_OPTIONS[1];
  if (pax <= 5) return GROUP_TIER_OPTIONS[2];
  if (pax <= 8) return GROUP_TIER_OPTIONS[3];
  return GROUP_TIER_OPTIONS[4];
}

export function getTotalPackagePrice(
  pkg: PackagePricingFields,
  type: PriceType,
  days: TotalDayOption,
): number | null {
  const price = toFiniteNumber(pkg[totalPriceFieldName(type, days)]);
  // Treat 0 as unavailable for total package pricing too
  return price === 0 ? null : price;
}

export function getAllAvailablePerPaxPrices(
  pkg: PackagePricingFields,
): number[] {
  const values: number[] = [];

  for (const typeDef of PRICE_TYPES) {
    for (const pax of PAX_OPTIONS) {
      const price = getPerPaxPrice(pkg, typeDef.value, pax);
      if (typeof price === "number") {
        values.push(price);
      }
    }
  }

  return values;
}

export function getAllAvailableTotalPrices(
  pkg: PackagePricingFields,
): number[] {
  const values: number[] = [];

  for (const typeDef of PRICE_TYPES) {
    for (const days of TOTAL_DAY_OPTIONS) {
      const price = getTotalPackagePrice(pkg, typeDef.value, days);
      if (typeof price === "number") {
        values.push(price);
      }
    }
  }

  return values;
}

export function getStartingPrice(pkg: PackagePricingFields): number {
  const values = [
    ...getAllAvailablePerPaxPrices(pkg),
    ...getAllAvailableTotalPrices(pkg),
  ];
  if (values.length === 0) return 0;
  return Math.min(...values);
}
