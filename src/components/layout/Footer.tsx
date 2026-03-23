import Link from "next/link";
import Image from "next/image";
import Container from "@/components/ui/Container";
import {
  SITE_NAME,
  NAV_LINKS,
  CONTACT_EMAIL,
  CONTACT_PHONE,
  WHATSAPP_NUMBER,
  FSSAI_NUMBER,
  SHIPPING_REGIONS,
} from "@/lib/constants";
import { getWhatsAppUrl } from "@/lib/utils";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const whatsappUrl = getWhatsAppUrl(
    WHATSAPP_NUMBER,
    "Hi! I'd like to know more about Organika's Food products."
  );

  return (
    <footer className="bg-deep-forest text-white/80">
      {/* Main Footer */}
      <Container className="py-16 md:py-20">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {/* Brand Column */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2">
              <Image
                src="/images/logo.png"
                alt="Organika's Food Logo"
                width={36}
                height={36}
                className="rounded-full"
              />
              <span className="font-heading text-xl text-white">
                {SITE_NAME}
              </span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/60">
              Premium natural food powders made from farm-fresh ingredients.
              Zero preservatives, 100% vegan, crafted with care in Maharashtra.
            </p>
            {/* Social / WhatsApp */}
            <div className="mt-6 flex items-center gap-3">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/70 transition-all duration-200 hover:bg-[#25D366] hover:text-white"
                aria-label="Chat on WhatsApp"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 00.611.611l4.458-1.495A11.943 11.943 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.315 0-4.458-.766-6.183-2.059l-.432-.324-2.645.887.887-2.645-.324-.432A9.935 9.935 0 012 12C2 6.486 6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z" />
                </svg>
              </a>
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/70 transition-all duration-200 hover:bg-white/20 hover:text-white"
                aria-label="Send email"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-5">
              Quick Links
            </h4>
            <ul className="space-y-3">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/60 transition-colors duration-200 hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Products */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-5">
              Products
            </h4>
            <ul className="space-y-3">
              {[
                "Beetroot Powder",
                "Carrot Powder",
                "Coriander Leaf Powder",
                "Curry Leaves Powder",
              ].map((product) => (
                <li key={product}>
                  <Link
                    href="/shop"
                    className="text-sm text-white/60 transition-colors duration-200 hover:text-white"
                  >
                    {product}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Regions */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-5">
              Get in Touch
            </h4>
            <ul className="space-y-3 text-sm text-white/60">
              <li>
                <a
                  href={`tel:${CONTACT_PHONE.replace(/\s/g, "")}`}
                  className="transition-colors hover:text-white"
                >
                  {CONTACT_PHONE}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="transition-colors hover:text-white"
                >
                  {CONTACT_EMAIL}
                </a>
              </li>
            </ul>

            {/* Shipping Regions */}
            <div className="mt-6">
              <h4 className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-3">
                We Deliver To
              </h4>
              <div className="flex flex-wrap gap-2">
                {SHIPPING_REGIONS.map((region) => (
                  <span
                    key={region}
                    className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs text-white/70"
                  >
                    {region}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Container>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <Container className="flex flex-col items-center justify-between gap-3 py-5 sm:flex-row">
          <p className="text-xs text-white/40">
            &copy; {currentYear} {SITE_NAME}. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-white/40">
            <span>FSSAI: {FSSAI_NUMBER}</span>
            <span className="hidden sm:inline">&middot;</span>
            <span className="hidden sm:inline">Maharashtra, India</span>
          </div>
        </Container>
      </div>
    </footer>
  );
}
