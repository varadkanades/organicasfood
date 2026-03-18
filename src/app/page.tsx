import { HeroSection } from "@/components/home/HeroSection";
import { TrustBar } from "@/components/home/TrustBar";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { BrandStory } from "@/components/home/BrandStory";
import { WhyChooseUs } from "@/components/home/WhyChooseUs";
import { Testimonials } from "@/components/home/Testimonials";

export default function HomePage() {
  return (
    <>
      {/* ── BATCH 2 ─────────────────────────── */}
      <HeroSection />
      <TrustBar />
      <FeaturedProducts />

      {/* ── BATCH 3 ─────────────────────────── */}
      <BrandStory />
      <WhyChooseUs />
      <Testimonials />
    </>
  );
}
