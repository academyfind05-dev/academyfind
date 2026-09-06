"use client";

import React from "react";
import { FaWhatsapp } from "react-icons/fa";

export function formatWhatsAppNumber(phone?: string | null): string {
  if (!phone) return "";
  let cleaned = phone.replace(/\D/g, "");
  if (cleaned.startsWith("0")) {
    cleaned = cleaned.slice(1);
  }
  if (cleaned.length === 10) {
    cleaned = `91${cleaned}`;
  }
  return cleaned;
}

interface AdminClaimWhatsAppButtonProps {
  phone: string;
  managerName: string;
  instituteName?: string;
  className?: string;
}

export default function AdminClaimWhatsAppButton({
  phone,
  managerName,
  instituteName,
  className = "",
}: AdminClaimWhatsAppButtonProps) {
  const waNumber = formatWhatsAppNumber(phone);

  if (!waNumber) return null;

  const defaultGreeting = `Hi ${managerName || "Manager"}, this is from AcademyFind regarding your ownership claim request for ${instituteName || "your institute"}.`;
  const whatsappUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(defaultGreeting)}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      title="Chat with manager on WhatsApp"
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 hover:text-emerald-800 border border-emerald-200/80 transition-all shadow-xs cursor-pointer ${className}`}
      onClick={(e) => e.stopPropagation()}
    >
      <FaWhatsapp className="w-3.5 h-3.5 text-[#25D366] shrink-0" />
      <span>WhatsApp</span>
    </a>
  );
}
