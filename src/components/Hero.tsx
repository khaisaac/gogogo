import RotatingBadge from "./RotatingBadge";
import styles from "./Hero.module.css";

export default function Hero() {
  return (
    <section id="hero" className={styles.hero}>
      <div className={styles.overlay} />
      <div className={styles.content}>
        {/* <span className={styles.badge}>✅ Free Cancellation 24 Hours</span> */}
        <h1 className={styles.title}>
          Your Rinjani Adventure
          <br />
          <span className={styles.highlight}>Starts Here</span>
        </h1>
        <p className={styles.subtitle}>
          Local &amp; licensed trekking agency in Lombok. Direct booking without
          intermediaries — better price, better experience.
        </p>
        <div className={styles.ctas}>
          <a href="#sembalun" className="btn-primary">
            Explore Packages
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 1l7 7-7 7M1 8h14" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </a>
          <a href="#about" className="btn-secondary">
            Learn More
          </a>
        </div>


      </div>

      {/* Rotating Badge - Kandoo style */}
      <div className={styles.rotatingBadgeWrapper}>
        <RotatingBadge />
      </div>

      <div className={styles.scrollIndicator}>
        <span>Scroll to explore</span>
        <svg width="16" height="24" viewBox="0 0 16 24" fill="none">
          <rect x="1" y="1" width="14" height="22" rx="7" stroke="white" strokeWidth="2"/>
          <circle cx="8" cy="8" r="2" fill="white" className={styles.scrollDot}/>
        </svg>
      </div>
    </section>
  );
}
