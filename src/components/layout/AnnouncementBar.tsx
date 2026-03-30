"use client";

import { useState, useEffect, useCallback } from "react";
import { X } from "lucide-react";
import { fetchActiveBanners, type Banner } from "@/lib/supabase-banners";

export default function AnnouncementBar() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dismissed, setDismissed] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load banners
  useEffect(() => {
    // Check if dismissed this session
    if (sessionStorage.getItem("announcement-dismissed") === "true") {
      setDismissed(true);
      setIsLoaded(true);
      return;
    }

    fetchActiveBanners().then((data) => {
      setBanners(data);
      setIsLoaded(true);
    });
  }, []);

  // Auto-rotate banners every 4 seconds
  useEffect(() => {
    if (banners.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [banners.length]);

  const handleDismiss = useCallback(() => {
    setDismissed(true);
    sessionStorage.setItem("announcement-dismissed", "true");
  }, []);

  // Don't render if dismissed, no banners, or still loading
  if (!isLoaded || dismissed || banners.length === 0) return null;

  const currentBanner = banners[currentIndex];

  return (
    <div className="bg-fresh-green text-white relative z-[60]">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-center h-8 sm:h-9">
        {/* Banner content with fade animation */}
        <div className="flex-1 text-center overflow-hidden">
          {currentBanner.link ? (
            <a
              href={currentBanner.link}
              className="text-xs sm:text-sm font-medium hover:underline transition-opacity duration-300"
            >
              {currentBanner.message}
            </a>
          ) : (
            <p className="text-xs sm:text-sm font-medium transition-opacity duration-300">
              {currentBanner.message}
            </p>
          )}
        </div>

        {/* Dismiss button */}
        <button
          onClick={handleDismiss}
          className="absolute right-2 sm:right-4 p-1 rounded hover:bg-white/20 transition-colors"
          aria-label="Dismiss announcement"
        >
          <X className="h-3.5 w-3.5" />
        </button>

        {/* Dot indicators for multiple banners */}
        {banners.length > 1 && (
          <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 flex gap-1">
            {banners.map((_, i) => (
              <span
                key={i}
                className={`w-1 h-1 rounded-full transition-colors ${
                  i === currentIndex ? "bg-white" : "bg-white/40"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
