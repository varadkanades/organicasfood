// Dynamic SEO meta tags — used via Next.js Metadata API
// This is a helper for generating metadata objects

import { SITE_NAME, SITE_URL } from "@/lib/constants";

interface SEOProps {
  title: string;
  description: string;
  image?: string;
  path?: string;
}

export function generateSEO({ title, description, image, path = "" }: SEOProps) {
  const url = `${SITE_URL}${path}`;
  const fullTitle = `${title} | ${SITE_NAME}`;

  return {
    title: fullTitle,
    description,
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: SITE_NAME,
      images: image ? [{ url: image }] : [],
      locale: "en_IN",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
    },
  };
}
