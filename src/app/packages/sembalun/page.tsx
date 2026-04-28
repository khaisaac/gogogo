import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import PackageCard from "@/components/PackageCard";
import Link from "next/link";
import { getPublicPackages } from "@/lib/public-packages";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Sembalun Trekking Packages - Rinjani",
  description: "Explore all our Mount Rinjani trekking packages starting from the Sembalun route. Enjoy vast landscapes and direct access to the summit.",
};

export default async function SembalunPackagesPage() {
  const { sembalun } = await getPublicPackages();

  return (
    <>
      <Navbar />
      <main className={styles.main}>
        <div className={styles.header}>
          <div className="container">
            <h1 className={styles.title}>Sembalun Trekking Packages</h1>
            <p className={styles.desc}>
              Sembalun Trekking Route is the most popular starting point for
              hikers aiming to reach the absolute summit of Mount Rinjani
              (3,726m). Starting from a high-altitude plateau, this route offers
              vast landscapes and the most direct access to the top. Sembalun is
              famously known as the "Path to the Summit." Browse our complete
              selection of Sembalun route packages below.
            </p>
          </div>
        </div>
        
        <div className={`container ${styles.gridContainer}`}>
          {sembalun.length > 0 ? (
            <div className={styles.grid}>
              {sembalun.map((pkg) => (
                <Link href={`/packages/${pkg.slug}`} key={pkg.id} className={styles.cardLink}>
                  <PackageCard
                    title={pkg.title}
                    duration={pkg.duration}
                    price={pkg.displayPrice}
                    image={pkg.image || "/hero-banner.png"}
                    difficulty={pkg.difficulty}
                    location="Sembalun"
                  />
                </Link>
              ))}
            </div>
          ) : (
            <div className={styles.empty}>
              <p>No Sembalun packages are currently available.</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
