// src/lib/supabase-coupons.ts
// Helper functions for coupon operations on the Supabase coupons table

import { supabase } from "@/lib/supabase";
import type { Coupon, CouponInput } from "@/types/coupon";

// ── Fetch all coupons (admin) ────────────────────────────────────────────────

export async function fetchCoupons(): Promise<Coupon[]> {
  const { data, error } = await supabase
    .from("coupons")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching coupons:", error.message);
    throw new Error(error.message);
  }

  return data as Coupon[];
}

// ── Create coupon (admin) ────────────────────────────────────────────────────

export async function createCoupon(input: CouponInput): Promise<Coupon> {
  const { data, error } = await supabase
    .from("coupons")
    .insert({
      code: input.code.toUpperCase().trim(),
      discount_type: input.discount_type,
      discount_value: input.discount_value,
      is_active: input.is_active ?? true,
      unlimited_use: input.unlimited_use ?? false,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating coupon:", error.message);
    throw new Error(error.message);
  }

  return data as Coupon;
}

// ── Update coupon (admin) ────────────────────────────────────────────────────

export async function updateCoupon(
  id: string,
  updates: Partial<CouponInput>
): Promise<Coupon> {
  const updateData: Record<string, unknown> = { ...updates };
  if (updates.code) {
    updateData.code = updates.code.toUpperCase().trim();
  }

  const { data, error } = await supabase
    .from("coupons")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating coupon:", error.message);
    throw new Error(error.message);
  }

  return data as Coupon;
}

// ── Delete coupon (admin) ────────────────────────────────────────────────────

export async function deleteCoupon(id: string): Promise<void> {
  const { error } = await supabase.from("coupons").delete().eq("id", id);

  if (error) {
    console.error("Error deleting coupon:", error.message);
    throw new Error(error.message);
  }
}

// ── Validate coupon (checkout) ───────────────────────────────────────────────

export async function validateCoupon(
  code: string,
  userId: string | null
): Promise<{ valid: boolean; coupon?: Coupon; error?: string }> {
  if (!userId) {
    return { valid: false, error: "Please sign in to use coupons" };
  }

  // Fetch coupon by code (case-insensitive)
  const { data: coupon, error } = await supabase
    .from("coupons")
    .select("*")
    .ilike("code", code.trim())
    .single();

  if (error || !coupon) {
    return { valid: false, error: "Invalid coupon code" };
  }

  if (!coupon.is_active) {
    return { valid: false, error: "This coupon is no longer active" };
  }

  // Check usage for non-unlimited coupons
  if (!coupon.unlimited_use) {
    const { data: usage } = await supabase
      .from("coupon_usage")
      .select("id")
      .eq("coupon_id", coupon.id)
      .eq("user_id", userId)
      .limit(1);

    if (usage && usage.length > 0) {
      return { valid: false, error: "You have already used this coupon" };
    }
  }

  return { valid: true, coupon: coupon as Coupon };
}

// ── Calculate discount ───────────────────────────────────────────────────────

export function calculateDiscount(coupon: Coupon, subtotal: number): number {
  if (coupon.discount_type === "percentage") {
    return Math.min(
      Math.round((subtotal * coupon.discount_value) / 100),
      subtotal
    );
  }
  // Flat discount — cannot exceed subtotal
  return Math.min(coupon.discount_value, subtotal);
}

// ── Record coupon usage (after order placed) ─────────────────────────────────

export async function recordCouponUsage(
  couponId: string,
  userId: string,
  orderId: string
): Promise<void> {
  const { error } = await supabase.from("coupon_usage").insert({
    coupon_id: couponId,
    user_id: userId,
    order_id: orderId,
  });

  if (error) {
    console.error("Error recording coupon usage:", error.message);
    // Don't throw — the order is already placed, just log the error
  }
}
