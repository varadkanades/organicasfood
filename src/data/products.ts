// ============================================================
// Organika's Food — Product Data
// Single source of truth for all product information.
// Update products here and every page updates automatically.
// ============================================================

export interface ProductSize {
  weight: string; // e.g. "50g", "100g", "250g"
  price: number; // in INR
  inStock: boolean;
}

export interface Product {
  name: string;
  tagline: string;
  description: string;
  longDescription: string;
  slug: string;
  imageSrc: string;
  badge?: string;
  color: string; // tailwind bg class for placeholder
  accentColor: string; // hex for badge + accents
  emoji: string; // fallback when image missing
  category: "vegetable" | "leaf";
  sizes: ProductSize[];
  benefits: string[];
  usage: string[];
  ingredients: string;
  shelfLife: string;
  discountPercent?: number; // 0-99, applied to all sizes
}

export const PRODUCTS: Product[] = [
  {
    name: "Beetroot Powder",
    tagline: "Rich & Earthy",
    description:
      "Vibrant, antioxidant-rich beetroot powder. Adds natural colour and iron-boost to smoothies, rotis, and gravies.",
    longDescription:
      "Our Beetroot Powder is made from handpicked, farm-fresh beetroots that are gently dehydrated at low temperatures to lock in their deep crimson colour and vital nutrients. Rich in iron, folate, and antioxidants, this versatile powder is perfect for adding natural colour and nutrition to your everyday cooking — from smoothies and rotis to gravies and face packs. No preservatives, no artificial colours — just 100% pure beetroot.",
    slug: "beetroot-powder",
    imageSrc: "/images/products/beetroot-powder.jpg",
    badge: "Bestseller",
    color: "bg-red-50",
    accentColor: "#C53030",
    emoji: "🟣",
    category: "vegetable",
    sizes: [
      { weight: "50g", price: 129, inStock: true },
      { weight: "100g", price: 199, inStock: true },
      { weight: "250g", price: 449, inStock: true },
    ],
    benefits: [
      "Rich in iron and folate",
      "Natural source of antioxidants",
      "Supports healthy blood pressure",
      "Natural food colouring alternative",
      "Can be used as a face pack for skin glow",
    ],
    usage: [
      "Add 1 tsp to smoothies or juices for a nutrition boost",
      "Mix into roti/paratha dough for natural pink colour",
      "Stir into gravies, soups, or rice for earthy flavour",
      "Use as a natural face pack mixed with curd or honey",
    ],
    ingredients: "100% Dehydrated Beetroot (Beta vulgaris)",
    shelfLife: "12 months from date of packaging",
  },
  {
    name: "Carrot Powder",
    tagline: "Sweet & Bright",
    description:
      "Sun-dried carrot powder packed with beta-carotene. Perfect for soups, baby food, and baked goods.",
    longDescription:
      "Made from sun-ripened carrots sourced directly from Maharashtra farms, our Carrot Powder retains the natural sweetness and vibrant orange colour of fresh carrots. Packed with beta-carotene, vitamin A, and dietary fibre, it's an easy way to add nutrition to soups, baby food, baked goods, and everyday meals. Gentle low-heat dehydration preserves maximum nutrients — no additives, no fillers.",
    slug: "carrot-powder",
    imageSrc: "/images/products/carrot-powder.jpg",
    color: "bg-orange-50",
    accentColor: "#C05621",
    emoji: "🥕",
    category: "vegetable",
    sizes: [
      { weight: "50g", price: 119, inStock: true },
      { weight: "100g", price: 179, inStock: true },
      { weight: "250g", price: 399, inStock: true },
    ],
    benefits: [
      "Excellent source of beta-carotene & vitamin A",
      "Supports eye health and immunity",
      "Natural sweetness — no added sugar needed",
      "High in dietary fibre",
      "Safe and nutritious for baby food",
    ],
    usage: [
      "Blend into soups and gravies for natural thickness",
      "Mix into baby food for added nutrition",
      "Add to cake or muffin batter for subtle sweetness",
      "Stir into kheer, halwa, or milkshakes",
    ],
    ingredients: "100% Dehydrated Carrot (Daucus carota)",
    shelfLife: "12 months from date of packaging",
  },
  {
    name: "Coriander Leaf Powder",
    tagline: "Fresh & Aromatic",
    description:
      "100% green coriander leaves, gently dehydrated to preserve aroma and nutrients. A kitchen essential.",
    longDescription:
      "Freshly harvested green coriander leaves, carefully cleaned and dehydrated at controlled low temperatures to preserve their signature aroma, vibrant green colour, and nutritional value. Our Coriander Leaf Powder is a convenient alternative to fresh coriander — it lasts longer, stores easily, and delivers the same authentic flavour to your dals, chutneys, and garnishes. Zero waste, zero preservatives.",
    slug: "coriander-leaf-powder",
    imageSrc: "/images/products/coriander-leaf-powder.jpg",
    badge: "Popular",
    color: "bg-green-50",
    accentColor: "#276749",
    emoji: "🌿",
    category: "leaf",
    sizes: [
      { weight: "25g", price: 89, inStock: true },
      { weight: "50g", price: 149, inStock: true },
      { weight: "100g", price: 269, inStock: true },
    ],
    benefits: [
      "Preserves fresh coriander aroma and colour",
      "Rich in vitamin C and vitamin K",
      "Aids digestion and detoxification",
      "Long shelf life vs fresh coriander",
      "Zero food waste — use only what you need",
    ],
    usage: [
      "Sprinkle over dals, curries, and rice as garnish",
      "Add to chutney for authentic coriander flavour",
      "Mix into buttermilk or raita",
      "Use in marinades and spice blends",
    ],
    ingredients: "100% Dehydrated Coriander Leaves (Coriandrum sativum)",
    shelfLife: "12 months from date of packaging",
  },
  {
    name: "Curry Leaves Powder",
    tagline: "Bold & Traditional",
    description:
      "Authentic curry leaves powder with deep, traditional flavour. Essential for South Indian cooking.",
    longDescription:
      "Made from fresh, aromatic curry leaves picked at peak flavour and gently dehydrated to retain their bold, traditional taste. Our Curry Leaves Powder is an essential for South Indian cooking — perfect for sambhar, rasam, chutneys, and tadkas. It delivers the same depth of flavour as fresh leaves but with the convenience of a powder that stores beautifully. No preservatives, no artificial flavourings.",
    slug: "curry-leaves-powder",
    imageSrc: "/images/products/curry-leaves-powder.jpg",
    color: "bg-emerald-50",
    accentColor: "#2F855A",
    emoji: "🍃",
    category: "leaf",
    sizes: [
      { weight: "25g", price: 99, inStock: true },
      { weight: "50g", price: 159, inStock: true },
      { weight: "100g", price: 289, inStock: true },
    ],
    benefits: [
      "Strong, authentic curry leaf flavour",
      "Rich in iron and calcium",
      "Supports hair health and growth",
      "Aids digestion naturally",
      "Convenient alternative to fresh curry leaves",
    ],
    usage: [
      "Add to sambhar, rasam, and dal tadka",
      "Mix into chutney or podi (gunpowder)",
      "Sprinkle over upma, poha, or idli",
      "Use in rice preparations and spice mixes",
    ],
    ingredients: "100% Dehydrated Curry Leaves (Murraya koenigii)",
    shelfLife: "12 months from date of packaging",
  },
];

