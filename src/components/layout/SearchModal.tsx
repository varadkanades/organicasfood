"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, X } from "lucide-react";
import { fetchProducts, type SupabaseProduct } from "@/lib/supabase-products";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<SupabaseProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Lazy-load products the first time the modal opens
  useEffect(() => {
    if (!isOpen || products.length > 0) return;
    setIsLoading(true);
    fetchProducts()
      .then(setProducts)
      .catch(() => setProducts([]))
      .finally(() => setIsLoading(false));
  }, [isOpen, products.length]);

  // Focus the input when opening
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  // Lock body scroll while open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const q = query.trim().toLowerCase();
  const matches = q
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.tagline?.toLowerCase().includes(q) ?? false) ||
          (p.description?.toLowerCase().includes(q) ?? false)
      )
    : products;

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-start justify-center pt-20 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-5 h-14 border-b border-soft-stone">
          <Search className="h-5 w-5 text-mid-gray shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products..."
            className="flex-1 bg-transparent text-rich-black placeholder:text-mid-gray/50 outline-none text-base"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close search"
            className="p-1.5 rounded-lg text-mid-gray hover:bg-soft-stone/60 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto">
          {isLoading ? (
            <p className="p-6 text-sm text-mid-gray text-center">Loading...</p>
          ) : matches.length === 0 ? (
            <p className="p-6 text-sm text-mid-gray text-center">
              {q ? `No products match "${query}"` : "No products available"}
            </p>
          ) : (
            <ul className="divide-y divide-soft-stone/60">
              {matches.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/shop/${p.slug}`}
                    onClick={onClose}
                    className="flex items-center gap-3 px-5 py-3 hover:bg-soft-stone/40 transition-colors"
                  >
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-soft-stone/30 shrink-0">
                      {p.image_src ? (
                        <Image
                          src={p.image_src}
                          alt={p.name}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl">
                          🌿
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-rich-black truncate">
                        {p.name}
                      </p>
                      {p.tagline && (
                        <p className="text-xs text-mid-gray truncate">
                          {p.tagline}
                        </p>
                      )}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
