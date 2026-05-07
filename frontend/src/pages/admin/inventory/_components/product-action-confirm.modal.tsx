import { Separator } from "@/components/separator";
import { Eye, EyeOff, Info, LockKeyhole, ShieldCheck } from "lucide-react";
import { useState } from "react";

interface ProductActionConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (password: string) => void;
  action: "deactivate" | "reactivate";
  isLoading: boolean;
}

export const ProductActionConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  action,
  isLoading,
}: ProductActionConfirmModalProps) => {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (!password) return;
    onConfirm(password);
    setPassword("");
  };

  const handleClose = () => {
    setPassword("");
    onClose();
  };

  const isDeactivate = action === "deactivate";

  return (
    <div className="absolute bg-black/40 w-full h-full top-0 left-0 flex justify-center items-center z-50">
      <div className="bg-background rounded-xl shadow-lg p-6 w-full max-w-md flex flex-col gap-4">
        <div className="flex flex-col gap-0.5">
          <div className="flex flex-col items-center">
            <div className="rounded-lg p-2 bg-indigo-200 w-fit">
              <LockKeyhole className="text-indigo-600" size={32} />
            </div>
            <label className="text-lg font-semibold capitalize">
              confirm your password
            </label>
            <label className="text-sm text-vesper-gray">
              Authentication required to proceed
            </label>
          </div>
          {/* <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            You are about to:
          </span>
          <h2 className="text-lg font-bold">
            {isDeactivate ? "Deactivate a Product" : "Reactivate a Product"}
          </h2> */}
        </div>

        <Separator orientation="horizontal" />

        <div className="flex gap-2 items-center">
          <div className="rounded-lg p-2 bg-amber-200/50 w-fit">
            <Info className="text-amber-500" size={32} />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              You are about to:
            </span>
            <h2 className="text-lg font-bold">
              {isDeactivate ? "Deactivate a Product" : "Reactivate a Product"}
            </h2>
          </div>
        </div>

        <Separator orientation="horizontal" />

        {/* <p className="text-sm text-gray-500">
          {isDeactivate
            ? "This product will be hidden from inventory operations and cannot be recreated with the same Item–Brand–Variant combination. Enter your password to confirm."
            : "This product will be restored to the active inventory. Enter your password to confirm."}
        </p> */}

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold">Password</label>
          <div className="relative">
            <span
              //   type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </span>
            <input
              type={showPassword ? "text" : "password"}
              className="input-style-2 pr-9"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && !isLoading && password && handleConfirm()
              }
              placeholder="Enter your password"
              autoComplete="new-password"
            />
          </div>
          <div className="flex gap-1 items-center">
            <ShieldCheck className="text-gray-600" size={14} />

            <label className="text-xs text-vesper-gray">
              For your security, please confirm your password to continue.
            </label>
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="px-4 py-2 rounded-lg text-sm border hover:bg-accent transition-colors disabled:opacity-50 max-w-full w-full"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading || !password}
            className={`px-4 py-2 rounded-lg text-sm font-semibold text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed max-w-full w-full ${
              isDeactivate
                ? "bg-red-500 hover:bg-red-600"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {isLoading
              ? "Processing..."
              : isDeactivate
                ? "Deactivate"
                : "Reactivate"}
          </button>
        </div>
      </div>
    </div>
  );
};
