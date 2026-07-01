import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import { SembalunPackages, SenaruPackages, ToreanPackages } from "@/components/Packages";
import dynamic from 'next/dynamic';
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { getPublicPackages } from "@/lib/public-packages";
import SenaruTransportSection from "@/components/SenaruTransportSection";
import { prisma } from "@/lib/db";
import type { Metadata } from "next";
import { getPageSEO } from "@/lib/seo";

const WhyChooseUs = dynamic(() => import('@/components/WhyChooseUs'));
const PriceTable = dynamic(() => import('@/components/PriceTable'));
const HowToBook = dynamic(() => import('@/components/HowToBook'));
const HappyGuests = dynamic(() => import('@/components/HappyGuests'));
const BlogSection = dynamic(() => import('@/components/BlogSection'));
const ERinjaniSection = dynamic(() => import('@/components/ERinjaniSection'));

export const revalidate = 60; // ISR: re-generate every 60 seconds

export async function generateMetadata(): Promise<Metadata> {
  return await getPageSEO("home", {
    title: "Trekking Mount Rinjani — #1 Local Lombok Trekking Agency",
    description:
      "Trekking Mount Rinjani is a local & licensed Rinjani trekking agency in Lombok, Indonesia. Book Mount Rinjani trekking packages via Sembalun, Senaru & Torean routes.",
  });
}

export default async function Home() {
  const { sembalun, senaru, torean } = await getPublicPackages();
  const ticketSetting = await prisma.ticketSetting.findUnique({ where: { id: "default" } });
  const eRinjaniImage = ticketSetting?.image || "https://lh3.googleusercontent.com/d/1eEbPQwKIIIq6THCCFQ56XUGPqJljgD1u";

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
        <ERinjaniSection image={eRinjaniImage} />
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
