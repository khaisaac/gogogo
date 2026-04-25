import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import { SembalunPackages, SenaruPackages } from "@/components/Packages";
import WhyChooseUs from "@/components/WhyChooseUs";
import PriceTable from "@/components/PriceTable";
import HowToBook from "@/components/HowToBook";
import HappyGuests from "@/components/HappyGuests";
import BlogSection from "@/components/BlogSection";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { getPublicPackages } from "@/lib/public-packages";

export default async function Home() {
  const { sembalun, senaru } = await getPublicPackages();

  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <About />
        <SembalunPackages packages={sembalun} />
        <SenaruPackages packages={senaru} />
        <WhyChooseUs />
        <PriceTable packages={[...sembalun, ...senaru]} />
        <HowToBook />
        <HappyGuests />
        <BlogSection />
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
