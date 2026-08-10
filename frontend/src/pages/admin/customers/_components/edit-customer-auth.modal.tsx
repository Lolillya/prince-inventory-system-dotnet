import { Separator } from "@/components/separator";
import { Info, LockKeyhole, ShieldCheck } from "lucide-react";

interface EditCustomerAuthModalProps {
  password: string;
  setPassword: (password: string) => void;
  passwordError: string;
  setPasswordError: (error: string) => void;
  isSubmitting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export const EditCustomerAuthModal = ({
  password,
  setPassword,
  passwordError,
  setPasswordError,
  isSubmitting,
  onCancel,
  onConfirm,
}: EditCustomerAuthModalProps) => {
  return (
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
            <span className="font-semibold">Edit a Customer</span>
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
            type="button"
            className="px-4 py-2 border rounded-md w-full max-w-full"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="px-4 py-2 bg-river-green text-white rounded-md disabled:opacity-60 w-full max-w-full"
            onClick={onConfirm}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
};
