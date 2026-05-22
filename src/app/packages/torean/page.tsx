import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import PackageCard from "@/components/PackageCard";
import Link from "next/link";
import { getPublicPackages } from "@/lib/public-packages";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Torean Trekking Packages - Rinjani",
  description: "Explore all our Mount Rinjani trekking packages starting from the Torean route. Famous for majestic vertical canyons and hot springs.",
};

export default async function ToreanPackagesPage() {
  const { torean } = await getPublicPackages();

  return (
    <>
      <Navbar />
      <main className={styles.main}>
        <div className={styles.header}>
          <div className="container">
            <h1 className={styles.title}>Torean Trekking Packages</h1>
            <p className={styles.desc}>
              Torean Trekking Route is famous for its majestic sheer vertical canyon cliffs,
              lush tropical jungles, crystal clear mountain rivers, and healing natural hot springs.
              Often compared to a journey back in time, this path offers some of the most dramatic
              and photogenic scenic viewpoints on Mount Rinjani. Browse our complete selection of
              Torean route packages below.
            </p>
          </div>
        </div>
        
        <div className={`container ${styles.gridContainer}`}>
          {torean && torean.length > 0 ? (
            <div className={styles.grid}>
              {torean.map((pkg) => (
                <Link href={`/packages/${pkg.slug}`} key={pkg.id} className={styles.cardLink}>
                  <PackageCard
                    title={pkg.title}
                    duration={pkg.duration}
                    price={pkg.displayPrice}
                    image={pkg.image || "/n.jpg"}
                    difficulty={pkg.difficulty}
                    location="Torean"
                  />
                </Link>
              ))}
            </div>
          ) : (
            <div className={styles.empty}>
              <p>No Torean packages are currently available.</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
