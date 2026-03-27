"use client";

import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import { PageHeader } from "@/components/shared/PageHeader";
import {
  WHATSAPP_NUMBER,
  CONTACT_EMAIL,
  CONTACT_PHONE,
  SITE_NAME,
} from "@/lib/constants";
import { getWhatsAppUrl } from "@/lib/utils";

// ── Contact methods ──────────────────────────────────────────────────────────
const CONTACT_METHODS = [
  {
    title: "WhatsApp",
    subtitle: "Fastest way to reach us",
    detail: "Chat with us anytime",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
      </svg>
    ),
    href: getWhatsAppUrl(
      WHATSAPP_NUMBER,
      "Hi! I have a question about Organika's Food products."
    ),
    accent: "bg-[#25D366]/10 text-[#25D366]",
    isExternal: true,
  },
  {
    title: "Email",
    subtitle: "For detailed queries",
    detail: CONTACT_EMAIL,
    icon: (
      <svg
        className="w-6 h-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect width="20" height="16" x="2" y="4" rx="2" />
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
      </svg>
    ),
    href: `mailto:${CONTACT_EMAIL}`,
    accent: "bg-earthy-brown/10 text-earthy-brown",
    isExternal: false,
  },
  {
    title: "Phone",
    subtitle: "Mon–Sat, 9 AM – 7 PM",
    detail: CONTACT_PHONE,
    icon: (
      <svg
        className="w-6 h-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
      </svg>
    ),
    href: `tel:${CONTACT_PHONE.replace(/\s/g, "")}`,
    accent: "bg-deep-forest/10 text-deep-forest",
    isExternal: false,
  },
];

