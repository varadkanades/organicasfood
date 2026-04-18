"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, ArrowLeft, Loader2, CheckCircle } from "lucide-react";
import Button from "@/components/ui/Button";
import { supabase } from "@/lib/supabase";

// ── Leaf decoration SVG ──────────────────────────────────────────────────────
function LeafDecoration({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M60 10C60 10 90 30 90 60C90 90 60 110 60 110C60 110 30 90 30 60C30 30 60 10 60 10Z"
        fill="currentColor"
        opacity="0.06"
      />
      <path
        d="M60 20C60 20 80 35 80 60C80 85 60 100 60 100"
        stroke="currentColor"
        opacity="0.1"
        strokeWidth="1"
        fill="none"
      />
    </svg>
  );
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isEmailSent, setIsEmailSent] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Email is required");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter a valid email address");
      return;
    }

    setIsLoading(true);
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email,
        {
          redirectTo: `${window.location.origin}/auth/callback?next=/auth/reset-password`,
        }
      );
      if (resetError) throw resetError;
      setIsEmailSent(true);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-warm-cream flex">
      {/* ── Left panel — Branding (hidden on mobile) ── */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-[48%] relative overflow-hidden bg-deep-forest">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-[0.04]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
              backgroundSize: "32px 32px",
            }}
          />
        </div>

        {/* Leaf decorations */}
        <LeafDecoration className="absolute -top-6 -right-6 w-48 h-48 text-white rotate-12" />
        <LeafDecoration className="absolute -bottom-10 -left-10 w-64 h-64 text-white -rotate-45" />
        <LeafDecoration className="absolute top-1/3 right-12 w-32 h-32 text-white rotate-[60deg]" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 xl:p-16 w-full">
          {/* Top — Logo */}
          <div>
            <Link href="/" className="inline-flex items-center gap-3 group">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 group-hover:bg-white/15 transition-colors">
                <svg
                  className="h-5 w-5 text-sage-green"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8z" />
                </svg>
              </span>
              <div>
                <span className="font-heading text-2xl text-white">
                  Organikas Foods
                </span>
                <span className="block text-[10px] font-medium tracking-[0.25em] uppercase text-white/40">
                  100% Natural
                </span>
              </div>
            </Link>
          </div>

          {/* Center — Tagline */}
          <div className="max-w-md">
            <h1 className="font-heading text-4xl xl:text-5xl text-white leading-[1.15] mb-6">
              Don&apos;t worry,{" "}
              <span className="italic text-sage-green">we&apos;ve got you.</span>
            </h1>
            <p className="text-white/50 text-base leading-relaxed">
              Reset your password and get back to exploring our range of
              pure, natural dehydrated vegetable powders.
            </p>
          </div>

          {/* Bottom — Footer text */}
          <p className="text-white/25 text-xs">
            © 2026 Organikas Foods. India.
          </p>
        </div>
      </div>

      {/* ── Right panel — Form ── */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top bar — Back to login */}
        <div className="p-5 sm:p-6 lg:p-8">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm text-mid-gray hover:text-rich-black transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
            Back to Sign In
          </Link>
        </div>

        {/* Form area — centered */}
        <div className="flex-1 flex items-center justify-center px-5 sm:px-8 pb-12">
          <div className="w-full max-w-[420px]">
            {/* Mobile logo (hidden on desktop) */}
            <div className="lg:hidden mb-8 text-center">
              <Link href="/" className="inline-flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-fresh-green/10">
                  <svg
                    className="h-4 w-4 text-fresh-green"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8z" />
                  </svg>
                </span>
                <span className="font-heading text-xl text-deep-forest">
                  Organikas Foods
                </span>
              </Link>
            </div>

            <AnimatePresence mode="wait">
              {isEmailSent ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center"
                >
                  <div className="mx-auto w-16 h-16 rounded-full bg-fresh-green/10 flex items-center justify-center mb-6">
                    <CheckCircle className="h-8 w-8 text-fresh-green" />
                  </div>
                  <h2 className="font-heading text-3xl sm:text-[2rem] text-rich-black mb-3">
                    Check your email
                  </h2>
                  <p className="text-mid-gray text-[15px] leading-relaxed mb-8">
                    We&apos;ve sent a password reset link to{" "}
                    <span className="font-medium text-rich-black">{email}</span>.
                    Click the link in the email to reset your password.
                  </p>
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-2 text-sm font-medium text-fresh-green hover:text-deep-forest transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Sign In
                  </Link>
                </motion.div>
              ) : (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {/* Heading */}
                  <div className="mb-8">
                    <h2 className="font-heading text-3xl sm:text-[2rem] text-rich-black mb-2">
                      Forgot password?
                    </h2>
                    <p className="text-mid-gray text-[15px]">
                      Enter your email address and we&apos;ll send you a link to reset your
                      password.
                    </p>
                  </div>

                  {/* Error */}
                  <AnimatePresence mode="wait">
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="mb-6 flex items-start gap-3 p-3.5 rounded-xl bg-red-50 border border-red-100"
                      >
                        <div className="w-1.5 h-1.5 mt-1.5 rounded-full bg-red-500 shrink-0" />
                        <p className="text-sm text-red-700 leading-snug">{error}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                    {/* Email field */}
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-xs font-semibold text-rich-black/70 uppercase tracking-wider mb-2"
                      >
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-mid-gray/50" />
                        <input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            if (error) setError("");
                          }}
                          placeholder="you@example.com"
                          className="w-full h-12 pl-11 pr-4 rounded-xl bg-white border-2 text-sm text-rich-black placeholder:text-mid-gray/40 transition-all duration-200 outline-none border-soft-stone/80 focus:border-fresh-green/50 hover:border-sage-green/40"
                        />
                      </div>
                    </div>

                    {/* Submit button */}
                    <div className="pt-2">
                      <Button
                        type="submit"
                        fullWidth
                        size="lg"
                        disabled={isLoading}
                        className="h-12 rounded-xl text-[15px]"
                      >
                        {isLoading ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          "Send Reset Link"
                        )}
                      </Button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
