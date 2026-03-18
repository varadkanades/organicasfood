"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";
import Button from "@/components/ui/Button";

export default function CartSummary() {
  const { totalPrice, closeCart } = useCart();

  return (
    <div className="border-t border-warm-stone/20 bg-white px-6 py-5">
      {/* Subtotal */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-mid-gray">Subtotal</span>
        <span className="text-sm font-semibold text-rich-black">
          {formatPrice(totalPrice)}
        </span>
      </div>

      {/* Shipping note */}
      <p className="text-xs text-mid-gray/70 mb-4">
        Free delivery within Sangli, Kolhapur & Pune
      </p>

      {/* Divider */}
      <div className="h-px bg-warm-stone/20 mb-4" />

      {/* Total */}
      <div className="flex items-center justify-between mb-5">
        <span className="text-base font-semibold text-rich-black">Total</span>
        <span className="text-xl font-bold text-deep-forest">
          {formatPrice(totalPrice)}
        </span>
      </div>

      {/* Checkout CTA */}
      <Link href="/checkout" onClick={closeCart}>
        <Button size="lg" fullWidth className="mb-3">
          Proceed to Checkout
        </Button>
      </Link>

      {/* Continue Shopping */}
      <button
        onClick={closeCart}
        className="w-full text-center text-sm text-mid-gray hover:text-rich-black transition-colors py-2"
      >
        Continue Shopping
      </button>
    </div>
  );
}
