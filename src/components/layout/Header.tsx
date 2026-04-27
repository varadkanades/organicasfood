"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  ShoppingBag,
  Search,
  Menu,
  X,
  LogOut,
  User,
  Shield,
  Settings,
  Package,
  MapPin,
  HelpCircle,
  FileText,
  ShieldCheck,
  ChevronDown,
} from "lucide-react";
import Container from "@/components/ui/Container";
import MobileNav from "@/components/layout/MobileNav";
import SearchModal from "@/components/layout/SearchModal";
import { NAV_LINKS, SITE_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

export default function Header() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const { toggleCart, totalItems } = useCart();
  const { user, role, isLoading, signOut } = useAuth();

  // Is this the homepage? If yes, header starts transparent
  const isHomepage = pathname === "/";

  // Track scroll for header appearance change
  const handleScroll = useCallback(() => {
    setIsScrolled(window.scrollY > 20);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // Close mobile nav on route change
  useEffect(() => {
    setIsMobileNavOpen(false);
    setIsProfileOpen(false);
  }, [pathname]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Prevent body scroll when mobile nav is open
  useEffect(() => {
    if (isMobileNavOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileNavOpen]);

  // Determine header visual state
  const isTransparent = isHomepage && !isScrolled;

  const handleSignOut = async () => {
    setIsProfileOpen(false);
    await signOut();
  };

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 w-full transition-all duration-500 ease-organic",
          isTransparent
            ? "bg-transparent border-b border-transparent"
            : "bg-white/90 backdrop-blur-md shadow-sm border-b border-soft-stone/50"
        )}
      >
        <Container>
          <nav
            className={cn(
              "flex items-center justify-between transition-all duration-300 ease-organic",
              isScrolled ? "h-14" : "h-18"
            )}
          >
            {/* Logo */}
            <Link
              href="/"
              className="relative z-10 flex items-center gap-2 group"
            >
              <Image
                src="/images/logo.png"
                alt="Organikas Foods Logo"
                width={36}
                height={36}
                className="rounded-full transition-all duration-300"
              />
              <div className="flex flex-col">
                <span
                  className={cn(
                    "font-heading leading-tight transition-all duration-300",
                    isTransparent ? "text-white" : "text-deep-forest",
                    isScrolled ? "text-lg" : "text-xl"
                  )}
                >
                  {SITE_NAME}
                </span>
                <span
                  className={cn(
                    "font-medium tracking-widest uppercase transition-all duration-300 origin-left",
                    isTransparent ? "text-white/60" : "text-sage-green",
                    isScrolled
                      ? "text-[9px] opacity-0 h-0"
                      : "text-[10px] opacity-100 h-auto"
                  )}
                >
                  100% Natural
                </span>
              </div>
            </Link>

            {/* Desktop Navigation — Center */}
            <div className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map((link) => {
                const isActive =
                  pathname === link.href ||
                  (link.href !== "/" && pathname.startsWith(link.href));

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200",
                      isTransparent
                        ? isActive
                          ? "text-white"
                          : "text-white/70 hover:text-white hover:bg-white/10"
                        : isActive
                          ? "text-deep-forest"
                          : "text-mid-gray hover:text-rich-black hover:bg-soft-stone/50"
                    )}
                  >
                    {link.label}
                    {/* Active indicator */}
                    {isActive && (
                      <span
                        className={cn(
                          "absolute bottom-0.5 left-1/2 -translate-x-1/2 h-0.5 w-5 rounded-full",
                          isTransparent ? "bg-white" : "bg-fresh-green"
                        )}
                      />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Right Side — Search + Cart + Auth + Mobile Menu */}
            <div className="flex items-center gap-1">
              {/* Search button */}
              <button
                type="button"
                onClick={() => setIsSearchOpen(true)}
                className={cn(
                  "relative flex h-10 w-10 items-center justify-center rounded-lg transition-colors duration-200",
                  isTransparent
                    ? "text-white/70 hover:bg-white/10 hover:text-white"
                    : "text-mid-gray hover:bg-soft-stone/50 hover:text-rich-black"
                )}
                aria-label="Search products"
              >
                <Search className="h-[18px] w-[18px]" strokeWidth={2} />
              </button>

              {/* Cart button */}
              <button
                onClick={toggleCart}
                className={cn(
                  "relative flex h-10 w-10 items-center justify-center rounded-lg transition-colors duration-200",
                  isTransparent
                    ? "text-white/70 hover:bg-white/10 hover:text-white"
                    : "text-mid-gray hover:bg-soft-stone/50 hover:text-rich-black"
                )}
                aria-label="Shopping cart"
              >
                <ShoppingBag className="h-[18px] w-[18px]" strokeWidth={2} />
                {/* Cart badge */}
                {totalItems > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-fresh-green text-white text-[10px] font-bold shadow-sm animate-scale-in">
                    {totalItems > 9 ? "9+" : totalItems}
                  </span>
                )}
              </button>

              {/* Auth — Login link or Profile dropdown.
                  Always render so the auth icon never disappears on refresh
                  (was previously hidden behind !isLoading). */}
              {(
                <>
                  {user ? (
                    <>
                      {/* Admin link — only for admins */}
                      {role === "admin" && (
                        <Link
                          href="/admin"
                          className={cn(
                            "relative flex h-10 w-10 items-center justify-center rounded-lg transition-colors duration-200",
                            isTransparent
                              ? "text-white/70 hover:bg-white/10 hover:text-white"
                              : "text-mid-gray hover:bg-soft-stone/50 hover:text-rich-black"
                          )}
                          aria-label="Admin dashboard"
                          title="Admin Dashboard"
                        >
                          <Shield className="h-[18px] w-[18px]" strokeWidth={2} />
                        </Link>
                      )}

                      {/* Profile dropdown */}
                      <div className="relative" ref={profileRef}>
                        <button
                          onClick={() => setIsProfileOpen(!isProfileOpen)}
                          className={cn(
                            "relative flex items-center gap-1 h-10 px-2 rounded-lg transition-colors duration-200",
                            isTransparent
                              ? "text-white/70 hover:bg-white/10 hover:text-white"
                              : "text-mid-gray hover:bg-soft-stone/50 hover:text-rich-black",
                            isProfileOpen && !isTransparent && "bg-soft-stone/50 text-rich-black",
                            isProfileOpen && isTransparent && "bg-white/10 text-white"
                          )}
                          aria-label="Account menu"
                          aria-expanded={isProfileOpen}
                        >
                          <User className="h-[18px] w-[18px]" strokeWidth={2} />
                          <ChevronDown
                            className={cn(
                              "h-3.5 w-3.5 transition-transform duration-200",
                              isProfileOpen && "rotate-180"
                            )}
                            strokeWidth={2}
                          />
                        </button>

                        {/* Dropdown menu */}
                        {isProfileOpen && (
                          <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl border border-soft-stone/60 shadow-lg py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                            {/* User info */}
                            <div className="px-4 py-2.5 border-b border-soft-stone/30">
                              <p className="text-sm font-medium text-rich-black truncate">
                                {user.user_metadata?.full_name || user.email?.split("@")[0] || "User"}
                              </p>
                              <p className="text-xs text-mid-gray truncate">
                                {user.email}
                              </p>
                            </div>

                            {/* Menu items */}
                            <div className="py-1">
                              <Link
                                href="/account/orders"
                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-rich-black hover:bg-soft-stone/30 transition-colors"
                                onClick={() => setIsProfileOpen(false)}
                              >
                                <Package className="h-4 w-4 text-mid-gray" />
                                My Orders
                              </Link>
                              <Link
                                href="/account/addresses"
                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-rich-black hover:bg-soft-stone/30 transition-colors"
                                onClick={() => setIsProfileOpen(false)}
                              >
                                <MapPin className="h-4 w-4 text-mid-gray" />
                                Saved Addresses
                              </Link>
                              <Link
                                href="/account/settings"
                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-rich-black hover:bg-soft-stone/30 transition-colors"
                                onClick={() => setIsProfileOpen(false)}
                              >
                                <Settings className="h-4 w-4 text-mid-gray" />
                                Settings
                              </Link>
                            </div>

                            {/* Divider */}
                            <div className="h-px bg-soft-stone/30 my-1" />

                            {/* Info links */}
                            <div className="py-1">
                              <Link
                                href="/pages/faq"
                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-mid-gray hover:bg-soft-stone/30 hover:text-rich-black transition-colors"
                                onClick={() => setIsProfileOpen(false)}
                              >
                                <HelpCircle className="h-4 w-4" />
                                FAQ
                              </Link>
                              <Link
                                href="/pages/terms"
                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-mid-gray hover:bg-soft-stone/30 hover:text-rich-black transition-colors"
                                onClick={() => setIsProfileOpen(false)}
                              >
                                <FileText className="h-4 w-4" />
                                Terms & Conditions
                              </Link>
                              <Link
                                href="/pages/privacy"
                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-mid-gray hover:bg-soft-stone/30 hover:text-rich-black transition-colors"
                                onClick={() => setIsProfileOpen(false)}
                              >
                                <ShieldCheck className="h-4 w-4" />
                                Privacy Policy
                              </Link>
                            </div>

                            {/* Divider */}
                            <div className="h-px bg-soft-stone/30 my-1" />

                            {/* Sign out */}
                            <div className="py-1">
                              <button
                                onClick={handleSignOut}
                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                              >
                                <LogOut className="h-4 w-4" />
                                Sign Out
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <Link
                      href="/login"
                      className={cn(
                        "relative flex h-10 w-10 items-center justify-center rounded-lg transition-colors duration-200",
                        isTransparent
                          ? "text-white/70 hover:bg-white/10 hover:text-white"
                          : "text-mid-gray hover:bg-soft-stone/50 hover:text-rich-black"
                      )}
                      aria-label="Sign in"
                      title="Sign in"
                    >
                      <User className="h-[18px] w-[18px]" strokeWidth={2} />
                    </Link>
                  )}
                </>
              )}

              {/* Mobile menu toggle */}
              <button
                onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
                className={cn(
                  "relative flex h-10 w-10 items-center justify-center rounded-lg transition-colors duration-200 md:hidden",
                  isTransparent
                    ? "text-white/70 hover:bg-white/10 hover:text-white"
                    : "text-mid-gray hover:bg-soft-stone/50 hover:text-rich-black"
                )}
                aria-label={isMobileNavOpen ? "Close menu" : "Open menu"}
                aria-expanded={isMobileNavOpen}
              >
                {isMobileNavOpen ? (
                  <X className="h-5 w-5" strokeWidth={2} />
                ) : (
                  <Menu className="h-5 w-5" strokeWidth={2} />
                )}
              </button>
            </div>
          </nav>
        </Container>
      </header>

      {/* Mobile Navigation Overlay */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

      <MobileNav
        isOpen={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
      />
    </>
  );
}
