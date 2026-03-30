// src/lib/supabase-banners.ts
// Helper functions for announcement_banners table

import { supabase } from "@/lib/supabase";

export interface Banner {
  id: string;
  message: string;
  link: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface BannerInput {
  message: string;
  link?: string;
  is_active?: boolean;
  sort_order?: number;
}

// ── Fetch active banners (public) ───────────────────────────────────────────

export async function fetchActiveBanners(): Promise<Banner[]> {
  const { data, error } = await supabase
    .from("announcement_banners")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Error fetching active banners:", error.message);
    return [];
  }

  return data as Banner[];
}

// ── Fetch all banners (admin) ───────────────────────────────────────────────

export async function fetchAllBanners(): Promise<Banner[]> {
  const { data, error } = await supabase
    .from("announcement_banners")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Error fetching banners:", error.message);
    throw new Error(error.message);
  }

  return data as Banner[];
}

// ── Create banner ───────────────────────────────────────────────────────────

export async function createBanner(input: BannerInput): Promise<Banner> {
  const { data, error } = await supabase
    .from("announcement_banners")
    .insert({
      message: input.message,
      link: input.link || null,
      is_active: input.is_active ?? true,
      sort_order: input.sort_order ?? 0,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating banner:", error.message);
    throw new Error(error.message);
  }

  return data as Banner;
}

// ── Update banner ───────────────────────────────────────────────────────────

export async function updateBanner(
  id: string,
  input: Partial<BannerInput>
): Promise<Banner> {
  const { data, error } = await supabase
    .from("announcement_banners")
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating banner:", error.message);
    throw new Error(error.message);
  }

  return data as Banner;
}

// ── Delete banner ───────────────────────────────────────────────────────────

export async function deleteBanner(id: string): Promise<void> {
  const { error } = await supabase
    .from("announcement_banners")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting banner:", error.message);
    throw new Error(error.message);
  }
}

// ── Toggle banner active status ─────────────────────────────────────────────

export async function toggleBannerActive(
  id: string,
  isActive: boolean
): Promise<Banner> {
  return updateBanner(id, { is_active: isActive });
}
