import Link from "next/link";
import ImageUploadField from "@/components/admin/ImageUploadField";
import ItineraryEditor from "@/components/admin/ItineraryEditor";
import MultiImageUploadField from "@/components/admin/MultiImageUploadField";
import { DIFFICULTY_OPTIONS } from "@/lib/difficulty";
import {
  GROUP_TIER_OPTIONS,
  PRICE_TYPES,
  TOTAL_DAY_OPTIONS,
  groupPriceFieldName,
  totalPriceFieldName,
} from "@/lib/pricing";
import { createPackage } from "../actions";
import styles from "../../admin.module.css";

const DEFAULT_ITINERARY = [
  {
    title: "Day 1",
    schedule: [
      "06.00-06.30: Breakfast in the hotel",
      "07.00-07.30: Transfer to Sembalun Village",
      "08.30: Check in at Rinjani National Park Registration Office, trekking begin.",
      "12.00: Lunch at Posst 2",
      "17.00: Arrive at Crater Rim Sembalun (RIM II), dinner, camp, and overnight.",
    ],
    overview: [
      "Distance: 10 KM",
      "Walk duration: 6-7 Hours",
      "Difficulty: Moderate",
      "Highest point: 2.639M (Camp site Plawangan Sembalun crater rim)",
      "Height gain: +1.539M",
    ],
  },
  {
    title: "Day 2",
    schedule: [
      "02.00: Climb the Rinjani Summit.",
      "05.30: Arrive at Summit (Before sunrise). Take photos (+- 1 Hour)",
      "07.00: Back to Camp area (RIM II), breakfast.",
      "10.00: Start descending down to Lake Area.",
      "12.30: Arrive at the lake, take shower at Hot Spring Water. Lunch.",
      "14.00: Start ascend to RIM 1.",
      "18.00: Arrive at Rim 1, camp, dinner, and overnight",
    ],
    overview: [],
  },
  {
    title: "Day 3",
    schedule: [
      "07.00: Breakfast at camp and pack equipment.",
      "10.00: Descend to the exit gate.",
      "14.00: Transfer back to the hotel.",
    ],
    overview: ["Easy descent and return transfer."],
  },
];

export default async function AdminNewPackagePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <section className={styles.card}>
      <div className={styles.row}>
        <h2 className={styles.heading}>Create Package</h2>
        <Link href="/admin/packages" className={styles.outlineLink}>
          Back to list
        </Link>
      </div>

      <form action={createPackage}>
        {error ? <p className={styles.helper}>Failed to save package: {error}</p> : null}
        <div className={styles.formGrid}>
          <div className={styles.field}>
            <label htmlFor="title">Title</label>
            <input id="title" name="title" required />
          </div>

          <div className={styles.field}>
            <label htmlFor="route">Route</label>
            <select id="route" name="route" defaultValue="sembalun">
              <option value="sembalun">Sembalun</option>
              <option value="senaru">Senaru</option>
            </select>
          </div>

          <div className={styles.field}>
            <label htmlFor="duration">Duration</label>
            <input
              id="duration"
              name="duration"
              placeholder="e.g. 3 Days"
              required
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="difficulty">Difficulty</label>
            <select id="difficulty" name="difficulty" defaultValue="moderate">
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
              Isi harga per person untuk bucket 1, 2-3, 4-5, 6-8, dan 9-10+
              trekkers. Saat checkout, total tetap dihitung per person dikali
              jumlah adult.
            </p>
            <div className={styles.pricingMatrix}>
              {PRICE_TYPES.map((typeDef) => (
                <section key={typeDef.value} className={styles.pricingSection}>
                  <h3 className={styles.pricingTitle}>{typeDef.label}</h3>
                  <div className={styles.pricingGrid}>
                    {GROUP_TIER_OPTIONS.map((tier) => {
                      const field = groupPriceFieldName(typeDef.value, tier.key);

                      return (
                        <div key={field} className={styles.field}>
                          <label htmlFor={field}>{tier.label}</label>
                          <input
                            id={field}
                            name={field}
                            type="number"
                            min={0}
                          />
                        </div>
                      );
                    })}
                  </div>
                  <div className={styles.pricingTotalGrid}>
                    {TOTAL_DAY_OPTIONS.map((days) => {
                      const field = totalPriceFieldName(typeDef.value, days);

                      return (
                        <div key={field} className={styles.field}>
                          <label htmlFor={field}>Total {days} Days</label>
                          <input
                            id={field}
                            name={field}
                            type="number"
                            min={0}
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
            <ImageUploadField id="image_file" name="image_file" />
          </div>

          <div className={`${styles.field} ${styles.full}`}>
            <label htmlFor="gallery_files">
              Package Gallery (multi photos)
            </label>
            <MultiImageUploadField id="gallery_files" name="gallery_files" />
          </div>

          <div className={`${styles.field} ${styles.full}`}>
            <label htmlFor="detail">Package Detail</label>
            <textarea
              id="detail"
              name="detail"
              placeholder="Deskripsi utama package"
              required
            />
          </div>

          <div className={`${styles.field} ${styles.full}`}>
            <label htmlFor="highlights">Highlights (satu baris per item)</label>
            <textarea
              id="highlights"
              name="highlights"
              placeholder={
                "Summit attack sunrise\nDanau Segara Anak\nHot spring"
              }
            />
          </div>

          <div className={`${styles.field} ${styles.full}`}>
            <label htmlFor="include">Include (satu baris per item)</label>
            <textarea
              id="include"
              name="include"
              placeholder={"Guide berlisensi\nMakan selama trekking\nTenda"}
            />
          </div>

          <div className={`${styles.field} ${styles.full}`}>
            <label htmlFor="exclude">Exclude (satu baris per item)</label>
            <textarea
              id="exclude"
              name="exclude"
              placeholder={"Tiket pesawat\nAsuransi pribadi\nTip guide"}
            />
          </div>

          <div className={`${styles.field} ${styles.full}`}>
            <label htmlFor="what_to_bring">
              What to Bring (satu baris per item)
            </label>
            <textarea
              id="what_to_bring"
              name="what_to_bring"
              placeholder={"Jaket hangat\nSepatu trekking\nHeadlamp"}
            />
          </div>

          <div className={`${styles.field} ${styles.full}`}>
            <label htmlFor="notes">Notes</label>
            <textarea
              id="notes"
              name="notes"
              placeholder={"Catatan tambahan untuk peserta trekking."}
            />
          </div>

          <div className={`${styles.field} ${styles.full}`}>
            <label>Itinerary</label>
            <ItineraryEditor
              name="itinerary"
              defaultValue={DEFAULT_ITINERARY}
            />
          </div>
        </div>

        <label className={styles.inlineCheck}>
          <input type="checkbox" name="is_active" defaultChecked />
          Active package
        </label>

        <div className={styles.formActions}>
          <button type="submit" className={styles.submitBtn}>
            Save Package
          </button>
        </div>
      </form>
    </section>
  );
}
