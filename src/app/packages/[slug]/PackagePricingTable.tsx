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

  if (availablePriceTypes.length === 0) {
    return null;
  }

  const availableTiers = GROUP_TIER_OPTIONS.filter((tier) =>
    availablePriceTypes.some(
      (type) => getGroupTierPrice(prices, type.value, tier.key) !== null
    )
  );

  const availableTotalDays = TOTAL_DAY_OPTIONS.filter((days) =>
    availablePriceTypes.some(
      (type) => getTotalPackagePrice(prices, type.value, days) !== null
    )
  );

  return (
    <div className={styles.pricingTableWrapper}>
      <h3 className={styles.pricingTitle}>Pricing Information</h3>
      <div className={styles.tableContainer}>
        <table className={styles.pricingTable}>
          <thead>
            <tr>
              <th>Service Type</th>
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
                        <td key={type.value}>
                          {price !== null ? `$${price}` : "-"}
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
                        <td key={type.value}>
                          {price !== null ? `$${price}` : "-"}
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
