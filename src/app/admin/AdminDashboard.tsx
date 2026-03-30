"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Save,
  Package,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Check,
  Loader2,
  Tag,
  ClipboardList,
  FileText,
  Upload,
  Megaphone,
} from "lucide-react";
import Container from "@/components/ui/Container";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import {
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  type SupabaseProduct,
  type SupabaseProductSize,
  type ProductInput,
} from "@/lib/supabase-products";
import CouponManager from "@/components/admin/CouponManager";
import OrderManager from "@/components/admin/OrderManager";
import PageManager from "@/components/admin/PageManager";
import BannerManager from "@/components/admin/BannerManager";
import { supabase } from "@/lib/supabase";

// ── Types ─────────────────────────────────────────────────────────────────────

type ViewMode = "list" | "form";

interface FormData {
  name: string;
  tagline: string;
  description: string;
  long_description: string;
  slug: string;
  image_src: string;
  badge: string;
  color: string;
  accent_color: string;
  emoji: string;
  category: "vegetable" | "leaf";
  sizes: SupabaseProductSize[];
  benefits: string[];
  usage: string[];
  ingredients: string;
  shelf_life: string;
  featured: boolean;
  discount_percent: number;
}

const EMPTY_FORM: FormData = {
  name: "",
  tagline: "",
  description: "",
  long_description: "",
  slug: "",
  image_src: "",
  badge: "",
  color: "bg-green-50",
  accent_color: "#4A7C2E",
  emoji: "🌿",
  category: "vegetable",
  sizes: [{ weight: "50g", price: 0, inStock: true }],
  benefits: [""],
  usage: [""],
  ingredients: "",
  shelf_life: "12 months from date of packaging",
  featured: false,
  discount_percent: 0,
};

