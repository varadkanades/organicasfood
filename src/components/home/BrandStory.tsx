"use client";

import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import Container from "@/components/ui/Container";

// ── Journey steps ─────────────────────────────────────────────────────────────
const JOURNEY_STEPS = [
  {
    number: "01",
    title: "Handpicked from the Field",
    description:
      "We start at the source — selecting the freshest beetroots, carrots, coriander, and curry leaves directly from trusted farmers who share our respect for the soil.",
  },
  {
    number: "02",
    title: "Gently Dehydrated",
    description:
      "Using low-heat dehydration, we turn fresh produce into fine powders. The colour, the nutrients, the aroma — all stay intact, exactly as nature intended.",
  },
  {
    number: "03",
    title: "Delivered to Your Door",
    description:
      "No warehouses, no middlemen, no long supply chains. We pack the goodness and send it straight to you — pure, fresh, and uncompromised.",
  },
];

// ── Animated step component ──────────────────────────────────────────────────
function JourneyStep({
  step,
  index,
}: {
  step: (typeof JOURNEY_STEPS)[0];
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
          setTimeout(() => setVisible(true), index * 150);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [index]);

  return (
    <div
      ref={ref}
      className={`flex gap-5 transition-all duration-700 ease-out ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      }`}
    >
      {/* Step number */}
      <div className="flex-shrink-0">
        <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-sage-green/15 text-deep-forest text-sm font-semibold">
          {step.number}
        </span>
      </div>

      {/* Content */}
      <div className="pt-1">
        <h3 className="font-heading text-xl text-rich-black mb-2">
          {step.title}
        </h3>
        <p className="text-mid-gray text-[15px] leading-relaxed">
          {step.description}
        </p>
      </div>
    </div>
  );
}

// ── Main BrandStory Section ──────────────────────────────────────────────────
export function BrandStory() {
  const [headingVisible, setHeadingVisible] = useState(false);
  const [imageVisible, setImageVisible] = useState(false);
  const headingRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const el = imageRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setImageVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="py-24 md:py-32 bg-warm-cream overflow-hidden">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center">
          {/* ── Left: Image ── */}
          <div
            ref={imageRef}
            className={`relative transition-all duration-1000 ease-out ${
              imageVisible
                ? "opacity-100 translate-x-0"
                : "opacity-0 -translate-x-10"
            }`}
          >
            {/* Main image */}
            <div className="relative aspect-[4/5] rounded-3xl overflow-hidden bg-soft-stone">
              <Image
                src="/images/hero/beetroot.jpg"
                alt="Fresh beetroot handpicked from the farm"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              {/* Subtle overlay for warmth */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
            </div>

            {/* Floating accent card */}
            <div className="absolute -bottom-6 -right-4 md:right-6 bg-white rounded-2xl shadow-lg px-6 py-4 border border-warm-stone/20 max-w-[220px]">
              <p className="text-3xl font-heading text-deep-forest">100%</p>
              <p className="text-xs text-mid-gray uppercase tracking-[0.15em] mt-0.5">
                Farm-fresh purity
              </p>
            </div>

            {/* Decorative blob */}
            <div
              className="absolute -top-8 -left-8 w-32 h-32 rounded-full bg-sage-green/8 -z-10"
              aria-hidden="true"
            />
          </div>

          {/* ── Right: Content ── */}
          <div>
            {/* Section label + heading */}
            <div
              ref={headingRef}
              className={`mb-10 transition-all duration-700 ease-out ${
                headingVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-6"
              }`}
            >
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-leaf-green mb-3">
                Our Story
              </p>
              <h2 className="font-heading text-4xl lg:text-5xl text-rich-black mb-6 leading-tight">
                From Our Farm{" "}
                <span className="text-deep-forest italic">to Your Home</span>
              </h2>
              <p className="text-mid-gray text-[15px] leading-relaxed max-w-lg">
                At Organika&apos;s Food, we believe the shortest distance between
                a healthy body and nature is the field itself. We noticed that in
                the journey from farm to store, most food loses its soul — its
                nutrients, its colour, its natural vitality. So we decided to
                change that.
              </p>
            </div>

            {/* Journey steps */}
            <div className="space-y-8 mb-10">
              {JOURNEY_STEPS.map((step, i) => (
                <JourneyStep key={step.number} step={step} index={i} />
              ))}
            </div>

            {/* Bottom note */}
            <div
              className={`border-t border-warm-stone/30 pt-6 transition-all duration-700 delay-500 ${
                headingVisible ? "opacity-100" : "opacity-0"
              }`}
            >
              <p className="text-sm text-mid-gray leading-relaxed italic">
                &ldquo;Today, Organika&apos;s Food is more than a brand — it&apos;s a
                bridge connecting the honest work of the farmer to the
                health-conscious lifestyle of your family.&rdquo;
              </p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
