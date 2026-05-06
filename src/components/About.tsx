"use client";

import { useRef, useState, UIEvent } from "react";
import RotatingBadge from "./RotatingBadge";
import styles from "./About.module.css";

const aboutImages = [
  "https://pvhtohzmttglkuauibhg.supabase.co/storage/v1/object/public/package/general/WhatsApp%20Image%202026-05-06%20at%2022.03.24.jpeg",
  "https://pvhtohzmttglkuauibhg.supabase.co/storage/v1/object/public/package/general/PHOTO-2026-01-07-18-02-49.jpg",
  "https://pvhtohzmttglkuauibhg.supabase.co/storage/v1/object/public/package/general/PHOTO-2026-01-07-18-02-49.jpg",
  "https://pvhtohzmttglkuauibhg.supabase.co/storage/v1/object/public/package/general/n.jpg"
];

export default function About() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftPos, setScrollLeftPos] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);

  const handleScroll = (e: UIEvent<HTMLDivElement>) => {
    const sectionWidth = e.currentTarget.offsetWidth;
    const scrollLeft = e.currentTarget.scrollLeft;
    const currentIndex = Math.round(scrollLeft / sectionWidth);
    if(currentIndex !== activeIndex && currentIndex < aboutImages.length) {
      setActiveIndex(currentIndex);
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
    const walk = (x - startX) * 1.5; // swipe sensitivity
    sliderRef.current.scrollLeft = scrollLeftPos - walk;
  };

  const scrollToSlide = (index: number) => {
    if (sliderRef.current) {
      const sectionWidth = sliderRef.current.offsetWidth;
      sliderRef.current.scrollTo({ left: index * sectionWidth, behavior: 'smooth' });
    }
  };

  return (
    <section id="about" className={`section ${styles.about}`}>
      <div className={styles.mapBg}>
        <img
          src="/indonesia-map.svg"
          alt=""
          className={styles.mapImage}
          aria-hidden="true"
        />
      </div>
      {/* Centered Header */}
      <div className={styles.header}>
        <span className={styles.label}>Trekking Mount Rinjani</span>
        <h2 className={styles.subtitle}>
          The best trekking experience in Lombok all in one place
        </h2>
      </div>

      <div className={`container ${styles.contentContainer}`}>
        <div className={styles.grid}>
          {/* Left Column — Text + Stats + CTA */}
          <div className={styles.textCol}>
            <p className={styles.text}>
              Trekking Mount Rinjani is a company focused on providing climbing
              services to Mount Rinjani without intermediaries. We manage
              everything directly. Our goal is to reduce costs, such as a 25-30%
              commission, so we ensure the quality of our service.
            </p>
            <p className={styles.text}>
              Before founding the company, I was a guide and founder of Rinjani
              Hero, one of the best trekking agencies in Lombok. Guided by
              passionate experts and backed by personalised service, small
              groups, and unwavering attention to detail, you can enjoy the
              journey knowing you&apos;re in the best hands every step of the way.
            </p>

            <div className={styles.stats}>
              <div className={styles.stat}>
                <strong>3</strong>
                <span>Trekking<br />Routes</span>
              </div>
              <div className={styles.stat}>
                <strong>500+</strong>
                <span>Happy<br />Guests</span>
              </div>
              <div className={styles.stat}>
                <strong>10+</strong>
                <span>Years<br />Experience</span>
              </div>
            </div>

            <a href="#sembalun" className="btn-primary">
              Discover More
            </a>
          </div>

          {/* Right Column — Photo Slider + Rotating Badge */}
          <div className={styles.imageCol}>
            <div className={styles.imageWrapper}>
              <div 
                className={`${styles.imageSlider} ${isDragging ? styles.dragging : ""}`}
                ref={sliderRef}
                onScroll={handleScroll}
                onMouseDown={handleMouseDown}
                onMouseLeave={handleMouseLeave}
                onMouseUp={handleMouseUp}
                onMouseMove={handleMouseMove}
              >
                {aboutImages.map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt={`Rinjani Trip Highlights ${i + 1}`}
                    className={styles.slideImage}
                  />
                ))}
              </div>
              <div className={styles.rotatingBadgeWrapper}>
                <RotatingBadge
                  text="TREKKING MOUNT RINJANI /// "
                  size={180}
                />
              </div>
            </div>
            <div className={styles.dots}>
              {aboutImages.map((_, i) => (
                <button
                  key={i}
                  onClick={() => scrollToSlide(i)}
                  className={activeIndex === i ? styles.dotActive : styles.dot}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
