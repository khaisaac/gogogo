import styles from "./HappyGuests.module.css";

export default function HappyGuests() {
  return (
    <section className={styles.section}>
      <div className={styles.overlay}></div>
      <div className={`container ${styles.container}`}>
        <h2 className={styles.title}>OVER 500+ HAPPY GUESTS HAVE CHOOSEN US</h2>
      </div>
    </section>
  );
}
