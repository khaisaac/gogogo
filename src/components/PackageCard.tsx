import styles from "./PackageCard.module.css";
import {
  difficultyScoreToLabel,
  difficultyScoreToLevel,
} from "@/lib/difficulty";

interface PackageCardProps {
  title: string;
  duration: string;
  price: number;
  image: string;
  badge?: string;
  rating?: number;
  difficulty?: number;
  location?: string;
  hideImage?: boolean;
}

export default function PackageCard({
  title,
  duration,
  price,
  image,
  difficulty = 1,
  location = "Indonesia",
  hideImage = false,
}: PackageCardProps) {
  // Map duration string to just number and "DAYS"
  const durationNum = duration.match(/\d+/)?.[0] || "3";
  const difficultyLevel = difficultyScoreToLevel(difficulty);
  const difficultyText = difficultyScoreToLabel(difficulty).toUpperCase();
  const difficultyFill = `${(difficultyLevel / 3) * 100}%`;

  return (
    <div className={`${styles.card} ${hideImage ? styles.cardNoImage : ""}`}>
      {!hideImage && (
        <div className={styles.imageWrapper}>
          <img src={image} alt={title} className={styles.image} />
        </div>
      )}
      <div className={styles.content}>
        <div className={styles.location}>
          {location} <span className={styles.dot}>•</span> Trekking
        </div>
        <h3 className={styles.title}>{title}</h3>
        <div className={styles.priceRow}>
          <span className={styles.fromText}>from</span>
          <span className={styles.priceValue}>${price}</span>
        </div>
        <div className={styles.footer}>
          <div className={styles.duration}>
            <span className={styles.durationNum}>{durationNum}</span>
            <span className={styles.durationText}>DAYS</span>
          </div>
          <div className={styles.difficultyBadge}>
            <div
              className={styles.difficultyCircle}
              style={{
                ["--difficulty-fill" as "--difficulty-fill"]: difficultyFill,
              }}
            >
              <span className={styles.difficultyValue}>{difficultyLevel}</span>
            </div>
            <span className={styles.difficultyLabel}>{difficultyText}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
