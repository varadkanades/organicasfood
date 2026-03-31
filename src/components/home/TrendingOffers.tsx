"use client";

import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { TrendingUp, Flame } from "lucide-react";
import Container from "@/components/ui/Container";
import {
  fetchProducts,
  getDiscountedPrice,
  type SupabaseProduct,
} from "@/lib/supabase-products";

function TrendingCard({
  product,
  index,
}: {
  product: SupabaseProduct;
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
          setTimeout(() => setVisible(true), index * 120);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [index]);

  const mainSize = product.sizes[1] || product.sizes[0];
  const hasDiscount = product.discount_percent > 0;
  const discountedPrice = hasDiscount
    ? getDiscountedPrice(mainSize.price, product.discount_percent)
    : mainSize.price;

  return (
    <div
      ref={ref}
      className={`transition-all duration-600 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
    >
      <Link href={`/shop/${product.slug}`} className="group block">
        <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10 hover:border-white/25 transition-all duration-300 hover:shadow-lg hover:shadow-black/20">
          {/* Discount badge */}
          {hasDiscount && (
            <div className="absolute top-3 left-3 z-10 flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-500 text-white text-xs font-bold shadow-lg">
              <Flame className="h-3 w-3" />
              {product.discount_percent}% OFF
            </div>
          )}

          {/* Product badge */}
          {product.badge && !hasDiscount && (
            <div className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-full bg-fresh-green text-white text-xs font-bold shadow-lg">
              {product.badge}
            </div>
          )}

          {/* Image */}
          <div className="relative aspect-square bg-white/5 overflow-hidden">
            <Image
              src={product.image_src}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 640px) 70vw, (max-width: 1024px) 40vw, 25vw"
            />
          </div>

          {/* Info */}
          <div className="p-4">
            <p className="text-xs text-white/50 uppercase tracking-wider mb-1">
              {product.tagline}
            </p>
            <h3 className="text-base font-semibold text-white mb-2 group-hover:text-fresh-green transition-colors">
              {product.name}
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-fresh-green">
                &#8377;{discountedPrice}
              </span>
              {hasDiscount && (
                <span className="text-sm text-white/40 line-through">
                  &#8377;{mainSize.price}
                </span>
              )}
              <span className="text-xs text-white/40">/ {mainSize.weight}</span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}

export function TrendingOffers() {
  const [trending, setTrending] = useState<SupabaseProduct[]>([]);
  const [headingVisible, setHeadingVisible] = useState(false);
  const headingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchProducts()
      .then((products) => {
        setTrending(
          products.filter((p) => p.discount_percent > 0 || p.badge)
        );
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const el = headingRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHeadingVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Don't render if no trending products
  if (trending.length === 0) return null;

  return (
    <section className="py-20 bg-deep-forest relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-fresh-green blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-sage-green blur-3xl" />
      </div>

      <Container className="relative z-10">
        {/* Heading */}
        <div
          ref={headingRef}
          className={`text-center mb-12 transition-all duration-700 ${
            headingVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-fresh-green/15 border border-fresh-green/20 mb-4">
            <TrendingUp className="h-4 w-4 text-fresh-green" />
            <span className="text-xs font-semibold text-fresh-green uppercase tracking-wider">
              Trending Now
            </span>
          </div>
          <h2 className="font-heading text-3xl lg:text-4xl text-white mb-3">
            Hot Picks &{" "}
            <span className="text-fresh-green italic">Special Offers</span>
          </h2>
          <p className="text-white/50 max-w-lg mx-auto text-sm leading-relaxed">
            Our most loved products and best deals — grab them before they&apos;re gone!
          </p>
        </div>

        {/* Product grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {trending.map((product, i) => (
            <TrendingCard key={product.slug} product={product} index={i} />
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-10">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-fresh-green text-white text-sm font-semibold hover:bg-fresh-green/90 transition-colors"
          >
            Shop All Products
            <TrendingUp className="h-4 w-4" />
          </Link>
        </div>
      </Container>
    </section>
  );
}
