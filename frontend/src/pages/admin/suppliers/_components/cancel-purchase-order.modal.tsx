import { Separator } from "@/components/separator";
import { PurchaseOrderRecord } from "@/features/purchase-order/purchase-order.model";
import axios from "axios";
import {
  FileText,
  Info,
  LockKeyhole,
  ShieldCheck,
  TriangleAlert,
  X,
} from "lucide-react";
import { useState } from "react";
import {
  DISPLAY_STATUS_CLASSES,
  DISPLAY_STATUS_ICON,
  DISPLAY_STATUS_LABEL,
  getDisplayStatus,
} from "@/features/purchase-order/purchase-order-status.helper";

interface CancelPurchaseOrderModalProps {
  purchaseOrder: PurchaseOrderRecord;
  onClose: () => void;
  onConfirm: (payload: {
    purchaseOrderId: number;
    reason: string;
    password: string;
  }) => Promise<void>;
  isCancelling: boolean;
}

export const CancelPurchaseOrderModal = ({
  purchaseOrder,
  onClose,
  onConfirm,
  isCancelling,
}: CancelPurchaseOrderModalProps) => {
  const [reason, setReason] = useState("");
  const [password, setPassword] = useState("");
  const [reasonError, setReasonError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const displayStatus = getDisplayStatus(purchaseOrder);
  const StatusIcon = DISPLAY_STATUS_ICON[displayStatus];

  // Valid Received Quantity = sum(valid, non-reversed restocks). received_quantity
  // is already computed live server-side, excluding voided/reversed restocks.
  const hasReceivedAny = purchaseOrder.line_Items.some(
    (li) => Number(li.received_quantity || 0) > 0,
  );
  const shortDeliveries = purchaseOrder.line_Items.filter(
    (li) => Number(li.remaining_quantity || 0) > 0,
  );

  const resultingStatusLabel = hasReceivedAny
    ? "Cancelled - After Partial Delivery"
    : "Cancelled - No Delivery";

  const handleOpenPasswordModal = () => {
    if (!reason.trim()) {
      setReasonError("Reason is required.");
      return;
    }

    setReasonError("");
    setIsPasswordModalOpen(true);
  };

  const resetModalState = () => {
    setIsPasswordModalOpen(false);
    setPassword("");
    setPasswordError("");
    setReason("");
    setReasonError("");
  };

  const handleCancelPO = async () => {
    if (!password.trim()) {
      setPasswordError("Password is required.");
      return;
    }

    setPasswordError("");
    try {
      await onConfirm({
        purchaseOrderId: purchaseOrder.purchase_Order_ID,
        reason: reason.trim(),
        password: password.trim(),
      });
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        setPasswordError("Incorrect password. Please try again.");
        return;
      }

      setPasswordError("Unable to cancel purchase order. Please try again.");
    }
  };

  return (
    <section className="absolute bg-black/40 w-full h-full top-0 left-0 flex justify-center items-center z-70">
      <div className="max-w-4/12 max-h-[90vh] overflow-y-auto bg-white p-8 rounded-lg border shadow-lg">
        <div className="flex flex-col gap-4">
          <div className="flex items-center">
            <h3>Cancel Purchase Order</h3>

            <div
              className="p-2 rounded-md cursor-pointer duration-300 transition-all hover:bg-gray-100 ml-auto"
              onClick={() => {
                resetModalState();
                onClose();
              }}
            >
              <X />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xl font-semibold flex items-center gap-2">
              <FileText />
              {purchaseOrder.purchase_Order_Number}
            </label>
            <span
              className={`font-semibold rounded-full text-xs py-1 px-3 flex items-center gap-2 ${DISPLAY_STATUS_CLASSES[displayStatus]}`}
            >
              {StatusIcon ? <StatusIcon size={14} /> : null}
              {DISPLAY_STATUS_LABEL[displayStatus]}
            </span>
          </div>

          <div className="flex items-start gap-2 p-4 border border-red-400 rounded-md bg-red-50">
            <TriangleAlert className="text-red-600 shrink-0 mt-0.5" size={28} />
            <span className="text-sm text-red-600 font-semibold flex flex-col gap-2">
              {hasReceivedAny
                ? "This purchase order has already received deliveries. "
                : ""}
              NOTE: This purchase order has already or did not received
              deliveries{" "}
              <span className="text-xs text-red-600 font-normal max-w-8/12">
                Canceling this purchase order will permanently close it and move
                it to Closed PO as{" "}
                <span className="font-bold text-red-600">
                  "{resultingStatusLabel}"
                </span>
              </span>
            </span>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold">
              Short Deliveries ({shortDeliveries.length})
            </label>
            <div className="rounded-md border-2 border-gray-300 overflow-hidden">
              <div className="grid grid-cols-[2fr_1fr] gap-2 px-3 py-2 bg-gray-50 text-xs font-semibold uppercase">
                <div>Product</div>
                <div className="text-right">Short Qty</div>
              </div>
              <div className="max-h-[20vh] overflow-y-auto">
                {shortDeliveries.length === 0 ? (
                  <div className="p-3 text-xs text-vesper-gray text-center">
                    No short deliveries
                  </div>
                ) : (
                  shortDeliveries.map((li) => (
                    <div
                      key={li.purchase_Order_LineItem_ID}
                      className="grid grid-cols-[2fr_1fr] gap-2 px-3 py-2 text-xs border-t"
                    >
                      <div className="font-semibold">
                        {li.product?.product_Name}
                      </div>
                      <div className="text-right font-semibold text-orange-600">
                        {li.remaining_quantity} {li.unit?.uom_Name ?? ""}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-1">
              <label className="text-sm font-semibold">Reason</label>
              <span className="text-red-500">*</span>
            </div>
            <textarea
              className="border rounded-md p-2 text-xs"
              rows={4}
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (reasonError && e.target.value.trim()) {
                  setReasonError("");
                }
              }}
              placeholder="Enter reason for cancelling this purchase order"
            />
            {reasonError ? (
              <span className="text-xs text-red-500">{reasonError}</span>
            ) : null}
          </div>

          <div className="flex items-center justify-end gap-3">
            <button
              className="px-4 py-2 border rounded-md"
              onClick={onClose}
              disabled={isCancelling}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 bg-red-500 text-white rounded-md disabled:opacity-60 flex items-center gap-2"
              onClick={handleOpenPasswordModal}
              disabled={isCancelling}
            >
              <TriangleAlert size={16} />
              Cancel PO
            </button>
          </div>
        </div>
      </div>

      {isPasswordModalOpen ? (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-70">
          <div className="w-full max-w-md bg-white rounded-lg border shadow-lg p-6 flex flex-col gap-4 justify-center items-center">
            <div className="p-3 rounded-md bg-indigo-100 w-fit">
              <LockKeyhole className="text-indigo-500" />
            </div>
            <div className="flex flex-col gap-1 text-center">
              <h3 className="text-lg font-semibold">Confirm Password</h3>
              <p className="text-sm text-vesper-gray">
                Authentication is required to proceed
              </p>
            </div>
            <Separator orientation="horizontal" />
            <div className="flex gap-2 w-full">
              <div className="p-2 rounded-md bg-orange-100 h-fit">
                <Info className="text-orange-500" />
              </div>

              <div className="flex flex-col">
                <span className="font-semibold">You are about to:</span>
                <span className="font-semibold">Cancel a Purchase Order</span>
                <span className="text-xs text-vesper-gray">
                  This action cannot be undone.
                </span>
              </div>
            </div>
            <Separator orientation="horizontal" />
            <div className="flex flex-col gap-1 w-full">
              <label className="text-sm font-semibold text-left w-full">
                Password
              </label>
              <input
                type="password"
                className="border rounded-md p-2 w-full shadow-none drop-shadow-none"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (passwordError && e.target.value.trim()) {
                    setPasswordError("");
                  }
                }}
                placeholder="Enter your password"
              />
            </div>
            {passwordError ? (
              <span className="text-xs text-red-500">{passwordError}</span>
            ) : null}

            <span className="flex items-center gap-1 text-xs text-vesper-gray w-full font-semibold">
              <ShieldCheck size={14} /> For your security, please confirm your
              password to continue.
            </span>

            <div className="flex justify-end gap-3 w-full">
              <button
                className="px-4 py-2 border rounded-md w-full max-w-full"
                onClick={() => {
                  setIsPasswordModalOpen(false);
                  setPassword("");
                  setPasswordError("");
                }}
                disabled={isCancelling}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-500 text-white rounded-md disabled:opacity-60 w-full max-w-full"
                onClick={handleCancelPO}
                disabled={isCancelling}
              >
                {isCancelling ? "Cancelling..." : "Cancel PO"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
};
