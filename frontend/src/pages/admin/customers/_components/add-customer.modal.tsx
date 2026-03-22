import { XIcon } from "@/icons";
import { Dispatch, SetStateAction } from "react";
import { AddCustomerForm } from "./forms/add-customer.form";
import { UserModel } from "@/features/auth-login/models/user.model";

interface AddCustomerModalProps {
  setIsAddCustomerModalOpen: Dispatch<SetStateAction<boolean>>;
  onSuccess?: (newCustomer: UserModel) => void;
}

export const AddCustomerModal = ({
  setIsAddCustomerModalOpen,
  onSuccess,
}: AddCustomerModalProps) => {
  const handleCloseModal = () => {
    setIsAddCustomerModalOpen(false);
  };

  const handleSuccess = (newCustomer: UserModel) => {
    handleCloseModal();
    onSuccess?.(newCustomer);
  };

  return (
    <div className="absolute bg-black/40 w-full h-full top-0 left-0 flex justify-center items-center z-50">
      <div className="w-[800px] h-[750px] bg-white px-20 py-10 rounded-lg border shadow-lg relative flex flex-col gap-4">
        <div>
          <div className="absolute top-4 right-4" onClick={handleCloseModal}>
            <XIcon />
          </div>
          <div className="w-full">
            <h1 className="text-2xl font-bold">Add Customer</h1>
            <p className="text-gray-500">
              Fill in the details to add a new customer to the database.
            </p>
          </div>
        </div>

        <AddCustomerForm onSuccess={handleSuccess} />
      </div>
    </div>
  );
};
