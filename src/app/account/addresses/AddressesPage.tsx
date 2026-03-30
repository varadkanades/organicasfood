"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  MapPin,
  Plus,
  Pencil,
  Trash2,
  X,
  Save,
  Loader2,
  AlertCircle,
  Check,
  Star,
  ArrowLeft,
  Home,
  Briefcase,
  MapPinned,
  User,
  Phone,
} from "lucide-react";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import {
  fetchUserAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  type SavedAddress,
  type AddressInput,
} from "@/lib/supabase-addresses";

// ── Indian states ─────────────────────────────────────────────────────────────

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
];

const LABEL_OPTIONS = [
  { value: "Home", icon: Home },
  { value: "Office", icon: Briefcase },
  { value: "Other", icon: MapPinned },
];

// ── Form data ─────────────────────────────────────────────────────────────────

interface AddressFormData {
  label: string;
  full_name: string;
  phone: string;
  address: string;
  city: string;
  pincode: string;
  state: string;
  is_default: boolean;
}

const EMPTY_FORM: AddressFormData = {
  label: "Home",
  full_name: "",
  phone: "",
  address: "",
  city: "",
  pincode: "",
  state: "Maharashtra",
  is_default: false,
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function AddressesPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<AddressFormData>(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Redirect if not logged in
  if (!authLoading && !user) {
    router.push("/login");
    return null;
  }

  // ── Load addresses ──────────────────────────────────────────────────────────

  const loadAddresses = useCallback(async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      const data = await fetchUserAddresses(user.id);
      setAddresses(data);
    } catch {
      setError("Failed to load addresses.");
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) loadAddresses();
  }, [user, loadAddresses]);

  // Clear messages
  useEffect(() => {
    if (success) {
      const t = setTimeout(() => setSuccess(null), 4000);
      return () => clearTimeout(t);
    }
  }, [success]);

  // ── Form helpers ────────────────────────────────────────────────────────────

  const openAddForm = () => {
    setFormData(EMPTY_FORM);
    setEditingId(null);
    setShowForm(true);
  };

  const openEditForm = (addr: SavedAddress) => {
    setFormData({
      label: addr.label,
      full_name: addr.full_name,
      phone: addr.phone,
      address: addr.address,
      city: addr.city,
      pincode: addr.pincode,
      state: addr.state,
      is_default: addr.is_default,
    });
    setEditingId(addr.id);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData(EMPTY_FORM);
    setError(null);
  };

  // ── Validate ────────────────────────────────────────────────────────────────

  function validate(): boolean {
    if (!formData.full_name.trim()) { setError("Full name is required."); return false; }
    if (!formData.phone.trim() || !/^[6-9]\d{9}$/.test(formData.phone.trim())) {
      setError("Enter a valid 10-digit phone number."); return false;
    }
    if (!formData.address.trim()) { setError("Address is required."); return false; }
    if (!formData.city.trim()) { setError("City is required."); return false; }
    if (!formData.pincode.trim() || !/^\d{6}$/.test(formData.pincode.trim())) {
      setError("Enter a valid 6-digit pincode."); return false;
    }
    if (!formData.state.trim()) { setError("State is required."); return false; }
    return true;
  }

  // ── Save ────────────────────────────────────────────────────────────────────

  const handleSave = async () => {
    if (!user || !validate()) return;
    setIsSaving(true);
    setError(null);

    try {
      const input: AddressInput = {
        label: formData.label,
        full_name: formData.full_name.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        city: formData.city.trim(),
        pincode: formData.pincode.trim(),
        state: formData.state,
        is_default: formData.is_default,
      };

      if (editingId) {
        await updateAddress(editingId, user.id, input);
        setSuccess("Address updated!");
      } else {
        await createAddress(user.id, input);
        setSuccess("Address saved!");
      }

      closeForm();
      loadAddresses();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save address.");
    } finally {
      setIsSaving(false);
    }
  };

  // ── Delete ──────────────────────────────────────────────────────────────────

  const handleDelete = async (id: string) => {
    if (!user) return;
    setIsDeletingId(id);
    try {
      await deleteAddress(id, user.id);
      setSuccess("Address deleted.");
      setDeleteConfirmId(null);
      loadAddresses();
    } catch {
      setError("Failed to delete address.");
    } finally {
      setIsDeletingId(null);
    }
  };

  // ── Loading ─────────────────────────────────────────────────────────────────

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-warm-cream pt-18 flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-fresh-green animate-spin" />
      </div>
    );
  }

  const inputBase =
    "w-full h-11 px-4 rounded-lg border border-soft-stone bg-white text-rich-black text-sm placeholder:text-mid-gray/50 focus:outline-none focus:ring-2 focus:ring-fresh-green/40 focus:border-fresh-green transition-colors";

  return (
    <div className="min-h-screen bg-warm-cream pt-18">
      <Container className="py-8 sm:py-12">
        <div className="max-w-2xl mx-auto">
          {/* Back link */}
          <Link
            href="/account/orders"
            className="inline-flex items-center gap-1.5 text-sm text-mid-gray hover:text-rich-black transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Orders
          </Link>

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-deep-forest/10">
                <MapPin className="h-6 w-6 text-deep-forest" />
              </div>
              <div>
                <h1 className="font-heading text-2xl text-deep-forest">
                  Saved Addresses
                </h1>
                <p className="text-sm text-mid-gray">
                  {addresses.length} address{addresses.length !== 1 ? "es" : ""} saved
                </p>
              </div>
            </div>
            {!showForm && (
              <button
                onClick={openAddForm}
                className="flex items-center gap-2 h-10 px-4 rounded-lg bg-deep-forest text-white text-sm font-medium hover:bg-rich-black transition-colors"
              >
                <Plus className="h-4 w-4" />
                Add Address
              </button>
            )}
          </div>

          {/* Messages */}
          {success && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm mb-4">
              <Check className="h-4 w-4 shrink-0" />
              {success}
            </div>
          )}
          {error && !showForm && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm mb-4">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {/* ── Address Form ─────────────────────────────────────────────── */}
          {showForm && (
            <div className="bg-white rounded-xl border border-soft-stone/60 p-5 sm:p-6 shadow-sm mb-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-sm font-semibold text-mid-gray uppercase tracking-wider">
                  {editingId ? "Edit Address" : "New Address"}
                </h2>
                <button
                  onClick={closeForm}
                  className="p-1.5 rounded-lg text-mid-gray hover:bg-soft-stone/50 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm mb-4">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}

              <div className="space-y-4">
                {/* Label */}
                <div>
                  <label className="block text-sm font-medium text-rich-black mb-2">
                    Address Label
                  </label>
                  <div className="flex gap-2">
                    {LABEL_OPTIONS.map(({ value, icon: Icon }) => (
                      <button
                        key={value}
                        onClick={() =>
                          setFormData((prev) => ({ ...prev, label: value }))
                        }
                        className={`flex items-center gap-2 h-10 px-4 rounded-lg border text-sm font-medium transition-colors ${
                          formData.label === value
                            ? "border-fresh-green bg-fresh-green/5 text-fresh-green"
                            : "border-soft-stone text-mid-gray hover:border-mid-gray"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        {value}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Full Name + Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-rich-black mb-1.5">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-mid-gray/50" />
                      <input
                        type="text"
                        value={formData.full_name}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, full_name: e.target.value }))
                        }
                        placeholder="e.g. Varad Kanade"
                        className={`${inputBase} !pl-10`}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-rich-black mb-1.5">
                      Phone <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-mid-gray/50" />
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, phone: e.target.value }))
                        }
                        placeholder="e.g. 9876543210"
                        maxLength={10}
                        className={`${inputBase} !pl-10`}
                      />
                    </div>
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-rich-black mb-1.5">
                    Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, address: e.target.value }))
                    }
                    placeholder="House/flat no., street, area, landmark"
                    className={inputBase}
                  />
                </div>

                {/* City + Pincode + State */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-rich-black mb-1.5">
                      City <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, city: e.target.value }))
                      }
                      placeholder="e.g. Pune"
                      className={inputBase}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-rich-black mb-1.5">
                      Pincode <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.pincode}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, pincode: e.target.value }))
                      }
                      placeholder="e.g. 411033"
                      maxLength={6}
                      className={inputBase}
                    />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-sm font-medium text-rich-black mb-1.5">
                      State <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.state}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, state: e.target.value }))
                      }
                      className={inputBase}
                    >
                      {INDIAN_STATES.map((state) => (
                        <option key={state} value={state}>
                          {state}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Default toggle */}
                <label className="flex items-center gap-3 cursor-pointer py-1">
                  <input
                    type="checkbox"
                    checked={formData.is_default}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, is_default: e.target.checked }))
                    }
                    className="h-4 w-4 rounded border-soft-stone text-fresh-green focus:ring-fresh-green/40"
                  />
                  <span className="text-sm text-rich-black flex items-center gap-1.5">
                    <Star className="h-3.5 w-3.5 text-amber-500" />
                    Set as default address
                  </span>
                </label>

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
                    className="flex-1 h-11 rounded-lg bg-deep-forest text-white text-sm font-medium hover:bg-rich-black transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    {editingId ? "Update" : "Save"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── Address List ─────────────────────────────────────────────── */}
          {!showForm && addresses.length === 0 ? (
            <div className="bg-white rounded-xl border border-soft-stone/60 p-12 shadow-sm text-center">
              <div className="w-16 h-16 rounded-full bg-soft-stone/30 flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-7 w-7 text-mid-gray/50" />
              </div>
              <h2 className="font-heading text-lg text-rich-black mb-2">
                No saved addresses
              </h2>
              <p className="text-sm text-mid-gray mb-6">
                Save your addresses for faster checkout.
              </p>
              <Button onClick={openAddForm}>
                <Plus className="h-4 w-4" />
                Add Your First Address
              </Button>
            </div>
          ) : (
            !showForm && (
              <div className="space-y-3">
                {addresses.map((addr) => {
                  const LabelIcon =
                    LABEL_OPTIONS.find((l) => l.value === addr.label)?.icon || MapPinned;

                  return (
                    <div
                      key={addr.id}
                      className="bg-white rounded-xl border border-soft-stone/60 p-4 sm:p-5 shadow-sm"
                    >
                      <div className="flex items-start gap-3">
                        {/* Icon */}
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-soft-stone/30 shrink-0">
                          <LabelIcon className="h-5 w-5 text-deep-forest" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-semibold text-rich-black">
                              {addr.label}
                            </span>
                            {addr.is_default && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-semibold">
                                <Star className="h-2.5 w-2.5" />
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-rich-black">{addr.full_name}</p>
                          <p className="text-xs text-mid-gray mt-0.5">
                            {addr.address}, {addr.city}, {addr.state} – {addr.pincode}
                          </p>
                          <p className="text-xs text-mid-gray mt-0.5">
                            Phone: {addr.phone}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => openEditForm(addr)}
                            className="p-2 rounded-lg text-mid-gray hover:bg-soft-stone/50 hover:text-rich-black transition-colors"
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          {deleteConfirmId === addr.id ? (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleDelete(addr.id)}
                                disabled={isDeletingId === addr.id}
                                className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                              >
                                {isDeletingId === addr.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Check className="h-4 w-4" />
                                )}
                              </button>
                              <button
                                onClick={() => setDeleteConfirmId(null)}
                                className="p-2 rounded-lg text-mid-gray hover:bg-soft-stone/50 transition-colors"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirmId(addr.id)}
                              className="p-2 rounded-lg text-mid-gray hover:bg-red-50 hover:text-red-600 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          )}
        </div>
      </Container>
    </div>
  );
}
