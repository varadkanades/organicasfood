"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import AnnouncementBar from "@/components/layout/AnnouncementBar";

// ── Hero slide data ───────────────────────────────────────────────────────────
// Each slide maps to one of Organika's products.
// To add/remove/reorder slides, just edit this array.
const HERO_SLIDES = [
  {
    src: "/images/hero/beetroot.jpg",
    alt: "Fresh beetroot — rich in antioxidants",
    label: "Beetroot Powder",
  },
  {
    src: "/images/hero/carrot.jpg",
    alt: "Farm-fresh carrots — packed with beta-carotene",
    label: "Carrot Powder",
  },
  {
    src: "/images/hero/currylandscape.jpg",
    alt: "Curry leaves — bold traditional flavour",
    label: "Curry Leaves Powder",
  },
  {
    src: "/images/hero/cardamom.jpg",
    alt: "Green cardamom — aromatic spice",
    label: "Coriander Leaf Powder",
  },
] as const;

// ── Duration config (ms) ─────────────────────────────────────────────────────
const SLIDE_DURATION = 7000; // How long each image stays
const FADE_DURATION = 1.2; // Crossfade transition (seconds)
const KEN_BURNS_SCALE = 1.08; // Subtle zoom amount (1.0 = none)

// ── Floating Particles Component ─────────────────────────────────────────────
// Creates subtle floating powder/dust effect over the hero
function FloatingParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);

  interface Particle {
    x: number;
    y: number;
    size: number;
    speedX: number;
    speedY: number;
    opacity: number;
    fadeSpeed: number;
  }

  const createParticle = useCallback((width: number, height: number): Particle => {
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2.5 + 0.5,
      speedX: (Math.random() - 0.5) * 0.3,
      speedY: -(Math.random() * 0.4 + 0.1), // Drift upward
      opacity: Math.random() * 0.5 + 0.1,
      fadeSpeed: Math.random() * 0.003 + 0.001,
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Initialize particles
    const count = Math.min(Math.floor((canvas.width * canvas.height) / 15000), 60);
    particlesRef.current = Array.from({ length: count }, () =>
      createParticle(canvas.width, canvas.height)
    );

    const animate = () => {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current.forEach((p) => {
        // Move
        p.x += p.speedX;
        p.y += p.speedY;

        // Fade in/out cycle
        p.opacity += p.fadeSpeed;
        if (p.opacity >= 0.6 || p.opacity <= 0.05) {
          p.fadeSpeed = -p.fadeSpeed;
        }

        // Reset if off-screen
        if (p.y < -10 || p.x < -10 || p.x > canvas.width + 10) {
          p.x = Math.random() * canvas.width;
          p.y = canvas.height + 10;
          p.opacity = 0.05;
        }

        // Draw
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
        ctx.fill();
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [createParticle]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full z-[2] pointer-events-none"
      aria-hidden="true"
    />
  );
}

// ── Scroll indicator ─────────────────────────────────────────────────────────
function ScrollIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 2, duration: 1 }}
      className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
    >
      <span className="text-[10px] uppercase tracking-[0.25em] text-white/50 font-medium">
        Scroll
      </span>
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="w-px h-8 bg-gradient-to-b from-white/40 to-transparent"
      />
    </motion.div>
  );
}

// ── Slide progress dots ──────────────────────────────────────────────────────
function SlideIndicators({
  total,
  current,
  onSelect,
}: {
  total: number;
  current: number;
  onSelect: (i: number) => void;
}) {
  return (
    <div className="absolute bottom-8 right-8 z-10 flex items-center gap-2.5 max-md:hidden">
      {Array.from({ length: total }).map((_, i) => (
        <button
          key={i}
          onClick={() => onSelect(i)}
          aria-label={`Go to slide ${i + 1}`}
          className="group relative flex items-center justify-center w-8 h-8"
        >
          <span
            className={`block rounded-full transition-all duration-500 ${
              i === current
                ? "w-2.5 h-2.5 bg-white"
                : "w-1.5 h-1.5 bg-white/40 group-hover:bg-white/70"
            }`}
          />
          {/* Active ring */}
          {i === current && (
            <motion.span
              layoutId="activeSlide"
              className="absolute inset-0 rounded-full border border-white/30"
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            />
          )}
        </button>
      ))}
    </div>
  );
}

// ── Stat pill ────────────────────────────────────────────────────────────────
function StatPill({
  number,
  label,
  delay,
}: {
  number: string;
  label: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.6, ease: "easeOut" }}
    >
      <p className="text-3xl font-heading text-white">{number}</p>
      <p className="text-[11px] text-white/50 uppercase tracking-[0.15em] mt-0.5">
        {label}
      </p>
    </motion.div>
  );
}

