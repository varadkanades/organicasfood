// GET /api/products — Return all products from Supabase
import { NextResponse } from "next/server";
import { fetchProducts } from "@/lib/supabase-products";

export async function GET() {
  try {
    const products = await fetchProducts();
    return NextResponse.json({ products });
  } catch {
    return NextResponse.json({ products: [] });
  }
}
