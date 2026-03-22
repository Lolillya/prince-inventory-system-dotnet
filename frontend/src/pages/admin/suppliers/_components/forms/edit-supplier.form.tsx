import { UserModel } from "@/features/auth-login/models/user.model";
import { EditSupplierService } from "@/features/suppliers/edit-supplier/edit-supplier.service";
import { UserClientModel } from "@/models/user-client.model";
import { useQueryClient } from "@tanstack/react-query";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import * as yup from "yup";

const schema = yup.object().shape({
  id: yup.string(),
  username: yup.string(),
  password: yup.string(),
  firstName: yup.string(),
  lastName: yup.string(),
  email: yup
    .string()
    .email("Invalid email address")
    .matches(
      /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/,
      "Invalid email format",
    ),
  phoneNumber: yup.string(),
  companyName: yup.string().required("Company name is required"),
  address: yup.string(),
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

  const onSubmit = async (data: yup.InferType<typeof schema>) => {
    const response = await EditSupplierService(data as UserModel);
    const updatedSupplier = response?.data;

    if (!updatedSupplier?.id) return;

    queryClient.setQueryData<UserClientModel[]>(["suppliers"], (prev) => {
      if (!prev) return prev;

      return prev.map((supplier) =>
        supplier.id === updatedSupplier.id
          ? { ...supplier, ...updatedSupplier }
          : supplier,
      );
    });

    queryClient.setQueryData<UserClientModel>(["supplier-selected"], (prev) => {
      if (!prev || prev.id !== updatedSupplier.id) return prev;
      return { ...prev, ...updatedSupplier };
    });

    await queryClient.invalidateQueries({ queryKey: ["suppliers"] });
    onSuccess();
  };

  return (
    <form
      className="h-full flex flex-col justify-between"
      onSubmit={handleSubmit(onSubmit)}
    >
      <input type="hidden" {...register("id")} />
      <input type="hidden" {...register("roleID")} />
      <input type="hidden" {...register("username")} />
      <div className="flex flex-col gap-2 mb-auto">
        {/* COMPANY NAME */}
        <div className="flex flex-col w-full gap-2">
          <label htmlFor="companyName" className="block text-sm font-medium">
            Company Name
          </label>
          <input
            id="companyName"
            type="text"
            className="w-full drop-shadow-none bg-custom-gray p-2"
            {...register("companyName")}
          />
        </div>

        {/* SUPPLIER NAME */}
        <div className="flex flex-col w-full justify-between gap-2">
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

      <button type="submit">Confirm Edit</button>
    </form>
  );
};
