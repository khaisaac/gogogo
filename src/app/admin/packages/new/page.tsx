import Link from "next/link";
import ImageUploadField from "@/components/admin/ImageUploadField";
import ItineraryEditor from "@/components/admin/ItineraryEditor";
import PackageOptionsBuilder from "@/components/admin/PackageOptionsBuilder";
import PackageFaqsBuilder from "@/components/admin/PackageFaqsBuilder";
import MultiImageUploadField from "@/components/admin/MultiImageUploadField";
import RichTextEditor from "@/components/admin/RichTextEditor";
import { DIFFICULTY_OPTIONS } from "@/lib/difficulty";

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
              <option value="torean">Torean</option>
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
            <label>Promo / Discount Settings</label>
            <div className={styles.pricingMatrix} style={{ gap: '1rem', display: 'flex', flexDirection: 'column' }}>
              <label className={styles.inlineCheck}>
                <input type="checkbox" name="is_direct_promo" />
                Direct Promo (Shows crossed-out price automatically, no code needed)
              </label>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div className={styles.field} style={{ flex: 1 }}>
                  <label htmlFor="promo_code">Voucher Code</label>
                  <input
                    id="promo_code"
                    name="promo_code"
                    type="text"
                    placeholder="e.g. SUMMER2026 (Leave empty for direct promo)"
                  />
                </div>
                <div className={styles.field} style={{ flex: 1 }}>
                  <label htmlFor="discount_percentage">Discount Percentage (%)</label>
                  <input
                    id="discount_percentage"
                    name="discount_percentage"
                    type="number"
                    min="0"
                    max="100"
                    placeholder="e.g. 10"
                  />
                </div>
                <div className={styles.field} style={{ flex: 1 }}>
                  <label htmlFor="discount_amount">Discount Amount (USD)</label>
                  <input
                    id="discount_amount"
                    name="discount_amount"
                    type="number"
                    min="0"
                    placeholder="e.g. 50"
                  />
                </div>
                <div className={styles.field} style={{ flex: 1 }}>
                  <label htmlFor="promo_usage_limit">Voucher Quota</label>
                  <input
                    id="promo_usage_limit"
                    name="promo_usage_limit"
                    type="number"
                    min="1"
                    placeholder="e.g. 5 (Leave empty for unlimited)"
                  />
                </div>
              </div>
              <p className={styles.helper}>
                You can use either Percentage OR Amount. If both are set, Percentage will be applied first. Quota limits how many times a voucher can be used.
              </p>
            </div>
          </div>

          <div className={`${styles.field} ${styles.full}`}>
            <label htmlFor="image_file">Package Image</label>
            <ImageUploadField
              id="image_file"
              name="image_file"
              currentImageFieldName="current_image"
              folder="packages"
            />
          </div>

          <div className={`${styles.field} ${styles.full}`}>
            <label htmlFor="gallery_files">
              Package Gallery (multi photos)
            </label>
            <MultiImageUploadField
              id="gallery_files"
              name="gallery_files"
              currentImagesFieldName="current_gallery"
              folder="packages"
            />
          </div>

          <div className={`${styles.field} ${styles.full}`}>
            <label htmlFor="detail">Package Detail</label>
            <RichTextEditor
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
            <PackageOptionsBuilder />
          </div>

          <div className={`${styles.field} ${styles.full}`}>
            <PackageFaqsBuilder />
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
