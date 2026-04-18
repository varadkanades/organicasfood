"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, role, isLoading } = useAuth();
  const router = useRouter();

  // Force the browser to revalidate admin pages on each visit so a stale
  // cached HTML never gets served after the role/session changes.
  useEffect(() => {
    const meta = document.createElement("meta");
    meta.httpEquiv = "Cache-Control";
    meta.content = "no-store, no-cache, must-revalidate";
    document.head.appendChild(meta);
    return () => {
      document.head.removeChild(meta);
    };
  }, []);

  useEffect(() => {
    // Wait for auth to load
    if (isLoading) return;

    // Not logged in → redirect to login (preserve return path)
    if (!user) {
      router.replace("/login?redirect=/admin");
      return;
    }

    // Not admin → redirect to homepage
    if (role !== "admin") {
      router.replace("/");
      return;
    }
  }, [user, role, isLoading, router]);

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-warm-cream pt-18">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-fresh-green border-t-transparent animate-spin" />
          <p className="text-sm text-mid-gray">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authorized — show nothing while redirecting
  if (!user || role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-warm-cream pt-18">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-fresh-green border-t-transparent animate-spin" />
          <p className="text-sm text-mid-gray">Redirecting...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