// ── FAQ data ─────────────────────────────────────────────────────────────────
const FAQS = [
  {
    question: "Where do you deliver?",
    answer: "We ship Pan-India and Internationally. For bulk or international orders, please reach out on WhatsApp.",
  },
  {
    question: "How do I place an order?",
    answer:
      "The easiest way is through WhatsApp — just message us with the product name and quantity, and we'll confirm your order within minutes. You can also browse our shop and add items to your cart.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept UPI, bank transfer, and cash on delivery (within select areas). Online payments through Razorpay are coming soon.",
  },
  {
    question: "How long does delivery take?",
    answer:
      "Delivery typically takes 3–7 business days across India. We'll share tracking details on WhatsApp once your order is shipped.",
  },
  {
    question: "What's the shelf life of your powders?",
    answer:
      "All our powders have a shelf life of 12 months from the date of packaging. Store in a cool, dry place and keep the container tightly sealed after each use.",
  },
  {
    question: "Are your products safe for children?",
    answer:
      "Absolutely. Our powders are 100% natural with zero preservatives or additives. They're safe for the whole family, including children. The Carrot Powder is particularly popular as a baby food supplement.",
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

// ── FAQ Accordion Item ───────────────────────────────────────────────────────
function FAQItem({
  question,
  answer,
  index,
}: {
  question: string;
  answer: string;
  index: number;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <AnimatedSection delay={index * 80}>
      <div className="border-b border-warm-stone/20">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between py-5 text-left group"
        >
          <span className="font-medium text-rich-black text-[15px] pr-8 group-hover:text-deep-forest transition-colors">
            {question}
          </span>
          <span
            className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 ${
              isOpen
                ? "bg-deep-forest text-white rotate-45"
                : "bg-soft-stone/50 text-mid-gray"
            }`}
          >
            <svg
              className="w-3.5 h-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
          </span>
        </button>

        <div
          className={`overflow-hidden transition-all duration-300 ${
            isOpen ? "max-h-60 pb-5" : "max-h-0"
          }`}
        >
          <p className="text-mid-gray text-[15px] leading-relaxed pr-12">
            {answer}
          </p>
        </div>
      </div>
    </AnimatedSection>
  );
}

// ── Main Contact Page ────────────────────────────────────────────────────────
export default function ContactPage() {
  return (
    <>
      <PageHeader
        eyebrow="Get in Touch"
        title="We're Here"
        highlight="to Help"
        description="Have a question, want to place a bulk order, or just want to say hello? We'd love to hear from you."
      />

      {/* ── Contact Methods ── */}
      <section className="py-16 md:py-20 bg-warm-cream">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {CONTACT_METHODS.map((method, i) => (
              <AnimatedSection key={method.title} delay={i * 100}>
                <a
                  href={method.href}
                  target={method.isExternal ? "_blank" : undefined}
                  rel={method.isExternal ? "noopener noreferrer" : undefined}
                  className="group block bg-white rounded-2xl p-8 border border-warm-stone/15 h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-sage-green/25"
                >
                  {/* Icon */}
                  <div
                    className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-5 ${method.accent} transition-transform duration-300 group-hover:scale-110`}
                  >
                    {method.icon}
                  </div>

                  <h3 className="font-heading text-xl text-rich-black mb-1">
                    {method.title}
                  </h3>
                  <p className="text-sm text-mid-gray mb-3">
                    {method.subtitle}
                  </p>
                  <p className="text-sm font-medium text-deep-forest">
                    {method.detail}
                  </p>
                </a>
              </AnimatedSection>
            ))}
          </div>
        </Container>
      </section>

      {/* ── FAQ Section ── */}
      <section className="py-16 md:py-24 bg-soft-stone/30 border-t border-warm-stone/15">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16">
            {/* Left: heading */}
            <div className="lg:col-span-2">
              <AnimatedSection>
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-leaf-green mb-3">
                  Common Questions
                </p>
                <h2 className="font-heading text-3xl md:text-4xl text-rich-black mb-4">
                  Frequently{" "}
                  <span className="text-deep-forest italic">Asked</span>
                </h2>
                <p className="text-mid-gray leading-relaxed mb-6">
                  Can&apos;t find what you&apos;re looking for? Message us
                  directly on WhatsApp and we&apos;ll get back to you right
                  away.
                </p>
                <a
                  href={getWhatsAppUrl(
                    WHATSAPP_NUMBER,
                    "Hi! I have a question."
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" size="sm">
                    Ask on WhatsApp →
                  </Button>
                </a>
              </AnimatedSection>
            </div>

            {/* Right: accordion */}
            <div className="lg:col-span-3">
              <div>
                {FAQS.map((faq, i) => (
                  <FAQItem
                    key={i}
                    question={faq.question}
                    answer={faq.answer}
                    index={i}
                  />
                ))}
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ── Delivery Regions ── */}
      <section className="py-16 md:py-20 bg-warm-cream border-t border-warm-stone/15">
        <Container>
          <AnimatedSection>
            <div className="text-center mb-10">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-leaf-green mb-3">
                We Deliver To
              </p>
              <h2 className="font-heading text-3xl text-rich-black">
                Our Delivery{" "}
                <span className="text-deep-forest italic">Regions</span>
              </h2>
            </div>
          </AnimatedSection>

          <div className="flex flex-wrap items-center justify-center gap-4 mb-10">
            {["Pan-India", "International"].map((region, i) => (
              <AnimatedSection key={region} delay={i * 100}>
                <div className="bg-white rounded-2xl px-8 py-6 border border-warm-stone/15 shadow-sm text-center min-w-[160px] transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
                  <p className="font-heading text-2xl text-deep-forest mb-1">
                    {region}
                  </p>
                  <p className="text-xs text-mid-gray">Shipping Available</p>
                </div>
              </AnimatedSection>
            ))}
          </div>

          <AnimatedSection>
            <p className="text-center text-sm text-mid-gray">
              Have questions about shipping?{" "}
              <a
                href={getWhatsAppUrl(
                  WHATSAPP_NUMBER,
                  "Hi! I have a question about shipping."
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="text-deep-forest font-medium hover:text-fresh-green transition-colors"
              >
                Ask us on WhatsApp →
              </a>
            </p>
          </AnimatedSection>
        </Container>
      </section>

      {/* ── Business Hours ── */}
      <section className="py-16 md:py-20 bg-deep-forest">
        <Container>
          <AnimatedSection>
            <div className="text-center max-w-lg mx-auto">
              <h2 className="font-heading text-3xl text-white mb-4">
                Business Hours
              </h2>
              <div className="space-y-2 text-white/70 text-[15px] mb-8">
                <p>
                  <span className="text-white font-medium">
                    Monday – Saturday:
                  </span>{" "}
                  9:00 AM – 7:00 PM
                </p>
                <p>
                  <span className="text-white font-medium">Sunday:</span>{" "}
                  Closed (WhatsApp messages answered next day)
                </p>
              </div>
              <p className="text-white/50 text-sm">
                {SITE_NAME} · Maharashtra, India
              </p>
            </div>
          </AnimatedSection>
        </Container>
      </section>
    </>
  );
}
