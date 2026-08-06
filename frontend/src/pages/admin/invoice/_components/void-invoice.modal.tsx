import { Separator } from "@/components/separator";
import { InvoiceAllModel } from "@/features/invoice/models/invoice-all.model";
import axios from "axios";
import { Info, LockKeyhole, ShieldCheck, TriangleAlert } from "lucide-react";
import { useState } from "react";

interface Props {
  selectedInvoice: InvoiceAllModel;
  onClose: () => void;
  onConfirm: (payload: {
    invoiceId: number;
    password: string;
    reason: string;
  }) => Promise<void>;
  isVoiding: boolean;
}

export const VoidInvoiceModal = ({
  selectedInvoice,
  onClose,
  onConfirm,
  isVoiding,
}: Props) => {
  const [reason, setReason] = useState("");
  const [reasonError, setReasonError] = useState("");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const invoiceNumberLabel = String(
    selectedInvoice.invoice_Number,
  ).padStart(6, "0");

  const customerLabel = selectedInvoice.customer.companyName
    ? selectedInvoice.customer.companyName
    : `${selectedInvoice.customer.firstName} ${selectedInvoice.customer.lastName}`;

  const handleOpenPasswordModal = () => {
    if (!reason.trim()) {
      setReasonError("Reason is required.");
      return;
    }

    setReasonError("");
    setIsPasswordModalOpen(true);
  };

  const handleVoid = async () => {
    if (!password.trim()) {
      setPasswordError("Password is required.");
      return;
    }

    setPasswordError("");
    try {
      await onConfirm({
        invoiceId: selectedInvoice.invoice_ID,
        password: password.trim(),
        reason: reason.trim(),
      });
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        setPasswordError("Incorrect password. Please try again.");
        return;
      }

      setPasswordError("Unable to void invoice. Please try again.");
    }
  };

  return (
    <section className="absolute bg-black/40 w-full h-full top-0 left-0 flex justify-center items-center z-50">
      <div className="w-3/6 h-4/5 bg-white p-10 rounded-lg border shadow-lg">
        <div className="flex flex-col gap-2 h-full">
          <label className="text-xl font-semibold">
            #DR/INV-{invoiceNumberLabel}
          </label>
          <label className="text-sm text-vesper-gray font-semibold">
            Customer: {customerLabel}
          </label>

          <div className="flex items-start gap-2 p-4 border border-red-400 rounded-md bg-red-50">
            <TriangleAlert className="text-red-600 shrink-0 mt-0.5" size={20} />
            <span className="text-sm text-red-600 font-semibold">
              You are about to void this invoice! This will mark the invoice
              as Voided and cannot be undone.
            </span>
          </div>

          <div className="flex-1 flex flex-col overflow-hidden gap-2">
            {/* TABLE DATA HEADERS */}
            <div className="flex justify-between py-3 px-5 bg-custom-gray rounded-lg gap-2">
              <label className="text-left w-full uppercase text-xs font-semibold">
                Product
              </label>
              <label className="text-left w-[30%] uppercase text-xs font-semibold">
                Quantity
              </label>
              <label className="text-right w-[30%] uppercase text-xs font-semibold">
                Total
              </label>
            </div>

            {/* TABLE DATA BODY */}
            <div className="overflow-auto flex flex-col h-full">
              {selectedInvoice.lineItems.map((item, i) => (
                <div
                  className={`py-3 px-5 flex justify-between gap-2 rounded-lg items-center ${i % 2 != 0 && "bg-custom-gray"}`}
                  key={item.lineItem_ID}
                >
                  <div className="text-xs w-full flex gap-2 items-center font-semibold">
                    <span>
                      {item.product.product_Name} - {item.product.brandName}{" "}
                      - {item.product.variantName}
                    </span>
                    <span>•</span>
                    <span className="text-vesper-gray">
                      {item.product.categoryName}
                    </span>
                  </div>

                  <span className="text-left w-[30%] text-xs font-semibold">
                    {item.unit_Quantity} {item.unit}
                  </span>

                  <span className="text-right w-[30%] text-xs font-semibold">
                    ₱
                    {item.sub_Total.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <Separator orientation="horizontal" />

          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold">Grand Total</span>
            <span className="text-lg font-bold">
              ₱
              {selectedInvoice.total_Amount.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-1">
              <label className="text-sm font-semibold">Reason</label>
              <span className="text-red-500">*</span>
            </div>
            <label className="text-vesper-gray text-xs">
              The reason will be recorded in invoice history and will also
              replace the current notes for this invoice.
            </label>
            <textarea
              className="border rounded-md p-2 text-xs"
              rows={3}
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (reasonError && e.target.value.trim()) {
                  setReasonError("");
                }
              }}
              placeholder="Enter reason for voiding this invoice"
            />
            {reasonError ? (
              <span className="text-xs text-red-500">{reasonError}</span>
            ) : null}
          </div>

          <div className="flex items-center justify-end gap-3">
            <button
              className="px-4 py-2 border rounded-md"
              onClick={onClose}
              disabled={isVoiding}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 bg-red-500 text-white rounded-md disabled:opacity-60"
              onClick={handleOpenPasswordModal}
              disabled={isVoiding}
            >
              <TriangleAlert />
              Void Invoice
            </button>
          </div>
        </div>
      </div>

      {isPasswordModalOpen ? (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-60">
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
                <span className="font-semibold">Void an Invoice</span>
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
                disabled={isVoiding}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-500 text-white rounded-md disabled:opacity-60 w-full max-w-full"
                onClick={handleVoid}
                disabled={isVoiding}
              >
                {isVoiding ? "Voiding..." : "Void Invoice"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
};
