"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  MapPin,
  Phone,
  User,
  Mail,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Truck,
  Package,
  Tag,
  X,
} from "lucide-react";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { formatPrice } from "@/lib/utils";
import { createOrder, type DeliveryDetails } from "@/lib/supabase-orders";
import {
  validateCoupon,
  calculateDiscount,
  recordCouponUsage,
} from "@/lib/supabase-coupons";
import type { AppliedCoupon } from "@/types/coupon";

// ── Indian states for dropdown ────────────────────────────────────────────────

const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];

// ── Shipping cost ─────────────────────────────────────────────────────────────

function getShippingCost(city: string): number {
  if (!city.trim()) return 0;
  return 60; // Flat ₹60 shipping — will be updated in Batch 2
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();

  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

  // Form state
  const [form, setForm] = useState<DeliveryDetails>({
    fullName: "",
    phone: "",
    email: user?.email || "",
    address: "",
    city: "",
    pincode: "",
    state: "",
  });
  const [notes, setNotes] = useState("");

  // Field errors
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof DeliveryDetails, string>>
  >({});

  // Computed
  const shipping = getShippingCost(form.city);
  const discount = appliedCoupon?.discountAmount ?? 0;
  const total = totalPrice + shipping - discount;
  const isFreeShipping = shipping === 0 && form.city.trim().length > 0;

  // ── Validation ──────────────────────────────────────────────────────────────

  function validate(): boolean {
    const errors: Partial<Record<keyof DeliveryDetails, string>> = {};

    if (!form.fullName.trim()) errors.fullName = "Full name is required";
    if (!form.phone.trim()) {
      errors.phone = "Phone number is required";
    } else if (!/^[6-9]\d{9}$/.test(form.phone.trim())) {
      errors.phone = "Enter a valid 10-digit Indian phone number";
    }
    if (!form.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      errors.email = "Enter a valid email address";
    }
    if (!form.address.trim()) errors.address = "Address is required";
    if (!form.city.trim()) errors.city = "City is required";
    if (!form.pincode.trim()) {
      errors.pincode = "Pincode is required";
    } else if (!/^\d{6}$/.test(form.pincode.trim())) {
      errors.pincode = "Enter a valid 6-digit pincode";
    }
    if (!form.state.trim()) errors.state = "State is required";

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  // ── Update field helper ─────────────────────────────────────────────────────

  function updateField(field: keyof DeliveryDetails, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  }

  // ── Coupon handlers ────────────────────────────────────────────────────────

  async function handleApplyCoupon() {
    if (!couponCode.trim()) return;
    setCouponError(null);
    setIsValidatingCoupon(true);

    try {
      const result = await validateCoupon(couponCode, user?.id ?? null);
      if (!result.valid || !result.coupon) {
        setCouponError(result.error || "Invalid coupon");
        return;
      }

      const discountAmount = calculateDiscount(result.coupon, totalPrice);
      setAppliedCoupon({ coupon: result.coupon, discountAmount });
      setCouponError(null);
    } catch {
      setCouponError("Failed to validate coupon. Please try again.");
    } finally {
      setIsValidatingCoupon(false);
    }
  }

  function handleRemoveCoupon() {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError(null);
  }

  // ── Place Order ─────────────────────────────────────────────────────────────

  async function handlePlaceOrder() {
    if (!validate()) return;
    if (items.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    setIsPlacingOrder(true);
    setError(null);

    let orderSucceeded = false;

    try {
      // Create order with 30s timeout protection
      const orderPromise = createOrder({
        items: items.map((item) => ({
          productId: item.productId,
          name: item.name,
          slug: item.slug,
          image: item.image,
          size: item.size,
          price: item.price,
          quantity: item.quantity,
        })),
        delivery: {
          fullName: form.fullName.trim(),
          phone: form.phone.trim(),
          email: form.email.trim(),
          address: form.address.trim(),
          city: form.city.trim(),
          pincode: form.pincode.trim(),
          state: form.state.trim(),
        },
        subtotal: totalPrice,
        shipping,
        discount,
        coupon_code: appliedCoupon?.coupon.code,
        total,
        payment_method: "cod",
        notes: notes.trim() || undefined,
      });

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Order is taking too long. Please check your connection and try again.")), 30000)
      );

      const order = await Promise.race([orderPromise, timeoutPromise]);

      // Record coupon usage (fire-and-forget — don't block checkout)
      if (appliedCoupon && user?.id) {
        recordCouponUsage(appliedCoupon.coupon.id, user.id, order.id).catch(() => {});
      }

      // Send order notification emails (fire-and-forget)
      fetch("/api/send-order-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderNumber: order.order_number,
          customerName: form.fullName.trim(),
          customerEmail: form.email.trim(),
          customerPhone: form.phone.trim(),
          address: form.address.trim(),
          city: form.city.trim(),
          state: form.state.trim(),
          pincode: form.pincode.trim(),
          items: items.map((item) => ({
            name: item.name,
            size: item.size,
            price: item.price,
            quantity: item.quantity,
          })),
          subtotal: totalPrice,
          shipping,
          discount,
          couponCode: appliedCoupon?.coupon.code,
          total,
          paymentMethod: "cod",
          notes: notes.trim() || undefined,
        }),
      }).catch(() => {}); // Silently ignore email errors

      // Mark success and navigate — order confirmation page has WhatsApp button
      orderSucceeded = true;
      router.push(`/order-confirmation?order=${order.order_number}`);
      clearCart();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to place order. Please try again.";
      setError(message);
    } finally {
      // Only reset loading state if order failed — prevents "empty cart" flash on success
      if (!orderSucceeded) {
        setIsPlacingOrder(false);
      }
    }
  }

  // ── Reusable input class ────────────────────────────────────────────────────

  const inputBase =
    "w-full h-11 pr-4 rounded-lg border text-rich-black text-sm placeholder:text-mid-gray/50 focus:outline-none focus:ring-2 focus:ring-fresh-green/40 focus:border-fresh-green transition-colors bg-white";

  function inputClass(field: keyof DeliveryDetails, hasIcon = false) {
    return `${inputBase} ${hasIcon ? "pl-10" : "pl-4"} ${
      fieldErrors[field] ? "border-red-300 bg-red-50/30" : "border-soft-stone"
    }`;
  }

  // ── Empty cart state ────────────────────────────────────────────────────────

  if (items.length === 0 && !isPlacingOrder) {
    return (
      <div className="min-h-screen bg-warm-cream pt-18">
        <Container className="py-16">
          <div className="max-w-md mx-auto text-center">
            <div className="w-20 h-20 rounded-full bg-soft-stone/50 flex items-center justify-center mb-5 mx-auto">
              <Package className="h-8 w-8 text-mid-gray" />
            </div>
            <h1 className="font-heading text-2xl text-rich-black mb-3">
              Your cart is empty
            </h1>
            <p className="text-sm text-mid-gray mb-8">
              Add some products to your cart before checking out.
            </p>
            <Link href="/shop">
              <Button size="lg">Browse Products</Button>
            </Link>
          </div>
        </Container>
      </div>
    );
  }

  // ── Main Checkout ───────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-warm-cream pt-18">
      <Container className="py-8 sm:py-12">
        {/* Back link */}
        <Link
          href="/shop"
          className="inline-flex items-center gap-1.5 text-sm text-mid-gray hover:text-rich-black transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Continue Shopping
        </Link>

        <h1 className="font-heading text-2xl sm:text-3xl text-deep-forest mb-8">
          Checkout
        </h1>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-3 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm mb-6">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* ── Left: Delivery Form ──────────────────────────────────── */}
          <div className="lg:col-span-7">
            <section className="bg-white rounded-xl border border-soft-stone/60 p-5 sm:p-6 shadow-sm">
              <h2 className="text-sm font-semibold text-mid-gray uppercase tracking-wider mb-5">
                Delivery Details
              </h2>

              <div className="space-y-4">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-rich-black mb-1.5">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-mid-gray/50" />
                    <input
                      type="text"
                      value={form.fullName}
                      onChange={(e) => updateField("fullName", e.target.value)}
                      placeholder="e.g. Varad Kanade"
                      className={inputClass("fullName", true)}
                    />
                  </div>
                  {fieldErrors.fullName && (
                    <p className="text-xs text-red-500 mt-1">{fieldErrors.fullName}</p>
                  )}
                </div>

                {/* Phone + Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-rich-black mb-1.5">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-mid-gray/50" />
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={(e) => updateField("phone", e.target.value)}
                        placeholder="e.g. 9876543210"
                        maxLength={10}
                        className={inputClass("phone", true)}
                      />
                    </div>
                    {fieldErrors.phone && (
                      <p className="text-xs text-red-500 mt-1">{fieldErrors.phone}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-rich-black mb-1.5">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-mid-gray/50" />
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => updateField("email", e.target.value)}
                        placeholder="e.g. your@email.com"
                        className={inputClass("email", true)}
                      />
                    </div>
                    {fieldErrors.email && (
                      <p className="text-xs text-red-500 mt-1">{fieldErrors.email}</p>
                    )}
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-rich-black mb-1.5">
                    Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-mid-gray/50" />
                    <input
                      type="text"
                      value={form.address}
                      onChange={(e) => updateField("address", e.target.value)}
                      placeholder="House/flat no., street, area, landmark"
                      className={inputClass("address", true)}
                    />
                  </div>
                  {fieldErrors.address && (
                    <p className="text-xs text-red-500 mt-1">{fieldErrors.address}</p>
                  )}
                </div>

                {/* City + Pincode + State */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-rich-black mb-1.5">
                      City <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.city}
                      onChange={(e) => updateField("city", e.target.value)}
                      placeholder="e.g. Mumbai"
                      className={inputClass("city")}
                    />
                    {fieldErrors.city && (
                      <p className="text-xs text-red-500 mt-1">{fieldErrors.city}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-rich-black mb-1.5">
                      Pincode <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.pincode}
                      onChange={(e) => updateField("pincode", e.target.value)}
                      placeholder="e.g. 411001"
                      maxLength={6}
                      className={inputClass("pincode")}
                    />
                    {fieldErrors.pincode && (
                      <p className="text-xs text-red-500 mt-1">{fieldErrors.pincode}</p>
                    )}
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-sm font-medium text-rich-black mb-1.5">
                      State <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={form.state}
                      onChange={(e) => updateField("state", e.target.value)}
                      className="w-full h-11 px-4 rounded-lg border border-soft-stone bg-white text-rich-black text-sm focus:outline-none focus:ring-2 focus:ring-fresh-green/40 focus:border-fresh-green transition-colors"
                    >
                      {INDIAN_STATES.map((state) => (
                        <option key={state} value={state}>
                          {state}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Order notes */}
                <div>
                  <label className="block text-sm font-medium text-rich-black mb-1.5">
                    Order Notes{" "}
                    <span className="text-mid-gray font-normal">(optional)</span>
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    placeholder="Any special instructions for delivery..."
                    className="w-full px-4 py-3 rounded-lg border border-soft-stone bg-white text-rich-black text-sm placeholder:text-mid-gray/50 focus:outline-none focus:ring-2 focus:ring-fresh-green/40 focus:border-fresh-green transition-colors resize-none"
                  />
                </div>
              </div>
            </section>

            {/* Payment method */}
            <section className="bg-white rounded-xl border border-soft-stone/60 p-5 sm:p-6 shadow-sm mt-6">
              <h2 className="text-sm font-semibold text-mid-gray uppercase tracking-wider mb-4">
                Payment Method
              </h2>
              <div className="flex items-center gap-4 p-4 rounded-lg border-2 border-fresh-green bg-fresh-green/5">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-fresh-green/10">
                  <Truck className="h-5 w-5 text-fresh-green" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-rich-black">
                    Cash on Delivery (COD)
                  </p>
                  <p className="text-xs text-mid-gray mt-0.5">
                    Pay when your order is delivered to your doorstep
                  </p>
                </div>
                <div className="ml-auto">
                  <div className="h-5 w-5 rounded-full border-2 border-fresh-green flex items-center justify-center">
                    <div className="h-2.5 w-2.5 rounded-full bg-fresh-green" />
                  </div>
                </div>
              </div>
              <p className="text-xs text-mid-gray/70 mt-3 flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5" />
                Online payment via Razorpay coming soon
              </p>
            </section>
          </div>

          {/* ── Right: Order Summary ─────────────────────────────────── */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-xl border border-soft-stone/60 p-5 sm:p-6 shadow-sm lg:sticky lg:top-24">
              <h2 className="text-sm font-semibold text-mid-gray uppercase tracking-wider mb-5">
                Order Summary
              </h2>

              {/* Items */}
              <div className="space-y-3 mb-5">
                {items.map((item) => (
                  <div
                    key={`${item.productId}-${item.size}`}
                    className="flex items-center gap-3"
                  >
                    <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-soft-stone/30 shrink-0">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="56px"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-rich-black truncate">
                        {item.name}
                      </p>
                      <p className="text-xs text-mid-gray">
                        {item.size} × {item.quantity}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-rich-black shrink-0">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Coupon section */}
              <div className="mb-4">
                {user ? (
                  appliedCoupon ? (
                    <div className="flex items-center justify-between p-3 rounded-lg bg-fresh-green/5 border border-fresh-green/20">
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-fresh-green" />
                        <span className="text-sm font-medium text-fresh-green">
                          {appliedCoupon.coupon.code}
                        </span>
                        <span className="text-xs text-mid-gray">
                          (−{formatPrice(appliedCoupon.discountAmount)})
                        </span>
                      </div>
                      <button
                        onClick={handleRemoveCoupon}
                        className="p-1 rounded hover:bg-fresh-green/10 transition-colors"
                      >
                        <X className="h-4 w-4 text-mid-gray" />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={couponCode}
                          onChange={(e) => {
                            setCouponCode(e.target.value.toUpperCase());
                            if (couponError) setCouponError(null);
                          }}
                          placeholder="Coupon code"
                          className="flex-1 h-10 px-3 rounded-lg border border-soft-stone bg-white text-sm font-mono text-rich-black placeholder:text-mid-gray/40 focus:outline-none focus:ring-2 focus:ring-fresh-green/40 focus:border-fresh-green transition-colors tracking-wider"
                        />
                        <button
                          onClick={handleApplyCoupon}
                          disabled={isValidatingCoupon || !couponCode.trim()}
                          className="h-10 px-4 rounded-lg bg-deep-forest text-white text-sm font-medium hover:bg-rich-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                        >
                          {isValidatingCoupon ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            "Apply"
                          )}
                        </button>
                      </div>
                      {couponError && (
                        <p className="text-xs text-red-500 mt-1.5">{couponError}</p>
                      )}
                    </div>
                  )
                ) : (
                  <p className="text-xs text-mid-gray text-center py-2">
                    <Link
                      href="/login"
                      className="text-fresh-green hover:text-deep-forest font-medium"
                    >
                      Sign in
                    </Link>{" "}
                    to apply a coupon code
                  </p>
                )}
              </div>

              <div className="h-px bg-soft-stone/40 mb-4" />

              {/* Subtotal */}
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-mid-gray">Subtotal</span>
                <span className="text-rich-black font-medium">
                  {formatPrice(totalPrice)}
                </span>
              </div>

              {/* Shipping */}
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-mid-gray">Shipping</span>
                <span
                  className={`font-medium ${
                    isFreeShipping ? "text-fresh-green" : "text-rich-black"
                  }`}
                >
                  {form.city.trim().length === 0
                    ? "Enter city"
                    : isFreeShipping
                      ? "FREE"
                      : formatPrice(shipping)}
                </span>
              </div>

              {/* Discount */}
              {discount > 0 && (
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-fresh-green">Discount</span>
                  <span className="font-medium text-fresh-green">
                    −{formatPrice(discount)}
                  </span>
                </div>
              )}

              <div className="mb-4" />

              {isFreeShipping && (
                <p className="text-xs text-fresh-green bg-fresh-green/5 rounded-lg px-3 py-2 mb-4">
                  Free delivery on this order!
                </p>
              )}

              <div className="h-px bg-soft-stone/40 mb-4" />

              {/* Total */}
              <div className="flex items-center justify-between mb-6">
                <span className="text-base font-semibold text-rich-black">
                  Total
                </span>
                <span className="text-xl font-bold text-deep-forest">
                  {formatPrice(total)}
                </span>
              </div>

              {/* WhatsApp confirmation info */}
              <div className="flex items-start gap-2.5 p-3 rounded-lg bg-[#25D366]/5 border border-[#25D366]/20 mb-4">
                <svg
                  className="w-4 h-4 text-[#25D366] shrink-0 mt-0.5"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 00.611.611l4.458-1.495A11.943 11.943 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.315 0-4.458-.766-6.183-2.059l-.432-.324-2.645.887.887-2.645-.324-.432A9.935 9.935 0 012 12C2 6.486 6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z" />
                </svg>
                <p className="text-xs text-[#1a3a2a]/70 leading-relaxed">
                  After placing your order, you can confirm on <strong className="text-[#25D366]">WhatsApp</strong> from the confirmation page to speed up processing.
                </p>
              </div>

              {/* Place order button */}
              <Button
                size="lg"
                fullWidth
                onClick={handlePlaceOrder}
                disabled={isPlacingOrder}
                className="mb-3"
              >
                {isPlacingOrder ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Placing Order...
                  </>
                ) : (
                  `Place Order · ${formatPrice(total)}`
                )}
              </Button>

              <p className="text-[11px] text-mid-gray/60 text-center">
                By placing this order, you agree to our{" "}
                <Link href="/pages/terms" className="underline hover:text-mid-gray">
                  terms and conditions
                </Link>.
              </p>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