// ── Helper functions ──────────────────────────────────────────────────────────

/** Get a product by its slug */
export function getProductBySlug(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}

/** Get all product slugs (for static generation) */
export function getAllProductSlugs(): string[] {
  return PRODUCTS.map((p) => p.slug);
}

/** Get products by category */
export function getProductsByCategory(
  category: "all" | "vegetable" | "leaf"
): Product[] {
  if (category === "all") return PRODUCTS;
  return PRODUCTS.filter((p) => p.category === category);
}

/** Get default price for a product (smallest size) */
export function getDefaultPrice(product: Product): number {
  return product.sizes[0]?.price ?? 0;
}

/** Get display price for a product (the middle/main size) */
export function getDisplayPrice(product: Product): {
  price: number;
  originalPrice: number;
  unit: string;
  discountPercent: number;
} {
  // Use the second size as the "display" price, or first if only one
  const sizeIndex = product.sizes.length > 1 ? 1 : 0;
  const size = product.sizes[sizeIndex];
  const dp = product.discountPercent ?? 0;
  const originalPrice = size.price;
  const price = dp > 0 ? Math.round(originalPrice * (1 - dp / 100)) : originalPrice;
  return { price, originalPrice, unit: size.weight, discountPercent: dp };
}

/** Apply discount to a specific price */
export function applyDiscount(price: number, discountPercent: number): number {
  if (discountPercent <= 0) return price;
  return Math.round(price * (1 - discountPercent / 100));
}
