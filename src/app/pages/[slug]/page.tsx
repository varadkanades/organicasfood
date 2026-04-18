import type { Metadata } from "next";
import LegalPage from "./LegalPage";

const PAGE_TITLES: Record<string, string> = {
  terms: "Terms & Conditions",
  privacy: "Privacy Policy",
  "return-policy": "Return & Refund Policy",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const title = PAGE_TITLES[slug] || "Page";
  return {
    title: `${title} | Organikas Foods`,
    description: `${title} for Organikas Foods — 100% Natural Food Powders.`,
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <LegalPage slug={slug} />;
}
