import { Separator } from "@/components/separator";
import { RestockAllModel } from "@/features/restock/models/restock-all.model";
import axios from "axios";
import {
  Info,
  Link2,
  LockKeyhole,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";
import { useState } from "react";

interface Props {
  selectedRestock: RestockAllModel;
  onClose: () => void;
  onConfirm: (payload: {
    restockId: number;
    reason: string;
    password: string;
  }) => Promise<void>;
  isVoiding: boolean;
}

export const VoidRestockModal = ({
  selectedRestock,
  onClose,
  onConfirm,
  isVoiding,
}: Props) => {
  const [reason, setReason] = useState("");
  const [password, setPassword] = useState("");
  const [reasonError, setReasonError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

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
        restockId: selectedRestock.restock_Id,
        reason: reason.trim(),
        password: password.trim(),
      });
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        setPasswordError("Incorrect password. Please try again.");
        return;
      }

      setPasswordError("Unable to void restock. Please try again.");
    }
  };

  return (
    <section className="absolute bg-black/40 w-full h-full top-0 left-0 flex justify-center items-center z-50">
      <div className="w-3/6 h-4/5 bg-white p-10 rounded-lg border shadow-lg">
        <div className="flex flex-col gap-2 h-full">
          <label className="text-xl font-semibold">
            {selectedRestock.restock_Number}
          </label>
          <label className="text-sm text-vesper-gray font-semibold">
            Supplier: {selectedRestock.supplier.firstName}{" "}
            {selectedRestock.supplier.lastName}
          </label>

          <div className="flex items-start gap-2 p-4 border border-red-400 rounded-md bg-red-50">
            <TriangleAlert className="text-red-600 shrink-0 mt-0.5" size={20} />
            {selectedRestock.purchase_order_number ? (
              <span className="text-sm text-red-600 font-semibold">
                NOTE: This restock is linked to{" "}
                <span className="font-bold">{selectedRestock.purchase_order_number}</span>. Undoing
                this will reverse the inventory receipt, restock the PO balance, and reopen
                the PO if it is currently completed.
              </span>
            ) : (
              <span className="text-sm text-red-600 font-semibold">
                You are about to undo this restock!
              </span>
            )}
          </div>

          {selectedRestock.purchase_order_number && (
            <div className="flex items-center gap-2 p-3 border border-blue-200 rounded-md bg-blue-50">
              <Link2 size={14} className="text-blue-500 shrink-0" />
              <span className="text-sm font-semibold text-blue-700">Linked Purchase Order:</span>
              <span className="text-sm font-bold text-blue-800">
                {selectedRestock.purchase_order_number}
              </span>
              {selectedRestock.purchase_order_status && (
                <>
                  <span className="text-blue-300">•</span>
                  <span className="text-xs font-semibold text-blue-600 bg-blue-100 border border-blue-200 rounded px-1.5 py-0.5">
                    {selectedRestock.purchase_order_status === "FULLY_DELIVERED"
                      ? "FULLY DELIVERED"
                      : selectedRestock.purchase_order_status}
                  </span>
                </>
              )}
            </div>
          )}

          <div className="flex-1 flex flex-col overflow-hidden gap-2 ">
            {/* TABLE DATA HEADERS */}
            <div className="flex justify-between py-3 px-5 bg-custom-gray rounded-lg gap-2">
              <label className="text-left w-full uppercase text-xs font-semibold">
                Product
              </label>
              <label className="text-left w-[70%] uppercase text-xs font-semibold">
                Conversion
              </label>
              <label className="text-left w-[30%] uppercase text-xs font-semibold">
                Quantity
              </label>
            </div>

            {/* TABLE DATA BODY */}
            <div className="overflow-auto flex flex-col h-full">
              {selectedRestock.line_Items.map((item, i) => (
                <div
                  className={`py-3 px-5 flex justify-between gap-2 rounded-lg items-center ${i % 2 != 0 && "bg-custom-gray"}`}
                  key={i}
                >
                  <div className="text-xs w-full flex gap-2 items-center font-semibold">
                    <span>{item.product.product_Name}</span>
                    <span>•</span>
                    <span className="text-vesper-gray">
                      {item.product.category.category_Name}
                    </span>
                  </div>
                  <span className="text-left w-[70%] text-xs font-semibold">
                    {item.unit_Preset?.preset_Levels
                      ?.map(
                        (l) =>
                          l.unit?.uom_Name +
                          (l.conversion_Factor !== 1
                            ? ` (${l.conversion_Factor}x)`
                            : ""),
                      )
                      .filter(Boolean)
                      .join(" → ") || "No preset"}
                  </span>

                  <span className="text-left w-[30%] text-xs font-semibold">
                    {item.base_Unit_Quantity} {item.base_Unit.uom_Name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-1">
              <label className="text-sm font-semibold">Reason</label>
              <span className="text-red-500">*</span>
            </div>
            <label className="text-vesper-gray text-xs">
              The reason will be recorded in inventory history and will also
              replacce the current restock notes for this restock entry.
            </label>
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
              placeholder="Enter reason for voiding this restock"
            />
            {reasonError ? (
              <span className="text-xs text-red-500">{reasonError}</span>
            ) : null}
          </div>

          {/* <div className="flex items-center gap-2">
            <CircleAlert className="text-red-400" size={14} />
            <span className="text-xs text-red-400">
              This restock is voidable, voiding will remove the quantity of the
              products listed above in the table
            </span>
          </div> */}

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
              Undo Restock
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
                <span className="font-semibold">Undo a Restock</span>
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
                {isVoiding ? "Voiding..." : "Void Restock"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
};
