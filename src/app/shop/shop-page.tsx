"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Check, ShoppingBag, Loader2 } from "lucide-react";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import { PageHeader } from "@/components/shared/PageHeader";
import {
  fetchProducts,
  type SupabaseProduct,
  getDiscountedPrice,
} from "@/lib/supabase-products";
import { PRODUCT_CATEGORIES, SORT_OPTIONS } from "@/lib/constants";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/context/CartContext";

function getDisplayPrice(product: SupabaseProduct) {
  const sizeIndex = product.sizes.length > 1 ? 1 : 0;
  const size = product.sizes[sizeIndex];
  const dp = product.discount_percent ?? 0;
  const originalPrice = size.price;
  const price = dp > 0 ? getDiscountedPrice(originalPrice, dp) : originalPrice;
  return { price, originalPrice, unit: size.weight, discountPercent: dp };
}

// ── Product card for shop grid ───────────────────────────────────────────────
function ShopProductCard({
  product,
  index,
}: {
  product: SupabaseProduct;
  index: number;
}) {
  const [visible, setVisible] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [added, setAdded] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { addItem } = useCart();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setVisible(true), index * 100);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [index]);

  const { price, originalPrice, unit, discountPercent } = getDisplayPrice(product);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      productId: product.slug,
      name: product.name,
      slug: product.slug,
      image: product.image_src,
      size: unit,
      price,
      quantity: 1,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
    >
      <div className="bg-white rounded-3xl overflow-hidden border border-warm-stone/15 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1.5 h-full flex flex-col">
        <Link href={`/shop/${product.slug}`} className="group block flex-1 flex flex-col">
          {/* Image */}
          <div className={`relative aspect-square overflow-hidden ${product.color}`}>
            {/* Badge */}
            {product.badge && (
              <div
                className="absolute top-4 left-4 z-10 px-3 py-1 rounded-full text-white text-xs font-semibold tracking-wide"
                style={{ backgroundColor: product.accent_color }}
              >
                {product.badge}
              </div>
            )}
            {/* Discount badge */}
            {discountPercent > 0 && (
              <div className="absolute top-4 right-4 z-10 px-2.5 py-1 rounded-full bg-red-500 text-white text-xs font-bold">
                {discountPercent}% OFF
              </div>
            )}

            {!imgError ? (
              <Image
                src={product.image_src}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4">
                <span className="text-6xl">{product.emoji}</span>
                <p className="text-xs text-center text-mid-gray/60">Image coming soon</p>
              </div>
            )}

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>

          {/* Content */}
          <div className="p-6 flex-1 flex flex-col">
            <p className="text-xs font-medium uppercase tracking-widest text-mid-gray mb-1">
              {product.tagline || "\u00A0"}
            </p>
            <h3 className="font-heading text-xl text-rich-black mb-2 group-hover:text-deep-forest transition-colors duration-200">
              {product.name}
            </h3>
            <p className="text-sm text-mid-gray leading-relaxed mb-4 line-clamp-2">
              {product.description || "\u00A0"}
            </p>

            {/* Price + sizes */}
            <div className="flex items-center justify-between mt-auto">
              <div>
                <span className="text-xl font-bold text-deep-forest">
                  {formatPrice(price)}
                </span>
                {discountPercent > 0 && (
                  <span className="text-sm text-mid-gray line-through ml-1.5">
                    {formatPrice(originalPrice)}
                  </span>
                )}
                <span className="text-xs text-mid-gray ml-1">/ {unit}</span>
              </div>
              <span className="text-xs text-mid-gray">
                {product.sizes.length} sizes available
              </span>
            </div>
          </div>
        </Link>

        {/* Add to Cart button — outside the Link */}
        <div className="px-6 pb-6 pt-0">
          <Button
            size="sm"
            fullWidth
            className={`gap-1.5 ${added ? "bg-fresh-green/90 hover:bg-fresh-green/90" : ""}`}
            onClick={handleAddToCart}
          >
            {added ? (
              <>
                <Check className="w-4 h-4" />
                Added to Cart
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
    </div>
  );
}

// ── Main Shop Page ───────────────────────────────────────────────────────────
export default function ShopPage() {
  const [products, setProducts] = useState<SupabaseProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");

  useEffect(() => {
    fetchProducts()
      .then(setProducts)
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  // Filter products
  const filtered =
    activeCategory === "all"
      ? products
      : products.filter((p) => p.category === activeCategory);

  // Sort products
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "price-low") {
      return getDisplayPrice(a).price - getDisplayPrice(b).price;
    }
    if (sortBy === "price-high") {
      return getDisplayPrice(b).price - getDisplayPrice(a).price;
    }
    return 0; // "newest" keeps original order
  });

  return (
    <>
      <PageHeader
        eyebrow="Our Products"
        title="Shop Pure"
        highlight="Powders"
        description="Every powder is made from a single ingredient — the vegetable itself. No fillers, no preservatives, no compromises."
      />

      <section className="py-16 md:py-20 bg-warm-cream">
        <Container>
          {/* Filter + Sort bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-12">
            {/* Category tabs */}
            <div className="flex items-center gap-2 flex-wrap">
              {PRODUCT_CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setActiveCategory(cat.value)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    activeCategory === cat.value
                      ? "bg-deep-forest text-white shadow-sm"
                      : "bg-soft-stone/50 text-mid-gray hover:bg-soft-stone hover:text-rich-black"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Sort dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-mid-gray">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white border border-warm-stone/30 rounded-lg px-3 py-2 text-sm text-rich-black focus:outline-none focus:ring-2 focus:ring-fresh-green/30 focus:border-fresh-green cursor-pointer"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Product count */}
          <p className="text-sm text-mid-gray mb-8">
            Showing{" "}
            <span className="font-medium text-rich-black">{sorted.length}</span>{" "}
            {sorted.length === 1 ? "product" : "products"}
          </p>

          {/* Product grid */}
          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-mid-gray" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {sorted.map((product, i) => (
                <ShopProductCard key={product.slug} product={product} index={i} />
              ))}
            </div>
          )}

          {/* Empty state */}
          {!isLoading && sorted.length === 0 && (
            <div className="text-center py-20">
              <p className="text-6xl mb-4">🌿</p>
              <p className="text-mid-gray">
                No products found in this category.
              </p>
            </div>
          )}

          {/* Bottom trust line */}
          <p className="text-center text-xs text-mid-gray mt-16 tracking-wide">
            All products are FSSAI certified · Free from preservatives &
            artificial colours · Ships Pan-India & Internationally
          </p>
        </Container>
      </section>
    </>
  );
}
