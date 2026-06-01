import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import { SembalunPackages, SenaruPackages, ToreanPackages } from "@/components/Packages";
import dynamic from 'next/dynamic';
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { getPublicPackages } from "@/lib/public-packages";
import SenaruTransportSection from "@/components/SenaruTransportSection";

const WhyChooseUs = dynamic(() => import('@/components/WhyChooseUs'));
const PriceTable = dynamic(() => import('@/components/PriceTable'));
const HowToBook = dynamic(() => import('@/components/HowToBook'));
const HappyGuests = dynamic(() => import('@/components/HappyGuests'));
const BlogSection = dynamic(() => import('@/components/BlogSection'));
const ERinjaniSection = dynamic(() => import('@/components/ERinjaniSection'));

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
