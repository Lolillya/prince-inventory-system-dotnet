import { ChangeEmployeePasswordService } from "@/features/employees/change-employee-password.service";
import { yupResolver } from "@hookform/resolvers/yup";
import { useState, Dispatch, SetStateAction } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as yup from "yup";
import { Eye, EyeOff } from "lucide-react";

const schema = yup.object().shape({
  newPassword: yup
    .string()
    .required("New password is required")
    .min(6, "Password must be at least 6 characters")
    .matches(/[0-9]/, "Password must contain at least one digit")
    .matches(/[a-z]/, "Password must contain at least one lowercase letter")
    .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
    .matches(
      /[^a-zA-Z0-9]/,
      "Password must contain at least one special character",
    ),
  confirmPassword: yup
    .string()
    .required("Please confirm the new password")
    .oneOf([yup.ref("newPassword")], "Passwords do not match"),
});

type RecoverAccountFormValues = {
  newPassword: string;
  confirmPassword: string;
};

interface RecoverAccountFormProps {
  userId: string;
  setIsRecoverAccountModalOpen: Dispatch<SetStateAction<boolean>>;
}

export const RecoverAccountForm = ({
  userId,
  setIsRecoverAccountModalOpen,
}: RecoverAccountFormProps) => {
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RecoverAccountFormValues>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: RecoverAccountFormValues) => {
    try {
      await ChangeEmployeePasswordService(userId, data.newPassword);
      toast.success("Password changed successfully.");
      setIsRecoverAccountModalOpen(false);
    } catch {
      toast.error("Failed to change password. Please try again.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-4 w-full"
    >
      {/* NEW PASSWORD */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">New Password</label>
        <div className="relative">
          <input
            type={showNewPassword ? "text" : "password"}
            className="w-full drop-shadow-none bg-custom-gray p-2 pr-10"
            placeholder="Enter new password"
            {...register("newPassword")}
          />
          <div
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 mr-2 cursor-pointer"
            onClick={() => setShowNewPassword((v) => !v)}
          >
            {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </div>
        </div>
        {errors.newPassword && (
          <span className="text-red-500 text-xs">
            {errors.newPassword.message}
          </span>
        )}
      </div>

      {/* CONFIRM PASSWORD */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">Confirm Password</label>
        <div className="relative">
          <input
            type={showConfirmPassword ? "text" : "password"}
            className="w-full drop-shadow-none bg-custom-gray p-2 pr-10"
            placeholder="Confirm new password"
            {...register("confirmPassword")}
          />
          <div
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 mr-2 cursor-pointer"
            onClick={() => setShowConfirmPassword((v) => !v)}
          >
            {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </div>
        </div>
        {errors.confirmPassword && (
          <span className="text-red-500 text-xs">
            {errors.confirmPassword.message}
          </span>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          className="bg-gray-100 text-gray-700 hover:bg-gray-200"
          onClick={() => setIsRecoverAccountModalOpen(false)}
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Change Password"}
        </button>
      </div>
    </form>
  );
};
