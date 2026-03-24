-- Migration: Add discount_percent column to products table
-- Run this in your Supabase SQL Editor

ALTER TABLE products ADD COLUMN IF NOT EXISTS discount_percent INTEGER DEFAULT 0;
