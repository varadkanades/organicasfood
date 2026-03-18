import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Organika's Food — Earthy Green Palette (Primary)
        "deep-forest": "#2D5016",
        "sage-green": "#7A9B6D",
        "fresh-green": "#4A7C2E",
        "warm-cream": "#FAF6F0",
        "earthy-brown": "#8B6914",
        "soft-stone": "#E8E4DE",
        "rich-black": "#1A1A1A",
        "mid-gray": "#666666",

        // Extended palette — used by HeroSection, TrustBar, ProductCard
        "leaf-green": "#3D6B2E",
        "sage-mist": "#B8C9AE",
        "warm-stone": "#D4CFC7",
      },
      fontFamily: {
        heading: ["var(--font-dm-serif)", "Georgia", "serif"],
        body: ["var(--font-dm-sans)", "system-ui", "sans-serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.6s ease-out forwards",
        "slide-up": "slideUp 0.6s ease-out forwards",
        "slide-down": "slideDown 0.3s ease-out forwards",
        "slide-in-right": "slideInRight 0.35s ease-out forwards",
        "scale-in": "scaleIn 0.3s ease-out forwards",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideDown: {
          "0%": { opacity: "0", transform: "translateY(-12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideInRight: {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
      transitionTimingFunction: {
        organic: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
