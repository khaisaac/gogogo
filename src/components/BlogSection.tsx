"use client";

import { useRef, useState } from "react";
import styles from "./BlogSection.module.css";

const articles = [
  {
    title: "Which Route Is Better: Sembalun or Senaru?",
    excerpt:
      "Choosing between Sembalun or Senaru is one of the most common questions for first-time Rinjani trekkers. Here's a detailed comparison.",
    image: "https://pvhtohzmttglkuauibhg.supabase.co/storage/v1/object/public/package/general/GOPR2283.JPG",
    date: "April 2026",
    slug: "#",
  },
  {
    title: "Rinjani Destination Guide",
    excerpt:
      "Discover Two Iconic Routes to Mount Rinjani: Trekking Adventures via Sembalun and Senaru.",
    image: "/hero-banner.png",
    date: "April 2026",
    slug: "#",
  },
  {
    title: "Mount Rinjani Trekking",
    excerpt:
      "Direct Booking for Mount Rinjani Trekking. Everything you need to know before your climb.",
    image: "/hero-banner.png",
    date: "April 2026",
    slug: "#",
  },
  {
    title: "Rinjani Route Comparison",
    excerpt:
      "Which Rinjani Route Is Best for You? Choosing the best Mount Rinjani trekking route.",
    image: "/hero-banner.png",
    date: "April 2026",
    slug: "#",
  },
];

export default function BlogSection() {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftPos, setScrollLeftPos] = useState(0);

  const scrollLeft = () => {
    if (sliderRef.current) {
      const slideItem = sliderRef.current.querySelector(`.${styles.card}`) as HTMLElement;
      const scrollAmount = slideItem ? slideItem.offsetWidth + 28 : 320; 
      sliderRef.current.scrollBy({ left: -scrollAmount, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (sliderRef.current) {
      const slideItem = sliderRef.current.querySelector(`.${styles.card}`) as HTMLElement;
      const scrollAmount = slideItem ? slideItem.offsetWidth + 28 : 320;
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

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    if (sliderRef.current) {
      setStartX(e.touches[0].pageX - sliderRef.current.offsetLeft);
      setScrollLeftPos(sliderRef.current.scrollLeft);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !sliderRef.current) return;
    const x = e.touches[0].pageX - sliderRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    sliderRef.current.scrollLeft = scrollLeftPos - walk;
  };

  const handleTouchEnd = () => setIsDragging(false);

  return (
    <section className={styles.blogSection}>
      <div className="container">
        <span className={styles.label}>Travel Tips &amp; Guides</span>
        <h2 className="section-title">Our Top Articles</h2>
        <p className="section-subtitle">
          Read our latest guides to prepare for your Rinjani adventure.
        </p>
        <div className={styles.sliderWrapper}>
          <div 
            className={`${styles.grid} ${isDragging ? styles.dragging : ""}`}
            ref={sliderRef}
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {articles.map((a, i) => (
              <a key={i} href={a.slug} className={styles.card}>
                <div className={styles.imageWrapper}>
                  <img src={a.image} alt={a.title} className={styles.image} />
                </div>
                <div className={styles.content}>
                  <span className={styles.date}>{a.date}</span>
                  <h3 className={styles.title}>{a.title}</h3>
                  <p className={styles.excerpt}>{a.excerpt}</p>
                  <span className={styles.readMore}>Read More →</span>
                </div>
              </a>
            ))}
          </div>

          {/* Mobile Navigation Arrows */}
          <div className={styles.mobileControls}>
            <button onClick={scrollLeft} className={styles.arrowBtn} aria-label="Previous">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
            </button>
            <button onClick={scrollRight} className={styles.arrowBtn} aria-label="Next">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
          </div>
        </div>
        <div className={styles.actions}>
          <a href="#" className="btn-outline">See All Articles</a>
        </div>
      </div>
    </section>
  );
}
