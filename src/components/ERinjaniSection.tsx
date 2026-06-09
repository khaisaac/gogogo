"use client";

import Link from "next/link";
import { Ticket, ShieldCheck, MapPin, ArrowRight } from "lucide-react";
import styles from "./ERinjaniSection.module.css";

export default function ERinjaniSection({ image }: { image?: string }) {
  const defaultImage = "https://lh3.googleusercontent.com/d/1eEbPQwKIIIq6THCCFQ56XUGPqJljgD1u";
  return (
    <section className={styles.section}>
      <div className={styles.deco1} />
      <div className={styles.deco2} />
      
      <div className={styles.container}>
        <div className={styles.card}>
          <div>
            <h2 className={styles.title}>e-Rinjani Entrance Tickets</h2>
            <p className={styles.desc}>
              Plan your Mount Rinjani trek the smart way! Secure your limited-availability national park ticket first, then match it with a flexible trekking package featuring free cancellation within 24 hours or pay-later options.
            </p>
            <img 
              src={image || defaultImage} 
              alt="e-Rinjani Hiking" 
              className={styles.promoImage}
              width={600}
              height={400}
              loading="lazy"
            />
          </div>

          <div className={styles.features}>
            <div className={styles.feature}>
              <div className={styles.iconWrapper}>
                <MapPin size={24} />
              </div>
              <span>Multiple Gate Options</span>
            </div>
            <div className={styles.feature}>
              <div className={styles.iconWrapper}>
                <ShieldCheck size={24} />
              </div>
              <span>Optional Premium Insurance</span>
            </div>
            <div className={styles.feature}>
              <div className={styles.iconWrapper}>
                <Ticket size={24} />
              </div>
              <span>Instant IDR Payment via DOKU</span>
            </div>
          </div>

          <Link href="/booking-ticket" className={styles.btn}>
            Book Entrance Ticket
            <ArrowRight size={20} />
          </Link>
        </div>
      </div>
    </section>
  );
}
