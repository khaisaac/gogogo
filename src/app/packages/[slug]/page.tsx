import Link from "next/link";
import { notFound } from "next/navigation";
import { difficultyScoreToLabel } from "@/lib/difficulty";
import { parsePackageContent } from "@/lib/package-content";
import {
  getPublicPackageBySlug,
  getPublicPackages,
} from "@/lib/public-packages";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PackageCard from "@/components/PackageCard";
import PackageGallery from "./PackageGallery";
import PackagePricingSelector from "./PackagePricingSelector";
import PackagePricingTable from "./PackagePricingTable";
import PackageSectionsAccordion from "./PackageSectionsAccordion";
import BottomBookingScrollButton from "./BottomBookingScrollButton";
import styles from "./PackageDetailPage.module.css";

export const dynamic = "force-dynamic";

function toList(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

export default async function PackageDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const trekkingPackage = await getPublicPackageBySlug(slug);

  if (!trekkingPackage) {
    notFound();
  }

  const content = parsePackageContent(trekkingPackage.description);
  const routeLabel =
    trekkingPackage.route === "sembalun" ? "Sembalun" : "Senaru";
  const highlights = toList(content.highlights);
  const includeItems = toList(content.include);
  const excludeItems = toList(content.exclude);
  const whatToBringItems = toList(content.whatToBring);
  const allPackages = await getPublicPackages();
  const relatedPackages = (
    trekkingPackage.route === "sembalun"
      ? allPackages.sembalun
      : allPackages.senaru
  )
    .filter((pkg) => pkg.slug !== trekkingPackage.slug)
    .slice(0, 3);

  const fallbackItinerary =
    trekkingPackage.route === "sembalun"
      ? [
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
        ]
      : [
          {
            title: "Day 1",
            schedule: [
              "08.00: Check-in at Senaru Gate and gear preparation.",
              "11.30: Trek through tropical forest and lunch stop.",
              "17.00: Arrive at Crater Rim Senaru, camp and sunset.",
            ],
            overview: [
              "Distance: 8 KM",
              "Walk duration: 5-6 Hours",
              "Difficulty: Moderate",
            ],
          },
          {
            title: "Day 2",
            schedule: [
              "09.00: Visit Segara Anak Lake.",
              "12.00: Soak at the hot spring and lunch.",
              "15.00: Return to camp and overnight.",
            ],
            overview: [],
          },
          { title: "Day 3", schedule: [], overview: [] },
        ];

  const itinerary = content.itinerary.length
    ? content.itinerary
    : fallbackItinerary;

  const galleryFromContent = content.gallery.filter(Boolean);
  const coverImage =
    trekkingPackage.image || galleryFromContent[0] || "/hero-banner.png";
  const galleryImages = Array.from(
    new Set([coverImage, ...galleryFromContent]),
  ).slice(0, 8);

  return (
    <>
      <Navbar />
      <main className={styles.page}>
        <section className={styles.topBlock}>
          <div className={styles.container}>
            <p className={styles.locationLabel}>{routeLabel} Route</p>
            <h1 className={styles.title}>{trekkingPackage.title}</h1>
            <div className={styles.reviewRow}>
              <span className={styles.stars}></span>
              <span className={styles.rating}>
              
              </span>
              <span className={styles.reviews}></span>

            </div>

            <div className={styles.mediaAndBooking}>
              <div>
                <PackageGallery
                  images={galleryImages}
                  packageTitle={trekkingPackage.title}
                />

                <div
                  className={styles.summary}
                  dangerouslySetInnerHTML={{
                    __html: content.detail || "Package detail belum tersedia."
                  }}
                />

                <PackagePricingTable prices={trekkingPackage} />
              </div>

              <aside id="package-selection-card" className={styles.bookingCard}>
                <PackagePricingSelector
                  packageId={trekkingPackage.id}
                  prices={trekkingPackage}
                  fallbackDisplayPrice={trekkingPackage.displayPrice}
                />

                <ul className={styles.policyList}>
                  <li>
                    <strong>Free cancellation</strong>
                    <span>
                      Cancel up to 24 hours in advance for a full refund.
                    </span>
                  </li>
                  <li>
                    <strong>Reserve now & pay later</strong>
                    <span>
                      Keep your travel plans flexible and secure your spot
                      today.
                    </span>
                  </li>
                </ul>
              </aside>
            </div>
          </div>
        </section>

        <section className={styles.contentBlock}>
          <div className={styles.container}>
            <div className={styles.metaGrid}>
              <article className={styles.metaCard}>
                <p className={styles.metaLabel}>Duration</p>
                <p className={styles.metaValue}>{trekkingPackage.duration}</p>
              </article>
              <article className={styles.metaCard}>
                <p className={styles.metaLabel}>Difficulty</p>
                <p className={styles.metaValue}>
                  {difficultyScoreToLabel(trekkingPackage.difficulty)}
                </p>
              </article>
              <article className={styles.metaCard}>
                <p className={styles.metaLabel}>Starting Point</p>
                <p className={styles.metaValue}>{routeLabel}</p>
              </article>
            </div>

            <article className={styles.detailCard}>
              <h2 className={styles.sectionTitle}>About this activity</h2>
              <ul className={styles.featureList}>
                <li>
                  <strong>Free cancellation</strong>
                  <span>
                    Cancel up to 24 hours in advance for a full refund.
                  </span>
                </li>
                <li>
                  <strong>Reserve now & pay later</strong>
                  <span>Book your spot and pay nothing today.</span>
                </li>
                <li>
                  <strong>Duration {trekkingPackage.duration}</strong>
                  <span>Exact timing will be confirmed after booking.</span>
                </li>
              </ul>
            </article>

            <article className={styles.detailCard}>
              <PackageSectionsAccordion
                itinerary={itinerary}
                highlights={highlights}
                includeItems={includeItems}
                excludeItems={excludeItems}
                whatToBringItems={whatToBringItems}
                notes={content.notes}
              />

              <section className={styles.relatedTourSection}>
                <h2 className={styles.relatedTourTitle}>Related Tour</h2>
                {relatedPackages.length > 0 ? (
                  <div className={styles.relatedTourGrid}>
                    {relatedPackages.map((pkg) => (
                      <Link
                        key={pkg.id}
                        href={`/packages/${pkg.slug}`}
                        className={styles.relatedTourLink}
                      >
                        <PackageCard
                          title={pkg.title}
                          duration={pkg.duration}
                          price={pkg.displayPrice}
                          image={pkg.image || "/hero-banner.png"}
                          difficulty={pkg.difficulty}
                          location={routeLabel}
                        />
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className={styles.relatedTourEmpty}>
                    No related tour available for this route.
                  </p>
                )}
              </section>
            </article>
          </div>
        </section>

        <section className={styles.bottomBookingBar}>
          <div className={styles.bottomBookingInner}>
            <div className={styles.bottomBookingPriceWrap}>
              <p className={styles.bottomBookingLabel}>Start from</p>
              <p className={styles.bottomBookingPrice}>
                ${trekkingPackage.displayPrice}
                <span>/ person</span>
              </p>
            </div>
            <BottomBookingScrollButton
              targetId="package-selection-card"
              className={styles.bottomBookingBtn}
            />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
