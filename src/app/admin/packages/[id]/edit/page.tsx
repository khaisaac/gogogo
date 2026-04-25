import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdminClient } from "@/app/admin/_lib";
import ImageUploadField from "@/components/admin/ImageUploadField";
import ItineraryEditor from "@/components/admin/ItineraryEditor";
import MultiImageUploadField from "@/components/admin/MultiImageUploadField";
import { DIFFICULTY_OPTIONS, difficultyScoreToValue } from "@/lib/difficulty";
import {
  GROUP_TIER_OPTIONS,
  PRICE_TYPES,
  TOTAL_DAY_OPTIONS,
  getGroupTierPrice,
  getTotalPackagePrice,
  groupPriceFieldName,
  totalPriceFieldName,
} from "@/lib/pricing";
import { parsePackageContent } from "@/lib/package-content";
import { updatePackage } from "../../actions";
import styles from "../../../admin.module.css";

export default async function AdminEditPackagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await requireAdminClient();
  const { data: pkg } = await supabase
    .from("packages")
    .select("*")
    .eq("id", id)
    .single();

  if (!pkg) {
    notFound();
  }

  const updateAction = updatePackage.bind(null, id);
  const content = parsePackageContent(pkg.description);
  const packageValues = pkg as Record<string, number | null | undefined>;

  return (
    <section className={styles.card}>
      <div className={styles.row}>
        <h2 className={styles.heading}>Edit Package</h2>
        <Link href="/admin/packages" className={styles.outlineLink}>
          Back to list
        </Link>
      </div>

      <form action={updateAction}>
        <div className={styles.formGrid}>
          <div className={styles.field}>
            <label htmlFor="title">Title</label>
            <input
              id="title"
              name="title"
              defaultValue={pkg.title || ""}
              required
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="route">Route</label>
            <select
              id="route"
              name="route"
              defaultValue={pkg.route || "sembalun"}
            >
              <option value="sembalun">Sembalun</option>
              <option value="senaru">Senaru</option>
            </select>
          </div>

          <div className={styles.field}>
            <label htmlFor="duration">Duration</label>
            <input
              id="duration"
              name="duration"
              defaultValue={pkg.duration || ""}
              required
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="difficulty">Difficulty</label>
            <select
              id="difficulty"
              name="difficulty"
              defaultValue={difficultyScoreToValue(pkg.difficulty)}
            >
              {DIFFICULTY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className={`${styles.field} ${styles.full}`}>
            <label>Pricing Matrix (USD per group tier)</label>
            <p className={styles.helper}>
              Update harga per person untuk bucket 1, 2-3, 4-5, 6-8, dan
              9-10+ trekkers. Saat checkout, total tetap dihitung per person
              dikali jumlah adult.
            </p>
            <div className={styles.pricingMatrix}>
              {PRICE_TYPES.map((typeDef) => (
                <section key={typeDef.value} className={styles.pricingSection}>
                  <h3 className={styles.pricingTitle}>{typeDef.label}</h3>
                  <div className={styles.pricingGrid}>
                    {GROUP_TIER_OPTIONS.map((tier) => {
                      const field = groupPriceFieldName(typeDef.value, tier.key);
                      const fallbackValue = getGroupTierPrice(
                        packageValues,
                        typeDef.value,
                        tier.key,
                        { fallbackToLegacy: false },
                      );

                      return (
                        <div key={field} className={styles.field}>
                          <label htmlFor={field}>{tier.label}</label>
                          <input
                            id={field}
                            name={field}
                            type="number"
                            min={0}
                            defaultValue={fallbackValue ?? ""}
                          />
                        </div>
                      );
                    })}
                  </div>
                  <div className={styles.pricingTotalGrid}>
                    {TOTAL_DAY_OPTIONS.map((days) => {
                      const field = totalPriceFieldName(typeDef.value, days);
                      const totalValue = getTotalPackagePrice(
                        packageValues,
                        typeDef.value,
                        days,
                      );

                      return (
                        <div key={field} className={styles.field}>
                          <label htmlFor={field}>Total {days} Days</label>
                          <input
                            id={field}
                            name={field}
                            type="number"
                            min={0}
                            defaultValue={totalValue ?? ""}
                          />
                        </div>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>
          </div>

          <div className={`${styles.field} ${styles.full}`}>
            <label htmlFor="image_file">Package Image</label>
            <ImageUploadField
              id="image_file"
              name="image_file"
              currentImage={pkg.image || ""}
              currentImageFieldName="current_image"
            />
          </div>

          <div className={`${styles.field} ${styles.full}`}>
            <label htmlFor="gallery_files">
              Package Gallery (multi photos)
            </label>
            <MultiImageUploadField
              id="gallery_files"
              name="gallery_files"
              currentImages={content.gallery}
              currentImagesFieldName="current_gallery"
            />
          </div>

          <div className={`${styles.field} ${styles.full}`}>
            <label htmlFor="detail">Package Detail</label>
            <textarea
              id="detail"
              name="detail"
              defaultValue={content.detail}
              required
            />
          </div>

          <div className={`${styles.field} ${styles.full}`}>
            <label htmlFor="highlights">Highlights (satu baris per item)</label>
            <textarea
              id="highlights"
              name="highlights"
              defaultValue={content.highlights}
            />
          </div>

          <div className={`${styles.field} ${styles.full}`}>
            <label htmlFor="include">Include (satu baris per item)</label>
            <textarea
              id="include"
              name="include"
              defaultValue={content.include}
            />
          </div>

          <div className={`${styles.field} ${styles.full}`}>
            <label htmlFor="exclude">Exclude (satu baris per item)</label>
            <textarea
              id="exclude"
              name="exclude"
              defaultValue={content.exclude}
            />
          </div>

          <div className={`${styles.field} ${styles.full}`}>
            <label htmlFor="what_to_bring">
              What to Bring (satu baris per item)
            </label>
            <textarea
              id="what_to_bring"
              name="what_to_bring"
              defaultValue={content.whatToBring}
            />
          </div>

          <div className={`${styles.field} ${styles.full}`}>
            <label htmlFor="notes">Notes</label>
            <textarea id="notes" name="notes" defaultValue={content.notes} />
          </div>

          <div className={`${styles.field} ${styles.full}`}>
            <label>Itinerary</label>
            <ItineraryEditor
              name="itinerary"
              defaultValue={content.itinerary}
            />
          </div>
        </div>

        <label className={styles.inlineCheck}>
          <input
            type="checkbox"
            name="is_active"
            defaultChecked={Boolean(pkg.is_active)}
          />
          Active package
        </label>

        <div className={styles.formActions}>
          <button type="submit" className={styles.submitBtn}>
            Update Package
          </button>
        </div>
      </form>
    </section>
  );
}
