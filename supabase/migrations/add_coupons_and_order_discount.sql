-- Migration: Add coupons system and order discount fields
-- Run this in your Supabase SQL Editor

-- ── 1. Create coupons table ─────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS coupons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'flat')),
  discount_value NUMERIC NOT NULL CHECK (discount_value > 0),
  is_active BOOLEAN DEFAULT true,
  unlimited_use BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ── 2. Create coupon_usage table ────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS coupon_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  coupon_id UUID REFERENCES coupons(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  used_at TIMESTAMPTZ DEFAULT now()
);

-- ── 3. Add discount columns to orders table ─────────────────────────────────

ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount NUMERIC DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS coupon_code TEXT DEFAULT NULL;

-- ── 4. RLS Policies for coupons ─────────────────────────────────────────────

ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

-- Anyone can read active coupons (needed for validation at checkout)
CREATE POLICY "Anyone can read coupons"
  ON coupons FOR SELECT
  USING (true);

-- Only admins can insert/update/delete coupons
CREATE POLICY "Admins can insert coupons"
  ON coupons FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update coupons"
  ON coupons FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete coupons"
  ON coupons FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ── 5. RLS Policies for coupon_usage ────────────────────────────────────────

ALTER TABLE coupon_usage ENABLE ROW LEVEL SECURITY;

-- Users can read their own coupon usage
CREATE POLICY "Users can read own coupon usage"
  ON coupon_usage FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own coupon usage
CREATE POLICY "Users can insert own coupon usage"
  ON coupon_usage FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admins can read all coupon usage
CREATE POLICY "Admins can read all coupon usage"
  ON coupon_usage FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ── 6. Index for faster coupon validation ───────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_coupon_usage_coupon_user
  ON coupon_usage(coupon_id, user_id);

CREATE INDEX IF NOT EXISTS idx_coupons_code
  ON coupons(code);
