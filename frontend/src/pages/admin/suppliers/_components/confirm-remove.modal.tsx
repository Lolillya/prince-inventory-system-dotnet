import { Separator } from "@/components/separator";
import { SupplierDataModel } from "@/features/suppliers/get-all-suppliers.model";
import { ToggleSupplierActiveService } from "@/features/suppliers/toggle-supplier-active/toggle-supplier-active.service";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Info, LockKeyhole, ShieldCheck, TriangleAlert } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ConfirmRemoveModalProps {
  setIsConfirmRemoveModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  supplier: SupplierDataModel;
}

export const ConfirmRemoveModal = ({
  setIsConfirmRemoveModalOpen,
  supplier,
}: ConfirmRemoveModalProps) => {
  const queryClient = useQueryClient();
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isActive = supplier.is_Active;
  const actionLabel = isActive ? "Deactivate" : "Reactivate";

  const handleCloseModal = () => {
    setIsConfirmRemoveModalOpen(false);
  };

  const handleConfirm = async () => {
    if (!password.trim()) {
      setPasswordError("Password is required.");
      return;
    }

    setIsSubmitting(true);
    try {
      await ToggleSupplierActiveService(supplier.supplier_Id, password.trim());

      toast.success(
        isActive
          ? "Supplier deactivated successfully"
          : "Supplier reactivated successfully",
      );

      await queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      handleCloseModal();
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        setPasswordError("Incorrect password. Please try again.");
        return;
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
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
            <span className="font-semibold">
              {actionLabel} {supplier.company_Name}
            </span>
            {isActive && (
              <span className="text-xs text-vesper-gray">
                The supplier will no longer be available for new restocks
                until reactivated.
              </span>
            )}
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
            onClick={handleCloseModal}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-red-500 text-white rounded-md disabled:opacity-60 w-full max-w-full"
            onClick={handleConfirm}
            disabled={isSubmitting}
          >
            <TriangleAlert size={16} />
            {isSubmitting ? "Please wait..." : actionLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
