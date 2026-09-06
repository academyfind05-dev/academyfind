"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  Building2,
  User,
  Phone,
  Sparkles,
  Link as LinkIcon,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import toast from "react-hot-toast";
import { formatWhatsAppNumber } from "./AdminClaimWhatsAppButton";

export interface ClaimInfo {
  id: string;
  instituteId: string;
  fullName: string;
  phone: string;
  email: string;
  status: string;
  institute?: {
    id?: string;
    name: string;
    slug?: string | null;
    address?: string | null;
    city?: { name: string } | null;
  } | null;
  user?: {
    id?: string;
    name?: string | null;
    email?: string | null;
  } | null;
}

interface ClaimApprovalNotifyDialogProps {
  isOpen: boolean;
  onClose: () => void;
  claim: ClaimInfo;
}

export function getProductionBaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (envUrl && !envUrl.includes("localhost")) {
    return envUrl.replace(/\/$/, "");
  }
  if (
    typeof window !== "undefined" &&
    window.location.origin &&
    !window.location.origin.includes("localhost")
  ) {
    return window.location.origin;
  }
  return "https://www.academyfind.com";
}

export function buildApprovalLinks(claim: ClaimInfo) {
  const baseUrl = getProductionBaseUrl();
  const instituteId = claim.institute?.id || claim.instituteId;
  const slug =
    claim.institute?.slug ||
    claim.institute?.name?.toLowerCase().replace(/[^a-z0-9]+/g, "-") ||
    "";

  const publicListingUrl = `${baseUrl}/institute/${instituteId}-${slug}`;
  const managerDashboardUrl = `${baseUrl}/manager/${instituteId}`;

  return { publicListingUrl, managerDashboardUrl };
}

export function buildApprovalWhatsAppMessage(claim: ClaimInfo): string {
  const { publicListingUrl, managerDashboardUrl } = buildApprovalLinks(claim);
  const managerName = claim.fullName || claim.user?.name || "Manager";
  const instituteName = claim.institute?.name || "Your Institute";

  return `🎉 *Congratulations ${managerName}!*

We are pleased to inform you that your claim request for *${instituteName}* has been officially verified & *APPROVED* on AcademyFind!

You now have full manager access to manage your institute's profile and student leads:

🌐 *View Your Public Listing:*
${publicListingUrl}

📊 *Access Manager Dashboard:*
${managerDashboardUrl}

*What you can do in your manager dashboard:*
✅ Update institute overview, facilities & photo gallery
✅ Add & manage courses, fee structures and batches
✅ View and manage direct student enquiry leads & callbacks
✅ Respond to student reviews and monitor traffic analytics

If you need any assistance getting started, feel free to reply directly to this message.

Best Regards,
*Team AcademyFind*
🌐 www.academyfind.com`;
}

