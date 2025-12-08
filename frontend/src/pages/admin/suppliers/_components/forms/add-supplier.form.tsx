import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import * as yup from "yup";

const schema = yup.object().shape({
  firstName: yup.string().required("First name is required"),
  lastName: yup.string().required("Last name is required"),
  emailAddress: yup
    .string()
    .email("Invalid email address")
    .required("Email address is required")
    .matches(
      /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/,
      "Invalid email format"
    ),
  contactNumber: yup
    .string()
    .required("Contact number is required")
    .matches(/^\+?[1-9]\d{1,14}$/, "Invalid contact number"),
  companyName: yup.string().required("Company name is required"),
  supplierNotes: yup.string(),
});

export const AddSupplierForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = () => {};

  return (
    <form
      className="h-full flex flex-col justify-between"
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="flex flex-col space-y-4 mb-auto">
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
              {...register("emailAddress")}
            />
            <span className="text-red-500 text-xs normal-case">
              {errors.emailAddress?.message}
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
              {...register("contactNumber")}
            />
            <span className="text-red-500 text-xs normal-case">
              {errors.contactNumber?.message}
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

        {/* DESCRIPTION */}
        <div>
          <label htmlFor="supplierNotes" className="block text-sm font-medium">
            Supplier Notes
          </label>
          <textarea
            id="supplierNotes"
            className="w-full p-2 rounded-lg "
            {...register("supplierNotes")}
          />
          <span className="text-red-500 text-xs normal-case">
            {errors.supplierNotes?.message}
          </span>
        </div>
      </div>

      <button type="submit">Add Supplier</button>
    </form>
  );
};
