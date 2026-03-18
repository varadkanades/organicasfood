// POST /api/razorpay/verify — Verify Razorpay payment signature
// TODO: Phase 4 — Implement signature verification
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();
  console.log("Verify payment:", body);

  // Placeholder
  return NextResponse.json({
    verified: true,
    message: "Payment verification (placeholder — Phase 4)",
  });
}
