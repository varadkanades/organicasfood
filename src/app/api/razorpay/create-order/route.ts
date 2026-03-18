// POST /api/razorpay/create-order — Create Razorpay order
// TODO: Phase 4 — Implement with Razorpay SDK
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();
  console.log("Create Razorpay order:", body);

  // Placeholder
  return NextResponse.json({
    orderId: "order_placeholder",
    amount: body.amount,
    currency: "INR",
    message: "Razorpay order (placeholder — Phase 4)",
  });
}
