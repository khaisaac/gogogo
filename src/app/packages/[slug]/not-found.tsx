import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import styles from "./PackageNotFound.module.css";

export default function PackageNotFoundPage() {
  return (
    <>
      <Navbar />
      <main className={styles.page}>
        <section className={styles.card}>
          <p className={styles.eyebrow}>404 - Package Not Found</p>
          <h1 className={styles.title}>Package tidak ditemukan</h1>
          <p className={styles.description}>
            Maaf, slug package yang kamu buka tidak valid atau sudah tidak
            tersedia.
          </p>
          <div className={styles.actions}>
            <Link href="/" className="btn-primary">
              Kembali ke Homepage
            </Link>
            <Link href="/#sembalun" className="btn-outline">
              Lihat Semua Packages
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
