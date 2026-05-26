import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import { SembalunPackages, SenaruPackages, ToreanPackages } from "@/components/Packages";
import WhyChooseUs from "@/components/WhyChooseUs";
import PriceTable from "@/components/PriceTable";
import HowToBook from "@/components/HowToBook";
import HappyGuests from "@/components/HappyGuests";
import BlogSection from "@/components/BlogSection";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { getPublicPackages } from "@/lib/public-packages";
import SenaruTransportSection from "@/components/SenaruTransportSection";

import ERinjaniSection from "@/components/ERinjaniSection";

export const revalidate = 60; // ISR: re-generate every 60 seconds

export default async function Home() {
  const { sembalun, senaru, torean } = await getPublicPackages();

  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <About />
        <SembalunPackages packages={sembalun} />
        <SenaruPackages packages={senaru} />
        <SenaruTransportSection />
        <ToreanPackages packages={torean} />
        <ERinjaniSection />
        <WhyChooseUs />
        <PriceTable packages={[...sembalun, ...senaru, ...torean]} />
        <HowToBook />
        <HappyGuests />
        <BlogSection />
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
