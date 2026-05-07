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

const SITE_URL = "https://trekkingmountrinjani.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Trekking Mount Rinjani — #1 Local Lombok Trekking Agency",
    template: "%s | Trekking Mount Rinjani",
  },
  description:
    "Trekking Mount Rinjani is a local & licensed Rinjani trekking agency in Lombok, Indonesia. Book Mount Rinjani trekking packages via Sembalun, Senaru & Torean routes. Summit trek, crater rim camping, Segara Anak lake, waterfall tours. 2D1N & 3D2N packages. Private & group tours. Free cancellation 24 hours. Direct booking, best price guaranteed.",
  keywords: [
    "trekking mount rinjani",
    "rinjani destination",
    "sembalun or senaru",
    "sembalun and senaru",
    "sembalun is famous",
    "senaru scenic routes",
    "sembalun vs senaru",
    "sembalun rinjani trek",
    "hidden scenic gems senaru",
    "best photo spots sembalun and senaru",
    "sembalun trekking tour packages",
    "senaru trekking tour packages",
    "sembalun village",
    "rinjani trekking agency",
    "best mount rinjani trekking",
    "rinjani trekking routes",
    "senaru sembalun torean route",
    "rinjani route",
    "mount rinjani trekking",
    "rinjani trekking",
    "mount rinjani trekking packages",
    "local rinjani agency",
    "lombok tour provider",
    "trek mount rinjani",
    "climb mount rinjani",
    "mount rinjani trek",
    "mount rinjani safe",
    "Mount Rinjani trekking guide",
    "Mount Rinjani Lombok trekking",
    "Rinjani summit trek",
    "Mount Rinjani crater rim trek",
    "Rinjani volcano trekking",
    "Rinjani national park trekking",
    "Lombok hiking adventure",
    "Rinjani hiking packages",
    "Rinjani 2 days 1 night trek",
    "Rinjani 3 days 2 nights trek",
    "Rinjani summit package",
    "Rinjani crater lake trek",
    "Segara Anak lake trekking",
    "Rinjani sunrise trek",
    "Rinjani camping trek",
    "Rinjani porter and guide",
    "Rinjani trekking permit",
    "best time to climb Mount Rinjani",
    "beginner Mount Rinjani trek",
    "advanced Rinjani hiking route",
    "private Rinjani trekking tour",
    "group trekking Mount Rinjani",
    "eco trekking Rinjani",
    "Rinjani backpacking trip",
    "Lombok mountain trekking",
    "Indonesia volcano trekking",
    "Mount Rinjani adventure tour",
    "Rinjani hiking experience",
    "Rinjani panoramic views",
    "Mount Rinjani summit sunrise",
    "Rinjani crater rim camping",
    "Senaru crater rim trek",
    "Sembalun crater rim trek",
    "Torean waterfall trekking route",
    "Rinjani waterfall trekking",
    "best trekking route Mount Rinjani",
    "Mount Rinjani hiking itinerary",
    "affordable Rinjani trekking packages",
    "luxury Rinjani trekking package",
    "all inclusive Rinjani trek",
    "Rinjani local guide service",
    "licensed Rinjani trekking company",
    "trusted Rinjani trekking operator",
    "Mount Rinjani expedition",
    "hiking Mount Rinjani Indonesia",
    "Rinjani multi day trek",
    "Rinjani adventure holiday",
    "Lombok eco tourism trekking",
    "Rinjani nature adventure",
    "Rinjani mountain camping",
    "Rinjani trekking from Lombok airport",
    "Mount Rinjani travel guide",
    "best Mount Rinjani tour operator",
    "Rinjani trekking booking",
    "easy booking Rinjani trek",
    "Rinjani hiking and camping",
    "family friendly Rinjani trekking",
    "safe Mount Rinjani hiking",
    "Mount Rinjani local experience",
    "Rinjani hidden waterfall route",
    "Rinjani photography spots",
    "best sunrise spots Rinjani",
    "Mount Rinjani bucket list trip",
    "Lombok trekking experience",
    "Indonesia hiking destination",
    "volcano hiking in Indonesia",
    "Rinjani summit challenge",
    "Mount Rinjani outdoor adventure",
    "Rinjani trekking for beginners",
    "professional Rinjani mountain guides",
    "Rinjani trekking reviews",
    "best rated Rinjani trekking agency",
    "authentic Lombok trekking experience",
    "Mount Rinjani scenic trail",
    "Rinjani trekking via Sembalun",
    "Rinjani trekking via Senaru",
    "Rinjani trekking via Torean",
    "Sembalun trekking experience",
    "Senaru jungle trekking",
    "Lombok volcano adventure",
    "Mount Rinjani eco adventure",
    "Rinjani trekking deals",
    "cheap Mount Rinjani trekking package",
    "Mount Rinjani hiking tour Indonesia",
    "explore Mount Rinjani Lombok",
    "Mount Rinjani trekking holiday",
    "Rinjani island adventure",
    "best Indonesia mountain trekking",
    "unforgettable Rinjani trekking experience",
    "Rinjani trekking with local guides",
    "Mount Rinjani crater lake camping",
    "Lombok summit trekking packages",
    "Mount Rinjani adventure packages",
    "Rinjani trekking and waterfall tour",
    "trekking and camping Lombok",
    "Rinjani mountain trail",
    "Mount Rinjani scenic adventure",
    "climb Rinjani from Sembalun",
    "climb Rinjani from Senaru",
    "best crater rim in Rinjani",
    "Rinjani trekking Indonesia travel",
    "Mount Rinjani hiking route map",
  ],
  authors: [{ name: "Trekking Mount Rinjani" }],
  creator: "Trekking Mount Rinjani",
  publisher: "Trekking Mount Rinjani",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "Trekking Mount Rinjani — #1 Local Lombok Trekking Agency",
    description:
      "Local & licensed Rinjani trekking agency. Mount Rinjani summit trek, crater rim camping, Segara Anak lake. Sembalun, Senaru & Torean routes. 2D1N & 3D2N packages. Free cancellation 24 hours.",
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "Trekking Mount Rinjani",
    images: [
      {
        url: `${SITE_URL}/hero-banner.png`,
        width: 1200,
        height: 630,
        alt: "Trekking Mount Rinjani — Lombok Adventure",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Trekking Mount Rinjani — #1 Local Lombok Trekking Agency",
    description:
      "Local & licensed Rinjani trekking agency in Lombok. Summit trek, crater rim, Segara Anak lake. Sembalun, Senaru & Torean routes. Best price guaranteed.",
    images: [`${SITE_URL}/hero-banner.png`],
  },
  alternates: {
    canonical: SITE_URL,
  },
};

