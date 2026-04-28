import styles from "./HowToBook.module.css";

export default function HowToBook() {
  return (
    <section className={`section-alt ${styles.section}`}>
      <div className="container">
        <div className={styles.grid}>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>How to Booking?</h3>
            <div className={styles.cardContent}>
              <p className={styles.cardText}>
                Choose which Trekking activity you want to have, (Private
                service or standard service):
              </p>
              <ul className={styles.cardList}>
                <li>Meeting point in Senaru / Sembalun</li>
                <li>Direct Trek</li>
              </ul>
              <p className={styles.cardText}>
                Fill The Booking Form provide and make sure you put valid email
                address, so we can reply after received your Tour or Activity
                booking request.
              </p>
            </div>
            <a
              href="/blog/booking-and-payment-procedure"
              className={styles.cardButton}
            >
              Read Details
            </a>
          </div>

          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Booking and Payment Procedure</h3>
            <div className={styles.cardContent}>
              <p className={styles.cardText}>
                Your reservation is absolutely secure. All personal data is
                encrypted and will be processed in a secure way. We takes the
                privacy of your personal data very seriously. Your personal
                information will only be used to process your booking.
              </p>
              <div className={styles.cardTrustInfo}>
                <div className={styles.trustItem}>
                  <span>🔒</span>
                  <p>
                    Your reservation is absolutely secure. All personal data is
                    encrypted.
                  </p>
                </div>
                <div className={styles.trustItem}>
                  <span>✅</span>
                  <p>Free cancellation up to 24 hours before the trek.</p>
                </div>
              </div>
            </div>
            <a
              href="/blog/booking-and-payment-procedure"
              className={styles.cardButton}
            >
              Read Details
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
