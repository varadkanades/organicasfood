"use client";

import Link from "next/link";
import { useRef, useEffect, useState } from "react";
import Container from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { ProductCard, type ProductCardProps } from "@/components/ui/ProductCard";

// ── Product data ──────────────────────────────────────────────────────────────
// Update prices once you decide on final pricing.
// Add your product images to public/images/products/
const PRODUCTS: ProductCardProps[] = [
  {
    name: "Beetroot Powder",
    tagline: "Rich & Earthy",
    description:
      "Vibrant, antioxidant-rich beetroot powder. Adds natural colour and iron-boost to smoothies, rotis, and gravies.",
    price: 199,
    unit: "100g",
    slug: "beetroot-powder",
    imageSrc: "/images/products/beetroot-powder.jpg",
    badge: "Bestseller",
    color: "bg-red-50",
    accentColor: "#C53030",
    emoji: "🟣",
  },
  {
    name: "Carrot Powder",
    tagline: "Sweet & Bright",
    description:
      "Sun-dried carrot powder packed with beta-carotene. Perfect for soups, baby food, and baked goods.",
    price: 179,
    unit: "100g",
    slug: "carrot-powder",
    imageSrc: "/images/products/carrot-powder.jpg",
    color: "bg-orange-50",
    accentColor: "#C05621",
    emoji: "🥕",
  },
  {
    name: "Coriander Leaf Powder",
    tagline: "Fresh & Aromatic",
    description:
      "100% green coriander leaves, gently dehydrated to preserve aroma and nutrients. A kitchen essential.",
    price: 149,
    unit: "50g",
    slug: "coriander-leaf-powder",
    imageSrc: "/images/products/coriander-leaf-powder.jpg",
    badge: "Popular",
    color: "bg-green-50",
    accentColor: "#276749",
    emoji: "🌿",
  },
  {
    name: "Curry Leaves Powder",
    tagline: "Bold & Traditional",
    description:
      "Authentic curry leaves powder with deep, traditional flavour. Essential for South Indian cooking.",
    price: 159,
    unit: "50g",
    slug: "curry-leaves-powder",
    imageSrc: "/images/products/curry-leaves-powder.jpg",
    color: "bg-emerald-50",
    accentColor: "#2F855A",
    emoji: "🍃",
  },
];

// Section heading with scroll-triggered reveal
function SectionHeading() {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`text-center mb-14 transition-all duration-700 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      }`}
    >
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-leaf-green mb-3">
        Our Products
      </p>
      <h2 className="font-heading text-4xl lg:text-5xl text-rich-black mb-4">
        Pure Powders,{" "}
        <span className="text-deep-forest italic">Real Nutrition</span>
      </h2>
      <p className="text-mid-gray max-w-xl mx-auto leading-relaxed">
        Every powder is dehydrated at low temperatures to preserve maximum
        nutrients. No fillers, no shortcuts — just the real vegetable, powdered.
      </p>
    </div>
  );
}

// Individual card with staggered reveal
function AnimatedCard({
  product,
  index,
}: {
  product: ProductCardProps;
  index: number;
}) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setVisible(true), index * 100);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [index]);

  return (
    <div
      ref={ref}
      className={`transition-all duration-600 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
    >
      <ProductCard {...product} />
    </div>
  );
}

export function FeaturedProducts() {
  return (
    <section className="py-24 bg-soft-stone/30">
      <Container>
        <SectionHeading />

        {/* 4-column grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {PRODUCTS.map((product, i) => (
            <AnimatedCard key={product.slug} product={product} index={i} />
          ))}
        </div>

        {/* View all CTA */}
        <div className="text-center mt-12">
          <Link href="/shop">
            <Button variant="outline" size="lg">
              View All Products
            </Button>
          </Link>
        </div>

        {/* Bottom note */}
        <p className="text-center text-xs text-mid-gray mt-6 tracking-wide">
          All products are FSSAI certified · Free from preservatives & artificial colours
        </p>
      </Container>
    </section>
  );
}
