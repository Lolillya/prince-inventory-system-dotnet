import { ChangeEmployeePasswordService } from "@/features/employees/change-employee-password.service";
import { yupResolver } from "@hookform/resolvers/yup";
import { useId, useState, ComponentProps, Dispatch, SetStateAction } from "react";
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
  const fieldId = useId();
  // Presentation only: the existing update API does not accept this field.
  const [currentPassword, setCurrentPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
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
      className="flex w-full flex-col"
    >
      <div className="flex min-h-[420px] flex-col gap-6 px-5 py-8 sm:px-8">
        <PasswordField
          label="Current Password"
          visible={showCurrentPassword}
          onToggle={() => setShowCurrentPassword((value) => !value)}
          inputProps={{
            id: `${fieldId}-current`,
            value: currentPassword,
            onChange: (event) => setCurrentPassword(event.target.value),
            autoComplete: "off",
          }}
        />
        <PasswordField
          label="New Password"
          visible={showNewPassword}
          onToggle={() => setShowNewPassword((value) => !value)}
          error={errors.newPassword?.message}
          inputProps={{
            id: `${fieldId}-new`,
            autoComplete: "new-password",
            ...register("newPassword"),
          }}
        />
        <PasswordField
          label="Confirm New Password"
          visible={showConfirmPassword}
          onToggle={() => setShowConfirmPassword((value) => !value)}
          error={errors.confirmPassword?.message}
          inputProps={{
            id: `${fieldId}-confirm`,
            autoComplete: "new-password",
            ...register("confirmPassword"),
          }}
        />
        <ul className="ml-4 list-disc text-sm leading-6 text-slate-500">
          <li>Minimum 8 characters</li>
          <li>Must include a number</li>
        </ul>
      </div>

      <div className="flex justify-end gap-4 border-t border-gray-200 px-5 py-6 sm:px-8 sm:py-7">
        <button
          type="button"
          className="h-12 w-auto max-w-none rounded-md border border-gray-200 bg-white px-6 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
          onClick={() => setIsRecoverAccountModalOpen(false)}
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="h-12 w-auto max-w-none rounded-md bg-[#009f83] px-6 text-sm font-semibold text-white shadow-sm hover:bg-emerald-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? "Saving..." : "Update Password"}
        </button>
      </div>
    </form>
  );
};

interface PasswordFieldProps {
  label: string;
  visible: boolean;
  onToggle: () => void;
  inputProps: ComponentProps<"input">;
  error?: string;
}

const PasswordField = ({ label, visible, onToggle, inputProps, error }: PasswordFieldProps) => (
  <div className="flex flex-col gap-2">
    <label htmlFor={inputProps.id} className="text-base font-medium text-slate-600">{label}</label>
    <div className="relative">
      <input
        {...inputProps}
        type={visible ? "text" : "password"}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputProps.id}-error` : undefined}
        className="h-12 w-full rounded-lg border border-gray-200 bg-white px-4 pr-12 text-base text-slate-700 drop-shadow-none focus:border-emerald-500 focus:outline-2 focus:outline-emerald-500/20"
      />
      <button
        type="button"
        aria-label={`${visible ? "Hide" : "Show"} ${label.toLowerCase()}`}
        aria-pressed={visible}
        aria-controls={inputProps.id}
        onClick={onToggle}
        className="absolute inset-y-1 right-1 my-auto h-10 w-10 max-w-none rounded-md bg-transparent p-2 text-slate-600 shadow-none hover:bg-slate-50 hover:shadow-none focus-visible:outline-2 focus-visible:outline-emerald-600"
      >
        {visible ? <EyeOff size={21} strokeWidth={1.7} /> : <Eye size={21} strokeWidth={1.7} />}
      </button>
    </div>
    {error && <p id={`${inputProps.id}-error`} role="alert" className="text-xs text-red-600">{error}</p>}
  </div>
);
