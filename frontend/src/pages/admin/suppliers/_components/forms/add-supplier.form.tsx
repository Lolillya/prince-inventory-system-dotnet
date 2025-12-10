import { UserModel } from "@/features/auth-login/models/user.model";
import { AddNewSupplierService } from "@/features/suppliers/add-new-supplier/add-new-supplier.service";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import * as yup from "yup";

const schema = yup.object().shape({
  username: yup.string(),
  password: yup.string(),
  firstName: yup.string().required("First name is required"),
  lastName: yup.string().required("Last name is required"),
  email: yup
    .string()
    .email("Invalid email address")
    .required("Email address is required")
    .matches(
      /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/,
      "Invalid email format"
    ),
  phoneNumber: yup.string().required("Contact number is required"),
  companyName: yup.string().required("Company name is required"),
  address: yup.string().required("Address is required"),
  notes: yup.string().optional(),
  roleID: yup.number().required(),
});

export const AddSupplierForm = () => {
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
    },
  });

  const onSubmit = (data: UserModel) => {
    AddNewSupplierService(data);
  };

  return (
    <form
      className="h-full flex flex-col justify-between"
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="flex flex-col space-y-4 mb-auto">
        {/* LOGIN DETAILS */}

        <div className="flex w-full justify-between gap-4">
          {/* USERNAME*/}
          <div className="flex flex-col w-full">
            <label htmlFor="firstName" className="block text-sm font-medium">
              Username
            </label>
            <input
              id="firstName"
              type="text"
              className="w-full drop-shadow-none bg-custom-gray p-2"
              placeholder="AUTO GENERATED"
              disabled
              {...register("username")}
            />
            <span className="text-red-500 text-xs normal-case">
              {errors.username?.message}
            </span>
          </div>

          {/* PASSWORD */}
          <div className="flex flex-col w-full">
            <label htmlFor="password" className="block text-sm font-medium">
              Password
            </label>
            <input
              id="password"
              type="text"
              className="w-full drop-shadow-none bg-custom-gray p-2"
              placeholder="AUTO GENERATED"
              disabled
              {...register("password")}
            />
            <span className="text-red-500 text-xs normal-case">
              {errors.password?.message}
            </span>
          </div>
        </div>

        {/* SUPPLIER NAME */}
        <div className="flex w-full justify-between gap-4">
          {/* FIRST NAME */}
          <div className="flex flex-col w-full">
            <label htmlFor="firstName" className="block text-sm font-medium">
              First Name
            </label>
            <input
              id="firstName"
              type="text"
              className="w-full drop-shadow-none bg-custom-gray p-2"
              {...register("firstName")}
            />
            <span className="text-red-500 text-xs normal-case">
              {errors.firstName?.message}
            </span>
          </div>

          {/* LAST NAME */}
          <div className="flex flex-col w-full">
            <label htmlFor="lastName" className="block text-sm font-medium">
              Last Name
            </label>
            <input
              id="lastName"
              type="text"
              className="w-full drop-shadow-none bg-custom-gray p-2"
              {...register("lastName")}
            />
            <span className="text-red-500 text-xs normal-case">
              {errors.lastName?.message}
            </span>
          </div>
        </div>

        <div className="flex w-full justify-between gap-4">
          <div className="flex flex-col w-full">
            <label htmlFor="emailAddress" className="block text-sm font-medium">
              Email Address
            </label>
            <input
              id="emailAddress"
              type="text"
              className="w-full drop-shadow-none bg-custom-gray p-2"
              {...register("email")}
            />
            <span className="text-red-500 text-xs normal-case">
              {errors.email?.message}
            </span>
          </div>

          <div className="flex flex-col w-full">
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
            <span className="text-red-500 text-xs normal-case">
              {errors.phoneNumber?.message}
            </span>
          </div>
        </div>

        {/* COMPANY NAME */}
        <div className="flex flex-col w-full">
          <label htmlFor="companyName" className="block text-sm font-medium">
            Company Name
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

        {/* ADDRESS */}
        <div className="flex flex-col w-full">
          <label htmlFor="address" className="block text-sm font-medium">
            Address
          </label>
          <input
            id="address"
            type="text"
            className="w-full drop-shadow-none bg-custom-gray p-2"
            {...register("address")}
          />
          <span className="text-red-500 text-xs normal-case">
            {errors.address?.message}
          </span>
        </div>

        {/* ROLE */}
        <div className="flex flex-col w-full">
          <label htmlFor="role" className="block text-sm font-medium">
            Role
          </label>
          <input
            id="role"
            type="text"
            className="w-full drop-shadow-none bg-custom-gray p-2"
            disabled
            placeholder="SUPPLIER"
            // {...register("role")}
          />
        </div>
        {/* DESCRIPTION */}
        <div>
          <label htmlFor="supplierNotes" className="block text-sm font-medium">
            Supplier Notes
          </label>
          <textarea
            id="supplierNotes"
            className="w-full p-2 rounded-lg "
            {...register("notes")}
          />
          <span className="text-red-500 text-xs normal-case">
            {errors.notes?.message}
          </span>
        </div>
      </div>

      <button type="submit">Add Supplier</button>
    </form>
  );
};
