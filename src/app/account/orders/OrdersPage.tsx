"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag,
  ChevronDown,
  Package,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  MapPin,
  Phone,
  Mail,
  Loader2,
  ArrowRight,
} from "lucide-react";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { fetchUserOrders, type SupabaseOrder, type OrderStatus } from "@/lib/supabase-orders";
import { formatPrice } from "@/lib/utils";

const STATUS_STEPS: { key: OrderStatus; label: string; icon: React.ElementType }[] = [
  { key: "pending", label: "Pending", icon: Clock },
  { key: "processing", label: "Processing", icon: Package },
  { key: "shipped", label: "Shipped", icon: Truck },
  { key: "delivered", label: "Delivered", icon: CheckCircle },
];

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: "bg-amber-50 text-amber-700",
  processing: "bg-blue-50 text-blue-700",
  shipped: "bg-indigo-50 text-indigo-700",
  delivered: "bg-green-50 text-green-700",
  cancelled: "bg-red-50 text-red-700",
};

const STATUS_DOT: Record<OrderStatus, string> = {
  pending: "bg-amber-500",
  processing: "bg-blue-500",
  shipped: "bg-indigo-500",
  delivered: "bg-green-500",
  cancelled: "bg-red-500",
};

function StatusStepper({ status }: { status: OrderStatus }) {
  if (status === "cancelled") {
    return (
      <div className="flex items-center gap-2 mt-4 px-3 py-2 rounded-lg bg-red-50">
        <XCircle className="h-4 w-4 text-red-500" />
        <span className="text-sm font-medium text-red-700">Order Cancelled</span>
      </div>
    );
  }

  const currentIndex = STATUS_STEPS.findIndex((s) => s.key === status);

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between">
        {STATUS_STEPS.map((step, idx) => {
          const isCompleted = idx <= currentIndex;
          const Icon = step.icon;
          return (
            <div key={step.key} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                    isCompleted
                      ? "bg-fresh-green text-white"
                      : "bg-soft-stone/50 text-mid-gray"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <span
                  className={`text-[10px] mt-1.5 font-medium ${
                    isCompleted ? "text-fresh-green" : "text-mid-gray"
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {idx < STATUS_STEPS.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-2 mb-5 ${
                    idx < currentIndex ? "bg-fresh-green" : "bg-soft-stone/50"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function OrdersPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [orders, setOrders] = useState<SupabaseOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    if (!user) return;
    try {
      const data = await fetchUserOrders(user.id);
      setOrders(data);
    } catch (err) {
      console.error("Failed to load orders:", err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }
    if (user) loadOrders();
  }, [user, authLoading, router, loadOrders]);

  if (authLoading || (!user && !orders.length)) {
    return (
      <div className="min-h-screen bg-warm-cream pt-18 flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-fresh-green animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm-cream pt-18">
      <Container className="py-8 sm:py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-heading text-2xl sm:text-3xl text-deep-forest mb-1">
            My Orders
          </h1>
          <p className="text-sm text-mid-gray mb-8">
            Track and manage your order history
          </p>

          {isLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-8 w-8 text-fresh-green animate-spin" />
            </div>
          ) : orders.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <ShoppingBag className="h-14 w-14 text-soft-stone mx-auto mb-4" />
              <h2 className="font-heading text-xl text-deep-forest mb-2">
                No orders yet
              </h2>
              <p className="text-sm text-mid-gray mb-6">
                Start shopping to see your orders here.
              </p>
              <Link href="/shop">
                <Button className="gap-2">
                  Start Shopping
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {orders.map((order, idx) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white rounded-xl border border-soft-stone/50 shadow-sm overflow-hidden"
                >
                  {/* Order card header */}
                  <button
                    onClick={() =>
                      setExpandedId(expandedId === order.id ? null : order.id)
                    }
                    className="w-full text-left p-5 hover:bg-soft-stone/10 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-deep-forest font-mono">
                          {order.order_number}
                        </p>
                        <p className="text-xs text-mid-gray mt-1">
                          {new Date(order.created_at).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                          {" · "}
                          {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-deep-forest">
                          {formatPrice(order.total)}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[order.order_status]}`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[order.order_status]}`}
                          />
                          {order.order_status.charAt(0).toUpperCase() +
                            order.order_status.slice(1)}
                        </span>
                        <ChevronDown
                          className={`h-4 w-4 text-mid-gray transition-transform ${
                            expandedId === order.id ? "rotate-180" : ""
                          }`}
                        />
                      </div>
                    </div>

                    <StatusStepper status={order.order_status} />
                  </button>

                  {/* Expanded details */}
                  <AnimatePresence>
                    {expandedId === order.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-5 border-t border-soft-stone/30 pt-4 space-y-4">
                          {/* Items */}
                          <div>
                            <h3 className="text-xs font-semibold text-mid-gray uppercase tracking-wider mb-3">
                              Items
                            </h3>
                            <div className="space-y-2">
                              {order.items.map((item, i) => (
                                <div
                                  key={i}
                                  className="flex items-center gap-3"
                                >
                                  {item.image ? (
                                    <Image
                                      src={item.image}
                                      alt={item.name}
                                      width={48}
                                      height={48}
                                      className="w-12 h-12 rounded-lg object-cover bg-soft-stone/30"
                                    />
                                  ) : (
                                    <div className="w-12 h-12 rounded-lg bg-soft-stone/30 flex items-center justify-center">
                                      <Package className="h-5 w-5 text-mid-gray" />
                                    </div>
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-rich-black truncate">
                                      {item.name}
                                    </p>
                                    <p className="text-xs text-mid-gray">
                                      {item.size} × {item.quantity}
                                    </p>
                                  </div>
                                  <p className="text-sm font-semibold text-rich-black">
                                    {formatPrice(item.price * item.quantity)}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Price breakdown */}
                          <div className="bg-warm-cream rounded-lg p-3 space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span className="text-mid-gray">Subtotal</span>
                              <span>{formatPrice(order.subtotal)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-mid-gray">Shipping</span>
                              <span>
                                {order.shipping === 0
                                  ? "FREE"
                                  : formatPrice(order.shipping)}
                              </span>
                            </div>
                            {order.discount > 0 && (
                              <div className="flex justify-between text-fresh-green">
                                <span>
                                  Discount
                                  {order.coupon_code
                                    ? ` (${order.coupon_code})`
                                    : ""}
                                </span>
                                <span>−{formatPrice(order.discount)}</span>
                              </div>
                            )}
                            <div className="flex justify-between font-semibold text-deep-forest pt-1 border-t border-soft-stone/40">
                              <span>Total</span>
                              <span>{formatPrice(order.total)}</span>
                            </div>
                          </div>

                          {/* Delivery address */}
                          <div>
                            <h3 className="text-xs font-semibold text-mid-gray uppercase tracking-wider mb-2">
                              Delivery
                            </h3>
                            <div className="text-sm text-mid-gray space-y-1">
                              <p className="font-medium text-rich-black">
                                {order.delivery.fullName}
                              </p>
                              <p className="flex items-center gap-1.5">
                                <MapPin className="h-3.5 w-3.5 shrink-0" />
                                {order.delivery.address},{" "}
                                {order.delivery.city},{" "}
                                {order.delivery.state} –{" "}
                                {order.delivery.pincode}
                              </p>
                              <p className="flex items-center gap-1.5">
                                <Phone className="h-3.5 w-3.5 shrink-0" />
                                +91 {order.delivery.phone}
                              </p>
                              <p className="flex items-center gap-1.5">
                                <Mail className="h-3.5 w-3.5 shrink-0" />
                                {order.delivery.email}
                              </p>
                            </div>
                          </div>

                          {/* Payment */}
                          <div className="flex items-center gap-4 text-xs text-mid-gray">
                            <span>
                              Payment:{" "}
                              {order.payment_method === "cod"
                                ? "Cash on Delivery"
                                : "Online"}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full font-medium ${
                                order.payment_status === "paid"
                                  ? "bg-green-50 text-green-700"
                                  : order.payment_status === "failed"
                                  ? "bg-red-50 text-red-700"
                                  : "bg-amber-50 text-amber-700"
                              }`}
                            >
                              {order.payment_status.charAt(0).toUpperCase() +
                                order.payment_status.slice(1)}
                            </span>
                          </div>

                          {order.notes && (
                            <div className="text-xs text-mid-gray bg-soft-stone/20 rounded-lg p-3">
                              <span className="font-medium">Notes:</span>{" "}
                              {order.notes}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}
