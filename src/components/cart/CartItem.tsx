"use client";

import Image from "next/image";
import { useState } from "react";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";
import type { CartItem as CartItemType } from "@/types";

interface CartItemRowProps {
  item: CartItemType;
}

export default function CartItemRow({ item }: CartItemRowProps) {
  const { removeItem, updateQuantity } = useCart();
  const [imgError, setImgError] = useState(false);

  const lineTotal = item.price * item.quantity;

  return (
    <div className="flex gap-4 py-4 border-b border-warm-stone/15 last:border-b-0 group">
      {/* Product Image */}
      <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-soft-stone/30 flex-shrink-0">
        {!imgError ? (
          <Image
            src={item.image}
            alt={item.name}
            fill
            className="object-cover"
            sizes="80px"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-3xl">🌿</span>
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h4 className="text-sm font-semibold text-rich-black leading-tight truncate">
              {item.name}
            </h4>
            <p className="text-xs text-mid-gray mt-0.5">{item.size}</p>
          </div>
          {/* Remove button */}
          <button
            onClick={() => removeItem(item.productId, item.size)}
            className="p-1.5 rounded-lg text-mid-gray/50 hover:text-red-500 hover:bg-red-50 transition-all duration-200 opacity-0 group-hover:opacity-100"
            aria-label={`Remove ${item.name}`}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Quantity + Price row */}
        <div className="flex items-center justify-between mt-3">
          {/* Quantity controls */}
          <div className="flex items-center gap-0 border border-warm-stone/30 rounded-lg overflow-hidden">
            <button
              onClick={() =>
                updateQuantity(item.productId, item.size, item.quantity - 1)
              }
              disabled={item.quantity <= 1}
              className="w-8 h-8 flex items-center justify-center text-mid-gray hover:bg-soft-stone/50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Decrease quantity"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="w-8 h-8 flex items-center justify-center text-sm font-semibold text-rich-black bg-white">
              {item.quantity}
            </span>
            <button
              onClick={() =>
                updateQuantity(item.productId, item.size, item.quantity + 1)
              }
              className="w-8 h-8 flex items-center justify-center text-mid-gray hover:bg-soft-stone/50 transition-colors"
              aria-label="Increase quantity"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>

          {/* Line total */}
          <span className="text-sm font-bold text-deep-forest">
            {formatPrice(lineTotal)}
          </span>
        </div>
      </div>
    </div>
  );
}
