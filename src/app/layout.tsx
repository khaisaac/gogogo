import type { Metadata } from "next";
import { Montserrat, DM_Sans } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
  weight: ["600", "700", "800", "900"],
});

const dmSans = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Trekking Mount Rinjani — The Best Lombok Tour Provider",
  description:
    "Trekking Mount Rinjani is a local & licensed Rinjani trekking agency. Direct booking without intermediaries. Free cancellation 24 hours. Sembalun, Senaru & Torean routes.",
  keywords: [
    "Mount Rinjani",
    "Rinjani trekking",
    "Lombok trekking",
    "Rinjani tour",
    "Sembalun route",
    "Senaru route",
    "Mount Rinjani summit",
    "Lombok tour provider",
  ],
  openGraph: {
    title: "Trekking Mount Rinjani — The Best Lombok Tour Provider",
    description:
      "Local & licensed Rinjani trekking agency. Direct service, no intermediaries. Free cancellation 24 hours.",
    type: "website",
    locale: "en_US",
    siteName: "Trekking Mount Rinjani",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${montserrat.variable} ${dmSans.variable}`}>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
