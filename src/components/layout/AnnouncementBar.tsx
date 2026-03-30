"use client";

import { useState, useEffect } from "react";
import { fetchActiveBanners, type Banner } from "@/lib/supabase-banners";

/**
 * Rolling marquee banner — designed to be placed inside the HeroSection.
 * Fetches active banners from Supabase and displays them as a continuously
 * scrolling marquee with a frosted-glass look.
 */
export default function AnnouncementBar() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    fetchActiveBanners().then((data) => {
      setBanners(data);
      setIsLoaded(true);
    });
  }, []);

  if (!isLoaded || banners.length === 0) return null;

  // Build the marquee text — join all banner messages with a separator
  const marqueeText = banners.map((b) => b.message).join("   ✦   ");
  // Duplicate for seamless loop
  const fullText = `${marqueeText}   ✦   ${marqueeText}   ✦   `;

  return (
    <div className="w-full overflow-hidden bg-white/10 backdrop-blur-sm border-y border-white/10">
      <div className="relative h-9 flex items-center">
        <div
          className="whitespace-nowrap animate-marquee"
          style={{
            animationDuration: `${Math.max(banners.length * 12, 20)}s`,
          }}
        >
          <span className="text-xs sm:text-sm font-medium text-white/80 tracking-wide">
            {fullText}
          </span>
        </div>
      </div>

      {/* Marquee animation via inline style tag */}
      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-marquee {
          animation: marquee linear infinite;
        }
      `}</style>
    </div>
  );
}
