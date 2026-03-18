"use client";

import { useEffect, useState } from "react";
import Container from "@/components/ui/Container";

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  highlight?: string;
  description?: string;
}

export function PageHeader({
  eyebrow,
  title,
  highlight,
  description,
}: PageHeaderProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="relative pt-28 pb-20 md:pt-36 md:pb-28 overflow-hidden isolate">
      {/* ── Dark gradient background ── */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1a2e1a] via-[#243524] to-[#1a2e1a]" />

      {/* ── Subtle radial glow ── */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(74,124,60,0.25)_0%,transparent_70%)] -translate-y-1/3 translate-x-1/4" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[radial-gradient(circle,rgba(74,124,60,0.15)_0%,transparent_70%)] translate-y-1/3 -translate-x-1/4" />

      {/* ── Decorative floating botanicals ── */}
      {/* Top-right leaf cluster */}
      <svg
        className="absolute top-12 right-10 md:right-20 w-32 h-32 md:w-48 md:h-48 text-white/[0.04] rotate-12"
        viewBox="0 0 200 200"
        fill="currentColor"
      >
        <path d="M100 20c-30 20-60 50-65 90s15 60 45 70c10-40 30-70 65-95S140 30 100 20z" />
        <path d="M120 50c-20 25-35 55-30 90 30-5 55-25 70-55s5-55-15-65c-5 10-15 20-25 30z" />
      </svg>

      {/* Bottom-left small leaves */}
      <svg
        className="absolute bottom-8 left-8 md:left-16 w-20 h-20 md:w-28 md:h-28 text-white/[0.04] -rotate-45"
        viewBox="0 0 100 100"
        fill="currentColor"
      >
        <path d="M50 10C30 25 15 45 15 65s15 25 35 25c0-25 10-45 35-55C75 20 65 10 50 10z" />
      </svg>

      {/* Mid-right small circle accent */}
      <div className="absolute top-1/2 right-[15%] w-2 h-2 rounded-full bg-white/[0.06]" />
      <div className="absolute top-[30%] right-[25%] w-1.5 h-1.5 rounded-full bg-white/[0.04]" />
      <div className="absolute bottom-[25%] left-[20%] w-1 h-1 rounded-full bg-white/[0.05]" />

      {/* ── Grain/noise texture overlay ── */}
      <div
        className="absolute inset-0 opacity-[0.03] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* ── Horizontal decorative line ── */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* ── Content ── */}
      <Container>
        <div className="relative z-10 max-w-2xl">
          {/* Animated entry */}
          <div
            className={`transition-all duration-700 ease-out ${
              visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
          >
            {eyebrow && (
              <div className="flex items-center gap-3 mb-5">
                {/* Small decorative bar */}
                <span className="block w-8 h-px bg-[#7cb368]" />
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#7cb368]">
                  {eyebrow}
                </p>
              </div>
            )}

            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl text-white leading-[1.1] mb-5">
              {title}
              {highlight && (
                <>
                  {" "}
                  <span className="italic text-[#7cb368]">{highlight}</span>
                </>
              )}
            </h1>

            {description && (
              <p
                className={`text-white/60 text-lg md:text-xl leading-relaxed max-w-xl transition-all duration-700 delay-200 ease-out ${
                  visible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-4"
                }`}
              >
                {description}
              </p>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