// JSON-LD Structured Data for Local Business + TourOperator
const jsonLd = {
  "@context": "https://schema.org",
  "@type": ["LocalBusiness", "TravelAgency"],
  name: "Trekking Mount Rinjani",
  description:
    "Local & licensed Rinjani trekking agency in Lombok, Indonesia. Mount Rinjani trekking packages via Sembalun, Senaru & Torean routes. Summit trek, crater rim camping, Segara Anak lake, waterfall tours. Private & group trekking. 2D1N & 3D2N packages available. Rinjani porter and guide included. Direct booking without intermediaries.",
  url: SITE_URL,
  telephone: "+6287765550004",
  email: "trekkingmrinjani@gmail.com",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Jalan Senaru Bayan",
    addressLocality: "Lombok Utara",
    addressRegion: "Nusa Tenggara Barat",
    addressCountry: "ID",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: -8.4095,
    longitude: 116.4194,
  },
  image: `${SITE_URL}/hero-banner.png`,
  priceRange: "$$",
  openingHoursSpecification: {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ],
    opens: "00:00",
    closes: "23:59",
  },
  sameAs: [
    "https://www.instagram.com/trekking_mountrinjani/",
    "https://www.facebook.com/lombok.smile.9",
  ],
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    reviewCount: "500",
    bestRating: "5",
  },
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Mount Rinjani Trekking Packages",
    itemListElement: [
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "TouristTrip",
          name: "Sembalun Trekking Tour Packages",
          description:
            "Trek Mount Rinjani via Sembalun route — the famous path to the summit (3,726m). Crater rim camping, sunrise views, Segara Anak lake.",
          touristType: "Adventure",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "TouristTrip",
          name: "Senaru Trekking Tour Packages",
          description:
            "Trek Mount Rinjani via Senaru route — the green scenic route through lush forests and waterfalls. Hidden gems and jungle trekking.",
          touristType: "Adventure",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "TouristTrip",
          name: "Torean Waterfall Trekking Route",
          description:
            "Trek Mount Rinjani via Torean route — waterfall trekking, scenic trails, and eco adventure in Rinjani National Park.",
          touristType: "Adventure",
        },
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${montserrat.variable} ${dmSans.variable}`}>
      <head>
        {/* Preconnect to critical origins */}
        <link rel="preconnect" href="https://pvhtohzmttglkuauibhg.supabase.co" />
        <link rel="dns-prefetch" href="https://pvhtohzmttglkuauibhg.supabase.co" />
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}

