"use client";

import { useState, useEffect, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Eye, EyeOff, ArrowLeft, Loader2, CheckCircle } from "lucide-react";
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

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmError, setConfirmError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [hasSession, setHasSession] = useState<boolean | null>(null);

  // Check if user has a valid session (from reset link)
  useEffect(() => {
    async function checkSession() {
      const { data: { session } } = await supabase.auth.getSession();
      setHasSession(!!session);
    }
    checkSession();
  }, []);

  function validate(): boolean {
    let valid = true;
    setPasswordError("");
    setConfirmError("");

    if (!password) {
      setPasswordError("Password is required");
      valid = false;
    } else if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      valid = false;
    }

    if (!confirmPassword) {
      setConfirmError("Please confirm your password");
      valid = false;
    } else if (password !== confirmPassword) {
      setConfirmError("Passwords do not match");
      valid = false;
    }

    return valid;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setError("");

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });
      if (updateError) throw updateError;
      setIsSuccess(true);
      // Redirect to login after 3 seconds
      setTimeout(() => router.push("/login"), 3000);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  // Loading state while checking session
  if (hasSession === null) {
    return (
      <div className="min-h-screen bg-warm-cream flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-fresh-green" />
      </div>
    );
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
                  Organika&apos;s Food
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
              Almost there,{" "}
              <span className="italic text-sage-green">set a new password.</span>
            </h1>
            <p className="text-white/50 text-base leading-relaxed">
              Choose a strong password to keep your account secure.
            </p>
          </div>

          {/* Bottom — Footer text */}
          <p className="text-white/25 text-xs">
            © 2026 Organika&apos;s Food. Sangli, Maharashtra.
          </p>
        </div>
      </div>

      {/* ── Right panel — Form ── */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top bar */}
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
                  Organika&apos;s Food
                </span>
              </Link>
            </div>

            <AnimatePresence mode="wait">
              {!hasSession ? (
                /* No valid session — link expired or direct access */
                <motion.div
                  key="no-session"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center"
                >
                  <div className="mx-auto w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-6">
                    <Lock className="h-8 w-8 text-red-400" />
                  </div>
                  <h2 className="font-heading text-3xl sm:text-[2rem] text-rich-black mb-3">
                    Invalid or expired link
                  </h2>
                  <p className="text-mid-gray text-[15px] leading-relaxed mb-8">
                    This password reset link is invalid or has expired.
                    Please request a new one.
                  </p>
                  <Link
                    href="/forgot-password"
                    className="inline-flex items-center gap-2 text-sm font-medium text-fresh-green hover:text-deep-forest transition-colors"
                  >
                    Request new reset link
                  </Link>
                </motion.div>
              ) : isSuccess ? (
                /* Password updated successfully */
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
                    Password updated
                  </h2>
                  <p className="text-mid-gray text-[15px] leading-relaxed mb-8">
                    Your password has been reset successfully. Redirecting you to sign in...
                  </p>
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-2 text-sm font-medium text-fresh-green hover:text-deep-forest transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Go to Sign In
                  </Link>
                </motion.div>
              ) : (
                /* Reset form */
                <motion.div
                  key="form"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {/* Heading */}
                  <div className="mb-8">
                    <h2 className="font-heading text-3xl sm:text-[2rem] text-rich-black mb-2">
                      Reset your password
                    </h2>
                    <p className="text-mid-gray text-[15px]">
                      Enter a new password for your account.
                    </p>
                  </div>

                  {/* General error */}
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
                    {/* New password */}
                    <div>
                      <label
                        htmlFor="password"
                        className="block text-xs font-semibold text-rich-black/70 uppercase tracking-wider mb-2"
                      >
                        New Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-mid-gray/50" />
                        <input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => {
                            setPassword(e.target.value);
                            if (passwordError) setPasswordError("");
                          }}
                          placeholder="••••••••"
                          className={`w-full h-12 pl-11 pr-12 rounded-xl bg-white border-2 text-sm text-rich-black placeholder:text-mid-gray/40 transition-all duration-200 outline-none ${
                            passwordError
                              ? "border-red-300 focus:border-red-400"
                              : "border-soft-stone/80 focus:border-fresh-green/50 hover:border-sage-green/40"
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-mid-gray/40 hover:text-mid-gray transition-colors"
                          tabIndex={-1}
                        >
                          {showPassword ? (
                            <EyeOff className="h-[18px] w-[18px]" />
                          ) : (
                            <Eye className="h-[18px] w-[18px]" />
                          )}
                        </button>
                      </div>
                      {passwordError && (
                        <p className="mt-1.5 text-xs text-red-500">{passwordError}</p>
                      )}
                    </div>

                    {/* Confirm password */}
                    <div>
                      <label
                        htmlFor="confirmPassword"
                        className="block text-xs font-semibold text-rich-black/70 uppercase tracking-wider mb-2"
                      >
                        Confirm Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-mid-gray/50" />
                        <input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => {
                            setConfirmPassword(e.target.value);
                            if (confirmError) setConfirmError("");
                          }}
                          placeholder="••••••••"
                          className={`w-full h-12 pl-11 pr-12 rounded-xl bg-white border-2 text-sm text-rich-black placeholder:text-mid-gray/40 transition-all duration-200 outline-none ${
                            confirmError
                              ? "border-red-300 focus:border-red-400"
                              : "border-soft-stone/80 focus:border-fresh-green/50 hover:border-sage-green/40"
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-mid-gray/40 hover:text-mid-gray transition-colors"
                          tabIndex={-1}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-[18px] w-[18px]" />
                          ) : (
                            <Eye className="h-[18px] w-[18px]" />
                          )}
                        </button>
                      </div>
                      {confirmError && (
                        <p className="mt-1.5 text-xs text-red-500">{confirmError}</p>
                      )}
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
                          "Reset Password"
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
