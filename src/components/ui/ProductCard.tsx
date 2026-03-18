"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Check, ShoppingBag } from "lucide-react";
import Button from "@/components/ui/Button";
import { useCart } from "@/context/CartContext";

export interface ProductCardProps {
  name: string;
  tagline: string;
  description: string;
  price: number;
  unit: string; // e.g. "100g"
  slug: string;
  imageSrc: string;
  badge?: string; // e.g. "Bestseller", "New"
  color: string; // tailwind bg class for placeholder e.g. "bg-red-50"
  accentColor: string; // for badge + hover ring e.g. "#E53E3E"
  emoji: string; // fallback emoji when image missing
}

export function ProductCard({
  name,
  tagline,
  description,
  price,
  unit,
  slug,
  imageSrc,
  badge,
  color,
  accentColor,
  emoji,
}: ProductCardProps) {
  const [hovered, setHovered] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();

  const formattedPrice = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      productId: slug,
      name,
      slug,
      image: imageSrc,
      size: unit,
      price,
      quantity: 1,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div
      className="group relative bg-white rounded-3xl overflow-hidden border border-warm-stone/15 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1.5 flex flex-col"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Badge */}
      {badge && (
        <div
          className="absolute top-4 left-4 z-10 px-3 py-1 rounded-full text-white text-xs font-semibold tracking-wide"
          style={{ backgroundColor: accentColor }}
        >
          {badge}
        </div>
      )}

      {/* Image area */}
      <div
        className={`relative aspect-square overflow-hidden ${color} transition-transform duration-500 ${
          hovered ? "scale-105" : "scale-100"
        }`}
      >
        {!imgError ? (
          <Image
            src={imageSrc}
            alt={name}
            fill
            className="object-cover transition-transform duration-500"
            onError={() => setImgError(true)}
          />
        ) : (
          /* Placeholder when image not yet added */
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4">
            <span className="text-6xl">{emoji}</span>
            <p className="text-xs text-center text-mid-gray/60">
              Add image at{" "}
              <code className="text-[10px] bg-white/70 px-1 rounded">
                public/images/products/{slug}.jpg
              </code>
            </p>
          </div>
        )}

        {/* Hover overlay gradient */}
        <div
          className={`absolute inset-0 bg-gradient-to-t from-black/20 to-transparent transition-opacity duration-300 ${
            hovered ? "opacity-100" : "opacity-0"
          }`}
        />
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <p className="text-xs font-medium uppercase tracking-widest text-mid-gray mb-1">
          {tagline}
        </p>
        <h3 className="font-heading text-xl text-rich-black mb-2 leading-tight">
          {name}
        </h3>
        <p className="text-sm text-mid-gray leading-relaxed mb-4 flex-1">
          {description}
        </p>

        {/* Price row */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-xl font-bold text-deep-forest">
              {formattedPrice}
            </span>
            <span className="text-xs text-mid-gray ml-1">/ {unit}</span>
          </div>
          <span className="text-xs bg-leaf-green/10 text-deep-forest px-2 py-1 rounded-full font-medium">
            In Stock
          </span>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Link href={`/shop/${slug}`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full">
              View Details
            </Button>
          </Link>
          <Button
            size="sm"
            className={`flex-1 gap-1.5 transition-all duration-200 ${
              added
                ? "bg-fresh-green/90 hover:bg-fresh-green/90"
                : ""
            }`}
            onClick={handleAddToCart}
          >
            {added ? (
              <>
                <Check className="w-4 h-4" />
                Added
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />
                Add to Cart
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Bottom accent line that appears on hover */}
      <div
        className="absolute bottom-0 left-0 right-0 h-0.5 transition-transform duration-300 origin-left"
        style={{
          backgroundColor: accentColor,
          transform: hovered ? "scaleX(1)" : "scaleX(0)",
        }}
      />
    </div>
  );
}
