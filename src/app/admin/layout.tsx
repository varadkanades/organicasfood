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

  useEffect(() => {
    // Wait for auth to load
    if (isLoading) return;

    // Not logged in → redirect to login
    if (!user) {
      router.replace("/login");
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
