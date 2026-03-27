// src/lib/supabase-pages.ts
// CRUD functions for the site_pages table (legal pages, etc.)

import { supabase } from "@/lib/supabase";

export interface SitePage {
  id: string;
  slug: string;
  title: string;
  content: string;
  updated_at: string;
  created_at: string;
}

// ── Fetch page by slug (public) ─────────────────────────────────────────────

export async function fetchPageBySlug(
  slug: string
): Promise<SitePage | null> {
  const { data, error } = await supabase
    .from("site_pages")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) {
    console.error("Error fetching page:", error.message);
    return null;
  }

  return data as SitePage;
}

// ── Fetch all pages ─────────────────────────────────────────────────────────

export async function fetchAllPages(): Promise<SitePage[]> {
  const { data, error } = await supabase
    .from("site_pages")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching pages:", error.message);
    throw new Error(error.message);
  }

  return data as SitePage[];
}

// ── Update page (admin) ─────────────────────────────────────────────────────

export async function updatePage(
  id: string,
  data: { title?: string; content?: string }
): Promise<SitePage> {
  const { data: updated, error } = await supabase
    .from("site_pages")
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating page:", error.message);
    throw new Error(error.message);
  }

  return updated as SitePage;
}

// ── Create page (admin) ─────────────────────────────────────────────────────

export async function createPage(data: {
  slug: string;
  title: string;
  content: string;
}): Promise<SitePage> {
  const { data: created, error } = await supabase
    .from("site_pages")
    .insert(data)
    .select()
    .single();

  if (error) {
    console.error("Error creating page:", error.message);
    throw new Error(error.message);
  }

  return created as SitePage;
}

// ── Delete page (admin) ─────────────────────────────────────────────────────

export async function deletePage(id: string): Promise<void> {
  const { error } = await supabase.from("site_pages").delete().eq("id", id);

  if (error) {
    console.error("Error deleting page:", error.message);
    throw new Error(error.message);
  }
}
