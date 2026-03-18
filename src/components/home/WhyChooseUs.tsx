"use client";

import { useRef, useEffect, useState } from "react";
import Container from "@/components/ui/Container";

// ── Benefits data ─────────────────────────────────────────────────────────────
const BENEFITS = [
  {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-7 h-7"
      >
        <path d="M12 22c4.97 0 9-2.69 9-6v-2c0-3.31-4.03-6-9-6s-9 2.69-9 6v2c0 3.31 4.03 6 9 6Z" />
        <path d="M12 14c4.97 0 9-2.69 9-6s-4.03-6-9-6-9 2.69-9 6 4.03 6 9 6Z" />
      </svg>
    ),
    title: "Zero Preservatives",
    description:
      "No chemicals, no additives, no artificial colours. Every powder is 100% single-ingredient — just the vegetable, dehydrated and ground. Nothing else makes it in.",
    accent: "bg-fresh-green/10 text-fresh-green",
  },
  {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-7 h-7"
      >
        <path d="M12 3v18" />
        <path d="M3.5 7.5c2.5-2 5-3 8.5-3s6 1 8.5 3" />
        <path d="M5 14.5c2-1.5 4.5-2.5 7-2.5s5 1 7 2.5" />
      </svg>
    ),
    title: "Small Batch Crafted",
    description:
      "We don't mass-produce. Each batch is made fresh in small quantities, ensuring quality control that factories simply can't match. You taste the difference.",
    accent: "bg-deep-forest/10 text-deep-forest",
  },
  {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-7 h-7"
      >
        <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z" />
        <path d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9" />
        <path d="M12 3v6" />
      </svg>
    ),
    title: "Farm to Table Direct",
    description:
      "No warehouses, no middlemen, no months on a shelf. We source directly from trusted farmers in Maharashtra and deliver straight to your kitchen — freshness guaranteed.",
    accent: "bg-earthy-brown/10 text-earthy-brown",
  },
];

// ── Animated benefit card ────────────────────────────────────────────────────
function BenefitCard({
  benefit,
  index,
}: {
  benefit: (typeof BENEFITS)[0];
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
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [index]);

  return (
    <div
      ref={ref}
      className={`group relative transition-all duration-700 ease-out ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
    >
      <div className="bg-white rounded-2xl p-8 md:p-10 border border-warm-stone/15 h-full transition-all duration-500 hover:shadow-lg hover:-translate-y-1 hover:border-sage-green/25">
        {/* Icon */}
        <div
          className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-6 ${benefit.accent} transition-transform duration-500 group-hover:scale-110`}
        >
          {benefit.icon}
        </div>

        {/* Content */}
        <h3 className="font-heading text-2xl text-rich-black mb-3">
          {benefit.title}
        </h3>
        <p className="text-mid-gray text-[15px] leading-relaxed">
          {benefit.description}
        </p>

        {/* Bottom accent line */}
        <div className="mt-8 h-px bg-gradient-to-r from-sage-green/30 via-sage-green/10 to-transparent w-0 group-hover:w-full transition-all duration-700" />
      </div>
    </div>
  );
}

// ── Main WhyChooseUs Section ─────────────────────────────────────────────────
export function WhyChooseUs() {
  const [headingVisible, setHeadingVisible] = useState(false);
  const headingRef = useRef<HTMLDivElement>(null);

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

  return (
    <section className="py-24 md:py-32 bg-soft-stone/30">
      <Container>
        {/* Section heading */}
        <div
          ref={headingRef}
          className={`text-center mb-16 transition-all duration-700 ease-out ${
            headingVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-6"
          }`}
        >
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-leaf-green mb-3">
            The Organika Difference
          </p>
          <h2 className="font-heading text-4xl lg:text-5xl text-rich-black mb-5">
            Why Families{" "}
            <span className="text-deep-forest italic">Trust Us</span>
          </h2>
          <p className="text-mid-gray max-w-xl mx-auto leading-relaxed">
            We do things differently — no shortcuts, no compromises. Here&apos;s
            what sets Organika apart from everything else on the shelf.
          </p>
        </div>

        {/* 3-column grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {BENEFITS.map((benefit, i) => (
            <BenefitCard key={benefit.title} benefit={benefit} index={i} />
          ))}
        </div>

        {/* Bottom trust note */}
        <div
          className={`text-center mt-14 transition-all duration-700 delay-500 ${
            headingVisible ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm border border-warm-stone/20 rounded-full px-6 py-3">
            <span className="w-2 h-2 rounded-full bg-fresh-green animate-pulse" />
            <span className="text-sm text-mid-gray">
              All products are{" "}
              <span className="text-deep-forest font-medium">
                FSSAI certified
              </span>{" "}
              and lab-tested for purity
            </span>
          </div>
        </div>
      </Container>
    </section>
  );
}
