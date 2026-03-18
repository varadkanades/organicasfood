"use client";

import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import { PageHeader } from "@/components/shared/PageHeader";
import { WHATSAPP_NUMBER, SHIPPING_REGIONS } from "@/lib/constants";
import { getWhatsAppUrl } from "@/lib/utils";

// ── Process timeline steps ───────────────────────────────────────────────────
const PROCESS_STEPS = [
  {
    step: "01",
    title: "Sourcing",
    description:
      "We handpick fresh vegetables directly from trusted farmers across Maharashtra — farmers who share our respect for the soil and practice sustainable agriculture.",
    icon: "🌱",
  },
  {
    step: "02",
    title: "Cleaning & Preparation",
    description:
      "Every vegetable is thoroughly washed, inspected by hand, and trimmed to ensure only the best quality produce enters our dehydration process.",
    icon: "💧",
  },
  {
    step: "03",
    title: "Low-Heat Dehydration",
    description:
      "We use gentle, low-temperature dehydration technology to remove moisture while preserving the natural colour, aroma, and up to 95% of the original nutrients.",
    icon: "☀️",
  },
  {
    step: "04",
    title: "Fine Grinding & Packaging",
    description:
      "The dehydrated vegetables are ground into a fine, consistent powder and sealed in airtight packaging to lock in freshness. From farm to pack in days, not months.",
    icon: "📦",
  },
];

// ── Core values ──────────────────────────────────────────────────────────────
const VALUES = [
  {
    title: "Purity First",
    description:
      "One ingredient per product. No fillers, no blending agents, no preservatives — ever. What you read on the label is all that's inside.",
  },
  {
    title: "Farm Direct",
    description:
      "We cut out warehouses and middlemen. Our supply chain is short, transparent, and built on trust with local Maharashtra farmers.",
  },
  {
    title: "Honest Nutrition",
    description:
      "We don't make miracle claims. We simply deliver vegetables in their most concentrated, convenient form — so you get real nutrition, daily.",
  },
];

// ── Animated section wrapper ─────────────────────────────────────────────────
function AnimatedSection({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setVisible(true), delay);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      } ${className}`}
    >
      {children}
    </div>
  );
}

// ── Main About Page ──────────────────────────────────────────────────────────
export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="Our Story"
        title="From Our Farm"
        highlight="to Your Home"
        description="We believe the shortest distance between a healthy body and nature is the field itself."
      />

      {/* ── Origin Story Section ── */}
      <section className="py-20 md:py-28 bg-warm-cream">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center">
            {/* Image */}
            <AnimatedSection>
              <div className="relative aspect-[4/5] rounded-3xl overflow-hidden bg-soft-stone shadow-sm">
                <Image
                  src="/images/hero/beetroot.jpg"
                  alt="Fresh beetroot handpicked from Maharashtra farms"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
              </div>
            </AnimatedSection>

            {/* Content */}
            <div>
              <AnimatedSection delay={100}>
                <h2 className="font-heading text-3xl md:text-4xl text-rich-black mb-6 leading-tight">
                  We noticed that in the journey from farm to store, most food{" "}
                  <span className="text-deep-forest italic">
                    loses its soul.
                  </span>
                </h2>
              </AnimatedSection>

              <AnimatedSection delay={200}>
                <div className="space-y-4 text-mid-gray text-[15px] leading-relaxed">
                  <p>
                    The nutrients fade. The colour dulls. The natural vibration
                    of fresh produce gets lost somewhere between the farm, the
                    warehouse, the shelf, and your kitchen. By the time it
                    reaches you, it&apos;s a shadow of what it was.
                  </p>
                  <p>
                    At Organika&apos;s Food, we decided to change that
                    narrative. We started with a simple question: what if we
                    could capture a vegetable at its absolute freshest — and
                    deliver that freshness directly to your doorstep?
                  </p>
                  <p>
                    The answer was low-heat dehydration. A gentle process that
                    removes moisture but preserves everything else — the deep
                    crimson of a beetroot, the bright orange of a carrot, the
                    intense aroma of fresh coriander leaves.
                  </p>
                  <p className="font-medium text-rich-black">
                    No preservatives. No artificial colours. No compromises.
                    Just the vegetable, powdered.
                  </p>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </Container>
      </section>

      {/* ── Our Process Section ── */}
      <section className="py-20 md:py-28 bg-soft-stone/30 border-y border-warm-stone/15">
        <Container>
          <AnimatedSection>
            <div className="text-center mb-16">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-leaf-green mb-3">
                Our Process
              </p>
              <h2 className="font-heading text-3xl md:text-4xl text-rich-black mb-4">
                From Field to{" "}
                <span className="text-deep-forest italic">Fine Powder</span>
              </h2>
              <p className="text-mid-gray max-w-xl mx-auto leading-relaxed">
                Every step is designed to preserve what nature created. Here&apos;s
                how your food gets from the soil to the seal.
              </p>
            </div>
          </AnimatedSection>

          {/* Process timeline */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {PROCESS_STEPS.map((step, i) => (
              <AnimatedSection key={step.step} delay={i * 120}>
                <div className="bg-white rounded-2xl p-8 border border-warm-stone/15 h-full transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                  {/* Step number + icon */}
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-5xl">{step.icon}</span>
                    <span className="text-xs font-semibold text-sage-green/60 uppercase tracking-widest">
                      Step {step.step}
                    </span>
                  </div>
                  <h3 className="font-heading text-xl text-rich-black mb-3">
                    {step.title}
                  </h3>
                  <p className="text-sm text-mid-gray leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </Container>
      </section>

      {/* ── Values Section ── */}
      <section className="py-20 md:py-28 bg-warm-cream">
        <Container>
          <AnimatedSection>
            <div className="text-center mb-16">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-leaf-green mb-3">
                What We Stand For
              </p>
              <h2 className="font-heading text-3xl md:text-4xl text-rich-black">
                Our{" "}
                <span className="text-deep-forest italic">Core Values</span>
              </h2>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {VALUES.map((value, i) => (
              <AnimatedSection key={value.title} delay={i * 120}>
                <div className="text-center">
                  {/* Decorative number */}
                  <span className="inline-block font-heading text-6xl text-sage-green/20 mb-2">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="font-heading text-2xl text-rich-black mb-3">
                    {value.title}
                  </h3>
                  <p className="text-mid-gray text-[15px] leading-relaxed max-w-sm mx-auto">
                    {value.description}
                  </p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </Container>
      </section>

      {/* ── CTA Section ── */}
      <section className="py-20 md:py-24 bg-deep-forest">
        <Container>
          <AnimatedSection>
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="font-heading text-3xl md:text-4xl text-white mb-4">
                Ready to Taste the{" "}
                <span className="italic text-sage-green">Difference?</span>
              </h2>
              <p className="text-white/60 leading-relaxed mb-8">
                Join families across{" "}
                {SHIPPING_REGIONS.join(", ")} who&apos;ve
                made Organika&apos;s powders a part of their daily kitchen.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/shop">
                  <Button
                    size="lg"
                    className="bg-fresh-green text-white hover:bg-sage-green border-0 shadow-lg"
                  >
                    Shop Our Products
                  </Button>
                </Link>
                <a
                  href={getWhatsAppUrl(WHATSAPP_NUMBER, "Hi! I'd like to learn more about Organika's Food products.")}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-white/30 text-white hover:bg-white/10 hover:border-white/50"
                  >
                    Chat on WhatsApp
                  </Button>
                </a>
              </div>
            </div>
          </AnimatedSection>
        </Container>
      </section>
    </>
  );
}
