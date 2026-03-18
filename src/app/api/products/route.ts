// GET /api/products — Return all products
// TODO: Phase 5 — Connect to Payload CMS / PostgreSQL
import { NextResponse } from "next/server";
import { PRODUCTS } from "@/data/products";

export async function GET() {
  return NextResponse.json({ products: PRODUCTS });
}
