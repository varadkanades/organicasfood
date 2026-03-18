"use client";

import { useRef, useEffect, useState } from "react";
import Container from "@/components/ui/Container";

// ── Testimonial data ──────────────────────────────────────────────────────────
// Replace with real testimonials as they come in.
const TESTIMONIALS = [
  {
    quote:
      "I was sceptical at first — how can a powder taste fresh? One spoonful of the Coriander Leaf Powder in my dal and I was sold. The aroma is exactly like fresh coriander from the market.",
    name: "Priya Deshmukh",
    location: "Pune",
    product: "Coriander Leaf Powder",
    initials: "PD",
  },
  {
    quote:
      "My daughter refuses to eat beetroot, but she doesn't even notice when I mix Organika's Beetroot Powder into her paratha dough. It's become my secret weapon — nutrition without the daily battle.",
    name: "Snehal Patil",
    location: "Sangli",
    product: "Beetroot Powder",
    initials: "SP",
  },
  {
    quote:
      "As a working mother, I don't always have time to chop fresh vegetables. These powders save me time without compromising on nutrition. The Carrot Powder in my son's kheer? He loves it.",
    name: "Anjali Kulkarni",
    location: "Kolhapur",
    product: "Carrot Powder",
    initials: "AK",
  },
  {
    quote:
      "I use the Curry Leaves Powder daily in my chutney and sambhar. The flavour is strong and authentic — better than the dried curry leaves I used to get from stores. And it lasts so much longer.",
    name: "Revati Joshi",
    location: "Pune",
    product: "Curry Leaves Powder",
    initials: "RJ",
  },
];

// ── Star rating component ────────────────────────────────────────────────────
function StarRating() {
  return (
    <div className="flex gap-0.5">
      {[...Array(5)].map((_, i) => (
        <svg
          key={i}
          className="w-4 h-4 text-earthy-brown"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

// ── Individual testimonial card ──────────────────────────────────────────────
function TestimonialCard({
  testimonial,
  index,
}: {
  testimonial: (typeof TESTIMONIALS)[0];
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
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [index]);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
    >
      <div className="bg-white rounded-2xl p-8 border border-warm-stone/15 h-full flex flex-col transition-all duration-500 hover:shadow-md hover:-translate-y-0.5">
        {/* Stars */}
        <StarRating />

        {/* Quote */}
        <blockquote className="mt-5 mb-8 flex-1">
          <p className="text-rich-black text-[15px] leading-relaxed">
            &ldquo;{testimonial.quote}&rdquo;
          </p>
        </blockquote>

        {/* Author */}
        <div className="flex items-center gap-3 pt-5 border-t border-warm-stone/20">
          {/* Avatar with initials */}
          <div className="w-10 h-10 rounded-full bg-sage-green/15 flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-semibold text-deep-forest">
              {testimonial.initials}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-rich-black truncate">
              {testimonial.name}
            </p>
            <p className="text-xs text-mid-gray">
              {testimonial.location} ·{" "}
              <span className="text-leaf-green">{testimonial.product}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Testimonials Section ────────────────────────────────────────────────
export function Testimonials() {
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
    <section className="py-24 md:py-32 bg-warm-cream">
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
            Real Families, Real Results
          </p>
          <h2 className="font-heading text-4xl lg:text-5xl text-rich-black mb-5">
            What Our{" "}
            <span className="text-deep-forest italic">Customers Say</span>
          </h2>
          <p className="text-mid-gray max-w-xl mx-auto leading-relaxed">
            Don&apos;t take our word for it — hear from families across
            Maharashtra who&apos;ve made Organika&apos;s powders a part of their
            daily kitchen.
          </p>
        </div>

        {/* Testimonials grid — 2 columns on desktop, 1 on mobile */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {TESTIMONIALS.map((testimonial, i) => (
            <TestimonialCard
              key={testimonial.name}
              testimonial={testimonial}
              index={i}
            />
          ))}
        </div>

        {/* WhatsApp CTA */}
        <div
          className={`text-center mt-14 transition-all duration-700 delay-500 ${
            headingVisible ? "opacity-100" : "opacity-0"
          }`}
        >
          <p className="text-sm text-mid-gray mb-3">
            Loved our products? We&apos;d love to hear from you too.
          </p>
          <a
            href="https://wa.me/919XXXXXXXXX?text=Hi%20Organika!%20I%20want%20to%20share%20my%20experience."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-deep-forest font-medium text-sm hover:text-fresh-green transition-colors duration-300"
          >
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
            </svg>
            Share your story on WhatsApp
            <span aria-hidden="true">→</span>
          </a>
        </div>
      </Container>
    </section>
  );
}
