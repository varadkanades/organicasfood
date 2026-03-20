"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, User } from "lucide-react";
import { NAV_LINKS, SITE_NAME, WHATSAPP_NUMBER } from "@/lib/constants";
import { getWhatsAppUrl, cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileNav({ isOpen, onClose }: MobileNavProps) {
  const pathname = usePathname();
  const { user, role, isLoading, signOut } = useAuth();

  const whatsappUrl = getWhatsAppUrl(
    WHATSAPP_NUMBER,
    "Hi! I have a question about Organika's Food products."
  );

  const handleSignOut = async () => {
    onClose();
    await signOut();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-rich-black/20 backdrop-blur-sm md:hidden"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Nav Panel */}
          <motion.nav
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 z-40 h-full w-[85%] max-w-sm bg-warm-cream shadow-2xl md:hidden"
          >
            <div className="flex h-full flex-col px-6 pt-20 pb-8">
              {/* Navigation Links */}
              <div className="flex flex-col gap-1">
                {NAV_LINKS.map((link, index) => {
                  const isActive =
                    pathname === link.href ||
                    (link.href !== "/" && pathname.startsWith(link.href));

                  return (
                    <motion.div
                      key={link.href}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + index * 0.05 }}
                    >
                      <Link
                        href={link.href}
                        onClick={onClose}
                        className={cn(
                          "flex items-center rounded-xl px-4 py-3.5 text-lg font-medium transition-all duration-200",
                          isActive
                            ? "bg-fresh-green/10 text-deep-forest"
                            : "text-mid-gray hover:bg-soft-stone/60 hover:text-rich-black"
                        )}
                      >
                        {link.label}
                        {isActive && (
                          <span className="ml-auto h-1.5 w-1.5 rounded-full bg-fresh-green" />
                        )}
                      </Link>
                    </motion.div>
                  );
                })}

                {/* Admin link — only visible to admins */}
                {user && role === "admin" && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + NAV_LINKS.length * 0.05 }}
                  >
                    <Link
                      href="/admin"
                      onClick={onClose}
                      className={cn(
                        "flex items-center rounded-xl px-4 py-3.5 text-lg font-medium transition-all duration-200",
                        pathname.startsWith("/admin")
                          ? "bg-fresh-green/10 text-deep-forest"
                          : "text-mid-gray hover:bg-soft-stone/60 hover:text-rich-black"
                      )}
                    >
                      Admin Dashboard
                      {pathname.startsWith("/admin") && (
                        <span className="ml-auto h-1.5 w-1.5 rounded-full bg-fresh-green" />
                      )}
                    </Link>
                  </motion.div>
                )}
              </div>

              {/* Divider */}
              <div className="my-6 h-px bg-soft-stone" />

              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="flex flex-col gap-3"
              >
                <Link
                  href="/shop"
                  onClick={onClose}
                  className="flex h-12 items-center justify-center rounded-xl bg-fresh-green text-white font-medium text-sm transition-colors hover:bg-deep-forest"
                >
                  Shop Now
                </Link>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-12 items-center justify-center gap-2 rounded-xl border-2 border-soft-stone text-mid-gray font-medium text-sm transition-colors hover:border-sage-green hover:text-rich-black"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 00.611.611l4.458-1.495A11.943 11.943 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.315 0-4.458-.766-6.183-2.059l-.432-.324-2.645.887.887-2.645-.324-.432A9.935 9.935 0 012 12C2 6.486 6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z" />
                  </svg>
                  Chat on WhatsApp
                </a>

                {/* Auth action */}
                {!isLoading && (
                  <>
                    {user ? (
                      <button
                        onClick={handleSignOut}
                        className="flex h-12 items-center justify-center gap-2 rounded-xl border-2 border-red-200 text-red-600 font-medium text-sm transition-colors hover:bg-red-50 hover:border-red-300"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </button>
                    ) : (
                      <Link
                        href="/login"
                        onClick={onClose}
                        className="flex h-12 items-center justify-center gap-2 rounded-xl border-2 border-soft-stone text-mid-gray font-medium text-sm transition-colors hover:border-sage-green hover:text-rich-black"
                      >
                        <User className="h-4 w-4" />
                        Sign In
                      </Link>
                    )}
                  </>
                )}
              </motion.div>

              {/* Bottom Brand */}
              <div className="mt-auto text-center">
                <p className="font-heading text-sm text-sage-green">
                  {SITE_NAME}
                </p>
                <p className="mt-1 text-[11px] text-mid-gray/60 tracking-wider uppercase">
                  100% Natural
                </p>
              </div>
            </div>
          </motion.nav>
        </>
      )}
    </AnimatePresence>
  );
}
