"use client";

import React, { useState } from "react";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import toast from "react-hot-toast";
import { updateClaimStatus } from "@/lib/User/admin/adminClaim";
import ClaimApprovalNotifyDialog, { ClaimInfo } from "./ClaimApprovalNotifyDialog";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import AdminDeleteButton from "./AdminDeleteButton";

interface AdminClaimRowActionsProps {
  claim: ClaimInfo;
  onDeleteClaim?: (id: string) => Promise<{ success: boolean; error?: string }>;
}

export default function AdminClaimRowActions({
  claim,
  onDeleteClaim,
}: AdminClaimRowActionsProps) {
  const [currentStatus, setCurrentStatus] = useState(claim.status);
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [isNotifyModalOpen, setIsNotifyModalOpen] = useState(false);
  const [isRejectConfirmOpen, setIsRejectConfirmOpen] = useState(false);

  const handleApprove = async () => {
    setIsApproving(true);
    try {
      const res = await updateClaimStatus(claim.id, "APPROVED");
      if (res && res.success) {
        toast.success("Claim approved successfully! 🎉");
        setCurrentStatus("APPROVED");
        setIsNotifyModalOpen(true);
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
            {/* Notify / WhatsApp Details Button */}
            <button
              type="button"
              onClick={() => setIsNotifyModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 hover:text-emerald-900 transition shadow-xs cursor-pointer"
              title="Open approval details & send links via WhatsApp"
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

      {/* Approval Notification Modal */}
      <ClaimApprovalNotifyDialog
        isOpen={isNotifyModalOpen}
        onClose={() => setIsNotifyModalOpen(false)}
        claim={claim}
      />
    </>
  );
}
