"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import PackageCard from "./PackageCard";
import styles from "./Packages.module.css";
import type { PublicPackage } from "@/lib/public-packages";

type PackageSliderProps = {
  packages: PublicPackage[];
};

export function SembalunPackages({ packages }: PackageSliderProps) {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftPos, setScrollLeftPos] = useState(0);

  const scrollLeft = () => {
    if (sliderRef.current) {
      const slideItem = sliderRef.current.querySelector(
        `.${styles.slideItem}`,
      ) as HTMLElement;
      const scrollAmount = slideItem ? slideItem.offsetWidth + 20 : 320; // width + gap
      sliderRef.current.scrollBy({ left: -scrollAmount, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (sliderRef.current) {
      const slideItem = sliderRef.current.querySelector(
        `.${styles.slideItem}`,
      ) as HTMLElement;
      const scrollAmount = slideItem ? slideItem.offsetWidth + 20 : 320;
      sliderRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    if (sliderRef.current) {
      setStartX(e.pageX - sliderRef.current.offsetLeft);
      setScrollLeftPos(sliderRef.current.scrollLeft);
    }
  };

  const handleMouseLeave = () => setIsDragging(false);
  const handleMouseUp = () => setIsDragging(false);
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !sliderRef.current) return;
    e.preventDefault();
    const x = e.pageX - sliderRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    sliderRef.current.scrollLeft = scrollLeftPos - walk;
  };

  return (
    <section id="sembalun" className={styles.sembalunSection}>
      <div className={styles.sembalunBackground}>
        <div className={styles.sembalunOverlay} />
      </div>
      <div className={`container ${styles.sembalunContainer}`}>
        <div className={styles.sembalunLeft}>
          <h2 className={styles.sembalunTitle}>
            Sembalun Trekking Tour Packages
          </h2>
          <p className={styles.sembalunDesc}>
            Sembalun Trekking Route is the most popular starting point for
            hikers aiming to reach the absolute summit of Mount Rinjani
            (3,726m). Starting from a high-altitude plateau, this route offers
            vast landscapes and the most direct access to the top. Sembalun is
            famously known as the "Path to the Summit."
          </p>
          <a href="#" className="btn-primary" style={{ marginBottom: "48px" }}>
            SHOW MORE
          </a>
          <div className={styles.sembalunControls}>
            <button
              onClick={scrollLeft}
              className={styles.arrowBtn}
              aria-label="Previous"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="square"
              >
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={scrollRight}
              className={styles.arrowBtn}
              aria-label="Next"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="square"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        <div className={styles.sembalunRight}>
          <div
            className={`${styles.slider} ${isDragging ? styles.dragging : ""}`}
            ref={sliderRef}
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
          >
            {packages.map((pkg) => (
              <div className={styles.slideItem} key={pkg.id}>
                <Link href={`/packages/${pkg.slug}`}>
                  <PackageCard
                    title={pkg.title}
                    duration={pkg.duration}
                    price={pkg.displayPrice}
                    image={pkg.image || "/hero-banner.png"}
                    difficulty={pkg.difficulty}
                    location="Sembalun"
                  />
                </Link>
              </div>
            ))}
          </div>
          {/* Mobile-only controls below the card */}
          <div className={styles.mobileControls}>
            <button
              onClick={scrollLeft}
              className={styles.arrowBtn}
              aria-label="Previous"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="square"
              >
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={scrollRight}
              className={styles.arrowBtn}
              aria-label="Next"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="square"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export function SenaruPackages({ packages }: PackageSliderProps) {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftPos, setScrollLeftPos] = useState(0);

  const scrollLeft = () => {
    if (sliderRef.current) {
      const slideItem = sliderRef.current.querySelector(
        `.${styles.slideItem}`,
      ) as HTMLElement;
      const scrollAmount = slideItem ? slideItem.offsetWidth + 20 : 320;
      sliderRef.current.scrollBy({ left: -scrollAmount, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (sliderRef.current) {
      const slideItem = sliderRef.current.querySelector(
        `.${styles.slideItem}`,
      ) as HTMLElement;
      const scrollAmount = slideItem ? slideItem.offsetWidth + 20 : 320;
      sliderRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    if (sliderRef.current) {
      setStartX(e.pageX - sliderRef.current.offsetLeft);
      setScrollLeftPos(sliderRef.current.scrollLeft);
    }
  };

  const handleMouseLeave = () => setIsDragging(false);
  const handleMouseUp = () => setIsDragging(false);
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !sliderRef.current) return;
    e.preventDefault();
    const x = e.pageX - sliderRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    sliderRef.current.scrollLeft = scrollLeftPos - walk;
  };

  return (
    <section id="senaru" className={styles.senaruSection}>
      <div className={styles.forestDeco} />
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>Senaru Trekking Tour Packages</h2>
          <p className={styles.desc}>
            While Senaru is the "Green Route". Discover Senaru's allure with our
            guided trekking tours. Let us lead you through lush forests,
            cascading waterfalls, and cultural gems. Experience the essence of
            Senaru with us.
          </p>
        </div>
        <div className={styles.wrapper}>
          <div
            className={`${styles.senaruSlider} ${isDragging ? styles.dragging : ""}`}
            ref={sliderRef}
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
          >
            {packages.map((pkg) => (
              <div className={styles.slideItem} key={pkg.id}>
                <Link href={`/packages/${pkg.slug}`}>
                  <PackageCard
                    title={pkg.title}
                    duration={pkg.duration}
                    price={pkg.displayPrice}
                    image={pkg.image || "/senaru.jpg"}
                    difficulty={pkg.difficulty}
                    location="Senaru"
                  />
                </Link>
              </div>
            ))}
          </div>

          {/* Mobile-only controls below the card */}
          <div className={styles.mobileControls}>
            <button
              onClick={scrollLeft}
              className={styles.arrowBtn}
              aria-label="Previous"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="square"
              >
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={scrollRight}
              className={styles.arrowBtn}
              aria-label="Next"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="square"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
        <div className={styles.actions}>
          <a href="#" className="btn-outline">
            SHOW ME MORE
          </a>
        </div>
      </div>
    </section>
  );
}
