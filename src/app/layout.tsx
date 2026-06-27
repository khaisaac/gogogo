import type { Metadata } from "next";
import { Montserrat, DM_Sans } from "next/font/google";
import Script from "next/script";
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
    "rinjani trekking packages",
    "mount rinjani trekking",
    "lombok trekking agency",
    "rinjani local guide",
    "sembalun trekking route",
    "senaru trekking route",
    "torean trekking route",
    "mount rinjani summit trek",
    "rinjani crater rim camping"
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
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
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
  logo: `${SITE_URL}/logo.png`,
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
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body suppressHydrationWarning>
        <Script
          strategy="lazyOnload"
          src="https://www.googletagmanager.com/gtag/js?id=AW-11203920100"
        />
        <Script id="google-ads" strategy="lazyOnload">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'AW-11203920100');
          `}
        </Script>
        <Script
          strategy="lazyOnload"
          src="https://www.googletagmanager.com/gtag/js?id=G-762E0P589G"
        />
        <Script id="google-analytics" strategy="lazyOnload">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-762E0P589G');
          `}
        </Script>
        {children}
      </body>
    </html>
  );
}

