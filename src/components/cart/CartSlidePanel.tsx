"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";
import CartItemRow from "@/components/cart/CartItem";
import CartSummary from "@/components/cart/CartSummary";
import Link from "next/link";

export default function CartSlidePanel() {
  const { items, isOpen, closeCart, totalItems, clearCart } = useCart();

  // Prevent body scroll when panel is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-rich-black/30 backdrop-blur-sm"
            onClick={closeCart}
            aria-hidden="true"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 z-50 h-full w-full max-w-md bg-warm-cream shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-warm-stone/20 bg-white">
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-5 h-5 text-deep-forest" />
                <h2 className="font-heading text-xl text-rich-black">
                  Your Cart
                </h2>
                {totalItems > 0 && (
                  <span className="bg-fresh-green/10 text-deep-forest text-xs font-semibold px-2 py-0.5 rounded-full">
                    {totalItems} {totalItems === 1 ? "item" : "items"}
                  </span>
                )}
              </div>
              <button
                onClick={closeCart}
                className="flex items-center justify-center w-10 h-10 rounded-xl text-mid-gray hover:bg-soft-stone/50 hover:text-rich-black transition-all duration-200"
                aria-label="Close cart"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items */}
            {items.length > 0 ? (
              <>
                {/* Scrollable items area */}
                <div className="flex-1 overflow-y-auto px-6 py-2 no-scrollbar">
                  {items.map((item) => (
                    <CartItemRow
                      key={`${item.productId}-${item.size}`}
                      item={item}
                    />
                  ))}

                  {/* Clear cart button */}
                  {items.length > 1 && (
                    <div className="pt-3 pb-2">
                      <button
                        onClick={clearCart}
                        className="text-xs text-mid-gray/60 hover:text-red-500 transition-colors"
                      >
                        Clear all items
                      </button>
                    </div>
                  )}
                </div>

                {/* Summary / Footer */}
                <CartSummary />
              </>
            ) : (
              /* Empty State */
              <div className="flex-1 flex flex-col items-center justify-center px-6">
                <div className="w-20 h-20 rounded-full bg-soft-stone/50 flex items-center justify-center mb-5">
                  <span className="text-4xl">🌿</span>
                </div>
                <h3 className="font-heading text-xl text-rich-black mb-2">
                  Your cart is empty
                </h3>
                <p className="text-sm text-mid-gray text-center mb-8 max-w-xs">
                  Looks like you haven&apos;t added any products yet. Browse our
                  pure, natural powders and find your favourites.
                </p>
                <Link
                  href="/shop"
                  onClick={closeCart}
                  className="inline-flex items-center justify-center h-11 px-6 bg-fresh-green text-white text-sm font-medium rounded-lg hover:bg-deep-forest transition-colors duration-200 shadow-sm"
                >
                  Browse Products
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
