// src/lib/supabase-products.ts
// Helper functions for CRUD operations on the Supabase products table

import { supabase } from "@/lib/supabase";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface SupabaseProductSize {
  weight: string;
  price: number;
  inStock: boolean;
}

export interface SupabaseProduct {
  id: string;
  name: string;
  tagline: string;
  description: string;
  long_description: string;
  slug: string;
  image_src: string;
  badge: string | null;
  color: string;
  accent_color: string;
  emoji: string;
  category: "vegetable" | "leaf";
  sizes: SupabaseProductSize[];
  benefits: string[];
  usage: string[];
  ingredients: string;
  shelf_life: string;
  featured: boolean;
  created_at: string;
  updated_at: string;
}

// Input type for creating/updating (no id, created_at, updated_at)
export type ProductInput = Omit<
  SupabaseProduct,
  "id" | "created_at" | "updated_at"
>;

// ── Fetch all products ────────────────────────────────────────────────────────

export async function fetchProducts(): Promise<SupabaseProduct[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching products:", error.message);
    throw new Error(error.message);
  }

  return data as SupabaseProduct[];
}

// ── Fetch single product by slug ──────────────────────────────────────────────

export async function fetchProductBySlug(
  slug: string
): Promise<SupabaseProduct | null> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) {
    console.error("Error fetching product:", error.message);
    return null;
  }

  return data as SupabaseProduct;
}

// ── Fetch single product by ID ────────────────────────────────────────────────

export async function fetchProductById(
  id: string
): Promise<SupabaseProduct | null> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching product:", error.message);
    return null;
  }

  return data as SupabaseProduct;
}

// ── Create a new product ──────────────────────────────────────────────────────

export async function createProduct(
  product: ProductInput
): Promise<SupabaseProduct> {
  const { data, error } = await supabase
    .from("products")
    .insert(product)
    .select()
    .single();

  if (error) {
    console.error("Error creating product:", error.message);
    throw new Error(error.message);
  }

  return data as SupabaseProduct;
}

// ── Update an existing product ────────────────────────────────────────────────

export async function updateProduct(
  id: string,
  updates: Partial<ProductInput>
): Promise<SupabaseProduct> {
  const { data, error } = await supabase
    .from("products")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating product:", error.message);
    throw new Error(error.message);
  }

  return data as SupabaseProduct;
}

// ── Delete a product ──────────────────────────────────────────────────────────

export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase.from("products").delete().eq("id", id);

  if (error) {
    console.error("Error deleting product:", error.message);
    throw new Error(error.message);
  }
}
