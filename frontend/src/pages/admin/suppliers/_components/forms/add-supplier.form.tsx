import { UserModel } from "@/features/auth-login/models/user.model";
import { AddNewSupplierService } from "@/features/suppliers/add-new-supplier/add-new-supplier.service";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import * as yup from "yup";
import { toast } from "sonner";

const schema = yup.object().shape({
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

interface AddSupplierFormProps {
  setIsAddSupplierModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const AddSupplierForm = ({
  setIsAddSupplierModalOpen,
}: AddSupplierFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      roleID: 3,
      username: "",
      password: "",
      phoneNumber: "",
      companyName: "",
      address: "",
      notes: "",
    },
  });

  const onSubmit = async (data: yup.InferType<typeof schema>) => {
    setIsLoading(true);
    try {
      await AddNewSupplierService(data as UserModel);
      toast.success("Supplier added successfully!");
      // Invalidate suppliers query to refresh the list
      await queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      // Close modal on successful submission
      setIsAddSupplierModalOpen(false);
    } catch (error) {
      // Error is already handled by the error handler in the service
      setIsLoading(false);
    }
  };

  return (
    <form
      className="h-full flex flex-col justify-between gap-4"
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="flex flex-col space-y-4 mb-auto">
        {/* LOGIN DETAILS */}

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
          <span className="text-red-500 text-xs normal-case">
            {errors.companyName?.message}
          </span>
        </div>

        {/* REPRESENTATIVE */}
        <div className="flex flex-col w-full gap-2">
          <label htmlFor="firstName" className="block text-sm font-medium">
            Representative
          </label>

          <div className="flex gap-4">
            <div className="flex flex-col w-full">
              <input
                id="firstName"
                type="text"
                className="w-full drop-shadow-none bg-custom-gray p-2"
                placeholder="First Name"
                {...register("firstName")}
              />
            </div>

            {/* LAST NAME */}
            <div className="flex flex-col w-full">
              <input
                id="lastName"
                type="text"
                className="w-full drop-shadow-none bg-custom-gray p-2"
                placeholder="Last Name"
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
              placeholder="09xxxxxxxxx"
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
              placeholder="example.email.com"
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
            Supplier Note
          </label>
          <textarea
            id="supplierNotes"
            className="w-full p-2 rounded-lg "
            placeholder="About this supplier..."
            {...register("notes")}
            rows={4}
          />
        </div>
      </div>

      <button type="submit" disabled={isLoading}>
        {isLoading ? "Adding..." : "Add Supplier"}
      </button>
    </form>
  );
};
