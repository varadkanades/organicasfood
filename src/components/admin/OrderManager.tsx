"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  ChevronDown,
  Package,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  MapPin,
  Search,
  Loader2,
  AlertCircle,
  Check,
} from "lucide-react";
import {
  fetchOrders,
  updateOrderStatus,
  updatePaymentStatus,
  type SupabaseOrder,
  type OrderStatus,
  type PaymentStatus,
} from "@/lib/supabase-orders";
import { formatPrice } from "@/lib/utils";

const ORDER_STATUSES: OrderStatus[] = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

const PAYMENT_STATUSES: PaymentStatus[] = [
  "pending",
  "paid",
  "failed",
  "refunded",
];

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  processing: "bg-blue-50 text-blue-700 border-blue-200",
  shipped: "bg-indigo-50 text-indigo-700 border-indigo-200",
  delivered: "bg-green-50 text-green-700 border-green-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
};

const PAYMENT_COLORS: Record<PaymentStatus, string> = {
  pending: "bg-amber-50 text-amber-700",
  paid: "bg-green-50 text-green-700",
  failed: "bg-red-50 text-red-700",
  refunded: "bg-gray-50 text-gray-700",
};

const STATUS_ICONS: Record<OrderStatus, React.ElementType> = {
  pending: Clock,
  processing: Package,
  shipped: Truck,
  delivered: CheckCircle,
  cancelled: XCircle,
};

