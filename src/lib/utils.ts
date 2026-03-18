import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind classes safely (handles conflicts) */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format price in INR (₹249, ₹1,499) */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

/** Generate URL-safe slug from string */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .trim();
}

/** Generate WhatsApp chat URL with pre-filled message */
export function getWhatsAppUrl(phone: string, message: string): string {
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

/** Generate WhatsApp order message for a product */
export function getWhatsAppOrderMessage(
  productName: string,
  size?: string
): string {
  let message = `Hi! I'd like to order ${productName}`;
  if (size) message += ` (${size})`;
  message += ` from Organika's Food. Please share details.`;
  return message;
}
