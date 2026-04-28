import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import PackageCard from "@/components/PackageCard";
import Link from "next/link";
import { getPublicPackages } from "@/lib/public-packages";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Senaru Trekking Packages - Rinjani",
  description: "Explore all our Mount Rinjani trekking packages starting from the Senaru route. Discover lush forests and cascading waterfalls.",
};

export default async function SenaruPackagesPage() {
  const { senaru } = await getPublicPackages();

  return (
    <>
      <Navbar />
      <main className={styles.main}>
        <div className={styles.header}>
          <div className="container">
            <h1 className={styles.title}>Senaru Trekking Packages</h1>
            <p className={styles.desc}>
              Senaru is famously known as the "Green Route". Discover Senaru's allure with our
              guided trekking tours. Let us lead you through lush forests,
              cascading waterfalls, and cultural gems. Experience the essence of
              Senaru with us. Browse our complete selection of Senaru route packages below.
            </p>
          </div>
        </div>
        
        <div className={`container ${styles.gridContainer}`}>
          {senaru.length > 0 ? (
            <div className={styles.grid}>
              {senaru.map((pkg) => (
                <Link href={`/packages/${pkg.slug}`} key={pkg.id} className={styles.cardLink}>
                  <PackageCard
                    title={pkg.title}
                    duration={pkg.duration}
                    price={pkg.displayPrice}
                    image={pkg.image || "/senaru.jpg"}
                    difficulty={pkg.difficulty}
                    location="Senaru"
                  />
                </Link>
              ))}
            </div>
          ) : (
            <div className={styles.empty}>
              <p>No Senaru packages are currently available.</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
