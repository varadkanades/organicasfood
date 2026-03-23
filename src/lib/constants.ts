// ============================================================
// Organika's Food — Site Constants
// Single source of truth for all site-wide data
// ============================================================

export const SITE_NAME = "Organika's Food";
export const SITE_TAGLINE = "100% Natural";
export const SITE_DESCRIPTION =
  "Premium natural food powders — Beetroot, Carrot, Coriander & Curry Leaves. 100% vegan, preservative-free, FSSAI approved.";
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://organikasfoods.com";

export const WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "919834845240";

// Footer / Contact
export const CONTACT_EMAIL = "organikasfoods@gmail.com";
export const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "organikasfoods@gmail.com";
export const CONTACT_PHONE = "+91 98348 45240";
export const FSSAI_NUMBER = "21525043002244";

// Shipping regions
export const SHIPPING_REGIONS = ["Sangli", "Kolhapur", "Pune"] as const;

// Navigation
export const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "About Us", href: "/about" },
  { label: "Contact", href: "/contact" },
] as const;

// Trust bar
export const TRUST_ITEMS = [
  { icon: "leaf", label: "100% Natural" },
  { icon: "shield-check", label: "Zero Preservatives" },
  { icon: "badge-check", label: "FSSAI Approved" },
  { icon: "sprout", label: "Farm Fresh" },
  { icon: "hand-heart", label: "Handcrafted" },
] as const;

// Product categories
export const PRODUCT_CATEGORIES = [
  { value: "all", label: "All Products" },
  { value: "vegetable", label: "Vegetable Powders" },
  { value: "leaf", label: "Leaf Powders" },
] as const;

// Sort options
export const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
] as const;

// Product badges (shown on packaging / product pages)
export const PRODUCT_BADGES = [
  "Premium",
  "Preservative-free",
  "100% Vegan",
  "Gluten-free",
  "Natural Food Color",
  "FSSAI Approved",
] as const;
