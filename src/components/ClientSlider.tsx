"use client";

import { useRef } from "react";
import Link from "next/link";
import styles from "./BlogSection.module.css";

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  featured_image: string | null;
  published_at: string;
  categories?: Array<{
    name: string;
  }> | null;
}

interface ClientSliderProps {
  items: Article[];
}

export default function ClientSlider({ items }: ClientSliderProps) {
  const sliderRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeftPos = useRef(0);

  const scrollLeft = () => {
    if (sliderRef.current) {
      const slideItem = sliderRef.current.querySelector(
        `.${styles.card}`,
      ) as HTMLElement;
      const scrollAmount = slideItem ? slideItem.offsetWidth + 28 : 320;
      sliderRef.current.scrollBy({ left: -scrollAmount, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (sliderRef.current) {
      const slideItem = sliderRef.current.querySelector(
        `.${styles.card}`,
      ) as HTMLElement;
      const scrollAmount = slideItem ? slideItem.offsetWidth + 28 : 320;
      sliderRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    if (sliderRef.current) {
      startX.current = e.pageX - sliderRef.current.offsetLeft;
      scrollLeftPos.current = sliderRef.current.scrollLeft;
    }
  };

  const handleMouseLeave = () => {
    isDragging.current = false;
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !sliderRef.current) return;
    e.preventDefault();
    const x = e.pageX - sliderRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.5;
    sliderRef.current.scrollLeft = scrollLeftPos.current - walk;
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    isDragging.current = true;
    if (sliderRef.current) {
      startX.current = e.touches[0].pageX - sliderRef.current.offsetLeft;
      scrollLeftPos.current = sliderRef.current.scrollLeft;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current || !sliderRef.current) return;
    const x = e.touches[0].pageX - sliderRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.5;
    sliderRef.current.scrollLeft = scrollLeftPos.current - walk;
  };

  const handleTouchEnd = () => {
    isDragging.current = false;
  };

  return (
    <div className={styles.sliderWrapper}>
      <div
        className={`${styles.grid}`}
        ref={sliderRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {items.map((a) => (
          <Link key={a.id} href={`/blog/${a.slug}`} className={styles.card}>
            <div className={styles.imageWrapper}>
              <img
                src={a.featured_image || "/hero-banner.png"}
                alt={a.title}
                className={styles.image}
              />
            </div>
            <div className={styles.content}>
              <span className={styles.date}>
                {new Date(a.published_at || new Date()).toLocaleDateString(
                  "en-US",
                  {
                    year: "numeric",
                    month: "long",
                  },
                )}
              </span>
              <h3 className={styles.title}>{a.title}</h3>
              <p className={styles.excerpt}>{a.excerpt}</p>
              <span className={styles.readMore}>Read More →</span>
            </div>
          </Link>
        ))}
      </div>

      {/* Mobile Navigation Arrows */}
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
  );
}