// ── Main Hero Section ────────────────────────────────────────────────────────
export function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [mounted, setMounted] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Start auto-play
  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, SLIDE_DURATION);
  }, []);

  useEffect(() => {
    setMounted(true);
    startTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startTimer]);

  const goToSlide = useCallback(
    (index: number) => {
      setCurrentSlide(index);
      startTimer(); // Reset timer on manual navigation
    },
    [startTimer]
  );

  return (
    <section className="relative h-screen min-h-[600px] max-h-[1000px] w-full overflow-hidden">
      {/* ── Background image slideshow ── */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="sync">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, scale: KEN_BURNS_SCALE }}
            exit={{ opacity: 0 }}
            transition={{
              opacity: { duration: FADE_DURATION, ease: "easeInOut" },
              scale: {
                duration: SLIDE_DURATION / 1000 + FADE_DURATION,
                ease: "linear",
              },
            }}
            className="absolute inset-0"
          >
            <Image
              src={HERO_SLIDES[currentSlide].src}
              alt={HERO_SLIDES[currentSlide].alt}
              fill
              priority={currentSlide === 0}
              className="object-cover"
              sizes="100vw"
              quality={85}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Dark gradient overlay for text readability ── */}
      <div
        className="absolute inset-0 z-[1]"
        aria-hidden="true"
        style={{
          background: `
            linear-gradient(
              to right,
              rgba(0, 0, 0, 0.65) 0%,
              rgba(0, 0, 0, 0.45) 40%,
              rgba(0, 0, 0, 0.2) 70%,
              rgba(0, 0, 0, 0.15) 100%
            ),
            linear-gradient(
              to top,
              rgba(0, 0, 0, 0.5) 0%,
              rgba(0, 0, 0, 0.0) 40%
            )
          `,
        }}
      />

      {/* ── Floating particles ── */}
      <FloatingParticles />

      {/* ── Rolling announcement banner ── */}
      <div className="absolute top-16 sm:top-18 left-0 right-0 z-20">
        <AnnouncementBar />
      </div>

      {/* ── Content ── */}
      <Container className="relative z-10 h-full flex flex-col justify-center">
        <div className="max-w-2xl">
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={mounted ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="inline-flex items-center gap-2.5 bg-white/10 backdrop-blur-sm border border-white/15 rounded-full px-4 py-2 mb-8"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-fresh-green animate-pulse" />
            <span className="text-xs font-medium text-white/80 tracking-[0.15em] uppercase">
              FSSAI Certified · Lic. 21525043002244 · 100% Natural
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={mounted ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.5, duration: 0.7, ease: "easeOut" }}
            className="font-heading text-5xl md:text-6xl lg:text-7xl xl:text-[5.25rem] leading-[1.05] text-white mb-6"
          >
            Nature&apos;s Best,{" "}
            <span className="italic text-sage-green">Powdered</span> Fresh.
          </motion.h1>

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={mounted ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.7, duration: 0.7 }}
            className="text-lg md:text-xl text-white/70 leading-relaxed max-w-lg mb-10"
          >
            Pure dehydrated vegetable powders with zero preservatives, zero
            additives. Straight from nature to your kitchen — nutrition that
            doesn&apos;t compromise.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={mounted ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.9, duration: 0.7 }}
            className="flex flex-wrap items-center gap-4 mb-14"
          >
            <Link href="/shop">
              <Button
                size="lg"
                className="bg-fresh-green text-white hover:bg-deep-forest shadow-lg shadow-black/20 border-0"
              >
                Shop Now
              </Button>
            </Link>
            <Link href="/about">
              <Button
                variant="outline"
                size="lg"
                className="border-white/30 text-white hover:bg-white/10 hover:border-white/50"
              >
                Our Story →
              </Button>
            </Link>
          </motion.div>

          {/* Stats row */}
          <div className="flex items-center gap-8 md:gap-10">
            <StatPill number="4+" label="Products" delay={1.1} />
            <div className="w-px h-10 bg-white/20" />
            <StatPill number="0" label="Preservatives" delay={1.2} />
            <div className="w-px h-10 bg-white/20" />
            <StatPill number="100%" label="Natural" delay={1.3} />
          </div>
        </div>
      </Container>

      {/* ── Slide indicators ── */}
      <SlideIndicators
        total={HERO_SLIDES.length}
        current={currentSlide}
        onSelect={goToSlide}
      />

      {/* ── Scroll indicator ── */}
      <ScrollIndicator />

      {/* ── Bottom gradient fade to next section ── */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32 z-[3] pointer-events-none"
        style={{
          background:
            "linear-gradient(to top, var(--color-warm-cream) 0%, transparent 100%)",
        }}
      />
    </section>
  );
}
