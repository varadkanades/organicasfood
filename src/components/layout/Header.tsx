"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ShoppingBag, Search, Menu, X, LogOut, User, Shield } from "lucide-react";
import Container from "@/components/ui/Container";
import MobileNav from "@/components/layout/MobileNav";
import { NAV_LINKS, SITE_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

export default function Header() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
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
  }, [pathname]);

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
                alt="Organika's Food Logo"
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

              {/* Auth button — Login link or Logout icon */}
              {!isLoading && (
                <>
                  {user ? (
                    <>
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
                      <Link
                        href="/account/orders"
                        className={cn(
                          "relative flex h-10 w-10 items-center justify-center rounded-lg transition-colors duration-200",
                          isTransparent
                            ? "text-white/70 hover:bg-white/10 hover:text-white"
                            : "text-mid-gray hover:bg-soft-stone/50 hover:text-rich-black"
                        )}
                        aria-label="My orders"
                        title="My Orders"
                      >
                        <User className="h-[18px] w-[18px]" strokeWidth={2} />
                      </Link>
                      <button
                        onClick={signOut}
                        className={cn(
                          "relative flex h-10 w-10 items-center justify-center rounded-lg transition-colors duration-200",
                          isTransparent
                            ? "text-white/70 hover:bg-white/10 hover:text-white"
                            : "text-mid-gray hover:bg-soft-stone/50 hover:text-rich-black"
                        )}
                        aria-label="Sign out"
                        title="Sign out"
                      >
                        <LogOut className="h-[18px] w-[18px]" strokeWidth={2} />
                      </button>
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
      <MobileNav
        isOpen={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
      />
    </>
  );
}
