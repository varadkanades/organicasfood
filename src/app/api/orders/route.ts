// POST /api/orders — Create new order
// TODO: Phase 4 — Implement order creation + database storage
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();
  console.log("New order:", body);

  // Placeholder response
  return NextResponse.json({
    success: true,
    orderId: `ORG-${Date.now()}`,
    message: "Order created (placeholder — Phase 4)",
  });
}
