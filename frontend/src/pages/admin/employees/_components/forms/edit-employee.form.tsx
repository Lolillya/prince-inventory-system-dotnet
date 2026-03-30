import { UserModel } from "@/features/auth-login/models/user.model";
import { EditEmployeeService } from "@/features/employees/edit-employee/edit-employee.service";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { Dispatch, SetStateAction } from "react";
import { UserClientModel } from "@/models/user-client.model";
import * as yup from "yup";

const schema = yup.object().shape({
  id: yup.string(),
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

interface EditEmployeeFormProps {
  selectedEmployee: UserModel;
  setIsEditEmployeeModalOpen: Dispatch<SetStateAction<boolean>>;
}

export const EditEmployeeForm = ({
  selectedEmployee,
  setIsEditEmployeeModalOpen,
}: EditEmployeeFormProps) => {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UserModel>({
    resolver: yupResolver(schema),
    defaultValues: {
      roleID: 2,
      username: "N/A",
      password: "N/A",
      email: selectedEmployee?.email || "",
      firstName: selectedEmployee?.firstName || "",
      lastName: selectedEmployee?.lastName || "",
      phoneNumber: selectedEmployee?.phoneNumber || "",
      companyName: selectedEmployee?.companyName || "",
      address: selectedEmployee?.address || "",
      notes: selectedEmployee?.notes || "",
      id: selectedEmployee?.id,
    },
  });

  const onSubmit = async (data: UserModel) => {
    const payload: UserModel = {
      ...data,
      id: selectedEmployee.id,
      roleID: selectedEmployee.roleID || 2,
      username: selectedEmployee.username || data.username || "N/A",
      notes: data.notes?.trim() ? data.notes : "N/A",
    };

    const result = await EditEmployeeService(payload);

    if (result) {
      const currentSelected = queryClient.getQueryData<UserClientModel>([
        "employee-selected",
      ]);

      const updatedSelectedEmployee: UserClientModel = {
        id: payload.id || "",
        username: payload.username || "",
        email: payload.email,
        firstName: payload.firstName,
        lastName: payload.lastName,
        companyName: payload.companyName,
        notes: payload.notes || "",
        phoneNumber: payload.phoneNumber,
        address: payload.address,
        role: currentSelected?.role || "employee",
      };

      // Close the modal
      setIsEditEmployeeModalOpen(false);

      // Keep details pane and list in sync immediately after a successful edit
      queryClient.setQueryData<UserClientModel>(
        ["employee-selected"],
        updatedSelectedEmployee
      );

      queryClient.setQueryData<UserClientModel[]>(["employee"], (previous) => {
        if (!previous) return previous;

        return previous.map((employee) =>
          employee.id === updatedSelectedEmployee.id
            ? { ...employee, ...updatedSelectedEmployee }
            : employee
        );
      });

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

      <button type="submit">Confirm Edit</button>
    </form>
  );
};
