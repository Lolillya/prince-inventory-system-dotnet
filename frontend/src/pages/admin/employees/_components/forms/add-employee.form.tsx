import { UserModel } from "@/features/auth-login/models/user.model";
import { AddNewEmployeeService } from "@/features/employees/add-employee/add-employee.service";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { Dispatch, SetStateAction } from "react";
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

interface AddEmployeeFormProps {
  setIsAddEmployeeModalOpen: Dispatch<SetStateAction<boolean>>;
}

export const AddEmployeeForm = ({ setIsAddEmployeeModalOpen }: AddEmployeeFormProps) => {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      roleID: 2,
      username: "",
      password: "",
      companyName: "Prince Educational Supply",
    },
  });

  const onSubmit = async (data: UserModel) => {
    // AddNewSupplierService(data);
    // AddNewEmployeeService(data);
    const result = await AddNewEmployeeService(data);
    if (result) {
      // Close the modal
      setIsAddEmployeeModalOpen(false);
      // Refetch the employee list
      queryClient.invalidateQueries({ queryKey: ["employee"] });
    }
  };

  return (
    <form
      className="h-full flex flex-col justify-between"
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="flex flex-col space-y-4 mb-auto">
        <input
          type="hidden"
          value="Prince Educational Supply"
          {...register("companyName")}
        />

        <div className="flex w-full justify-between gap-4">
          <div className="flex flex-col w-full">
            <label htmlFor="firstName" className="block text-sm font-medium">
              First Name <span className="text-red-500">*</span>
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
          <div className="flex flex-col w-full">
            <label htmlFor="lastName" className="block text-sm font-medium">
              Last Name <span className="text-red-500">*</span>
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
            <label htmlFor="contactNumber" className="block text-sm font-medium">
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
          <div className="flex flex-col w-full">
            <label htmlFor="emailAddress" className="block text-sm font-medium">
              Email
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
        </div>

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

        <div className="flex w-full justify-between gap-4">
          <div className="flex flex-col w-full">
            <label htmlFor="username" className="block text-sm font-medium">
              Username <span className="text-red-500">*</span>
            </label>
            <input
              id="username"
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

          <div className="flex flex-col w-full">
            <label htmlFor="password" className="block text-sm font-medium">
              Password <span className="text-red-500">*</span>
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

        <div className="flex flex-col w-full">
          <label htmlFor="employeeNotes" className="block text-sm font-medium">
            Employee notes
          </label>
          <textarea
            id="employeeNotes"
            className="w-full p-2 rounded-lg"
            placeholder="About the employee..."
            {...register("notes")}
          />
          <span className="text-red-500 text-xs normal-case">
            {errors.notes?.message}
          </span>
        </div>
      </div>

      <button type="submit">Add Employee</button>
    </form>
  );
};