export default function OrderManager() {
  const [orders, setOrders] = useState<SupabaseOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await fetchOrders();
      setOrders(data);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to load orders";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 6000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleStatusChange = async (
    orderId: string,
    newStatus: OrderStatus
  ) => {
    setUpdatingId(orderId);
    try {
      await updateOrderStatus(orderId, newStatus);
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId ? { ...o, order_status: newStatus } : o
        )
      );
      setSuccess("Order status updated");
    } catch {
      setError("Failed to update order status");
    } finally {
      setUpdatingId(null);
    }
  };

  const handlePaymentChange = async (
    orderId: string,
    newStatus: PaymentStatus
  ) => {
    setUpdatingId(orderId);
    try {
      await updatePaymentStatus(orderId, newStatus);
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId ? { ...o, payment_status: newStatus } : o
        )
      );
      setSuccess("Payment status updated");
    } catch {
      setError("Failed to update payment status");
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = orders.filter((o) => {
    const matchesSearch =
      !searchQuery ||
      o.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.delivery.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.delivery.phone.includes(searchQuery);
    const matchesStatus =
      statusFilter === "all" || o.order_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 text-fresh-green animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* Messages */}
      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
          <Check className="h-4 w-4 shrink-0" />
          {success}
        </div>
      )}

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-mid-gray" />
          <input
            type="text"
            placeholder="Search by order #, name, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-lg border border-soft-stone text-sm text-rich-black placeholder:text-mid-gray/50 focus:outline-none focus:ring-2 focus:ring-fresh-green/40 focus:border-fresh-green bg-white"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value as OrderStatus | "all")
          }
          className="h-10 px-3 rounded-lg border border-soft-stone text-sm text-rich-black bg-white focus:outline-none focus:ring-2 focus:ring-fresh-green/40"
        >
          <option value="all">All Statuses</option>
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Summary */}
      <p className="text-xs text-mid-gray mb-4">
        {filtered.length} order{filtered.length !== 1 ? "s" : ""}
        {statusFilter !== "all" ? ` · ${statusFilter}` : ""}
      </p>

      {/* Order list */}
      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <Package className="h-10 w-10 text-soft-stone mx-auto mb-3" />
          <p className="text-sm text-mid-gray">No orders found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((order) => {
            const isExpanded = expandedId === order.id;
            const StatusIcon = STATUS_ICONS[order.order_status];

            return (
              <div
                key={order.id}
                className="bg-white rounded-xl border border-soft-stone/50 shadow-sm overflow-hidden"
              >
                {/* Row header */}
                <button
                  onClick={() =>
                    setExpandedId(isExpanded ? null : order.id)
                  }
                  className="w-full text-left p-4 hover:bg-soft-stone/10 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-wrap">
                    <StatusIcon
                      className={`h-5 w-5 shrink-0 ${
                        order.order_status === "delivered"
                          ? "text-green-600"
                          : order.order_status === "cancelled"
                          ? "text-red-500"
                          : "text-mid-gray"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-deep-forest font-mono">
                          {order.order_number}
                        </span>
                        <span className="text-xs text-mid-gray">
                          {order.delivery.fullName}
                        </span>
                      </div>
                      <p className="text-xs text-mid-gray mt-0.5">
                        {new Date(order.created_at).toLocaleDateString(
                          "en-IN",
                          {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-deep-forest">
                      {formatPrice(order.total)}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[order.order_status]}`}
                    >
                      {order.order_status.charAt(0).toUpperCase() +
                        order.order_status.slice(1)}
                    </span>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${PAYMENT_COLORS[order.payment_status]}`}
                    >
                      {order.payment_status.charAt(0).toUpperCase() +
                        order.payment_status.slice(1)}
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 text-mid-gray transition-transform ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                </button>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-soft-stone/30 pt-4 space-y-4">
                    {/* Status controls */}
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="flex-1">
                        <label className="text-xs font-medium text-mid-gray mb-1 block">
                          Order Status
                        </label>
                        <select
                          value={order.order_status}
                          onChange={(e) =>
                            handleStatusChange(
                              order.id,
                              e.target.value as OrderStatus
                            )
                          }
                          disabled={updatingId === order.id}
                          className="w-full h-9 px-3 rounded-lg border border-soft-stone text-sm bg-white focus:outline-none focus:ring-2 focus:ring-fresh-green/40 disabled:opacity-50"
                        >
                          {ORDER_STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {s.charAt(0).toUpperCase() + s.slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex-1">
                        <label className="text-xs font-medium text-mid-gray mb-1 block">
                          Payment Status
                        </label>
                        <select
                          value={order.payment_status}
                          onChange={(e) =>
                            handlePaymentChange(
                              order.id,
                              e.target.value as PaymentStatus
                            )
                          }
                          disabled={updatingId === order.id}
                          className="w-full h-9 px-3 rounded-lg border border-soft-stone text-sm bg-white focus:outline-none focus:ring-2 focus:ring-fresh-green/40 disabled:opacity-50"
                        >
                          {PAYMENT_STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {s.charAt(0).toUpperCase() + s.slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Items */}
                    <div>
                      <h3 className="text-xs font-semibold text-mid-gray uppercase tracking-wider mb-3">
                        Items ({order.items.length})
                      </h3>
                      <div className="space-y-2">
                        {order.items.map((item, i) => (
                          <div key={i} className="flex items-center gap-3">
                            {item.image ? (
                              <Image
                                src={item.image}
                                alt={item.name}
                                width={40}
                                height={40}
                                className="w-10 h-10 rounded-lg object-cover bg-soft-stone/30"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-soft-stone/30 flex items-center justify-center">
                                <Package className="h-4 w-4 text-mid-gray" />
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

                    {/* Price summary */}
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

                    {/* Delivery */}
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
                          {order.delivery.address}, {order.delivery.city},{" "}
                          {order.delivery.state} – {order.delivery.pincode}
                        </p>
                        <p>Phone: +91 {order.delivery.phone}</p>
                        <p>Email: {order.delivery.email}</p>
                      </div>
                    </div>

                    {/* Payment method */}
                    <p className="text-xs text-mid-gray">
                      Payment method:{" "}
                      {order.payment_method === "cod"
                        ? "Cash on Delivery"
                        : "Online (Razorpay)"}
                    </p>

                    {order.notes && (
                      <div className="text-xs text-mid-gray bg-soft-stone/20 rounded-lg p-3">
                        <span className="font-medium">Notes:</span>{" "}
                        {order.notes}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
