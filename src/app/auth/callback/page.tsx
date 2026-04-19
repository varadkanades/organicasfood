"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

function CallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handle = async () => {
      const rawRedirect = searchParams.get("redirect");
      const safeRedirect =
        rawRedirect && rawRedirect.startsWith("/") && !rawRedirect.startsWith("//")
          ? rawRedirect
          : null;

      const code = searchParams.get("code");
      const hash = typeof window !== "undefined" ? window.location.hash : "";

      try {
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
        } else if (hash.includes("access_token")) {
          // Implicit flow — Supabase auto-detects hash via detectSessionInUrl.
          // Wait briefly for the session to be set.
          await new Promise((r) => setTimeout(r, 200));
        }

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.replace("/login?error=auth_failed");
          return;
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        if (profile?.role === "admin") {
          router.replace("/admin");
        } else {
          router.replace(safeRedirect || "/");
        }
      } catch {
        router.replace("/login?error=auth_failed");
      }
    };

    handle();
  }, [router, searchParams]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-warm-cream">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 rounded-full border-2 border-fresh-green border-t-transparent animate-spin" />
        <p className="text-sm text-mid-gray">Signing you in...</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={null}>
      <CallbackInner />
    </Suspense>
  );
}
