"use client";

import { AlertCircle, MessageCircle } from "lucide-react";
import { WHATSAPP_NUMBER } from "@/lib/constants";
import { getWhatsAppUrl } from "@/lib/utils";

interface OutOfStockAlertProps {
  productName: string;
  size?: string;
  className?: string;
}

export default function OutOfStockAlert({
  productName,
  size,
  className = "",
}: OutOfStockAlertProps) {
  const message = `Hi! I'd like to pre-book ${productName}${
    size ? ` (${size})` : ""
  } from Organika's Food. Please let me know when it's back in stock.`;
  const waUrl = getWhatsAppUrl(WHATSAPP_NUMBER, message);

  return (
    <div
      role="alert"
      className={`flex items-start gap-2.5 p-3 rounded-xl bg-amber-50 border border-amber-200 ${className}`}
    >
      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-xs text-amber-900 leading-snug">
          Currently out of stock — please contact us on WhatsApp to pre-book
          your order.
        </p>
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 mt-1.5 text-xs font-semibold text-[#1a3a2a] bg-[#25D366]/15 hover:bg-[#25D366]/25 px-2.5 py-1 rounded-full transition-colors"
        >
          <MessageCircle className="w-3 h-3" />
          Pre-book on WhatsApp
        </a>
      </div>
    </div>
  );
}
