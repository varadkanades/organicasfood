"use client";

import { useState, useEffect, FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowLeft, Loader2 } from "lucide-react";
import Button from "@/components/ui/Button";
import { supabase } from "@/lib/supabase";

// ── Types ────────────────────────────────────────────────────────────────────
type AuthMode = "login" | "signup";

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

// ── Google SVG Icon ──────────────────────────────────────────────────────────
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

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

// ── Main Login Component ─────────────────────────────────────────────────────
export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<AuthMode>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Handle error query params from auth callback
  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam === "auth_failed") {
      setErrors({ general: "Your verification link may have expired. Please try signing up again." });
    }
  }, [searchParams]);

  // Safe relative redirect: starts with "/" but not "//" (no protocol-relative URLs)
  const rawRedirect = searchParams.get("redirect");
  const safeRedirect =
    rawRedirect && rawRedirect.startsWith("/") && !rawRedirect.startsWith("//")
      ? rawRedirect
      : null;

  // Form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // ── Validation ───────────────────────────────────────────────────────────
  function validate(): boolean {
    const newErrors: FormErrors = {};

    if (mode === "signup" && !name.trim()) {
      newErrors.name = "Full name is required";
    }

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Enter a valid email address";
    }

    if (mode === "signup" && phone && !/^[6-9]\d{9}$/.test(phone)) {
      newErrors.phone = "Enter a valid 10-digit Indian mobile number";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (mode === "signup") {
      if (!confirmPassword) {
        newErrors.confirmPassword = "Please confirm your password";
      } else if (password !== confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  // ── Form submit ──────────────────────────────────────────────────────────
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setErrors({});

    try {
      if (mode === "login") {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;

        // Check user role from profiles table
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", data.user.id)
          .single();

        if (profile?.role === "admin") {
          router.push("/admin");
        } else {
          router.push(safeRedirect || "/");
        }
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
              phone: phone,
            },
          },
        });
        if (error) throw error;

        // Check if email confirmation is required
        if (data.user && !data.session) {
          setSuccessMessage("Check your email for a confirmation link to complete signup. Don't forget to check your spam folder.");
        } else {
          router.push(safeRedirect || "/");
        }
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setErrors({ general: message });
    } finally {
      setIsLoading(false);
    }
  }

  // ── Google sign-in ───────────────────────────────────────────────────────
  async function handleGoogleSignIn() {
    setIsGoogleLoading(true);
    setErrors({});
    try {
      const callbackUrl = new URL(`${window.location.origin}/auth/callback`);
      if (safeRedirect) callbackUrl.searchParams.set("redirect", safeRedirect);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: callbackUrl.toString(),
        },
      });
      if (error) throw error;
      // If no error, browser will redirect — set a timeout to reset loading
      // in case redirect doesn't happen (e.g. popup blocked)
      setTimeout(() => setIsGoogleLoading(false), 5000);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message.includes("provider")
            ? "Google sign-in is temporarily unavailable. Please use email and password."
            : err.message
          : "Google sign-in failed. Please try again.";
      setErrors({ general: message });
      setIsGoogleLoading(false);
    }
  }

  // ── Switch mode ──────────────────────────────────────────────────────────
  function switchMode(newMode: AuthMode) {
    setMode(newMode);
    setErrors({});
    setShowPassword(false);
    setShowConfirmPassword(false);
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
        <div className="relative z-10 flex flex-col justify-between p-12 pt-20 xl:p-16 xl:pt-24 w-full">
          {/* Top — Logo */}
          <div>
            <Link href="/" className="inline-flex items-center gap-3 group">
              <Image
                src="/images/logo.png"
                alt="Organika's Food Logo"
                width={56}
                height={56}
                className="rounded-full bg-white/10 group-hover:bg-white/15 transition-colors"
              />
              <div>
                <span className="font-heading text-3xl text-white">
                  Organika&apos;s Food
                </span>
                <span className="block text-[11px] font-medium tracking-[0.25em] uppercase text-white/40">
                  100% Natural
                </span>
              </div>
            </Link>
          </div>

          {/* Center — Tagline */}
          <div className="max-w-md">
            <h1 className="font-heading text-4xl xl:text-5xl text-white leading-[1.15] mb-6">
              Nature&apos;s Best,{" "}
              <span className="italic text-sage-green">Powdered</span> Fresh.
            </h1>
            <p className="text-white/50 text-base leading-relaxed mb-10">
              Pure dehydrated vegetable powders crafted in Maharashtra. Zero
              preservatives, zero additives — just the goodness of nature.
            </p>

            {/* Trust signals */}
            <div className="flex flex-wrap gap-3">
              {["FSSAI Certified", "100% Natural", "No Preservatives", "Farm Fresh"].map(
                (tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.08] border border-white/10 text-white/60 text-xs font-medium"
                  >
                    <span className="w-1 h-1 rounded-full bg-sage-green" />
                    {tag}
                  </span>
                )
              )}
            </div>
          </div>

          {/* Bottom — Footer text */}
          <p className="text-white/25 text-xs">
            © 2026 Organika&apos;s Food. India.
          </p>
        </div>
      </div>

      {/* ── Right panel — Auth form ── */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top bar — Back to home */}
        <div className="p-5 sm:p-6 lg:p-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-mid-gray hover:text-rich-black transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
            Back to Home
          </Link>
        </div>

        {/* Form area — centered */}
        <div className="flex-1 flex items-center justify-center px-5 sm:px-8 pb-12">
          <div className="w-full max-w-[420px]">
            {/* Mobile logo (hidden on desktop) */}
            <div className="lg:hidden mb-8 text-center">
              <Link href="/" className="inline-flex items-center gap-2">
                <Image
                  src="/images/logo.png"
                  alt="Organika's Food Logo"
                  width={44}
                  height={44}
                  className="rounded-full"
                />
                <span className="font-heading text-2xl text-deep-forest">
                  Organika&apos;s Food
                </span>
              </Link>
            </div>

            {/* Heading */}
            <div className="mb-8">
              <h2 className="font-heading text-3xl sm:text-[2rem] text-rich-black mb-2">
                {mode === "login" ? "Welcome back" : "Create your account"}
              </h2>
              <p className="text-mid-gray text-[15px]">
                {mode === "login"
                  ? "Sign in to access your account and orders."
                  : "Join us for farm-fresh natural powders."}
              </p>
            </div>

            {/* Tab switcher */}
            <div className="relative flex bg-soft-stone/60 rounded-xl p-1 mb-8">
              {(["login", "signup"] as AuthMode[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => switchMode(tab)}
                  className={`relative z-10 flex-1 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    mode === tab
                      ? "text-rich-black"
                      : "text-mid-gray hover:text-rich-black"
                  }`}
                >
                  {tab === "login" ? "Sign In" : "Sign Up"}
                </button>
              ))}
              {/* Active tab indicator */}
              <motion.div
                layoutId="authTab"
                className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-lg shadow-sm"
                style={{ left: mode === "login" ? 4 : "calc(50% + 0px)" }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            </div>

            {/* Success message (email verification) */}
            <AnimatePresence mode="wait">
              {successMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="mb-6 p-4 rounded-xl bg-green-50 border border-green-200"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 mt-1.5 rounded-full bg-green-500 shrink-0" />
                    <p className="text-sm text-green-800 leading-snug">{successMessage}</p>
                  </div>
                  <button
                    type="button"
                    disabled={resendCooldown > 0}
                    onClick={async () => {
                      await supabase.auth.resend({ type: "signup", email });
                      setResendCooldown(60);
                      const interval = setInterval(() => {
                        setResendCooldown((c) => {
                          if (c <= 1) { clearInterval(interval); return 0; }
                          return c - 1;
                        });
                      }, 1000);
                    }}
                    className="mt-2 ml-4 text-xs font-medium text-green-700 hover:text-green-900 underline disabled:opacity-50 disabled:no-underline"
                  >
                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend verification email"}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* General error */}
            <AnimatePresence mode="wait">
              {errors.general && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="mb-6 flex items-start gap-3 p-3.5 rounded-xl bg-red-50 border border-red-100"
                >
                  <div className="w-1.5 h-1.5 mt-1.5 rounded-full bg-red-500 shrink-0" />
                  <p className="text-sm text-red-700 leading-snug">{errors.general}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Google sign-in */}
            <button
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading || isLoading}
              className="w-full flex items-center justify-center gap-3 h-12 px-4 rounded-xl border-2 border-soft-stone/80 bg-white text-sm font-medium text-rich-black hover:border-sage-green/40 hover:bg-soft-stone/20 transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]"
            >
              {isGoogleLoading ? (
                <Loader2 className="h-5 w-5 animate-spin text-mid-gray" />
              ) : (
                <>
                  <GoogleIcon className="h-5 w-5" />
                  Continue with Google
                </>
              )}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-soft-stone" />
              <span className="text-xs font-medium text-mid-gray/60 uppercase tracking-wider">
                or
              </span>
              <div className="flex-1 h-px bg-soft-stone" />
            </div>

            {/* Form */}
            <AnimatePresence mode="wait">
              <motion.div
                key={mode}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                <form
                  onSubmit={handleSubmit}
                  className="space-y-4"
                  noValidate
                >
                  {/* Name field (signup only) */}
                  {mode === "signup" && (
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-xs font-semibold text-rich-black/70 uppercase tracking-wider mb-2"
                      >
                        Full Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-mid-gray/50" />
                        <input
                          id="name"
                          type="text"
                          value={name}
                          onChange={(e) => {
                            setName(e.target.value);
                            if (errors.name)
                              setErrors((prev) => ({ ...prev, name: undefined }));
                          }}
                          placeholder="Varad Kanade"
                          className={`w-full h-12 pl-11 pr-4 rounded-xl bg-white border-2 text-sm text-rich-black placeholder:text-mid-gray/40 transition-all duration-200 outline-none ${
                            errors.name
                              ? "border-red-300 focus:border-red-400"
                              : "border-soft-stone/80 focus:border-fresh-green/50 hover:border-sage-green/40"
                          }`}
                        />
                      </div>
                      {errors.name && (
                        <p className="mt-1.5 text-xs text-red-500">{errors.name}</p>
                      )}
                    </div>
                  )}

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
                          if (errors.email)
                            setErrors((prev) => ({ ...prev, email: undefined }));
                        }}
                        placeholder="you@example.com"
                        className={`w-full h-12 pl-11 pr-4 rounded-xl bg-white border-2 text-sm text-rich-black placeholder:text-mid-gray/40 transition-all duration-200 outline-none ${
                          errors.email
                            ? "border-red-300 focus:border-red-400"
                            : "border-soft-stone/80 focus:border-fresh-green/50 hover:border-sage-green/40"
                        }`}
                      />
                    </div>
                    {errors.email && (
                      <p className="mt-1.5 text-xs text-red-500">{errors.email}</p>
                    )}
                  </div>

                  {/* Phone field (signup only) */}
                  {mode === "signup" && (
                    <div>
                      <label
                        htmlFor="phone"
                        className="block text-xs font-semibold text-rich-black/70 uppercase tracking-wider mb-2"
                      >
                        Phone Number{" "}
                        <span className="normal-case tracking-normal text-mid-gray/50 font-normal">
                          (optional)
                        </span>
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-mid-gray/50" />
                        <span className="absolute left-11 top-1/2 -translate-y-1/2 text-sm text-mid-gray/50">
                          +91
                        </span>
                        <input
                          id="phone"
                          type="tel"
                          value={phone}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                            setPhone(val);
                            if (errors.phone)
                              setErrors((prev) => ({ ...prev, phone: undefined }));
                          }}
                          placeholder="9876543210"
                          className={`w-full h-12 pl-[5.5rem] pr-4 rounded-xl bg-white border-2 text-sm text-rich-black placeholder:text-mid-gray/40 transition-all duration-200 outline-none ${
                            errors.phone
                              ? "border-red-300 focus:border-red-400"
                              : "border-soft-stone/80 focus:border-fresh-green/50 hover:border-sage-green/40"
                          }`}
                        />
                      </div>
                      {errors.phone && (
                        <p className="mt-1.5 text-xs text-red-500">{errors.phone}</p>
                      )}
                    </div>
                  )}

                  {/* Password field */}
                  <div>
                    <label
                      htmlFor="password"
                      className="block text-xs font-semibold text-rich-black/70 uppercase tracking-wider mb-2"
                    >
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-mid-gray/50" />
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (errors.password)
                            setErrors((prev) => ({ ...prev, password: undefined }));
                        }}
                        placeholder="••••••••"
                        className={`w-full h-12 pl-11 pr-12 rounded-xl bg-white border-2 text-sm text-rich-black placeholder:text-mid-gray/40 transition-all duration-200 outline-none ${
                          errors.password
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
                    {errors.password && (
                      <p className="mt-1.5 text-xs text-red-500">{errors.password}</p>
                    )}
                  </div>

                  {/* Confirm password (signup only) */}
                  {mode === "signup" && (
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
                            if (errors.confirmPassword)
                              setErrors((prev) => ({
                                ...prev,
                                confirmPassword: undefined,
                              }));
                          }}
                          placeholder="••••••••"
                          className={`w-full h-12 pl-11 pr-12 rounded-xl bg-white border-2 text-sm text-rich-black placeholder:text-mid-gray/40 transition-all duration-200 outline-none ${
                            errors.confirmPassword
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
                      {errors.confirmPassword && (
                        <p className="mt-1.5 text-xs text-red-500">
                          {errors.confirmPassword}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Forgot password link (login only) */}
                  {mode === "login" && (
                    <div className="flex justify-end">
                      <Link
                        href="/forgot-password"
                        className="text-xs font-medium text-fresh-green hover:text-deep-forest transition-colors"
                      >
                        Forgot password?
                      </Link>
                    </div>
                  )}

                  {/* Submit button */}
                  <div className="pt-2">
                    <Button
                      type="submit"
                      fullWidth
                      size="lg"
                      disabled={isLoading || isGoogleLoading}
                      className="h-12 rounded-xl text-[15px]"
                    >
                      {isLoading ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : mode === "login" ? (
                        "Sign In"
                      ) : (
                        "Create Account"
                      )}
                    </Button>
                  </div>

                  {/* Terms (signup only) */}
                  {mode === "signup" && (
                    <p className="text-center text-xs text-mid-gray/60 leading-relaxed pt-1">
                      By creating an account, you agree to our{" "}
                      <Link
                        href="/terms"
                        className="text-fresh-green hover:text-deep-forest underline underline-offset-2"
                      >
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link
                        href="/privacy"
                        className="text-fresh-green hover:text-deep-forest underline underline-offset-2"
                      >
                        Privacy Policy
                      </Link>
                      .
                    </p>
                  )}
                </form>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}