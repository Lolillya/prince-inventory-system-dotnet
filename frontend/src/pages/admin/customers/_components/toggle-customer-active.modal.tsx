import { Separator } from "@/components/separator";
import { UserClientModel } from "@/models/user-client.model";
import { ToggleCustomerActiveService } from "@/features/customers/toggle-customer-active.service";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import {
  Eye,
  EyeOff,
  LockKeyhole,
  ShieldCheck,
  TriangleAlert,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ToggleCustomerActiveModalProps {
  customer: UserClientModel;
  onClose: () => void;
}

export const ToggleCustomerActiveModal = ({
  customer,
  onClose,
}: ToggleCustomerActiveModalProps) => {
  const queryClient = useQueryClient();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isActive = customer.isActive;
  const actionLabel = isActive ? "Deactivate" : "Reactivate";

  const handleConfirm = async () => {
    if (!password.trim()) {
      setPasswordError("Password is required.");
      return;
    }

    setIsSubmitting(true);
    try {
      await ToggleCustomerActiveService(customer.id, password.trim());

      toast.success(
        isActive
          ? "Customer deactivated successfully"
          : "Customer reactivated successfully",
      );

      await queryClient.invalidateQueries({ queryKey: ["customer"] });
      onClose();
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        setPasswordError("Incorrect password. Please try again.");
        return;
      }
      // Other failures (e.g. the 0-invoice-records requirement) are already
      // surfaced as a toast by the service — keep the modal open so the
      // user can see it and adjust/cancel.
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="fixed bg-black/40 w-full h-full top-0 left-0 flex justify-center items-center z-70">
      <div className="w-full max-w-md bg-white rounded-2xl border shadow-lg p-8 flex flex-col gap-4 justify-center items-center relative">
        <div
          className="absolute top-4 right-4 p-2 rounded-md cursor-pointer duration-300 transition-all hover:bg-gray-100"
          onClick={onClose}
        >
          <X />
        </div>

        <div className="p-4 rounded-2xl bg-indigo-100 w-fit">
          <LockKeyhole className="text-indigo-500" size={28} />
        </div>
        <div className="flex flex-col gap-1 text-center">
          <h3 className="text-2xl font-bold">Confirm Your Password</h3>
          <p className="text-sm text-vesper-gray">
            Authentication required to proceed
          </p>
        </div>

        <Separator orientation="horizontal" />

        <div className="flex gap-3 w-full items-start">
          <div className="p-2 rounded-xl bg-orange-100 h-fit shrink-0">
            <TriangleAlert className="text-orange-500" size={22} />
          </div>

          <div className="flex flex-col">
            <span className="font-semibold">You are about to:</span>
            <span className="font-semibold">{actionLabel} a Customer</span>
          </div>
        </div>

        <Separator orientation="horizontal" />

        <div className="flex flex-col gap-1 w-full">
          <label className="text-sm font-semibold text-left w-full">
            Password
          </label>
          <div className="relative w-full">
            <input
              type={showPassword ? "text" : "password"}
              className="border rounded-md p-2 pr-10 w-full shadow-none drop-shadow-none"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (passwordError && e.target.value.trim()) {
                  setPasswordError("");
                }
              }}
              placeholder="Enter your password"
            />
            <div
              className="absolute right-4 top-1/2 -translate-y-1/2 text-vesper-gray cursor-pointer hover:text-vesper-gray/80 hover:scale-105 duration-300 transition-all"
              onClick={() => setShowPassword((prev) => !prev)}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </div>
          </div>
        </div>
        {passwordError ? (
          <span className="text-xs text-red-500 w-full text-left">
            {passwordError}
          </span>
        ) : null}

        <span className="flex items-center gap-1 text-xs text-vesper-gray w-full font-semibold">
          <ShieldCheck size={14} /> For your security, please confirm your
          password to continue.
        </span>

        <div className="flex justify-end gap-3 w-full">
          <button
            className="px-4 py-2 border rounded-md w-full max-w-full bg-white hover:bg-gray-50 disabled:opacity-60 text-vesper-gray"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2  text-white rounded-md disabled:opacity-60 w-full max-w-full"
            onClick={handleConfirm}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Please wait..." : "Confirm & Proceed"}
          </button>
        </div>
      </div>
    </section>
  );
};
