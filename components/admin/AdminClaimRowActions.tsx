"use client";

import React, { useState } from "react";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import toast from "react-hot-toast";
import { updateClaimStatus } from "@/lib/User/admin/adminClaim";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import AdminDeleteButton from "./AdminDeleteButton";
import { formatWhatsAppNumber } from "./AdminClaimWhatsAppButton";

export interface ClaimData {
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

interface AdminClaimRowActionsProps {
  claim: ClaimData;
  onDeleteClaim?: (id: string) => Promise<{ success: boolean; error?: string }>;
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

export function buildApprovalLinks(claim: ClaimData) {
  const baseUrl = getProductionBaseUrl();
  const instituteId = claim.institute?.id || claim.instituteId;
  const rawSlug =
    claim.institute?.slug ||
    claim.institute?.name?.toLowerCase().replace(/[^a-z0-9]+/g, "-") ||
    "";
  const slug = rawSlug.replace(/^-+|-+$/g, "");

  const publicListingUrl = slug
    ? `${baseUrl}/institute/${instituteId}-${slug}`
    : `${baseUrl}/institute/${instituteId}`;
  const managerDashboardUrl = `${baseUrl}/manager/${instituteId}`;

  return { publicListingUrl, managerDashboardUrl };
}

export function buildApprovalWhatsAppMessage(claim: ClaimData): string {
  const { publicListingUrl, managerDashboardUrl } = buildApprovalLinks(claim);
  const managerName = claim.fullName || claim.user?.name || "Manager";
  const instituteName = claim.institute?.name || "Your Institute";

  return `\u{1F389} *Congratulations ${managerName}!*

We are pleased to inform you that your claim request for *${instituteName}* has been officially verified & *APPROVED* on AcademyFind!

You now have full manager access to your profile:

\u{1F310} *View Your Public Listing:*
${publicListingUrl}

\u{1F4CA} *Access Manager Dashboard:*
${managerDashboardUrl}

*What you can do in your dashboard:*
\u2705 Update institute info, courses, & fee structure
\u2705 Add batches, facilities & gallery photos
\u2705 View student enquiry leads & callbacks
\u2705 Respond to student reviews

If you need any assistance, feel free to reply directly to this message.

Best Regards,
*Team AcademyFind*
\u{1F310} www.academyfind.com`;
}

export function buildApprovalWhatsAppUrl(claim: ClaimData): string {
  const waPhone = formatWhatsAppNumber(claim.phone);
  if (!waPhone) return "";
  const message = buildApprovalWhatsAppMessage(claim);
  return `https://api.whatsapp.com/send?phone=${waPhone}&text=${encodeURIComponent(message)}`;
}

export default function AdminClaimRowActions({
  claim,
  onDeleteClaim,
}: AdminClaimRowActionsProps) {
  const [currentStatus, setCurrentStatus] = useState(claim.status);
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [isNotifyOpen, setIsNotifyOpen] = useState(false);
  const [isRejectConfirmOpen, setIsRejectConfirmOpen] = useState(false);

  const waUrl = buildApprovalWhatsAppUrl(claim);

  const handleApprove = async () => {
    setIsApproving(true);
    try {
      const res = await updateClaimStatus(claim.id, "APPROVED");
      if (res && res.success) {
        toast.success("Claim approved! 🎉");
        setCurrentStatus("APPROVED");
        // Open small notify manager dialog
        setIsNotifyOpen(true);
      } else {
        toast.error((res as any)?.error || "Failed to approve claim");
      }
    } catch (err: any) {
      console.error("Error approving claim:", err);
      toast.error("Failed to approve claim");
    } finally {
      setIsApproving(false);
    }
  };

  const handleOpenWhatsApp = () => {
    if (waUrl) {
      window.open(waUrl, "_blank");
      setIsNotifyOpen(false);
    } else {
      toast.error("No valid phone number for WhatsApp");
    }
  };

  const handleRejectConfirm = async () => {
    setIsRejecting(true);
    try {
      const res = await updateClaimStatus(claim.id, "REJECTED");
      if (res && res.success) {
        toast.success("Claim rejected");
        setCurrentStatus("REJECTED");
      } else {
        toast.error((res as any)?.error || "Failed to reject claim");
      }
    } catch (err: any) {
      console.error("Error rejecting claim:", err);
      toast.error("Failed to reject claim");
    } finally {
      setIsRejecting(false);
      setIsRejectConfirmOpen(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-end gap-2">
        {currentStatus === "PENDING" ? (
          <>
            {/* Reject Button */}
            <button
              type="button"
              onClick={() => setIsRejectConfirmOpen(true)}
              disabled={isApproving || isRejecting}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition shadow-xs cursor-pointer disabled:opacity-50"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Reject</span>
            </button>

            {/* Approve Button */}
            <button
              type="button"
              onClick={handleApprove}
              disabled={isApproving || isRejecting}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 border border-emerald-700 rounded-lg hover:bg-emerald-700 transition shadow-xs cursor-pointer disabled:opacity-50"
            >
              {isApproving ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <CheckCircle className="w-3.5 h-3.5" />
              )}
              <span>{isApproving ? "Approving..." : "Approve"}</span>
            </button>
          </>
        ) : currentStatus === "APPROVED" ? (
          <>
            {/* Notify Manager Button */}
            <button
              type="button"
              onClick={() => setIsNotifyOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 hover:text-emerald-900 transition shadow-xs cursor-pointer"
              title="Notify manager on WhatsApp"
            >
              <FaWhatsapp className="w-3.5 h-3.5 text-[#25D366]" />
              <span>Notify Manager</span>
            </button>

            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              Approved
            </span>
          </>
        ) : (
          <span className="text-xs font-medium text-slate-400 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
            Rejected
          </span>
        )}

        {/* Delete Button */}
        {onDeleteClaim && (
          <AdminDeleteButton
            id={claim.id}
            onDelete={onDeleteClaim}
            title="Delete Claim?"
          />
        )}
      </div>

      {/* 🚀 Chotta Sa Notify Manager Dialog Box */}
      <Dialog open={isNotifyOpen} onOpenChange={setIsNotifyOpen}>
        <DialogContent className="sm:max-w-md p-6 rounded-2xl bg-white border border-slate-200 shadow-xl">
          <DialogHeader className="gap-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                <FaWhatsapp className="w-5 h-5 text-[#25D366]" />
              </div>
              <div>
                <DialogTitle className="text-lg font-extrabold text-slate-900 leading-tight">
                  Notify Manager
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500 mt-0.5">
                  Request is approved. Send confirmation & institute links to manager.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* Details Card */}
          <div className="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs text-slate-700 space-y-1.5">
            <div className="font-bold text-slate-900 text-sm">{claim.institute?.name || "Institute"}</div>
            <div className="text-slate-500">
              Manager: <span className="font-semibold text-slate-700">{claim.fullName}</span> ({claim.phone})
            </div>
            <p className="text-slate-500 pt-1 text-[11px] leading-relaxed">
              Click below to send their public listing and dashboard links directly on WhatsApp.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="mt-5 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsNotifyOpen(false)}
              className="rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold px-4"
            >
              Close
            </Button>
            <button
              type="button"
              onClick={handleOpenWhatsApp}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-95"
            >
              <FaWhatsapp className="w-4 h-4" />
              <span>Send via WhatsApp</span>
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmation modal before rejecting */}
      <ConfirmModal
        isOpen={isRejectConfirmOpen}
        onClose={() => setIsRejectConfirmOpen(false)}
        onConfirm={handleRejectConfirm}
        title="Reject Claim Request?"
        description={`Are you sure you want to reject the ownership claim for ${
          claim.institute?.name || "this institute"
        } submitted by ${claim.fullName}?`}
        confirmText="Yes, Reject"
        destructive={true}
        loading={isRejecting}
      />
    </>
  );
}
