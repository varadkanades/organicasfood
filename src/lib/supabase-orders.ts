// src/lib/supabase-orders.ts
// Helper functions for order operations on the Supabase orders table

import { supabase } from "@/lib/supabase";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface OrderItem {
  productId: string;
  name: string;
  slug: string;
  image: string;
  size: string;
  price: number;
  quantity: number;
}

export interface DeliveryDetails {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  pincode: string;
  state: string;
}

export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export type PaymentMethod = "cod" | "razorpay";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export interface SupabaseOrder {
  id: string;
  order_number: string;
  user_id: string | null;
  items: OrderItem[];
  delivery: DeliveryDetails;
  subtotal: number;
  shipping: number;
  total: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  order_status: OrderStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateOrderInput {
  items: OrderItem[];
  delivery: DeliveryDetails;
  subtotal: number;
  shipping: number;
  total: number;
  payment_method: PaymentMethod;
  notes?: string;
}

// ── Generate order number ─────────────────────────────────────────────────────

function generateOrderNumber(): string {
  const now = new Date();
  const date = now.toISOString().slice(2, 10).replace(/-/g, "");
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORG-${date}-${rand}`;
}

// ── Create order ──────────────────────────────────────────────────────────────

export async function createOrder(
  input: CreateOrderInput
): Promise<SupabaseOrder> {
  // Get current user (may be null for guest checkout)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const orderData = {
    order_number: generateOrderNumber(),
    user_id: user?.id || null,
    items: input.items,
    delivery: input.delivery,
    subtotal: input.subtotal,
    shipping: input.shipping,
    total: input.total,
    payment_method: input.payment_method,
    payment_status: input.payment_method === "cod" ? "pending" : "pending",
    order_status: "pending" as OrderStatus,
    notes: input.notes || null,
  };

  const { data, error } = await supabase
    .from("orders")
    .insert(orderData)
    .select()
    .single();

  if (error) {
    console.error("Error creating order:", error.message);
    throw new Error(error.message);
  }

  return data as SupabaseOrder;
}

// ── Fetch all orders (admin) ──────────────────────────────────────────────────

export async function fetchOrders(): Promise<SupabaseOrder[]> {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching orders:", error.message);
    throw new Error(error.message);
  }

  return data as SupabaseOrder[];
}

// ── Fetch single order by ID ──────────────────────────────────────────────────

export async function fetchOrderById(
  id: string
): Promise<SupabaseOrder | null> {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching order:", error.message);
    return null;
  }

  return data as SupabaseOrder;
}

// ── Fetch order by order number ───────────────────────────────────────────────

export async function fetchOrderByNumber(
  orderNumber: string
): Promise<SupabaseOrder | null> {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("order_number", orderNumber)
    .single();

  if (error) {
    console.error("Error fetching order:", error.message);
    return null;
  }

  return data as SupabaseOrder;
}

// ── Update order status (admin) ───────────────────────────────────────────────

export async function updateOrderStatus(
  id: string,
  orderStatus: OrderStatus
): Promise<SupabaseOrder> {
  const { data, error } = await supabase
    .from("orders")
    .update({ order_status: orderStatus })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating order:", error.message);
    throw new Error(error.message);
  }

  return data as SupabaseOrder;
}

// ── Update payment status (admin) ─────────────────────────────────────────────

export async function updatePaymentStatus(
  id: string,
  paymentStatus: PaymentStatus
): Promise<SupabaseOrder> {
  const { data, error } = await supabase
    .from("orders")
    .update({ payment_status: paymentStatus })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating payment:", error.message);
    throw new Error(error.message);
  }

  return data as SupabaseOrder;
}
