import Link from "next/link";
import styles from "./SenaruTransport.module.css";
import Image from "next/image";

export default function SenaruTransportSection() {
  return (
    <section className={styles.transportSection}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>Senaru Transport & Shuttle</h2>
          <p className={styles.desc}>
            Need a ride to or from Senaru? We offer safe, comfortable, and reliable airport transfers and shuttle services across Lombok. Start your journey with ease.
          </p>
        </div>
        
        <div className={styles.imageWrapper}>
          <div className={styles.imageContainer}>
            <Image
              src="/senaru-transport.jpg"
              alt="Senaru Transport Services"
              fill
              className={styles.image}
              unoptimized
            />
          </div>
        </div>

        <div className={styles.actions}>
          <Link href="/booking-transport" className="btn-primary" style={{ padding: "14px 32px", fontSize: "1.1rem" }}>
            BOOK TRANSPORT NOW
          </Link>
        </div>
      </div>
    </section>
  );
}
