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

  // Join all banner messages with spacing — admin controls the text
  const marqueeText = banners.map((b) => b.message).join("          ");

  return (
    <div className="w-full overflow-hidden bg-white/10 backdrop-blur-sm border-y border-white/10">
      <div className="relative h-9 flex items-center overflow-hidden">
        {/* Two identical spans side by side for seamless infinite loop */}
        <div
          className="flex shrink-0"
          style={{
            animation: `scroll ${Math.max(banners.length * 15, 25)}s linear infinite`,
          }}
        >
          <span className="shrink-0 whitespace-nowrap text-xs sm:text-sm font-medium text-white/80 tracking-wide px-8">
            {marqueeText}
          </span>
          <span className="shrink-0 whitespace-nowrap text-xs sm:text-sm font-medium text-white/80 tracking-wide px-8">
            {marqueeText}
          </span>
          <span className="shrink-0 whitespace-nowrap text-xs sm:text-sm font-medium text-white/80 tracking-wide px-8">
            {marqueeText}
          </span>
          <span className="shrink-0 whitespace-nowrap text-xs sm:text-sm font-medium text-white/80 tracking-wide px-8">
            {marqueeText}
          </span>
        </div>
      </div>
    </div>
  );
}
