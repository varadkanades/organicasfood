"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Save,
  Loader2,
  AlertCircle,
  Check,
  ToggleLeft,
  ToggleRight,
  Link as LinkIcon,
  MessageSquare,
  ArrowUpDown,
} from "lucide-react";
import {
  fetchAllBanners,
  createBanner,
  updateBanner,
  deleteBanner,
  toggleBannerActive,
  type Banner,
  type BannerInput,
} from "@/lib/supabase-banners";

type ViewMode = "list" | "form";

interface BannerFormData {
  message: string;
  link: string;
  is_active: boolean;
  sort_order: string;
}

const EMPTY_FORM: BannerFormData = {
  message: "",
  link: "",
  is_active: true,
  sort_order: "0",
};

export default function BannerManager() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<BannerFormData>(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // ── Load banners ──────────────────────────────────────────────────────────

  const loadBanners = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await fetchAllBanners();
      setBanners(data);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to load banners";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBanners();
  }, [loadBanners]);

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
  };

  const openEditForm = (banner: Banner) => {
    setFormData({
      message: banner.message,
      link: banner.link || "",
      is_active: banner.is_active,
      sort_order: String(banner.sort_order),
    });
    setEditingId(banner.id);
    setViewMode("form");
  };

  const closeForm = () => {
    setViewMode("list");
    setEditingId(null);
    setFormData(EMPTY_FORM);
  };

  // ── Save (create/update) ─────────────────────────────────────────────────

  const handleSave = async () => {
    if (!formData.message.trim()) {
      setError("Banner message is required.");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const input: BannerInput = {
        message: formData.message.trim(),
        link: formData.link.trim() || undefined,
        is_active: formData.is_active,
        sort_order: parseInt(formData.sort_order) || 0,
      };

      if (editingId) {
        await updateBanner(editingId, input);
        setSuccess("Banner updated successfully!");
      } else {
        await createBanner(input);
        setSuccess("Banner created successfully!");
      }

      closeForm();
      loadBanners();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to save banner";
      setError(message);
    } finally {
      setIsSaving(false);
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────────

  const handleDelete = async (id: string) => {
    setIsDeletingId(id);
    try {
      await deleteBanner(id);
      setSuccess("Banner deleted.");
      setDeleteConfirmId(null);
      loadBanners();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to delete banner";
      setError(message);
    } finally {
      setIsDeletingId(null);
    }
  };

  // ── Toggle active ─────────────────────────────────────────────────────────

  const handleToggle = async (banner: Banner) => {
    if (togglingId) return;
    setTogglingId(banner.id);
    try {
      await toggleBannerActive(banner.id, !banner.is_active);
      loadBanners();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to toggle banner";
      setError(message);
    } finally {
      setTogglingId(null);
    }
  };

  // ── Loading state ─────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 text-fresh-green animate-spin" />
      </div>
    );
  }

  // ── Form view ─────────────────────────────────────────────────────────────

  if (viewMode === "form") {
    return (
      <div className="max-w-xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-rich-black">
            {editingId ? "Edit Banner" : "Add Banner"}
          </h3>
          <button
            onClick={closeForm}
            className="p-2 rounded-lg text-mid-gray hover:bg-soft-stone/50 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-rich-black mb-1.5">
              Message <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <MessageSquare className="absolute left-3.5 top-3 h-4 w-4 text-mid-gray/50" />
              <textarea
                value={formData.message}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, message: e.target.value }))
                }
                placeholder="e.g. Free shipping on orders above ₹500!"
                rows={2}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-soft-stone bg-white text-sm text-rich-black placeholder:text-mid-gray/50 focus:outline-none focus:ring-2 focus:ring-fresh-green/40 focus:border-fresh-green transition-colors resize-none"
              />
            </div>
          </div>

          {/* Link (optional) */}
          <div>
            <label className="block text-sm font-medium text-rich-black mb-1.5">
              Link{" "}
              <span className="text-mid-gray font-normal">(optional)</span>
            </label>
            <div className="relative">
              <LinkIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-mid-gray/50" />
              <input
                type="url"
                value={formData.link}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, link: e.target.value }))
                }
                placeholder="e.g. /shop or https://..."
                className="w-full h-11 pl-10 pr-4 rounded-lg border border-soft-stone bg-white text-sm text-rich-black placeholder:text-mid-gray/50 focus:outline-none focus:ring-2 focus:ring-fresh-green/40 focus:border-fresh-green transition-colors"
              />
            </div>
          </div>

          {/* Sort order + Active toggle */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-rich-black mb-1.5">
                Sort Order
              </label>
              <div className="relative">
                <ArrowUpDown className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-mid-gray/50" />
                <input
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      sort_order: e.target.value,
                    }))
                  }
                  className="w-full h-11 pl-10 pr-4 rounded-lg border border-soft-stone bg-white text-sm text-rich-black focus:outline-none focus:ring-2 focus:ring-fresh-green/40 focus:border-fresh-green transition-colors"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-rich-black mb-1.5">
                Active
              </label>
              <button
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    is_active: !prev.is_active,
                  }))
                }
                className={`flex items-center gap-2 h-11 px-4 rounded-lg border transition-colors ${
                  formData.is_active
                    ? "border-fresh-green bg-fresh-green/5 text-fresh-green"
                    : "border-soft-stone bg-white text-mid-gray"
                }`}
              >
                {formData.is_active ? (
                  <ToggleRight className="h-5 w-5" />
                ) : (
                  <ToggleLeft className="h-5 w-5" />
                )}
                <span className="text-sm font-medium">
                  {formData.is_active ? "Active" : "Inactive"}
                </span>
              </button>
            </div>
          </div>

          {/* Preview */}
          {formData.message.trim() && (
            <div>
              <label className="block text-sm font-medium text-mid-gray mb-1.5">
                Preview
              </label>
              <div className="bg-fresh-green text-white text-xs sm:text-sm font-medium text-center py-2 px-4 rounded-lg">
                {formData.message}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={closeForm}
              className="flex-1 h-11 rounded-lg border border-soft-stone text-sm font-medium text-mid-gray hover:bg-soft-stone/30 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 h-11 rounded-lg bg-deep-forest text-white text-sm font-medium hover:bg-rich-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {editingId ? "Update" : "Create"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── List view ─────────────────────────────────────────────────────────────

  return (
    <div>
      {/* Messages */}
      {success && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm mb-4">
          <Check className="h-4 w-4 shrink-0" />
          {success}
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm mb-4">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Add button */}
      <div className="flex justify-end mb-4">
        <button
          onClick={openAddForm}
          className="flex items-center gap-2 h-10 px-4 rounded-lg bg-deep-forest text-white text-sm font-medium hover:bg-rich-black transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Banner
        </button>
      </div>

      {/* Banner list */}
      {banners.length === 0 ? (
        <div className="text-center py-16">
          <MessageSquare className="h-10 w-10 text-mid-gray/30 mx-auto mb-3" />
          <p className="text-sm text-mid-gray">
            No announcement banners yet.
          </p>
          <p className="text-xs text-mid-gray/60 mt-1">
            Create one to show a message across your site.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {banners.map((banner) => (
            <div
              key={banner.id}
              className={`flex items-center gap-4 p-4 rounded-xl border transition-colors ${
                banner.is_active
                  ? "bg-white border-soft-stone/60"
                  : "bg-soft-stone/20 border-soft-stone/30 opacity-60"
              }`}
            >
              {/* Active toggle */}
              <button
                onClick={() => handleToggle(banner)}
                disabled={togglingId === banner.id}
                className={`shrink-0 disabled:opacity-50 ${
                  banner.is_active ? "text-fresh-green" : "text-mid-gray/40"
                }`}
                title={banner.is_active ? "Deactivate" : "Activate"}
              >
                {banner.is_active ? (
                  <ToggleRight className="h-6 w-6" />
                ) : (
                  <ToggleLeft className="h-6 w-6" />
                )}
              </button>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-rich-black truncate">
                  {banner.message}
                </p>
                <div className="flex items-center gap-3 mt-1">
                  {banner.link && (
                    <span className="text-xs text-mid-gray/60 flex items-center gap-1">
                      <LinkIcon className="h-3 w-3" />
                      {banner.link}
                    </span>
                  )}
                  <span className="text-xs text-mid-gray/40">
                    Order: {banner.sort_order}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => openEditForm(banner)}
                  className="p-2 rounded-lg text-mid-gray hover:bg-soft-stone/50 hover:text-rich-black transition-colors"
                  title="Edit"
                >
                  <Pencil className="h-4 w-4" />
                </button>

                {deleteConfirmId === banner.id ? (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleDelete(banner.id)}
                      disabled={isDeletingId === banner.id}
                      className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                      title="Confirm delete"
                    >
                      {isDeletingId === banner.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Check className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(null)}
                      className="p-2 rounded-lg text-mid-gray hover:bg-soft-stone/50 transition-colors"
                      title="Cancel"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setDeleteConfirmId(banner.id)}
                    className="p-2 rounded-lg text-mid-gray hover:bg-red-50 hover:text-red-600 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
