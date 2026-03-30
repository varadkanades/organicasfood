"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  Loader2,
  CheckCircle,
  AlertCircle,
  ShieldCheck,
  Settings,
} from "lucide-react";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";

export default function SettingsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Check if user signed in via Google OAuth
  const isGoogleUser = user?.app_metadata?.provider === "google";

  // Redirect to login if not authenticated
  if (!authLoading && !user) {
    router.push("/login");
    return null;
  }

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-warm-cream pt-18 flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-fresh-green animate-spin" />
      </div>
    );
  }

  async function handleChangePassword() {
    setError(null);
    setSuccess(false);

    // Validation
    if (!newPassword.trim()) {
      setError("Please enter a new password.");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsUpdating(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        setError(updateError.message);
        return;
      }

      setSuccess(true);
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      setError("Failed to update password. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  }

  const inputBase =
    "w-full h-11 pl-10 pr-12 rounded-lg border text-rich-black text-sm placeholder:text-mid-gray/50 focus:outline-none focus:ring-2 focus:ring-fresh-green/40 focus:border-fresh-green transition-colors bg-white";

  return (
    <div className="min-h-screen bg-warm-cream pt-18">
      <Container className="py-8 sm:py-12">
        <div className="max-w-lg mx-auto">
          {/* Back link */}
          <Link
            href="/account/orders"
            className="inline-flex items-center gap-1.5 text-sm text-mid-gray hover:text-rich-black transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Orders
          </Link>

          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-deep-forest/10">
              <Settings className="h-6 w-6 text-deep-forest" />
            </div>
            <div>
              <h1 className="font-heading text-2xl text-deep-forest">
                Account Settings
              </h1>
              <p className="text-sm text-mid-gray">{user?.email}</p>
            </div>
          </div>

          {/* Change Password Card */}
          <div className="bg-white rounded-xl border border-soft-stone/60 p-5 sm:p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <Lock className="h-4 w-4 text-mid-gray" />
              <h2 className="text-sm font-semibold text-mid-gray uppercase tracking-wider">
                Change Password
              </h2>
            </div>

            {isGoogleUser ? (
              /* Google OAuth user — can't change password here */
              <div className="flex items-start gap-3 p-4 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 text-sm">
                <ShieldCheck className="h-5 w-5 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Signed in with Google</p>
                  <p className="text-blue-600 mt-1 text-xs">
                    Your password is managed through your Google account.
                    Visit{" "}
                    <a
                      href="https://myaccount.google.com/security"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:text-blue-800"
                    >
                      Google Account Security
                    </a>{" "}
                    to change it.
                  </p>
                </div>
              </div>
            ) : (
              /* Email/password user — show change password form */
              <div className="space-y-4">
                {/* Success message */}
                {success && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">
                    <CheckCircle className="h-4 w-4 shrink-0" />
                    <p>Password updated successfully!</p>
                  </div>
                )}

                {/* Error message */}
                {error && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <p>{error}</p>
                  </div>
                )}

                {/* New Password */}
                <div>
                  <label className="block text-sm font-medium text-rich-black mb-1.5">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-mid-gray/50" />
                    <input
                      type={showNew ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        if (error) setError(null);
                        if (success) setSuccess(false);
                      }}
                      placeholder="Enter new password (min 6 characters)"
                      className={`${inputBase} border-soft-stone`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew(!showNew)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-mid-gray/50 hover:text-mid-gray transition-colors"
                    >
                      {showNew ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-rich-black mb-1.5">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-mid-gray/50" />
                    <input
                      type={showConfirm ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (error) setError(null);
                      }}
                      placeholder="Re-enter new password"
                      className={`${inputBase} border-soft-stone`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-mid-gray/50 hover:text-mid-gray transition-colors"
                    >
                      {showConfirm ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <Button
                  size="lg"
                  fullWidth
                  onClick={handleChangePassword}
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Password"
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
}
