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

export type PriceType = string;

export type PriceFieldName = string;
export type TotalPriceFieldName = string;
export type GroupPriceFieldName = string;

export type LegacyPriceFieldName =
  | "price_1pax"
  | "price_2_3pax"
  | "price_4_5pax"
  | "price_6plus";

export type PackagePricingFields = Record<string, any>;

export type PackageOptionItem = {
  id: string;
  title: string;
  content: string;
  include?: string;
  exclude?: string;
  pricing?: {
    price_1pax?: number | null;
    price_2_3pax?: number | null;
    price_4_5pax?: number | null;
    price_6_8pax?: number | null;
    price_9_10pax?: number | null;
    total_2_days?: number | null;
    total_3_days?: number | null;
  };
};

export function priceFieldName(
  type: string,
  pax: PaxNumber,
): string {
  return `${type}_price_${pax}pax`;
}

export function groupPriceFieldName(
  type: string,
  tier: GroupTierKey,
): string {
  return `${type}_group_price_${tier}`;
}

export function totalPriceFieldName(
  type: string,
  days: TotalDayOption,
): string {
  return `${type}_total_${days}_days`;
}

function toFiniteNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const num = Number(value);
  if (Number.isNaN(num) || num <= 0) return null;
  return num;
}

export function getPackageOptions(pkg: any): PackageOptionItem[] {
  if (!pkg) return [];
  let rawOptions: any[] = [];
  if (Array.isArray(pkg.options)) {
    rawOptions = pkg.options;
  } else if (typeof pkg.options === "string" && pkg.options.trim()) {
    try {
      const parsed = JSON.parse(pkg.options);
      if (Array.isArray(parsed)) rawOptions = parsed;
    } catch {}
  }

  const valid = rawOptions.filter((item) => item && item.title);

  if (valid.length > 0) {
    return valid.map((item, idx) => {
      const id = item.id || item.title.toLowerCase().trim().replace(/[^a-z0-9]+/g, "_") || `option_${idx}`;
      let pricing = item.pricing;

      if (!pricing || Object.keys(pricing).length === 0) {
        const lowerTitle = item.title.toLowerCase();
        const isPrivate = lowerTitle.includes("private") || (idx === 0 && !lowerTitle.includes("standard"));
        const typePrefix = isPrivate ? "private" : "standard";

        pricing = {
          price_1pax: toFiniteNumber(pkg[`${typePrefix}_price_1pax`] ?? (isPrivate ? pkg.price_1pax : null)),
          price_2_3pax: toFiniteNumber(pkg[`${typePrefix}_price_2pax`] ?? (isPrivate ? pkg.price_2_3pax : null)),
          price_4_5pax: toFiniteNumber(pkg[`${typePrefix}_price_4pax`] ?? (isPrivate ? pkg.price_4_5pax : null)),
          price_6_8pax: toFiniteNumber(pkg[`${typePrefix}_price_6pax`] ?? (isPrivate ? pkg.price_6plus : null)),
          price_9_10pax: toFiniteNumber(pkg[`${typePrefix}_price_9pax`] ?? (isPrivate ? pkg.price_6plus : null)),
          total_2_days: toFiniteNumber(pkg[`${typePrefix}_total_2_days`]),
          total_3_days: toFiniteNumber(pkg[`${typePrefix}_total_3_days`]),
        };
      } else {
        pricing = {
          price_1pax: toFiniteNumber(pricing.price_1pax),
          price_2_3pax: toFiniteNumber(pricing.price_2_3pax),
          price_4_5pax: toFiniteNumber(pricing.price_4_5pax),
          price_6_8pax: toFiniteNumber(pricing.price_6_8pax),
          price_9_10pax: toFiniteNumber(pricing.price_9_10pax),
          total_2_days: toFiniteNumber(pricing.total_2_days),
          total_3_days: toFiniteNumber(pricing.total_3_days),
        };
      }

      return {
        ...item,
        id,
        pricing,
      };
    });
  }

  const result: PackageOptionItem[] = [];
  const privatePrice1 = toFiniteNumber(pkg.private_price_1pax ?? pkg.price_1pax);
  const privateTotal2 = toFiniteNumber(pkg.private_total_2_days);
  const standardPrice1 = toFiniteNumber(pkg.standard_price_1pax);
  const standardTotal2 = toFiniteNumber(pkg.standard_total_2_days);

  if (privatePrice1 !== null || privateTotal2 !== null || !standardPrice1) {
    result.push({
      id: "private",
      title: "Private",
      content: "",
      pricing: {
        price_1pax: toFiniteNumber(pkg.private_price_1pax ?? pkg.price_1pax),
        price_2_3pax: toFiniteNumber(pkg.private_price_2pax ?? pkg.price_2_3pax),
        price_4_5pax: toFiniteNumber(pkg.private_price_4pax ?? pkg.price_4_5pax),
        price_6_8pax: toFiniteNumber(pkg.private_price_6pax ?? pkg.price_6plus),
        price_9_10pax: toFiniteNumber(pkg.private_price_9pax ?? pkg.price_6plus),
        total_2_days: toFiniteNumber(pkg.private_total_2_days),
        total_3_days: toFiniteNumber(pkg.private_total_3_days),
      },
    });
  }
  if (standardPrice1 !== null || standardTotal2 !== null) {
    result.push({
      id: "standard",
      title: "Standard",
      content: "",
      pricing: {
        price_1pax: toFiniteNumber(pkg.standard_price_1pax),
        price_2_3pax: toFiniteNumber(pkg.standard_price_2pax),
        price_4_5pax: toFiniteNumber(pkg.standard_price_4pax),
        price_6_8pax: toFiniteNumber(pkg.standard_price_6pax),
        price_9_10pax: toFiniteNumber(pkg.standard_price_9pax),
        total_2_days: toFiniteNumber(pkg.standard_total_2_days),
        total_3_days: toFiniteNumber(pkg.standard_total_3_days),
      },
    });
  }

  return result;
}

