"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./WhyChooseUs.module.css";

const whyUsCards = [
  {
    image: "https://pvhtohzmttglkuauibhg.supabase.co/storage/v1/object/public/package/general/GOPR2283.JPG",
    title: "LOCAL EXPERTS",
    text: "At our destination we have established our own local teams. We have partnered with the best local operators to ensure you benefit from unbeatable expertise. Wherever you choose to travel with us, you can be sure our guides and support staff have an unrivalled knowledge and understanding of Mount Rinjani.",
  },
  {
    image: "/sembalun.jpg",
    title: "QUALITY CUSTOMER SERVICE",
    text: "We constantly aim to provide service that exceeds our customers expectations every step of the way. That could mean helpful video calls with our travel consultants before departure, comfortable accommodation on arrival or top quality equipment during your trip. We don't cut any corners.",
  },
  {
    image: "/senaru.jpg",
    title: "SAFETY & RESPONSIBILITY",
    text: "Your safety is our top priority. All our guides are trained in first aid and mountain rescue. We also practice Leave No Trace principles, ensuring that beautiful Mount Rinjani remains pristine for future generations of trekkers to enjoy.",
  },
];

export default function WhyChooseUs() {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftPos, setScrollLeftPos] = useState(0);

  const scrollLeft = () => {
    if (sliderRef.current) {
      // scroll by approx one card width + gap
      sliderRef.current.scrollBy({ left: -320, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: 320, behavior: "smooth" });
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
    <section className={`section ${styles.section}`}>
      <div className={`container ${styles.container}`}>
        {/* Left Column: Intro */}
        <div className={styles.introCol}>
          <span className={styles.label}>NEW TO OUR ADVENTURES?</span>
          <h2 className={styles.title}>Why you should travel with us</h2>
          <p className={styles.desc}>
            Your trip of a lifetime is so important to get right. All of our team
            works hard to ensure you have an unforgettable adventure. With over 10
            years of experience, Trekking Mount Rinjani is dedicated to
            responsible travel and your safety, whilst delivering exceptional service.
          </p>
          <Link href="/why-choose-us" className={styles.learnMore}>
            LEARN MORE
          </Link>
        </div>

        {/* Center & Right: Image Cards Slider */}
        <div className={styles.sliderContainer}>
          <div
            className={`${styles.cardsCol} ${isDragging ? styles.dragging : ""}`}
            ref={sliderRef}
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {whyUsCards.map((card, i) => (
              <div key={i} className={styles.card}>
                <div className={styles.imageWrapper}>
                  <Image src={card.image} alt={card.title} fill sizes="(max-width: 768px) 100vw, 33vw" className={styles.image} loading="lazy" />
                </div>
                <h3 className={styles.cardTitle}>{card.title}</h3>
                <p className={styles.cardText}>{card.text}</p>
              </div>
            ))}
          </div>
          
          {/* Navigation Arrows at bottom right */}
          <div className={styles.navRow}>
            <button 
              className={styles.arrowBtn} 
              aria-label="Previous" 
              onClick={scrollLeft}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </button>
            <button 
              className={styles.arrowBtnDark} 
              aria-label="Next" 
              onClick={scrollRight}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
