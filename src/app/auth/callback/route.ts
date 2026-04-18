// src/app/auth/callback/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Check if there's a next URL (e.g., password reset redirect)
      const next = searchParams.get("next");
      if (next) {
        return NextResponse.redirect(`${origin}${next}`);
      }

      // Safe redirect (e.g. /checkout) — must be relative path, not protocol-relative
      const rawRedirect = searchParams.get("redirect");
      const safeRedirect =
        rawRedirect && rawRedirect.startsWith("/") && !rawRedirect.startsWith("//")
          ? rawRedirect
          : null;

      // Get user to check role
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // Check profile for role
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        if (profile?.role === "admin") {
          return NextResponse.redirect(`${origin}/admin`);
        }
      }

      return NextResponse.redirect(`${origin}${safeRedirect || "/"}`);
    }
  }

  // If something went wrong, redirect to login with error
  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}