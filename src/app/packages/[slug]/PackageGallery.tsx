"use client";

import { useEffect, useState } from "react";
import styles from "./PackageDetailPage.module.css";

type PackageGalleryProps = {
  images: string[];
  packageTitle: string;
};

export default function PackageGallery({
  images,
  packageTitle,
}: PackageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [mobileIndex, setMobileIndex] = useState(0);

  const maxIndex = Math.max(0, images.length - 1);

  useEffect(() => {
    if (activeIndex === null) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveIndex(null);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [activeIndex]);

  useEffect(() => {
    setMobileIndex((prev) => Math.min(prev, maxIndex));
  }, [maxIndex]);

  const goToSlide = (index: number) => {
    const clamped = Math.max(0, Math.min(index, maxIndex));
    setMobileIndex(clamped);
  };

  return (
    <>
      <div className={styles.galleryGrid}>
        {images.map((src, index) => (
          <button
            key={`${src}-${index}`}
            type="button"
            className={`${styles.galleryItem} ${index === 0 ? styles.galleryItemMain : ""}`}
            onClick={() => setActiveIndex(index)}
            aria-label={`Open photo ${index + 1}`}
          >
            <img
              src={src}
              alt={`${packageTitle} photo ${index + 1}`}
              className={styles.galleryImage}
            />
          </button>
        ))}
      </div>

      <div className={styles.galleryMobileCarousel}>
        {images.length > 1 ? (
          <>
            <button
              type="button"
              className={`${styles.galleryMobileNavBtn} ${styles.galleryMobileNavLeft}`}
              onClick={() => goToSlide(mobileIndex - 1)}
              aria-label="Previous photo"
              disabled={mobileIndex === 0}
            >
              ‹
            </button>
            <button
              type="button"
              className={`${styles.galleryMobileNavBtn} ${styles.galleryMobileNavRight}`}
              onClick={() => goToSlide(mobileIndex + 1)}
              aria-label="Next photo"
              disabled={mobileIndex === maxIndex}
            >
              ›
            </button>
          </>
        ) : null}

        <div
          className={styles.galleryMobileTrack}
          style={{ transform: `translateX(-${mobileIndex * 100}%)` }}
        >
          {images.map((src, index) => (
            <button
              key={`${src}-mobile-${index}`}
              type="button"
              className={styles.galleryMobileSlide}
              onClick={() => setActiveIndex(index)}
              aria-label={`Open photo ${index + 1}`}
            >
              <img
                src={src}
                alt={`${packageTitle} photo ${index + 1}`}
                className={styles.galleryImage}
              />
            </button>
          ))}
        </div>
      </div>

      {activeIndex !== null ? (
        <div
          className={styles.modalBackdrop}
          role="dialog"
          aria-modal="true"
          onClick={() => setActiveIndex(null)}
        >
          <div
            className={styles.modalPanel}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className={styles.modalClose}
              onClick={() => setActiveIndex(null)}
              aria-label="Close image preview"
            >
              Close
            </button>
            <img
              src={images[activeIndex]}
              alt={`${packageTitle} large preview ${activeIndex + 1}`}
              className={styles.modalImage}
            />
          </div>
        </div>
      ) : null}
    </>
  );
}