export default function ClaimApprovalNotifyDialog({
  isOpen,
  onClose,
  claim,
}: ClaimApprovalNotifyDialogProps) {
  const [copiedMessage, setCopiedMessage] = useState(false);
  const [copiedListing, setCopiedListing] = useState(false);
  const [copiedDashboard, setCopiedDashboard] = useState(false);

  const { publicListingUrl, managerDashboardUrl } = buildApprovalLinks(claim);
  const fullMessage = buildApprovalWhatsAppMessage(claim);
  const waPhone = formatWhatsAppNumber(claim.phone);
  const whatsappUrl = waPhone
    ? `https://wa.me/${waPhone}?text=${encodeURIComponent(fullMessage)}`
    : "";

  const copyToClipboard = async (
    text: string,
    setCopiedState: (v: boolean) => void,
    label: string
  ) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedState(true);
      toast.success(`${label} copied to clipboard!`);
      setTimeout(() => setCopiedState(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl p-0 overflow-hidden rounded-3xl border-slate-200 bg-white shadow-2xl font-sans">
        {/* Header with Emerald Badge */}
        <div className="bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 p-6 text-white relative">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shrink-0 border border-white/30 shadow-inner">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                  Claim Approved! Tell the Manager
                </DialogTitle>
                <DialogDescription className="text-emerald-100 text-xs mt-1">
                  Request successfully verified. Send this official confirmation with live links to the manager on WhatsApp.
                </DialogDescription>
              </div>
            </div>
          </div>

          {/* Quick Details Chips */}
          <div className="mt-4 pt-3 border-t border-white/15 flex flex-wrap items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-black/20 text-white font-semibold backdrop-blur-xs">
              <Building2 className="w-3.5 h-3.5 text-emerald-200" />
              {claim.institute?.name || "Institute"}
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-black/20 text-white font-semibold backdrop-blur-xs">
              <User className="w-3.5 h-3.5 text-emerald-200" />
              {claim.fullName}
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-black/20 text-white font-semibold backdrop-blur-xs">
              <Phone className="w-3.5 h-3.5 text-emerald-200" />
              {claim.phone}
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Quick Direct Link Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Public Listing Link */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-slate-300 transition-colors">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1.5">
                <span className="flex items-center gap-1 text-blue-600">
                  <LinkIcon className="w-3.5 h-3.5" /> Public Listing Link
                </span>
                <button
                  type="button"
                  onClick={() =>
                    copyToClipboard(publicListingUrl, setCopiedListing, "Listing Link")
                  }
                  className="p-1 text-slate-500 hover:text-blue-600 rounded transition cursor-pointer"
                  title="Copy Link"
                >
                  {copiedListing ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
              <div className="text-[11px] text-slate-500 font-mono truncate bg-white p-2 rounded-lg border border-slate-200">
                {publicListingUrl}
              </div>
              <a
                href={publicListingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700"
              >
                Open Page <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Manager Dashboard Link */}
            <div className="p-3.5 rounded-2xl bg-amber-50/50 border border-amber-200/80 hover:border-amber-300 transition-colors">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1.5">
                <span className="flex items-center gap-1 text-amber-700">
                  <Sparkles className="w-3.5 h-3.5" /> Manager Dashboard Link
                </span>
                <button
                  type="button"
                  onClick={() =>
                    copyToClipboard(
                      managerDashboardUrl,
                      setCopiedDashboard,
                      "Dashboard Link"
                    )
                  }
                  className="p-1 text-slate-500 hover:text-amber-700 rounded transition cursor-pointer"
                  title="Copy Link"
                >
                  {copiedDashboard ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
              <div className="text-[11px] text-slate-500 font-mono truncate bg-white p-2 rounded-lg border border-amber-200">
                {managerDashboardUrl}
              </div>
              <a
                href={managerDashboardUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 hover:text-amber-800"
              >
                Open Dashboard <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* WhatsApp Message Preview Bubble */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <FaWhatsapp className="w-3.5 h-3.5 text-[#25D366]" />
                WhatsApp Message Preview
              </label>
              <button
                type="button"
                onClick={() =>
                  copyToClipboard(fullMessage, setCopiedMessage, "Full Message")
                }
                className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg transition cursor-pointer"
              >
                {copiedMessage ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Full Message</span>
                  </>
                )}
              </button>
            </div>

            {/* Chat Bubble Frame */}
            <div className="bg-[#EFEAE2] p-3 sm:p-4 rounded-2xl border border-[#d1c7b8] shadow-inner">
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 max-w-lg relative">
                <div className="text-xs sm:text-[13px] text-slate-800 whitespace-pre-line leading-relaxed font-sans select-all">
                  {fullMessage}
                </div>
                <div className="text-[10px] text-slate-400 text-right mt-2 flex items-center justify-end gap-1 font-medium">
                  Ready to send • <span>wa.me</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Footer */}
        <div className="bg-slate-50 border-t border-slate-200 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto rounded-xl border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs"
          >
            Close
          </Button>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                copyToClipboard(fullMessage, setCopiedMessage, "Full Message")
              }
              className="w-full sm:w-auto rounded-xl border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs gap-1.5"
            >
              {copiedMessage ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              Copy Text
            </Button>

            {whatsappUrl ? (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#1ebd59] text-white font-bold text-xs shadow-md hover:shadow-lg transition-all transform active:scale-95"
              >
                <FaWhatsapp className="w-4 h-4" />
                <span>Send via WhatsApp</span>
              </a>
            ) : (
              <Button
                disabled
                className="w-full sm:w-auto rounded-xl bg-slate-300 text-slate-500 font-bold text-xs"
              >
                No Phone Provided
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
