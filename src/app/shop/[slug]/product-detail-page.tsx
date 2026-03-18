"use client";

import { useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Check, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import {
  getProductBySlug,
  getProductsByCategory,
  PRODUCTS,
  type Product,
  type ProductSize,
} from "@/data/products";
import {
  formatPrice,
  getWhatsAppUrl,
  getWhatsAppOrderMessage,
} from "@/lib/utils";
import { WHATSAPP_NUMBER } from "@/lib/constants";

// ── Size Selector ────────────────────────────────────────────────────────────
function SizeSelector({
  sizes,
  selected,
  onSelect,
  accentColor,
}: {
  sizes: ProductSize[];
  selected: number;
  onSelect: (i: number) => void;
  accentColor: string;
}) {
  return (
    <div className="flex gap-3">
      {sizes.map((size, i) => (
        <button
          key={size.weight}
          onClick={() => onSelect(i)}
          className={`relative px-5 py-3 rounded-xl border-2 transition-all duration-200 text-center min-w-[90px] ${
            selected === i
              ? "border-deep-forest bg-deep-forest/5 shadow-sm"
              : "border-warm-stone/30 hover:border-sage-green/50 bg-white"
          }`}
        >
          <span
            className={`block text-sm font-semibold ${
              selected === i ? "text-deep-forest" : "text-rich-black"
            }`}
          >
            {size.weight}
          </span>
          <span
            className={`block text-xs mt-0.5 ${
              selected === i ? "text-deep-forest" : "text-mid-gray"
            }`}
          >
            {formatPrice(size.price)}
          </span>
          {!size.inStock && (
            <span className="absolute -top-2 -right-2 bg-red-100 text-red-600 text-[10px] font-medium px-1.5 py-0.5 rounded-full">
              Out
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

// ── Info tabs (Benefits / How to Use / Ingredients) ──────────────────────────
function ProductTabs({ product }: { product: Product }) {
  const [activeTab, setActiveTab] = useState<
    "benefits" | "usage" | "ingredients"
  >("benefits");

  const tabs = [
    { id: "benefits" as const, label: "Benefits" },
    { id: "usage" as const, label: "How to Use" },
    { id: "ingredients" as const, label: "Ingredients" },
  ];

  return (
    <div>
      {/* Tab headers */}
      <div className="flex gap-1 border-b border-warm-stone/20 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-3 text-sm font-medium transition-all duration-200 border-b-2 -mb-px ${
              activeTab === tab.id
                ? "border-deep-forest text-deep-forest"
                : "border-transparent text-mid-gray hover:text-rich-black"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="min-h-[180px]">
        {activeTab === "benefits" && (
          <ul className="space-y-3">
            {product.benefits.map((benefit, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-fresh-green flex-shrink-0" />
                <span className="text-[15px] text-rich-black leading-relaxed">
                  {benefit}
                </span>
              </li>
            ))}
          </ul>
        )}

        {activeTab === "usage" && (
          <ul className="space-y-3">
            {product.usage.map((tip, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="mt-0.5 text-sm font-semibold text-sage-green flex-shrink-0 w-5">
                  {i + 1}.
                </span>
                <span className="text-[15px] text-rich-black leading-relaxed">
                  {tip}
                </span>
              </li>
            ))}
          </ul>
        )}

        {activeTab === "ingredients" && (
          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-mid-gray mb-2">
                Ingredients
              </p>
              <p className="text-[15px] text-rich-black">
                {product.ingredients}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-mid-gray mb-2">
                Shelf Life
              </p>
              <p className="text-[15px] text-rich-black">
                {product.shelfLife}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-mid-gray mb-2">
                Storage
              </p>
              <p className="text-[15px] text-rich-black">
                Store in a cool, dry place away from direct sunlight. Keep the
                container tightly sealed after each use.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Related product card ─────────────────────────────────────────────────────
function RelatedCard({ product }: { product: Product }) {
  const [imgError, setImgError] = useState(false);

  return (
    <Link href={`/shop/${product.slug}`} className="group block">
      <div className="bg-white rounded-2xl overflow-hidden border border-warm-stone/15 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1">
        <div className={`relative aspect-square ${product.color}`}>
          {!imgError ? (
            <Image
              src={product.imageSrc}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, 25vw"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-5xl">{product.emoji}</span>
            </div>
          )}
        </div>
        <div className="p-4">
          <h4 className="font-heading text-lg text-rich-black group-hover:text-deep-forest transition-colors">
            {product.name}
          </h4>
          <p className="text-sm text-mid-gray mt-1">
            From {formatPrice(product.sizes[0].price)}
          </p>
        </div>
      </div>
    </Link>
  );
}

// ── Main Product Detail Page ─────────────────────────────────────────────────
export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const product = getProductBySlug(slug);
  const { addItem } = useCart();

  const [selectedSize, setSelectedSize] = useState(
    // Default to the middle size
    product ? Math.min(1, product.sizes.length - 1) : 0
  );
  const [imgError, setImgError] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 404 if product not found
  if (!product) {
    return (
      <section className="pt-32 pb-24 bg-warm-cream min-h-screen">
        <Container className="text-center">
          <p className="text-6xl mb-6">🔍</p>
          <h1 className="font-heading text-3xl text-rich-black mb-4">
            Product Not Found
          </h1>
          <p className="text-mid-gray mb-8">
            We couldn&apos;t find the product you&apos;re looking for.
          </p>
          <Link href="/shop">
            <Button>Back to Shop</Button>
          </Link>
        </Container>
      </section>
    );
  }

  const currentSize = product.sizes[selectedSize];
  const whatsappUrl = getWhatsAppUrl(
    WHATSAPP_NUMBER,
    getWhatsAppOrderMessage(product.name, currentSize.weight)
  );

  // Related products (same category, exclude current)
  const related = PRODUCTS.filter(
    (p) => p.slug !== product.slug
  ).slice(0, 3);

  return (
    <>
      {/* ── Product Detail Section ── */}
      <section className="pt-28 md:pt-32 pb-16 md:pb-24 bg-warm-cream">
        <Container>
          {/* Breadcrumb */}
          <nav
            className={`flex items-center gap-2 text-sm mb-8 transition-all duration-500 ${
              mounted ? "opacity-100" : "opacity-0"
            }`}
          >
            <Link
              href="/"
              className="text-mid-gray hover:text-rich-black transition-colors"
            >
              Home
            </Link>
            <span className="text-warm-stone">/</span>
            <Link
              href="/shop"
              className="text-mid-gray hover:text-rich-black transition-colors"
            >
              Shop
            </Link>
            <span className="text-warm-stone">/</span>
            <span className="text-rich-black font-medium">{product.name}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            {/* ── Left: Product Image ── */}
            <div
              className={`transition-all duration-700 ease-out ${
                mounted
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 -translate-x-8"
              }`}
            >
              <div
                className={`relative aspect-square rounded-3xl overflow-hidden ${product.color} shadow-sm`}
              >
                {product.badge && (
                  <div
                    className="absolute top-5 left-5 z-10 px-3 py-1 rounded-full text-white text-xs font-semibold tracking-wide"
                    style={{ backgroundColor: product.accentColor }}
                  >
                    {product.badge}
                  </div>
                )}

                {!imgError ? (
                  <Image
                    src={product.imageSrc}
                    alt={product.name}
                    fill
                    priority
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6">
                    <span className="text-8xl">{product.emoji}</span>
                    <p className="text-sm text-center text-mid-gray/60">
                      Product image coming soon
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* ── Right: Product Info ── */}
            <div
              className={`transition-all duration-700 delay-100 ease-out ${
                mounted
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 translate-x-8"
              }`}
            >
              {/* Tagline */}
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-leaf-green mb-2">
                {product.tagline}
              </p>

              {/* Name */}
              <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl text-rich-black mb-4">
                {product.name}
              </h1>

              {/* Description */}
              <p className="text-mid-gray text-[15px] leading-relaxed mb-8 max-w-lg">
                {product.longDescription}
              </p>

              {/* Size selector */}
              <div className="mb-8">
                <p className="text-sm font-medium text-rich-black mb-3">
                  Select Size
                </p>
                <SizeSelector
                  sizes={product.sizes}
                  selected={selectedSize}
                  onSelect={setSelectedSize}
                  accentColor={product.accentColor}
                />
              </div>

              {/* Price display */}
              <div className="flex items-baseline gap-3 mb-8">
                <span className="text-3xl font-bold text-deep-forest">
                  {formatPrice(currentSize.price)}
                </span>
                <span className="text-sm text-mid-gray">
                  / {currentSize.weight}
                </span>
                {currentSize.inStock ? (
                  <span className="text-xs bg-fresh-green/10 text-deep-forest px-2.5 py-1 rounded-full font-medium">
                    In Stock
                  </span>
                ) : (
                  <span className="text-xs bg-red-50 text-red-600 px-2.5 py-1 rounded-full font-medium">
                    Out of Stock
                  </span>
                )}
              </div>

              {/* CTA buttons */}
              <div className="flex flex-col sm:flex-row gap-3 mb-10">
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
                  <Button
                    size="lg"
                    fullWidth
                    className="bg-[#25D366] hover:bg-[#20BD5A] text-white border-0 gap-2"
                    disabled={!currentSize.inStock}
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                    </svg>
                    Order on WhatsApp
                  </Button>
                </a>
                <Button
                  variant="outline"
                  size="lg"
                  className={`flex-1 gap-2 ${added ? "bg-fresh-green text-white border-fresh-green hover:bg-fresh-green hover:text-white" : ""}`}
                  disabled={!currentSize.inStock}
                  onClick={() => {
                    addItem({
                      productId: product.slug,
                      name: product.name,
                      slug: product.slug,
                      image: product.imageSrc,
                      size: currentSize.weight,
                      price: currentSize.price,
                      quantity: 1,
                    });
                    setAdded(true);
                    setTimeout(() => setAdded(false), 1500);
                  }}
                >
                  {added ? (
                    <>
                      <Check className="w-4 h-4" />
                      Added to Cart
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      Add to Cart
                    </>
                  )}
                </Button>
              </div>

              {/* Trust badges */}
              <div className="flex flex-wrap gap-3 mb-10">
                {["FSSAI Certified", "100% Natural", "No Preservatives", "Vegan"].map(
                  (badge) => (
                    <span
                      key={badge}
                      className="inline-flex items-center gap-1.5 text-xs text-mid-gray bg-soft-stone/50 px-3 py-1.5 rounded-full"
                    >
                      <span className="w-1 h-1 rounded-full bg-fresh-green" />
                      {badge}
                    </span>
                  )
                )}
              </div>

              {/* Tabs section */}
              <ProductTabs product={product} />
            </div>
          </div>
        </Container>
      </section>

      {/* ── Related Products ── */}
      {related.length > 0 && (
        <section className="py-16 md:py-20 bg-soft-stone/30 border-t border-warm-stone/15">
          <Container>
            <div className="flex items-center justify-between mb-10">
              <h2 className="font-heading text-2xl md:text-3xl text-rich-black">
                You Might Also Like
              </h2>
              <Link
                href="/shop"
                className="text-sm font-medium text-deep-forest hover:text-fresh-green transition-colors hidden sm:block"
              >
                View All →
              </Link>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
              {related.map((p) => (
                <RelatedCard key={p.slug} product={p} />
              ))}
            </div>
          </Container>
        </section>
      )}
    </>
  );
}