export function getLegacyPerPaxPrice(
  pkg: any,
  pax: number,
): number | null {
  if (!pkg) return null;
  if (pax <= 1) return toFiniteNumber(pkg.price_1pax);
  if (pax <= 3) return toFiniteNumber(pkg.price_2_3pax);
  if (pax <= 5) return toFiniteNumber(pkg.price_4_5pax);
  return toFiniteNumber(pkg.price_6plus);
}

export function getPerPaxPrice(
  pkg: any,
  type: string,
  pax: number,
): number | null {
  if (pax < 1 || pax > 10 || !pkg) return null;

  const options = getPackageOptions(pkg);
  const matched = options.find((o) => o.id === type || o.title.toLowerCase() === type.toLowerCase() || (type === "private" && o.title.toLowerCase().includes("private")) || (type === "standard" && o.title.toLowerCase().includes("standard")));

  if (matched?.pricing) {
    const p = matched.pricing;
    if (pax === 1) return toFiniteNumber(p.price_1pax);
    if (pax <= 3) return toFiniteNumber(p.price_2_3pax);
    if (pax <= 5) return toFiniteNumber(p.price_4_5pax);
    if (pax <= 8) return toFiniteNumber(p.price_6_8pax);
    return toFiniteNumber(p.price_9_10pax ?? p.price_6_8pax);
  }

  const directPrice = toFiniteNumber(pkg[priceFieldName(type, pax as PaxNumber)]);
  if (directPrice !== null) return directPrice;

  return getLegacyPerPaxPrice(pkg, pax);
}

export function getPerPaxMatrixPrice(
  pkg: any,
  type: string,
  pax: number,
): number | null {
  return getPerPaxPrice(pkg, type, pax);
}

export function getGroupTierPrice(
  pkg: any,
  type: string,
  tier: GroupTierKey,
  options?: { fallbackToLegacy?: boolean },
): number | null {
  const tierOption = GROUP_TIER_OPTIONS.find((option) => option.key === tier);
  if (!tierOption) return null;

  for (const pax of tierOption.paxValues) {
    const price = getPerPaxPrice(pkg, type, pax);
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
  pkg: any,
  type: string,
  days: TotalDayOption,
): number | null {
  if (!pkg) return null;
  const options = getPackageOptions(pkg);
  const matched = options.find((o) => o.id === type || o.title.toLowerCase() === type.toLowerCase() || (type === "private" && o.title.toLowerCase().includes("private")) || (type === "standard" && o.title.toLowerCase().includes("standard")));

  if (matched?.pricing) {
    const p = matched.pricing;
    if (days === 2) return toFiniteNumber(p.total_2_days);
    if (days === 3) return toFiniteNumber(p.total_3_days);
  }

  const price = toFiniteNumber(pkg[totalPriceFieldName(type, days)]);
  return price === 0 ? null : price;
}

export function getAllAvailablePerPaxPrices(
  pkg: any,
): number[] {
  if (!pkg) return [];
  const options = getPackageOptions(pkg);
  const values: number[] = [];

  if (options.length > 0) {
    for (const opt of options) {
      for (const pax of PAX_OPTIONS) {
        const price = getPerPaxPrice(pkg, opt.id, pax);
        if (typeof price === "number") {
          values.push(price);
        }
      }
    }
  } else {
    for (const typeDef of PRICE_TYPES) {
      for (const pax of PAX_OPTIONS) {
        const price = getPerPaxPrice(pkg, typeDef.value, pax);
        if (typeof price === "number") {
          values.push(price);
        }
      }
    }
  }

  return values;
}

export function getAllAvailableTotalPrices(
  pkg: any,
): number[] {
  if (!pkg) return [];
  const options = getPackageOptions(pkg);
  const values: number[] = [];

  if (options.length > 0) {
    for (const opt of options) {
      for (const days of TOTAL_DAY_OPTIONS) {
        const price = getTotalPackagePrice(pkg, opt.id, days);
        if (typeof price === "number") {
          values.push(price);
        }
      }
    }
  } else {
    for (const typeDef of PRICE_TYPES) {
      for (const days of TOTAL_DAY_OPTIONS) {
        const price = getTotalPackagePrice(pkg, typeDef.value, days);
        if (typeof price === "number") {
          values.push(price);
        }
      }
    }
  }

  return values;
}

export function getStartingPrice(pkg: any): number {
  const values = [
    ...getAllAvailablePerPaxPrices(pkg),
    ...getAllAvailableTotalPrices(pkg),
  ];
  if (values.length === 0) return 0;
  return Math.min(...values);
}
