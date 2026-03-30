// src/lib/supabase-addresses.ts
// Helper functions for saved customer addresses

import { supabase } from "@/lib/supabase";

export interface SavedAddress {
  id: string;
  user_id: string;
  label: string; // e.g. "Home", "Office", "Other"
  full_name: string;
  phone: string;
  address: string;
  city: string;
  pincode: string;
  state: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface AddressInput {
  label: string;
  full_name: string;
  phone: string;
  address: string;
  city: string;
  pincode: string;
  state: string;
  is_default?: boolean;
}

// ── Fetch user's saved addresses ────────────────────────────────────────────

export async function fetchUserAddresses(
  userId: string
): Promise<SavedAddress[]> {
  const { data, error } = await supabase
    .from("saved_addresses")
    .select("*")
    .eq("user_id", userId)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching addresses:", error.message);
    return [];
  }

  return data as SavedAddress[];
}

// ── Create address ──────────────────────────────────────────────────────────

export async function createAddress(
  userId: string,
  input: AddressInput
): Promise<SavedAddress> {
  // If this is set as default, unset other defaults first
  if (input.is_default) {
    await supabase
      .from("saved_addresses")
      .update({ is_default: false })
      .eq("user_id", userId);
  }

  const { data, error } = await supabase
    .from("saved_addresses")
    .insert({
      user_id: userId,
      label: input.label,
      full_name: input.full_name,
      phone: input.phone,
      address: input.address,
      city: input.city,
      pincode: input.pincode,
      state: input.state,
      is_default: input.is_default ?? false,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating address:", error.message);
    throw new Error(error.message);
  }

  return data as SavedAddress;
}

// ── Update address ──────────────────────────────────────────────────────────

export async function updateAddress(
  id: string,
  userId: string,
  input: Partial<AddressInput>
): Promise<SavedAddress> {
  // If setting as default, unset other defaults first
  if (input.is_default) {
    await supabase
      .from("saved_addresses")
      .update({ is_default: false })
      .eq("user_id", userId);
  }

  const { data, error } = await supabase
    .from("saved_addresses")
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    console.error("Error updating address:", error.message);
    throw new Error(error.message);
  }

  return data as SavedAddress;
}

// ── Delete address ──────────────────────────────────────────────────────────

export async function deleteAddress(
  id: string,
  userId: string
): Promise<void> {
  const { error } = await supabase
    .from("saved_addresses")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) {
    console.error("Error deleting address:", error.message);
    throw new Error(error.message);
  }
}
