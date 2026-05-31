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
  const dragStartRef = useRef({ x: 0, scrollLeft: 0 });
  const isMouseDownRef = useRef(false);
  const wasDraggingRef = useRef(false);

  const scrollLeft = () => {
    if (sliderRef.current) {
      const slideItem = sliderRef.current.querySelector(
        `.${styles.sembalunSlideItem}`,
      ) as HTMLElement;
      const scrollAmount = slideItem ? slideItem.offsetWidth + 20 : 320; // width + gap
      sliderRef.current.scrollBy({ left: -scrollAmount, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (sliderRef.current) {
      const slideItem = sliderRef.current.querySelector(
        `.${styles.sembalunSlideItem}`,
      ) as HTMLElement;
      const scrollAmount = slideItem ? slideItem.offsetWidth + 20 : 320;
      sliderRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!sliderRef.current) return;
    isMouseDownRef.current = true;
    wasDraggingRef.current = false;
    dragStartRef.current = {
      x: e.pageX,
      scrollLeft: sliderRef.current.scrollLeft,
    };
  };

  const handleMouseLeave = () => {
    isMouseDownRef.current = false;
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    isMouseDownRef.current = false;
    if (isDragging) {
      setIsDragging(false);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDownRef.current || !sliderRef.current) return;
    const x = e.pageX;
    const walk = x - dragStartRef.current.x;
    if (Math.abs(walk) > 5) {
      if (!isDragging) {
        setIsDragging(true);
        wasDraggingRef.current = true;
      }
      e.preventDefault();
      sliderRef.current.scrollLeft = dragStartRef.current.scrollLeft - walk * 1.5;
    }
  };

  const handleLinkClick = (e: React.MouseEvent) => {
    if (wasDraggingRef.current) {
      e.preventDefault();
      e.stopPropagation();
      wasDraggingRef.current = false;
    }
  };

  return (
    <section id="sembalun" className={styles.sembalunSection}>
      <div className={styles.sembalunBackground}>
        <div className={styles.sembalunOverlay} />
      </div>
      <div className={styles.container}>
        <div className={styles.sembalunHeader}>
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
        </div>

        <div className={styles.wrapper}>
          <div
            className={`${styles.sembalunSliderGrid} ${isDragging ? styles.dragging : ""}`}
            ref={sliderRef}
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
          >
            {packages.slice(0, 4).map((pkg) => (
              <div className={styles.sembalunSlideItem} key={pkg.id}>
                <Link href={`/packages/${pkg.slug}`} onClick={handleLinkClick}>
                  <PackageCard
                    title={pkg.title}
                    duration={pkg.duration}
                    price={pkg.displayPrice}
                    originalPrice={pkg.originalDisplayPrice}
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
        <div className={styles.sembalunActions}>
          <Link href="/packages/sembalun" className="btn-primary">
            SHOW MORE
          </Link>
        </div>
      </div>
    </section>
  );
}

export function SenaruPackages({ packages }: PackageSliderProps) {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, scrollLeft: 0 });
  const isMouseDownRef = useRef(false);
  const wasDraggingRef = useRef(false);

  const scrollLeft = () => {
    if (sliderRef.current) {
      const slideItem = sliderRef.current.querySelector(
        `.${styles.senaruSlideItem}`,
      ) as HTMLElement;
      const scrollAmount = slideItem ? slideItem.offsetWidth + 20 : 320;
      sliderRef.current.scrollBy({ left: -scrollAmount, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (sliderRef.current) {
      const slideItem = sliderRef.current.querySelector(
        `.${styles.senaruSlideItem}`,
      ) as HTMLElement;
      const scrollAmount = slideItem ? slideItem.offsetWidth + 20 : 320;
      sliderRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!sliderRef.current) return;
    isMouseDownRef.current = true;
    wasDraggingRef.current = false;
    dragStartRef.current = {
      x: e.pageX,
      scrollLeft: sliderRef.current.scrollLeft,
    };
  };

  const handleMouseLeave = () => {
    isMouseDownRef.current = false;
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    isMouseDownRef.current = false;
    if (isDragging) {
      setIsDragging(false);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDownRef.current || !sliderRef.current) return;
    const x = e.pageX;
    const walk = x - dragStartRef.current.x;
    if (Math.abs(walk) > 5) {
      if (!isDragging) {
        setIsDragging(true);
        wasDraggingRef.current = true;
      }
      e.preventDefault();
      sliderRef.current.scrollLeft = dragStartRef.current.scrollLeft - walk * 1.5;
    }
  };

  const handleLinkClick = (e: React.MouseEvent) => {
    if (wasDraggingRef.current) {
      e.preventDefault();
      e.stopPropagation();
      wasDraggingRef.current = false;
    }
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
            {packages.slice(0, 4).map((pkg) => (
              <div className={styles.senaruSlideItem} key={pkg.id}>
                <Link href={`/packages/${pkg.slug}`} onClick={handleLinkClick}>
                  <PackageCard
                    title={pkg.title}
                    duration={pkg.duration}
                    price={pkg.displayPrice}
                    originalPrice={pkg.originalDisplayPrice}
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
          <Link href="/packages/senaru" className="btn-outline">
            SHOW ME MORE
          </Link>
        </div>
      </div>
    </section>
  );
}

export function ToreanPackages({ packages }: PackageSliderProps) {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, scrollLeft: 0 });
  const isMouseDownRef = useRef(false);
  const wasDraggingRef = useRef(false);

  const scrollLeft = () => {
    if (sliderRef.current) {
      const slideItem = sliderRef.current.querySelector(
        `.${styles.toreanSlideItem}`,
      ) as HTMLElement;
      const scrollAmount = slideItem ? slideItem.offsetWidth + 20 : 320;
      sliderRef.current.scrollBy({ left: -scrollAmount, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (sliderRef.current) {
      const slideItem = sliderRef.current.querySelector(
        `.${styles.toreanSlideItem}`,
      ) as HTMLElement;
      const scrollAmount = slideItem ? slideItem.offsetWidth + 20 : 320;
      sliderRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!sliderRef.current) return;
    isMouseDownRef.current = true;
    wasDraggingRef.current = false;
    dragStartRef.current = {
      x: e.pageX,
      scrollLeft: sliderRef.current.scrollLeft,
    };
  };

  const handleMouseLeave = () => {
    isMouseDownRef.current = false;
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    isMouseDownRef.current = false;
    if (isDragging) {
      setIsDragging(false);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDownRef.current || !sliderRef.current) return;
    const x = e.pageX;
    const walk = x - dragStartRef.current.x;
    if (Math.abs(walk) > 5) {
      if (!isDragging) {
        setIsDragging(true);
        wasDraggingRef.current = true;
      }
      e.preventDefault();
      sliderRef.current.scrollLeft = dragStartRef.current.scrollLeft - walk * 1.5;
    }
  };

  const handleLinkClick = (e: React.MouseEvent) => {
    if (wasDraggingRef.current) {
      e.preventDefault();
      e.stopPropagation();
      wasDraggingRef.current = false;
    }
  };

  return (
    <section id="torean" className={styles.toreanSection}>
      <div className={styles.toreanDeco} />
      <div className={styles.container}>
        <div className={styles.toreanHeader}>
          <h2 className={styles.toreanTitle}>Torean Trekking Tour Packages</h2>
          <p className={styles.toreanDesc}>
            Torean Route is widely renowned for its breathtaking vertical canyon cliffs,
            cascading river streams, lush rainforests, and natural hot spring pathways.
            Often described as a journey into a mystical world, it offers one of the most
            dramatic and visually stunning landscape trails on Mount Rinjani.
          </p>
        </div>
        <div className={styles.wrapper}>
          <div
            className={`${styles.toreanSlider} ${isDragging ? styles.dragging : ""}`}
            ref={sliderRef}
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
          >
            {packages.slice(0, 4).map((pkg) => (
              <div className={styles.toreanSlideItem} key={pkg.id}>
                <Link href={`/packages/${pkg.slug}`} onClick={handleLinkClick}>
                  <PackageCard
                    title={pkg.title}
                    duration={pkg.duration}
                    price={pkg.displayPrice}
                    originalPrice={pkg.originalDisplayPrice}
                    image={pkg.image || "/n.jpg"}
                    difficulty={pkg.difficulty}
                    location="Torean"
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
        <div className={styles.toreanActions}>
          <Link href="/packages/torean" className="btn-primary">
            SHOW MORE
          </Link>
        </div>
      </div>
    </section>
  );
}

