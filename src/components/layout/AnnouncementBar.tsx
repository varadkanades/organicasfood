"use client";

import { useState, useEffect } from "react";
import { fetchActiveBanners, type Banner } from "@/lib/supabase-banners";

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

  // Build the content block: all banner messages with bullet separators
  const messageBlock = banners.map((b, i) => (
    <span key={b.id} className="inline-flex items-center gap-4">
      {i > 0 && (
        <span className="w-1 h-1 rounded-full bg-white/40 shrink-0" />
      )}
      <span>{b.message}</span>
    </span>
  ));

  // Duration scales with number of banners (more content = slower scroll)
  const duration = Math.max(banners.length * 12, 20);

  return (
    <div className="w-full overflow-hidden bg-white/10 backdrop-blur-sm border-y border-white/10">
      <div className="relative h-9 flex items-center overflow-hidden">
        {/*
          Track: holds 2 identical copies of the content.
          Animates from translateX(-100%) → translateX(0) for left-to-right motion.
          When copy 1 exits right, copy 2 seamlessly enters from left.
        */}
        <div
          className="marquee-track flex shrink-0"
          style={{
            animation: `marquee-ltr ${duration}s linear infinite`,
            width: "max-content",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.animationPlayState = "paused";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.animationPlayState = "running";
          }}
        >
          {/* Copy 1 */}
          <div className="shrink-0 whitespace-nowrap text-xs sm:text-sm font-medium text-white/80 tracking-wide px-8 inline-flex items-center gap-4">
            {messageBlock}
          </div>
          {/* Copy 2 (identical duplicate for seamless loop) */}
          <div className="shrink-0 whitespace-nowrap text-xs sm:text-sm font-medium text-white/80 tracking-wide px-8 inline-flex items-center gap-4">
            {messageBlock}
          </div>
        </div>
      </div>
    </div>
  );
}
