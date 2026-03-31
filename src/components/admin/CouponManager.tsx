"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Save,
  Tag,
  Loader2,
  AlertCircle,
  Check,
  Percent,
  IndianRupee,
  ToggleLeft,
  ToggleRight,
  Users,
} from "lucide-react";
import {
  fetchCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} from "@/lib/supabase-coupons";
import type { Coupon, CouponInput } from "@/types/coupon";

// ── Types ─────────────────────────────────────────────────────────────────────

type ViewMode = "list" | "form";

interface CouponFormData {
  code: string;
  discount_type: "percentage" | "flat";
  discount_value: string;
  is_active: boolean;
  unlimited_use: boolean;
}

const EMPTY_FORM: CouponFormData = {
  code: "",
  discount_type: "percentage",
  discount_value: "",
  is_active: true,
  unlimited_use: false,
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function CouponManager() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<CouponFormData>(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // ── Load coupons ──────────────────────────────────────────────────────────

  const loadCoupons = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await fetchCoupons();
      setCoupons(data);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to load coupons";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCoupons();
  }, [loadCoupons]);

  // ── Clear messages ────────────────────────────────────────────────────────

  useEffect(() => {
    if (success) {
      const t = setTimeout(() => setSuccess(null), 4000);
      return () => clearTimeout(t);
    }
  }, [success]);

  useEffect(() => {
    if (error) {
      const t = setTimeout(() => setError(null), 6000);
      return () => clearTimeout(t);
    }
  }, [error]);

  // ── Form helpers ──────────────────────────────────────────────────────────

  const openAddForm = () => {
    setFormData(EMPTY_FORM);
    setEditingId(null);
    setViewMode("form");
    setError(null);
  };

  const openEditForm = (coupon: Coupon) => {
    setFormData({
      code: coupon.code,
      discount_type: coupon.discount_type,
      discount_value: String(coupon.discount_value),
      is_active: coupon.is_active,
      unlimited_use: coupon.unlimited_use,
    });
    setEditingId(coupon.id);
    setViewMode("form");
    setError(null);
  };

  const cancelForm = () => {
    setViewMode("list");
    setEditingId(null);
    setFormData(EMPTY_FORM);
    setError(null);
  };

  // ── Save ──────────────────────────────────────────────────────────────────

  const handleSave = async () => {
    if (!formData.code.trim()) {
      setError("Coupon code is required.");
      return;
    }
    const discountVal = parseFloat(formData.discount_value);
    if (!discountVal || discountVal <= 0) {
      setError("Discount value must be greater than 0.");
      return;
    }
    if (formData.discount_type === "percentage" && discountVal > 100) {
      setError("Percentage discount cannot exceed 100%.");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const input: CouponInput = {
        code: formData.code,
        discount_type: formData.discount_type,
        discount_value: discountVal,
        is_active: formData.is_active,
        unlimited_use: formData.unlimited_use,
      };

      if (editingId) {
        await updateCoupon(editingId, input);
        setSuccess(`Coupon "${formData.code.toUpperCase()}" updated.`);
      } else {
        await createCoupon(input);
        setSuccess(`Coupon "${formData.code.toUpperCase()}" created.`);
      }

      await loadCoupons();
      cancelForm();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to save coupon";
      setError(message);
    } finally {
      setIsSaving(false);
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────────

  const handleDelete = async (id: string) => {
    setIsDeletingId(id);
    setError(null);

    try {
      const coupon = coupons.find((c) => c.id === id);
      await deleteCoupon(id);
      setSuccess(`Coupon "${coupon?.code}" deleted.`);
      setDeleteConfirmId(null);
      await loadCoupons();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to delete coupon";
      setError(message);
    } finally {
      setIsDeletingId(null);
    }
  };

  // ── Toggle active ─────────────────────────────────────────────────────────

  const toggleActive = async (coupon: Coupon) => {
    if (togglingId) return;
    setTogglingId(coupon.id);
    try {
      await updateCoupon(coupon.id, { is_active: !coupon.is_active });
      await loadCoupons();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to update coupon";
      setError(message);
    } finally {
      setTogglingId(null);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div>
      {/* Top action bar */}
      {viewMode === "list" && (
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-mid-gray">
            {coupons.length} coupon{coupons.length !== 1 ? "s" : ""}
          </p>
          <button
            onClick={openAddForm}
            className="flex items-center gap-2 h-10 px-5 rounded-lg bg-fresh-green text-white text-sm font-medium hover:bg-deep-forest transition-colors shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Add Coupon
          </button>
        </div>
      )}

      {/* Messages */}
      {error && (
        <div className="mb-6 flex items-start gap-3 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <p>{error}</p>
          <button onClick={() => setError(null)} className="ml-auto shrink-0">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      {success && (
        <div className="mb-6 flex items-start gap-3 p-4 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">
          <Check className="h-5 w-5 shrink-0 mt-0.5" />
          <p>{success}</p>
          <button
            onClick={() => setSuccess(null)}
            className="ml-auto shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* ── LIST VIEW ──────────────────────────────────────────────────────── */}
      {viewMode === "list" && (
        <>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="h-8 w-8 text-fresh-green animate-spin" />
              <p className="text-sm text-mid-gray">Loading coupons...</p>
            </div>
          ) : coupons.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Tag className="h-12 w-12 text-soft-stone" />
              <p className="text-mid-gray">No coupons yet.</p>
              <button
                onClick={openAddForm}
                className="flex items-center gap-2 h-10 px-5 rounded-lg bg-fresh-green text-white text-sm font-medium hover:bg-deep-forest transition-colors"
              >
                <Plus className="h-4 w-4" />
                Create your first coupon
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {coupons.map((coupon) => (
                <div
                  key={coupon.id}
                  className="bg-white rounded-xl border border-soft-stone/60 p-5 hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-center justify-between gap-4">
                    {/* Left: coupon info */}
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-fresh-green/10">
                        {coupon.discount_type === "percentage" ? (
                          <Percent className="h-5 w-5 text-fresh-green" />
                        ) : (
                          <IndianRupee className="h-5 w-5 text-fresh-green" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-rich-black text-base tracking-wide">
                            {coupon.code}
                          </span>
                          {!coupon.is_active && (
                            <span className="inline-flex px-2 py-0.5 rounded-full bg-red-50 border border-red-200 text-red-600 text-[10px] font-semibold uppercase tracking-wider">
                              Inactive
                            </span>
                          )}
                          {coupon.unlimited_use && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-600 text-[10px] font-semibold uppercase tracking-wider">
                              <Users className="h-3 w-3" />
                              Unlimited
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-mid-gray mt-0.5">
                          {coupon.discount_type === "percentage"
                            ? `${coupon.discount_value}% off`
                            : `₹${coupon.discount_value} off`}
                        </p>
                      </div>
                    </div>

                    {/* Right: actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      {/* Toggle active */}
                      <button
                        onClick={() => toggleActive(coupon)}
                        disabled={togglingId === coupon.id}
                        className="p-2 rounded-lg hover:bg-soft-stone/50 transition-colors disabled:opacity-50"
                        title={
                          coupon.is_active
                            ? "Deactivate coupon"
                            : "Activate coupon"
                        }
                      >
                        {coupon.is_active ? (
                          <ToggleRight className="h-5 w-5 text-fresh-green" />
                        ) : (
                          <ToggleLeft className="h-5 w-5 text-mid-gray" />
                        )}
                      </button>
                      {/* Edit */}
                      <button
                        onClick={() => openEditForm(coupon)}
                        className="p-2 rounded-lg hover:bg-soft-stone/50 transition-colors"
                        title="Edit coupon"
                      >
                        <Pencil className="h-4 w-4 text-mid-gray" />
                      </button>
                      {/* Delete */}
                      {deleteConfirmId === coupon.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleDelete(coupon.id)}
                            disabled={isDeletingId === coupon.id}
                            className="px-3 py-1.5 rounded-lg bg-red-500 text-white text-xs font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
                          >
                            {isDeletingId === coupon.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              "Delete"
                            )}
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(null)}
                            className="p-1.5 rounded-lg hover:bg-soft-stone/50 transition-colors"
                          >
                            <X className="h-4 w-4 text-mid-gray" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirmId(coupon.id)}
                          className="p-2 rounded-lg hover:bg-red-50 transition-colors"
                          title="Delete coupon"
                        >
                          <Trash2 className="h-4 w-4 text-red-400" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── FORM VIEW ──────────────────────────────────────────────────────── */}
      {viewMode === "form" && (
        <div className="bg-white rounded-xl border border-soft-stone/60 p-6 sm:p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-heading text-xl text-rich-black">
              {editingId ? "Edit Coupon" : "Create Coupon"}
            </h3>
            <button
              onClick={cancelForm}
              className="p-2 rounded-lg hover:bg-soft-stone/50 transition-colors"
            >
              <X className="h-5 w-5 text-mid-gray" />
            </button>
          </div>

          <div className="space-y-6 max-w-lg">
            {/* Coupon Code */}
            <div>
              <label className="block text-xs font-semibold text-rich-black/70 uppercase tracking-wider mb-2">
                Coupon Code
              </label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    code: e.target.value.toUpperCase(),
                  }))
                }
                placeholder="e.g. DIWALI30"
                className="w-full h-11 px-4 rounded-lg bg-white border-2 border-soft-stone/80 text-sm font-mono text-rich-black placeholder:text-mid-gray/40 focus:border-fresh-green/50 outline-none transition-colors tracking-wider"
              />
            </div>

            {/* Discount Type */}
            <div>
              <label className="block text-xs font-semibold text-rich-black/70 uppercase tracking-wider mb-2">
                Discount Type
              </label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      discount_type: "percentage",
                    }))
                  }
                  className={`flex items-center gap-2 h-11 px-5 rounded-lg border-2 text-sm font-medium transition-all ${
                    formData.discount_type === "percentage"
                      ? "border-fresh-green bg-fresh-green/5 text-fresh-green"
                      : "border-soft-stone/80 text-mid-gray hover:border-sage-green/40"
                  }`}
                >
                  <Percent className="h-4 w-4" />
                  Percentage
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      discount_type: "flat",
                    }))
                  }
                  className={`flex items-center gap-2 h-11 px-5 rounded-lg border-2 text-sm font-medium transition-all ${
                    formData.discount_type === "flat"
                      ? "border-fresh-green bg-fresh-green/5 text-fresh-green"
                      : "border-soft-stone/80 text-mid-gray hover:border-sage-green/40"
                  }`}
                >
                  <IndianRupee className="h-4 w-4" />
                  Flat Amount
                </button>
              </div>
            </div>

            {/* Discount Value */}
            <div>
              <label className="block text-xs font-semibold text-rich-black/70 uppercase tracking-wider mb-2">
                Discount Value
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-mid-gray/60">
                  {formData.discount_type === "percentage" ? "%" : "₹"}
                </span>
                <input
                  type="number"
                  value={formData.discount_value}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      discount_value: e.target.value,
                    }))
                  }
                  placeholder={
                    formData.discount_type === "percentage" ? "30" : "50"
                  }
                  min="0"
                  max={formData.discount_type === "percentage" ? "100" : undefined}
                  className="w-full h-11 pl-10 pr-4 rounded-lg bg-white border-2 border-soft-stone/80 text-sm text-rich-black placeholder:text-mid-gray/40 focus:border-fresh-green/50 outline-none transition-colors"
                />
              </div>
              <p className="mt-1.5 text-xs text-mid-gray/60">
                {formData.discount_type === "percentage"
                  ? `Customers will get ${formData.discount_value || "0"}% off their order`
                  : `Customers will get ₹${formData.discount_value || "0"} off their order`}
              </p>
            </div>

            {/* Toggles */}
            <div className="space-y-4 pt-2">
              {/* Active toggle */}
              <label className="flex items-center justify-between cursor-pointer group">
                <div>
                  <span className="text-sm font-medium text-rich-black">
                    Active
                  </span>
                  <p className="text-xs text-mid-gray mt-0.5">
                    Customers can use this coupon at checkout
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      is_active: !prev.is_active,
                    }))
                  }
                  className="shrink-0"
                >
                  {formData.is_active ? (
                    <ToggleRight className="h-7 w-7 text-fresh-green" />
                  ) : (
                    <ToggleLeft className="h-7 w-7 text-mid-gray" />
                  )}
                </button>
              </label>

              {/* Unlimited use toggle */}
              <label className="flex items-center justify-between cursor-pointer group">
                <div>
                  <span className="text-sm font-medium text-rich-black">
                    Unlimited Use (Festival Mode)
                  </span>
                  <p className="text-xs text-mid-gray mt-0.5">
                    Allow each customer to use this coupon multiple times
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      unlimited_use: !prev.unlimited_use,
                    }))
                  }
                  className="shrink-0"
                >
                  {formData.unlimited_use ? (
                    <ToggleRight className="h-7 w-7 text-fresh-green" />
                  ) : (
                    <ToggleLeft className="h-7 w-7 text-mid-gray" />
                  )}
                </button>
              </label>
            </div>

            {/* Save / Cancel buttons */}
            <div className="flex items-center gap-3 pt-4 border-t border-soft-stone/60">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 h-11 px-6 rounded-lg bg-fresh-green text-white text-sm font-medium hover:bg-deep-forest transition-colors disabled:opacity-50"
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {editingId ? "Update Coupon" : "Create Coupon"}
              </button>
              <button
                onClick={cancelForm}
                className="h-11 px-6 rounded-lg border-2 border-soft-stone/80 text-sm font-medium text-mid-gray hover:border-rich-black/30 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
