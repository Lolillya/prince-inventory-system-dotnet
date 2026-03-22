import { RestockAllModel } from "@/features/restock/models/restock-all.model";
import axios from "axios";
import { CircleAlert } from "lucide-react";
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
          <label className="text-sm text-vesper-gray">
            Supplier: {selectedRestock.supplier.firstName}{" "}
            {selectedRestock.supplier.lastName}
          </label>

          <div className="flex-1 flex flex-col overflow-hidden gap-2 ">
            {/* TABLE DATA HEADERS */}
            <div className="flex justify-between py-3 px-5 bg-custom-gray rounded-lg gap-2">
              <label className="text-left w-full uppercase text-xs font-semibold">
                Item
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
                  <div className="text-nowrap text-sm w-full">
                    <span>{item.product.product_Name}</span>
                    <span> - </span>
                    <span>{item.product.brand.brandName}</span>
                    <span> - </span>
                    <span>{item.product.variant.variant_Name}</span>
                  </div>
                  <span className="text-left w-[70%]">
                    {item.unit_Preset?.preset_Levels
                      ?.map(
                        (l) =>
                          l.unit?.uom_Name +
                          (l.conversion_Factor !== 1
                            ? ` (x${l.conversion_Factor})`
                            : ""),
                      )
                      .filter(Boolean)
                      .join(" → ") || "No preset"}
                  </span>

                  <span className="text-left w-[30%]">
                    {item.base_Unit_Quantity} {item.base_Unit.uom_Name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm text-vesper-gray">Reason:</label>
            <textarea
              className="border rounded-md p-2"
              rows={2}
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

          <div className="flex items-center gap-2">
            <CircleAlert className="text-red-400" size={14} />
            <span className="text-xs text-red-400">
              This restock is voidable, voiding will remove the quantity of the
              products listed above in the table
            </span>
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
              Continue
            </button>
          </div>
        </div>
      </div>

      {isPasswordModalOpen ? (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-60">
          <div className="w-full max-w-md bg-white rounded-lg border shadow-lg p-6 flex flex-col gap-4">
            <h3 className="text-lg font-semibold">Confirm Password</h3>
            <p className="text-sm text-vesper-gray">
              Enter your password to continue voiding this restock.
            </p>
            <input
              type="password"
              className="border rounded-md p-2"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (passwordError && e.target.value.trim()) {
                  setPasswordError("");
                }
              }}
              placeholder="Enter your password"
            />
            {passwordError ? (
              <span className="text-xs text-red-500">{passwordError}</span>
            ) : null}

            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 border rounded-md"
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
                className="px-4 py-2 bg-red-500 text-white rounded-md disabled:opacity-60"
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
