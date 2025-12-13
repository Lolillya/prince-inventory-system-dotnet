import { XIcon } from "@/icons";
import { Dispatch, SetStateAction } from "react";
import { EditCustomerForm } from "./forms/edit.customer.form";
import { UserModel } from "@/features/auth-login/models/user.model";

interface EditCustomerModalProps {
  setIsEditCustomerModalOpen: Dispatch<SetStateAction<boolean>>;
  selectedCustomer: UserModel;
}

export const EditCustomerModal = ({
  setIsEditCustomerModalOpen,
  selectedCustomer,
}: EditCustomerModalProps) => {
  const handleCloseModal = () => {
    setIsEditCustomerModalOpen(false);
  };

  return (
    <div className="absolute bg-black/40 w-full h-full top-0 left-0 flex justify-center items-center z-50">
      <div className="w-2/4 h-4/5 bg-white px-20 py-10 rounded-lg border shadow-lg relative flex flex-col gap-4">
        <div>
          <div className="absolute top-4 right-4" onClick={handleCloseModal}>
            <XIcon />
          </div>
          <div className="w-full">
            <h1 className="text-2xl font-bold">Edit Customer</h1>
            <p className="text-gray-500">
              Fill in the details to edit the customer in the database.
            </p>
          </div>
        </div>

        {/*  */}
        <EditCustomerForm selectedCustomer={selectedCustomer} />
      </div>
    </div>
  );
};
