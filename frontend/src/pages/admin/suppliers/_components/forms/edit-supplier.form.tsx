import { Separator } from "@/components/separator";
import { UserModel } from "@/features/auth-login/models/user.model";
import { EditSupplierService } from "@/features/suppliers/edit-supplier/edit-supplier.service";
import { UserClientModel } from "@/models/user-client.model";
import { useQueryClient } from "@tanstack/react-query";
import { yupResolver } from "@hookform/resolvers/yup";
import axios from "axios";
import { Info, LockKeyhole, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { toast } from "sonner";

const schema = yup.object().shape({
  id: yup.string(),
  username: yup.string(),
  password: yup.string(),
  firstName: yup.string().optional(),
  lastName: yup.string().optional(),
  email: yup
    .string()
    .optional()
    .email("Invalid email address")
    .matches(
      /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/,
      { message: "Invalid email format", excludeEmptyString: true },
    ),
  phoneNumber: yup.string().optional(),
  companyName: yup.string().required("Company name is required"),
  address: yup.string().optional(),
  notes: yup.string().optional(),
  roleID: yup.number().required(),
});

interface EditSupplierFormProps {
  selectedSupplier: UserModel | undefined;
  onSuccess: () => void;
}

export const EditSupplierForm = ({
  selectedSupplier,
  onSuccess,
}: EditSupplierFormProps) => {
  const queryClient = useQueryClient();
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingData, setPendingData] = useState<yup.InferType<
    typeof schema
  > | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      roleID: 3,
      username: "N/A",
      password: "N/A",
      email: selectedSupplier?.email || "",
      firstName: selectedSupplier?.firstName || "",
      lastName: selectedSupplier?.lastName || "",
      phoneNumber: selectedSupplier?.phoneNumber || "",
      companyName: selectedSupplier?.companyName || "",
      address: selectedSupplier?.address || "",
      notes: selectedSupplier?.notes || "",
      id: selectedSupplier?.id,
    },
  });

  const onValidated = (data: yup.InferType<typeof schema>) => {
    setPendingData(data);
    setPasswordError("");
    setIsPasswordModalOpen(true);
  };

  const handleConfirmEdit = async () => {
    if (!password.trim()) {
      setPasswordError("Password is required.");
      return;
    }

    if (!pendingData) return;

    setIsSubmitting(true);
    try {
      const response = await EditSupplierService({
        ...pendingData,
        password,
      } as UserModel);
      const updatedSupplier = response?.data;

      if (!updatedSupplier?.id) return;

      toast.success("Supplier updated successfully!");

      queryClient.setQueryData<UserClientModel[]>(["suppliers"], (prev) => {
        if (!prev) return prev;

        return prev.map((supplier) =>
          supplier.id === updatedSupplier.id
            ? { ...supplier, ...updatedSupplier }
            : supplier,
        );
      });

      queryClient.setQueryData<UserClientModel>(
        ["supplier-selected"],
        (prev) => {
          if (!prev || prev.id !== updatedSupplier.id) return prev;
          return { ...prev, ...updatedSupplier };
        },
      );

      await queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      setIsPasswordModalOpen(false);
      setPassword("");
      onSuccess();
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
    <form
      className="h-full flex flex-col justify-between"
      onSubmit={handleSubmit(onValidated)}
    >
      <input type="hidden" {...register("id")} />
      <input type="hidden" {...register("roleID")} />
      <input type="hidden" {...register("username")} />
      <div className="flex flex-col gap-2 mb-auto">
        {/* COMPANY NAME */}
        <div className="flex flex-col w-full gap-2">
          <label htmlFor="companyName" className="block text-sm font-medium">
            Supplier Company Name <span className="text-red-500">*</span>
          </label>
          <input
            id="companyName"
            type="text"
            className="w-full drop-shadow-none bg-custom-gray p-2"
            {...register("companyName")}
          />
        </div>

        {/* REPRESENTATIVE */}
        <div className="flex flex-col w-full gap-2">
          <label htmlFor="firstName" className="block text-sm font-medium">
            Representative
          </label>

          <div className="flex gap-4">
            {/* FIRST NAME */}
            <div className="flex flex-col w-full">
              <input
                id="firstName"
                type="text"
                className="w-full drop-shadow-none bg-custom-gray p-2"
                {...register("firstName")}
              />
            </div>

            {/* LAST NAME */}
            <div className="flex flex-col w-full">
              <input
                id="lastName"
                type="text"
                className="w-full drop-shadow-none bg-custom-gray p-2"
                {...register("lastName")}
              />
            </div>
          </div>
        </div>

        <div className="flex w-full justify-between gap-4">
          <div className="flex flex-col w-full gap-2">
            <label
              htmlFor="contactNumber"
              className="block text-sm font-medium"
            >
              Contact Number
            </label>
            <input
              id="contactNumber"
              type="text"
              className="w-full drop-shadow-none bg-custom-gray p-2"
              {...register("phoneNumber")}
            />
          </div>

          <div className="flex flex-col w-full gap-2">
            <label htmlFor="emailAddress" className="block text-sm font-medium">
              Email Address
            </label>
            <input
              id="emailAddress"
              type="text"
              className="w-full drop-shadow-none bg-custom-gray p-2"
              {...register("email")}
            />
          </div>
        </div>

        {/* ADDRESS */}
        <div className="flex flex-col w-full gap-2">
          <label htmlFor="address" className="block text-sm font-medium">
            Address
          </label>
          <input
            id="address"
            type="text"
            className="w-full drop-shadow-none bg-custom-gray p-2"
            {...register("address")}
          />
        </div>

        {/* DESCRIPTION */}
        <div className="flex flex-col gap-2">
          <label htmlFor="supplierNotes" className="block text-sm font-medium">
            Supplier Notes
          </label>
          <textarea
            id="supplierNotes"
            className="w-full p-2 rounded-lg "
            rows={4}
            {...register("notes")}
          />
        </div>
      </div>

      <button type="submit" disabled={isSubmitting}>
        Confirm Edit
      </button>

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
                <span className="font-semibold">Edit a Supplier</span>
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
                onClick={() => {
                  setIsPasswordModalOpen(false);
                  setPassword("");
                  setPasswordError("");
                }}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="px-4 py-2 bg-river-green text-white rounded-md disabled:opacity-60 w-full max-w-full"
                onClick={handleConfirmEdit}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </form>
  );
};
