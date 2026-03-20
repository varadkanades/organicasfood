"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle,
  Package,
  MapPin,
  Phone,
  Mail,
  Truck,
  ArrowRight,
  Copy,
  Check,
  Loader2,
} from "lucide-react";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import { formatPrice, getWhatsAppUrl } from "@/lib/utils";
import { WHATSAPP_NUMBER, SITE_NAME } from "@/lib/constants";
import {
  fetchOrderByNumber,
  type SupabaseOrder,
} from "@/lib/supabase-orders";

export default function OrderConfirmation() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("order");

  const [order, setOrder] = useState<SupabaseOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadOrder() {
      if (!orderNumber) {
        setError("No order number found.");
        setIsLoading(false);
        return;
      }

      try {
        const data = await fetchOrderByNumber(orderNumber);
        if (!data) {
          setError("Order not found.");
        } else {
          setOrder(data);
        }
      } catch {
        setError("Failed to load order details.");
      } finally {
        setIsLoading(false);
      }
    }

    loadOrder();
  }, [orderNumber]);

  const copyOrderNumber = () => {
    if (order?.order_number) {
      navigator.clipboard.writeText(order.order_number);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-warm-cream pt-18 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 text-fresh-green animate-spin" />
          <p className="text-sm text-mid-gray">Loading order details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !order) {
    return (
      <div className="min-h-screen bg-warm-cream pt-18">
        <Container className="py-16">
          <div className="max-w-md mx-auto text-center">
            <Package className="h-12 w-12 text-mid-gray mx-auto mb-4" />
            <h1 className="font-heading text-2xl text-rich-black mb-3">
              {error || "Order not found"}
            </h1>
            <p className="text-sm text-mid-gray mb-8">
              Please check your order number and try again.
            </p>
            <Link href="/shop">
              <Button>Browse Products</Button>
            </Link>
          </div>
        </Container>
      </div>
    );
  }

  // WhatsApp message for order tracking
  const whatsappMessage = `Hi! I just placed order ${order.order_number} on ${SITE_NAME}. My name is ${order.delivery.fullName}. Please confirm my order.`;
  const whatsappUrl = getWhatsAppUrl(WHATSAPP_NUMBER, whatsappMessage);

  return (
    <div className="min-h-screen bg-warm-cream pt-18">
      <Container className="py-8 sm:py-12">
        <div className="max-w-2xl mx-auto">
          {/* ── Success header ────────────────────────────────────────── */}
          <div className="text-center mb-10">
            <div className="w-16 h-16 rounded-full bg-fresh-green/10 flex items-center justify-center mx-auto mb-5">
              <CheckCircle className="h-8 w-8 text-fresh-green" />
            </div>
            <h1 className="font-heading text-2xl sm:text-3xl text-deep-forest mb-2">
              Order Placed Successfully!
            </h1>
            <p className="text-mid-gray text-sm">
              Thank you for your order. We&apos;ll start processing it right away.
            </p>
          </div>

          {/* ── Order number ──────────────────────────────────────────── */}
          <div className="bg-white rounded-xl border border-soft-stone/60 p-5 sm:p-6 shadow-sm mb-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <p className="text-xs font-semibold text-mid-gray uppercase tracking-wider mb-1">
                  Order Number
                </p>
                <p className="text-lg font-bold text-deep-forest font-mono">
                  {order.order_number}
                </p>
              </div>
              <button
                onClick={copyOrderNumber}
                className="flex items-center gap-1.5 h-9 px-3 rounded-lg text-xs font-medium text-mid-gray border border-soft-stone hover:bg-soft-stone/30 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-fresh-green" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    Copy
                  </>
                )}
              </button>
            </div>
            <div className="flex items-center gap-4 mt-4 text-xs text-mid-gray">
              <span>
                Placed:{" "}
                {new Date(order.created_at).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                {order.order_status.charAt(0).toUpperCase() +
                  order.order_status.slice(1)}
              </span>
            </div>
          </div>

          {/* ── Items ─────────────────────────────────────────────────── */}
          <div className="bg-white rounded-xl border border-soft-stone/60 p-5 sm:p-6 shadow-sm mb-6">
            <h2 className="text-xs font-semibold text-mid-gray uppercase tracking-wider mb-4">
              Items Ordered
            </h2>
            <div className="space-y-3">
              {order.items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between gap-3 py-2 border-b border-soft-stone/20 last:border-0"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-rich-black">
                      {item.name}
                    </p>
                    <p className="text-xs text-mid-gray">
                      {item.size} × {item.quantity}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-rich-black shrink-0">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>

            <div className="h-px bg-soft-stone/40 my-4" />

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-mid-gray">Subtotal</span>
                <span className="text-rich-black">
                  {formatPrice(order.subtotal)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-mid-gray">Shipping</span>
                <span
                  className={
                    order.shipping === 0 ? "text-fresh-green font-medium" : "text-rich-black"
                  }
                >
                  {order.shipping === 0 ? "FREE" : formatPrice(order.shipping)}
                </span>
              </div>
              <div className="h-px bg-soft-stone/40 my-2" />
              <div className="flex justify-between">
                <span className="font-semibold text-rich-black">Total</span>
                <span className="text-lg font-bold text-deep-forest">
                  {formatPrice(order.total)}
                </span>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2 text-xs text-mid-gray bg-warm-cream rounded-lg px-3 py-2">
              <Truck className="h-4 w-4 shrink-0" />
              <span>Payment: Cash on Delivery</span>
            </div>
          </div>

          {/* ── Delivery details ──────────────────────────────────────── */}
          <div className="bg-white rounded-xl border border-soft-stone/60 p-5 sm:p-6 shadow-sm mb-8">
            <h2 className="text-xs font-semibold text-mid-gray uppercase tracking-wider mb-4">
              Delivery Address
            </h2>
            <div className="space-y-2 text-sm">
              <p className="font-medium text-rich-black flex items-center gap-2">
                <span>{order.delivery.fullName}</span>
              </p>
              <p className="text-mid-gray flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                {order.delivery.address}, {order.delivery.city},{" "}
                {order.delivery.state} – {order.delivery.pincode}
              </p>
              <p className="text-mid-gray flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 shrink-0" />
                +91 {order.delivery.phone}
              </p>
              <p className="text-mid-gray flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 shrink-0" />
                {order.delivery.email}
              </p>
            </div>
            {order.notes && (
              <div className="mt-4 p-3 rounded-lg bg-warm-cream text-sm text-mid-gray">
                <p className="text-xs font-medium text-mid-gray uppercase tracking-wider mb-1">
                  Notes
                </p>
                {order.notes}
              </div>
            )}
          </div>

          {/* ── Actions ───────────────────────────────────────────────── */}
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1"
            >
              <Button
                size="lg"
                fullWidth
                className="bg-[#25D366] hover:bg-[#20BD5A] text-white border-0 gap-2"
              >
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
                Confirm on WhatsApp
              </Button>
            </a>
            <Link href="/shop" className="flex-1">
              <Button variant="outline" size="lg" fullWidth className="gap-2">
                Continue Shopping
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}
