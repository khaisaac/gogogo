import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import styles from "./page.module.css";
import Image from "next/image";

export const metadata = {
  title: "About Us | Why Choose Us - Rinjani Trekking",
  description: "Learn more about our Rinjani trekking services, our experienced team, and our commitment to safety and quality.",
};

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className={styles.main}>
        {/* Hero Section */}
        <div className={styles.hero}>
          <div className="container">
            <h1 className={styles.heroTitle}>Why Choose Us</h1>
            <p className={styles.heroDesc}>
              Your trip of a lifetime is so important to get right. Discover why hundreds
              of trekkers choose us every year for their Mount Rinjani adventure.
            </p>
          </div>
        </div>

        {/* Content Section */}
        <div className={`container ${styles.contentContainer}`}>
          <div className={styles.featureBlock}>
            <div className={styles.textContent}>
              <h2 className={styles.sectionTitle}>Local Experts</h2>
              <p>
                At our destination we have established our own local teams. We have partnered
                with the best local operators to ensure you benefit from unbeatable expertise.
                Wherever you choose to travel with us, you can be sure our guides and support
                staff have an unrivalled knowledge and understanding of Mount Rinjani.
              </p>
              <p>
                Our guides are born and raised in the villages surrounding the mountain. They
                know every trail, every weather pattern, and every secret viewpoint.
              </p>
            </div>
            <div className={styles.imageContent}>
              <div className={styles.imageWrapper}>
                <Image 
                  src="https://pvhtohzmttglkuauibhg.supabase.co/storage/v1/object/public/package/general/GOPR2283.JPG" 
                  alt="Local Experts guiding a group" 
                  fill
                  className={styles.image}
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </div>
          </div>

          <div className={`${styles.featureBlock} ${styles.reversed}`}>
            <div className={styles.textContent}>
              <h2 className={styles.sectionTitle}>Quality Customer Service</h2>
              <p>
                We constantly aim to provide service that exceeds our customers expectations
                every step of the way. That could mean helpful video calls with our travel
                consultants before departure, comfortable accommodation on arrival or top quality
                equipment during your trip. We don't cut any corners.
              </p>
              <p>
                From your first inquiry until you return home, our dedicated support team
                is available to answer your questions and ensure a seamless experience.
              </p>
            </div>
            <div className={styles.imageContent}>
              <div className={styles.imageWrapper}>
                <Image 
                  src="/sembalun.jpg" 
                  alt="Quality camping equipment on Rinjani" 
                  fill
                  className={styles.image}
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </div>
          </div>

          <div className={styles.featureBlock}>
            <div className={styles.textContent}>
              <h2 className={styles.sectionTitle}>Safety & Responsibility</h2>
              <p>
                Your safety is our top priority. All our guides are trained in first aid and
                mountain rescue. We also practice Leave No Trace principles, ensuring that
                beautiful Mount Rinjani remains pristine for future generations of trekkers
                to enjoy.
              </p>
              <p>
                We provide regular health checks during the trek and always carry comprehensive
                first aid kits and emergency communication devices.
              </p>
            </div>
            <div className={styles.imageContent}>
              <div className={styles.imageWrapper}>
                <Image 
                  src="/senaru.jpg" 
                  alt="Safe trekking environment" 
                  fill
                  className={styles.image}
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
