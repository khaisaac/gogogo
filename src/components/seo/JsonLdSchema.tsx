import React from "react";

interface JsonLdSchemaProps {
  type?: string;
  title?: string;
  description?: string;
  url?: string;
  imageUrl?: string;
}

export default function JsonLdSchema({
  type = "Website",
  title = "Trekking Mount Rinjani Lombok Agency",
  description = "Official licensed Mount Rinjani trekking specialist.",
  url = "https://trekkingmountrinjani.com",
  imageUrl = "https://trekkingmountrinjani.com/hero-banner.png",
}: JsonLdSchemaProps) {
  let schemaData: any = {
    "@context": "https://schema.org",
    "@type": type,
    name: title,
    description: description,
    url: url,
  };

  if (type === "Article") {
    schemaData = {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: title,
      description: description,
      image: imageUrl ? [imageUrl] : [],
      publisher: {
        "@type": "Organization",
        name: "Trekking Mount Rinjani",
      },
    };
  } else if (type === "Tour" || type === "Product") {
    schemaData = {
      "@context": "https://schema.org",
      "@type": "TouristTrip",
      name: title,
      description: description,
      touristType: ["Hikers", "Adventure"],
    };
  } else if (type === "LocalBusiness" || type === "Organization") {
    schemaData = {
      "@context": "https://schema.org",
      "@type": "TravelAgency",
      name: "Trekking Mount Rinjani",
      description: description,
      url: url,
      address: {
        "@type": "PostalAddress",
        addressLocality: "Senaru, Lombok",
        addressRegion: "Nusa Tenggara Barat",
        addressCountry: "ID",
      },
    };
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
    />
  );
}