// ── Helper: generate slug from name ───────────────────────────────────────────

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"products" | "coupons" | "orders" | "pages" | "banners">("products");
  const [products, setProducts] = useState<SupabaseProduct[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null);

  // ── Load products ───────────────────────────────────────────────────────────

  const loadProducts = useCallback(async () => {
    try {
      setIsLoadingProducts(true);
      const data = await fetchProducts();
      setProducts(data);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to load products";
      setError(message);
    } finally {
      setIsLoadingProducts(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // ── Clear messages after 4 seconds ──────────────────────────────────────────

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

  // ── Form helpers ────────────────────────────────────────────────────────────

  const openAddForm = () => {
    setFormData(EMPTY_FORM);
    setEditingProductId(null);
    setViewMode("form");
    setError(null);
  };

  const openEditForm = (product: SupabaseProduct) => {
    setFormData({
      name: product.name,
      tagline: product.tagline,
      description: product.description,
      long_description: product.long_description,
      slug: product.slug,
      image_src: product.image_src,
      badge: product.badge || "",
      color: product.color,
      accent_color: product.accent_color,
      emoji: product.emoji,
      category: product.category,
      sizes: product.sizes.length > 0 ? product.sizes : [{ weight: "50g", price: 0, inStock: true }],
      benefits: product.benefits.length > 0 ? product.benefits : [""],
      usage: product.usage.length > 0 ? product.usage : [""],
      ingredients: product.ingredients,
      shelf_life: product.shelf_life,
      featured: product.featured,
      discount_percent: product.discount_percent ?? 0,
    });
    setEditingProductId(product.id);
    setImageFile(null);
    setImagePreview(null);
    setViewMode("form");
    setError(null);
  };

  const cancelForm = () => {
    setViewMode("list");
    setEditingProductId(null);
    setFormData(EMPTY_FORM);
    setImageFile(null);
    setImagePreview(null);
    setError(null);
  };

  // ── Save (create or update) ─────────────────────────────────────────────────

  const handleSave = async () => {
    // Validation
    if (!formData.name.trim()) {
      setError("Product name is required.");
      return;
    }
    if (!formData.slug.trim()) {
      setError("Product slug is required.");
      return;
    }
    if (formData.sizes.length === 0) {
      setError("At least one size is required.");
      return;
    }
    for (const size of formData.sizes) {
      if (!size.weight.trim() || size.price <= 0) {
        setError("Each size must have a weight and a price greater than 0.");
        return;
      }
    }

    setIsSaving(true);
    setError(null);

    try {
      // Upload image if a new file was selected
      let imageSrc = formData.image_src.trim();
      if (imageFile) {
        setIsUploadingImage(true);
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) throw new Error("Not authenticated");

        const uploadForm = new window.FormData();
        uploadForm.append("file", imageFile);
        uploadForm.append("slug", formData.slug.trim());

        const res = await fetch("/api/upload/product-image", {
          method: "POST",
          headers: { Authorization: `Bearer ${session.access_token}` },
          body: uploadForm,
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.error || "Image upload failed");
        imageSrc = result.url;
        setIsUploadingImage(false);
      }

      const productInput: ProductInput = {
        name: formData.name.trim(),
        tagline: formData.tagline.trim(),
        description: formData.description.trim(),
        long_description: formData.long_description.trim(),
        slug: formData.slug.trim(),
        image_src: imageSrc,
        badge: formData.badge.trim() || null,
        color: formData.color.trim(),
        accent_color: formData.accent_color.trim(),
        emoji: formData.emoji.trim(),
        category: formData.category,
        sizes: formData.sizes,
        benefits: formData.benefits.filter((b) => b.trim() !== ""),
        usage: formData.usage.filter((u) => u.trim() !== ""),
        ingredients: formData.ingredients.trim(),
        shelf_life: formData.shelf_life.trim(),
        featured: formData.featured,
        discount_percent: formData.discount_percent,
      };

      if (editingProductId) {
        await updateProduct(editingProductId, productInput);
        setSuccess(`"${productInput.name}" updated successfully.`);
      } else {
        await createProduct(productInput);
        setSuccess(`"${productInput.name}" created successfully.`);
      }

      await loadProducts();
      cancelForm();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to save product";
      setError(message);
    } finally {
      setIsSaving(false);
    }
  };

  // ── Delete ──────────────────────────────────────────────────────────────────

  const handleDelete = async (id: string) => {
    setIsDeleting(id);
    setError(null);

    try {
      const product = products.find((p) => p.id === id);
      await deleteProduct(id);
      setSuccess(`"${product?.name}" deleted successfully.`);
      setDeleteConfirmId(null);
      await loadProducts();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to delete product";
      setError(message);
    } finally {
      setIsDeleting(null);
    }
  };

  // ── Quick stock toggle ──────────────────────────────────────────────────────

  const toggleStock = async (
    productId: string,
    sizeIndex: number,
    currentValue: boolean
  ) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    const updatedSizes = [...product.sizes];
    updatedSizes[sizeIndex] = {
      ...updatedSizes[sizeIndex],
      inStock: !currentValue,
    };

    try {
      await updateProduct(productId, { sizes: updatedSizes });
      await loadProducts();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to update stock";
      setError(message);
    }
  };

  // ── Size management in form ─────────────────────────────────────────────────

  const addSize = () => {
    setFormData((prev) => ({
      ...prev,
      sizes: [...prev.sizes, { weight: "", price: 0, inStock: true }],
    }));
  };

  const removeSize = (index: number) => {
    if (formData.sizes.length <= 1) return;
    setFormData((prev) => ({
      ...prev,
      sizes: prev.sizes.filter((_, i) => i !== index),
    }));
  };

  const updateSize = (
    index: number,
    field: keyof SupabaseProductSize,
    value: string | number | boolean
  ) => {
    setFormData((prev) => {
      const updated = [...prev.sizes];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, sizes: updated };
    });
  };

  // ── Array field helpers (benefits, usage) ───────────────────────────────────

  const addArrayItem = (field: "benefits" | "usage") => {
    setFormData((prev) => ({ ...prev, [field]: [...prev[field], ""] }));
  };

  const removeArrayItem = (field: "benefits" | "usage", index: number) => {
    if (formData[field].length <= 1) return;
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const updateArrayItem = (
    field: "benefits" | "usage",
    index: number,
    value: string
  ) => {
    setFormData((prev) => {
      const updated = [...prev[field]];
      updated[index] = value;
      return { ...prev, [field]: updated };
    });
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-warm-cream pt-18 pb-16">
      <Container>
        {/* Header bar */}
        <div className="flex items-center justify-between py-8 border-b border-soft-stone">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Link
                href="/"
                className="flex items-center gap-1 text-sm text-mid-gray hover:text-rich-black transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to site
              </Link>
            </div>
            <h1 className="font-heading text-2xl sm:text-3xl text-deep-forest">
              Admin Dashboard
            </h1>
            <p className="text-sm text-mid-gray mt-1">
              Manage products, coupons, and more
            </p>
          </div>
          {activeTab === "products" && viewMode === "list" && (
            <button
              onClick={openAddForm}
              className="flex items-center gap-2 h-11 px-5 rounded-lg bg-fresh-green text-white text-sm font-medium hover:bg-deep-forest transition-colors shadow-sm"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add Product</span>
            </button>
          )}
        </div>

        {/* Tab navigation */}
        <div className="flex gap-1 mt-6 border-b border-soft-stone">
          {([
            { key: "products" as const, label: "Products", icon: Package },
            { key: "orders" as const, label: "Orders", icon: ClipboardList },
            { key: "coupons" as const, label: "Coupons", icon: Tag },
            { key: "pages" as const, label: "Pages", icon: FileText },
            { key: "banners" as const, label: "Banners", icon: Megaphone },
          ]).map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => {
                setActiveTab(key);
                if (key === "products") cancelForm();
              }}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors -mb-px ${
                activeTab === key
                  ? "border-fresh-green text-fresh-green"
                  : "border-transparent text-mid-gray hover:text-rich-black"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

        {/* ── PRODUCTS TAB ── */}
        {activeTab === "products" && (<>
        {/* Messages */}
        {error && (
          <div className="mt-6 flex items-start gap-3 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <p>{error}</p>
            <button
              onClick={() => setError(null)}
              className="ml-auto shrink-0"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
        {success && (
          <div className="mt-6 flex items-start gap-3 p-4 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">
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

        {/* ── LIST VIEW ──────────────────────────────────────────────────── */}
        {viewMode === "list" && (
          <div className="mt-8">
            {isLoadingProducts ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Loader2 className="h-8 w-8 text-fresh-green animate-spin" />
                <p className="text-sm text-mid-gray">Loading products...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Package className="h-12 w-12 text-soft-stone" />
                <p className="text-mid-gray">No products yet.</p>
                <button
                  onClick={openAddForm}
                  className="flex items-center gap-2 h-10 px-5 rounded-lg bg-fresh-green text-white text-sm font-medium hover:bg-deep-forest transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Add your first product
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="bg-white rounded-xl border border-soft-stone/60 overflow-hidden shadow-sm"
                  >
                    {/* Product row */}
                    <div className="flex items-center gap-4 p-4 sm:p-5">
                      {/* Emoji/image */}
                      <div
                        className={cn(
                          "flex h-12 w-12 shrink-0 items-center justify-center rounded-lg text-2xl",
                          product.color
                        )}
                      >
                        {product.emoji}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-heading text-lg text-rich-black truncate">
                            {product.name}
                          </h3>
                          {product.badge && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-fresh-green/10 text-fresh-green">
                              {product.badge}
                            </span>
                          )}
                          {product.featured && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-earthy-brown/10 text-earthy-brown">
                              Featured
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-mid-gray mt-0.5">
                          {product.tagline} · {product.category} ·{" "}
                          {product.sizes.length} size
                          {product.sizes.length !== 1 ? "s" : ""}
                        </p>
                      </div>

                      {/* Prices summary */}
                      <div className="hidden sm:block text-right shrink-0">
                        <p className="text-sm font-semibold text-rich-black">
                          ₹{product.sizes[0]?.price ?? 0}
                          {product.sizes.length > 1 && (
                            <span className="text-mid-gray font-normal">
                              {" "}
                              – ₹
                              {product.sizes[product.sizes.length - 1]?.price ??
                                0}
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-mid-gray mt-0.5">
                          {product.sizes[0]?.weight}
                          {product.sizes.length > 1 &&
                            ` – ${product.sizes[product.sizes.length - 1]?.weight}`}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() =>
                            setExpandedProduct(
                              expandedProduct === product.id
                                ? null
                                : product.id
                            )
                          }
                          className="flex h-9 w-9 items-center justify-center rounded-lg text-mid-gray hover:bg-soft-stone/60 hover:text-rich-black transition-colors"
                          title="View details"
                        >
                          {expandedProduct === product.id ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          onClick={() => openEditForm(product)}
                          className="flex h-9 w-9 items-center justify-center rounded-lg text-mid-gray hover:bg-blue-50 hover:text-blue-600 transition-colors"
                          title="Edit product"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(product.id)}
                          className="flex h-9 w-9 items-center justify-center rounded-lg text-mid-gray hover:bg-red-50 hover:text-red-600 transition-colors"
                          title="Delete product"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Expanded: sizes + stock management */}
                    {expandedProduct === product.id && (
                      <div className="border-t border-soft-stone/40 bg-warm-cream/50 px-4 sm:px-5 py-4">
                        <p className="text-xs font-semibold text-mid-gray uppercase tracking-wider mb-3">
                          Sizes & Stock
                        </p>
                        <div className="space-y-2">
                          {product.sizes.map((size, sizeIdx) => (
                            <div
                              key={sizeIdx}
                              className="flex items-center justify-between gap-4 bg-white rounded-lg px-4 py-3 border border-soft-stone/40"
                            >
                              <div className="flex items-center gap-4">
                                <span className="text-sm font-medium text-rich-black w-14">
                                  {size.weight}
                                </span>
                                <span className="text-sm text-mid-gray">
                                  ₹{size.price}
                                </span>
                              </div>
                              <button
                                onClick={() =>
                                  toggleStock(
                                    product.id,
                                    sizeIdx,
                                    size.inStock
                                  )
                                }
                                className={cn(
                                  "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200",
                                  size.inStock
                                    ? "bg-fresh-green"
                                    : "bg-soft-stone"
                                )}
                                role="switch"
                                aria-checked={size.inStock}
                                title={
                                  size.inStock
                                    ? "In stock — click to mark out of stock"
                                    : "Out of stock — click to mark in stock"
                                }
                              >
                                <span
                                  className={cn(
                                    "pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm ring-0 transition-transform duration-200 mt-0.5",
                                    size.inStock
                                      ? "translate-x-[22px]"
                                      : "translate-x-0.5"
                                  )}
                                />
                              </button>
                            </div>
                          ))}
                        </div>
                        <p className="text-xs text-mid-gray mt-3">
                          Slug: <code className="text-xs">{product.slug}</code>{" "}
                          · Updated:{" "}
                          {new Date(product.updated_at).toLocaleDateString(
                            "en-IN",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            }
                          )}
                        </p>
                      </div>
                    )}

                    {/* Delete confirmation */}
                    {deleteConfirmId === product.id && (
                      <div className="border-t border-red-200 bg-red-50 px-4 sm:px-5 py-4">
                        <p className="text-sm text-red-700 mb-3">
                          Are you sure you want to delete{" "}
                          <strong>{product.name}</strong>? This action cannot be
                          undone.
                        </p>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDelete(product.id)}
                            disabled={isDeleting === product.id}
                            className="flex items-center gap-2 h-9 px-4 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                          >
                            {isDeleting === product.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                            Delete
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(null)}
                            className="h-9 px-4 rounded-lg text-sm font-medium text-mid-gray hover:bg-white transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── FORM VIEW (Add / Edit) ─────────────────────────────────────── */}
        {viewMode === "form" && (
          <div className="mt-8 max-w-3xl">
            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={cancelForm}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-mid-gray hover:bg-soft-stone/60 hover:text-rich-black transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <h2 className="font-heading text-xl text-deep-forest">
                {editingProductId ? "Edit Product" : "Add New Product"}
              </h2>
            </div>

            <div className="space-y-6">
              {/* ── Basic Info ──────────────────────────────────────────── */}
              <section className="bg-white rounded-xl border border-soft-stone/60 p-5 sm:p-6 shadow-sm">
                <h3 className="text-sm font-semibold text-mid-gray uppercase tracking-wider mb-4">
                  Basic Info
                </h3>
                <div className="space-y-4">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-rich-black mb-1.5">
                      Product Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => {
                        const name = e.target.value;
                        setFormData((prev) => ({
                          ...prev,
                          name,
                          slug: editingProductId
                            ? prev.slug
                            : generateSlug(name),
                        }));
                      }}
                      placeholder="e.g. Beetroot Powder"
                      className="w-full h-11 px-4 rounded-lg border border-soft-stone bg-warm-cream/50 text-rich-black text-sm placeholder:text-mid-gray/50 focus:outline-none focus:ring-2 focus:ring-fresh-green/40 focus:border-fresh-green transition-colors"
                    />
                  </div>

                  {/* Slug */}
                  <div>
                    <label className="block text-sm font-medium text-rich-black mb-1.5">
                      Slug <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          slug: e.target.value,
                        }))
                      }
                      placeholder="e.g. beetroot-powder"
                      className="w-full h-11 px-4 rounded-lg border border-soft-stone bg-warm-cream/50 text-rich-black text-sm placeholder:text-mid-gray/50 focus:outline-none focus:ring-2 focus:ring-fresh-green/40 focus:border-fresh-green transition-colors font-mono"
                    />
                    <p className="text-xs text-mid-gray mt-1">
                      Used in URL: /shop/{formData.slug || "..."}
                    </p>
                  </div>

                  {/* Tagline + Category row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-rich-black mb-1.5">
                        Tagline
                      </label>
                      <input
                        type="text"
                        value={formData.tagline}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            tagline: e.target.value,
                          }))
                        }
                        placeholder="e.g. Rich & Earthy"
                        className="w-full h-11 px-4 rounded-lg border border-soft-stone bg-warm-cream/50 text-rich-black text-sm placeholder:text-mid-gray/50 focus:outline-none focus:ring-2 focus:ring-fresh-green/40 focus:border-fresh-green transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-rich-black mb-1.5">
                        Category
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            category: e.target.value as "vegetable" | "leaf",
                          }))
                        }
                        className="w-full h-11 px-4 rounded-lg border border-soft-stone bg-warm-cream/50 text-rich-black text-sm focus:outline-none focus:ring-2 focus:ring-fresh-green/40 focus:border-fresh-green transition-colors"
                      >
                        <option value="vegetable">Vegetable</option>
                        <option value="leaf">Leaf</option>
                      </select>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-rich-black mb-1.5">
                      Short Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      rows={2}
                      placeholder="Brief product description for cards..."
                      className="w-full px-4 py-3 rounded-lg border border-soft-stone bg-warm-cream/50 text-rich-black text-sm placeholder:text-mid-gray/50 focus:outline-none focus:ring-2 focus:ring-fresh-green/40 focus:border-fresh-green transition-colors resize-none"
                    />
                  </div>

                  {/* Long Description */}
                  <div>
                    <label className="block text-sm font-medium text-rich-black mb-1.5">
                      Long Description
                    </label>
                    <textarea
                      value={formData.long_description}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          long_description: e.target.value,
                        }))
                      }
                      rows={4}
                      placeholder="Detailed product description for the product page..."
                      className="w-full px-4 py-3 rounded-lg border border-soft-stone bg-warm-cream/50 text-rich-black text-sm placeholder:text-mid-gray/50 focus:outline-none focus:ring-2 focus:ring-fresh-green/40 focus:border-fresh-green transition-colors resize-none"
                    />
                  </div>
                </div>
              </section>

              {/* ── Sizes & Pricing ────────────────────────────────────── */}
              <section className="bg-white rounded-xl border border-soft-stone/60 p-5 sm:p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-mid-gray uppercase tracking-wider">
                    Sizes & Pricing
                  </h3>
                  <button
                    onClick={addSize}
                    className="flex items-center gap-1 text-xs font-medium text-fresh-green hover:text-deep-forest transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add size
                  </button>
                </div>
                <div className="space-y-3">
                  {formData.sizes.map((size, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3"
                    >
                      <input
                        type="text"
                        value={size.weight}
                        onChange={(e) =>
                          updateSize(idx, "weight", e.target.value)
                        }
                        placeholder="50g"
                        className="w-24 h-10 px-3 rounded-lg border border-soft-stone bg-warm-cream/50 text-rich-black text-sm placeholder:text-mid-gray/50 focus:outline-none focus:ring-2 focus:ring-fresh-green/40 focus:border-fresh-green transition-colors"
                      />
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-mid-gray">
                          ₹
                        </span>
                        <input
                          type="number"
                          min="0"
                          value={size.price || ""}
                          onChange={(e) =>
                            updateSize(
                              idx,
                              "price",
                              parseInt(e.target.value) || 0
                            )
                          }
                          placeholder="199"
                          className="w-full h-10 pl-7 pr-3 rounded-lg border border-soft-stone bg-warm-cream/50 text-rich-black text-sm placeholder:text-mid-gray/50 focus:outline-none focus:ring-2 focus:ring-fresh-green/40 focus:border-fresh-green transition-colors"
                        />
                      </div>
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={size.inStock}
                          onChange={(e) =>
                            updateSize(idx, "inStock", e.target.checked)
                          }
                          className="h-4 w-4 rounded border-soft-stone text-fresh-green focus:ring-fresh-green/40"
                        />
                        <span className="text-xs text-mid-gray whitespace-nowrap">
                          In stock
                        </span>
                      </label>
                      {formData.sizes.length > 1 && (
                        <button
                          onClick={() => removeSize(idx)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-mid-gray hover:bg-red-50 hover:text-red-500 transition-colors shrink-0"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </section>

              {/* ── Appearance ─────────────────────────────────────────── */}
              <section className="bg-white rounded-xl border border-soft-stone/60 p-5 sm:p-6 shadow-sm">
                <h3 className="text-sm font-semibold text-mid-gray uppercase tracking-wider mb-4">
                  Appearance
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-rich-black mb-1.5">
                      Product Image
                    </label>
                    {/* Preview */}
                    {(imagePreview || formData.image_src) && (
                      <div className="relative w-32 h-32 mb-3 rounded-xl overflow-hidden border border-soft-stone bg-warm-cream/50">
                        <Image
                          src={imagePreview || formData.image_src}
                          alt="Preview"
                          fill
                          className="object-cover"
                          unoptimized={!!imagePreview}
                        />
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2 px-4 h-11 rounded-lg border border-soft-stone bg-warm-cream/50 text-sm text-rich-black cursor-pointer hover:border-fresh-green/40 transition-colors">
                        <Upload className="w-4 h-4 text-mid-gray" />
                        {imageFile ? imageFile.name : "Choose image"}
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setImageFile(file);
                              setImagePreview(URL.createObjectURL(file));
                            }
                          }}
                        />
                      </label>
                      {imageFile && (
                        <button
                          type="button"
                          onClick={() => {
                            setImageFile(null);
                            setImagePreview(null);
                          }}
                          className="text-xs text-red-500 hover:text-red-700"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    {isUploadingImage && (
                      <p className="mt-2 text-xs text-mid-gray flex items-center gap-1.5">
                        <Loader2 className="w-3 h-3 animate-spin" /> Uploading image...
                      </p>
                    )}
                    {!imageFile && (
                      <input
                        type="text"
                        value={formData.image_src}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            image_src: e.target.value,
                          }))
                        }
                        placeholder="Or enter image URL/path manually"
                        className="mt-2 w-full h-9 px-3 rounded-lg border border-soft-stone bg-warm-cream/50 text-rich-black text-xs placeholder:text-mid-gray/50 focus:outline-none focus:ring-2 focus:ring-fresh-green/40 focus:border-fresh-green transition-colors font-mono"
                      />
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-rich-black mb-1.5">
                      Badge (optional)
                    </label>
                    <input
                      type="text"
                      value={formData.badge}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          badge: e.target.value,
                        }))
                      }
                      placeholder="e.g. Bestseller, Popular, New"
                      className="w-full h-11 px-4 rounded-lg border border-soft-stone bg-warm-cream/50 text-rich-black text-sm placeholder:text-mid-gray/50 focus:outline-none focus:ring-2 focus:ring-fresh-green/40 focus:border-fresh-green transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-rich-black mb-1.5">
                      Emoji
                    </label>
                    <input
                      type="text"
                      value={formData.emoji}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          emoji: e.target.value,
                        }))
                      }
                      placeholder="🌿"
                      className="w-full h-11 px-4 rounded-lg border border-soft-stone bg-warm-cream/50 text-rich-black text-2xl focus:outline-none focus:ring-2 focus:ring-fresh-green/40 focus:border-fresh-green transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-rich-black mb-1.5">
                      Accent Color
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={formData.accent_color}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            accent_color: e.target.value,
                          }))
                        }
                        className="h-11 w-14 rounded-lg border border-soft-stone cursor-pointer"
                      />
                      <input
                        type="text"
                        value={formData.accent_color}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            accent_color: e.target.value,
                          }))
                        }
                        className="flex-1 h-11 px-4 rounded-lg border border-soft-stone bg-warm-cream/50 text-rich-black text-sm font-mono focus:outline-none focus:ring-2 focus:ring-fresh-green/40 focus:border-fresh-green transition-colors"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-rich-black mb-1.5">
                      Background Color Class
                    </label>
                    <input
                      type="text"
                      value={formData.color}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          color: e.target.value,
                        }))
                      }
                      placeholder="bg-green-50"
                      className="w-full h-11 px-4 rounded-lg border border-soft-stone bg-warm-cream/50 text-rich-black text-sm font-mono focus:outline-none focus:ring-2 focus:ring-fresh-green/40 focus:border-fresh-green transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-rich-black mb-1.5">
                      Discount %
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={99}
                      value={formData.discount_percent}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          discount_percent: Math.min(99, Math.max(0, parseInt(e.target.value) || 0)),
                        }))
                      }
                      placeholder="0"
                      className="w-full h-11 px-4 rounded-lg border border-soft-stone bg-warm-cream/50 text-rich-black text-sm placeholder:text-mid-gray/50 focus:outline-none focus:ring-2 focus:ring-fresh-green/40 focus:border-fresh-green transition-colors"
                    />
                    <p className="mt-1 text-xs text-mid-gray">Set 0 for no discount</p>
                  </div>
                  <div className="flex items-center gap-3 self-end">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={formData.featured}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            featured: e.target.checked,
                          }))
                        }
                        className="h-4 w-4 rounded border-soft-stone text-fresh-green focus:ring-fresh-green/40"
                      />
                      <span className="text-sm font-medium text-rich-black">
                        Featured product
                      </span>
                    </label>
                  </div>
                </div>
              </section>

              {/* ── Benefits ───────────────────────────────────────────── */}
              <section className="bg-white rounded-xl border border-soft-stone/60 p-5 sm:p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-mid-gray uppercase tracking-wider">
                    Benefits
                  </h3>
                  <button
                    onClick={() => addArrayItem("benefits")}
                    className="flex items-center gap-1 text-xs font-medium text-fresh-green hover:text-deep-forest transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add
                  </button>
                </div>
                <div className="space-y-2">
                  {formData.benefits.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={item}
                        onChange={(e) =>
                          updateArrayItem("benefits", idx, e.target.value)
                        }
                        placeholder={`Benefit ${idx + 1}`}
                        className="flex-1 h-10 px-4 rounded-lg border border-soft-stone bg-warm-cream/50 text-rich-black text-sm placeholder:text-mid-gray/50 focus:outline-none focus:ring-2 focus:ring-fresh-green/40 focus:border-fresh-green transition-colors"
                      />
                      {formData.benefits.length > 1 && (
                        <button
                          onClick={() => removeArrayItem("benefits", idx)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-mid-gray hover:bg-red-50 hover:text-red-500 transition-colors shrink-0"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </section>

              {/* ── Usage ──────────────────────────────────────────────── */}
              <section className="bg-white rounded-xl border border-soft-stone/60 p-5 sm:p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-mid-gray uppercase tracking-wider">
                    How to Use
                  </h3>
                  <button
                    onClick={() => addArrayItem("usage")}
                    className="flex items-center gap-1 text-xs font-medium text-fresh-green hover:text-deep-forest transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add
                  </button>
                </div>
                <div className="space-y-2">
                  {formData.usage.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={item}
                        onChange={(e) =>
                          updateArrayItem("usage", idx, e.target.value)
                        }
                        placeholder={`Usage tip ${idx + 1}`}
                        className="flex-1 h-10 px-4 rounded-lg border border-soft-stone bg-warm-cream/50 text-rich-black text-sm placeholder:text-mid-gray/50 focus:outline-none focus:ring-2 focus:ring-fresh-green/40 focus:border-fresh-green transition-colors"
                      />
                      {formData.usage.length > 1 && (
                        <button
                          onClick={() => removeArrayItem("usage", idx)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-mid-gray hover:bg-red-50 hover:text-red-500 transition-colors shrink-0"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </section>

              {/* ── Additional Info ────────────────────────────────────── */}
              <section className="bg-white rounded-xl border border-soft-stone/60 p-5 sm:p-6 shadow-sm">
                <h3 className="text-sm font-semibold text-mid-gray uppercase tracking-wider mb-4">
                  Additional Info
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-rich-black mb-1.5">
                      Ingredients
                    </label>
                    <input
                      type="text"
                      value={formData.ingredients}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          ingredients: e.target.value,
                        }))
                      }
                      placeholder="100% Dehydrated..."
                      className="w-full h-11 px-4 rounded-lg border border-soft-stone bg-warm-cream/50 text-rich-black text-sm placeholder:text-mid-gray/50 focus:outline-none focus:ring-2 focus:ring-fresh-green/40 focus:border-fresh-green transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-rich-black mb-1.5">
                      Shelf Life
                    </label>
                    <input
                      type="text"
                      value={formData.shelf_life}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          shelf_life: e.target.value,
                        }))
                      }
                      placeholder="12 months from date of packaging"
                      className="w-full h-11 px-4 rounded-lg border border-soft-stone bg-warm-cream/50 text-rich-black text-sm placeholder:text-mid-gray/50 focus:outline-none focus:ring-2 focus:ring-fresh-green/40 focus:border-fresh-green transition-colors"
                    />
                  </div>
                </div>
              </section>

              {/* ── Save / Cancel ──────────────────────────────────────── */}
              <div className="flex items-center gap-3 pt-2 pb-8">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-2 h-11 px-6 rounded-lg bg-fresh-green text-white text-sm font-medium hover:bg-deep-forest transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {editingProductId ? "Save Changes" : "Create Product"}
                </button>
                <button
                  onClick={cancelForm}
                  className="h-11 px-6 rounded-lg text-sm font-medium text-mid-gray hover:bg-soft-stone/60 hover:text-rich-black transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
        </>)}

        {/* ── ORDERS TAB ── */}
        {activeTab === "orders" && (
          <div className="mt-8">
            <OrderManager />
          </div>
        )}

        {/* ── COUPONS TAB ── */}
        {activeTab === "coupons" && (
          <div className="mt-8">
            <CouponManager />
          </div>
        )}

        {/* ── PAGES TAB ── */}
        {activeTab === "pages" && (
          <div className="mt-8">
            <PageManager />
          </div>
        )}

        {/* ── BANNERS TAB ── */}
        {activeTab === "banners" && (
          <div className="mt-8">
            <BannerManager />
          </div>
        )}
      </Container>
    </div>
  );
}
