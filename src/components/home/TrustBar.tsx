"use client";

import { useRef, useEffect, useState } from "react";

interface TrustItem {
  icon: string;
  title: string;
  subtitle: string;
}

const TRUST_ITEMS: TrustItem[] = [
  {
    icon: "🏛️",
    title: "FSSAI Certified",
    subtitle: "Govt. approved food safety standards",
  },
  {
    icon: "🌿",
    title: "100% Natural",
    subtitle: "Zero preservatives, zero additives",
  },
  {
    icon: "🧪",
    title: "No Artificial Colours",
    subtitle: "Pure colour from real vegetables",
  },
  {
    icon: "💬",
    title: "WhatsApp Support",
    subtitle: "Chat with us anytime, instantly",
  },
  {
    icon: "🏡",
    title: "Small Batch Made",
    subtitle: "Crafted fresh, not factory-produced",
  },
];

function TrustCard({ item, index }: { item: TrustItem; index: number }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setVisible(true), index * 80);
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
      className={`flex-shrink-0 flex items-center gap-4 px-6 py-5 bg-white rounded-2xl border border-warm-stone/20 shadow-sm min-w-[220px] lg:min-w-0 transition-all duration-500 hover:shadow-md hover:-translate-y-0.5 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
      }`}
    >
      <span className="text-3xl flex-shrink-0">{item.icon}</span>
      <div>
        <p className="text-sm font-semibold text-rich-black">{item.title}</p>
        <p className="text-xs text-mid-gray mt-0.5 leading-snug">{item.subtitle}</p>
      </div>
    </div>
  );
}

export function TrustBar() {
  return (
    <section className="py-10 bg-warm-cream border-y border-warm-stone/15 overflow-hidden">
      {/* Mobile: horizontal scroll. Desktop: flex row */}
      <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex gap-4 overflow-x-auto pb-2 lg:overflow-visible lg:grid lg:grid-cols-5 lg:gap-4 scrollbar-hide">
          {TRUST_ITEMS.map((item, i) => (
            <TrustCard key={item.title} item={item} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
