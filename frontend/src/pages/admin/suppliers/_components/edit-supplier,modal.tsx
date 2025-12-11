import { XIcon } from "@/icons";
import { EditSupplierForm } from "./forms/edit-supplier.form";
import { UserModel } from "@/features/auth-login/models/user.model";

interface EditSupplierModalProps {
  setIsEditSupplierModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  selectedSupplier: UserModel | undefined;
}

export const EditSupplierModal = ({
  setIsEditSupplierModalOpen,
  selectedSupplier,
}: EditSupplierModalProps) => {
  const handleCloseModal = () => {
    setIsEditSupplierModalOpen(false);
  };

  return (
    <div className="absolute bg-black/40 w-full h-full top-0 left-0 flex justify-center items-center z-50">
      <div className="w-2/4 h-4/5 bg-white px-20 py-10 rounded-lg border shadow-lg relative flex flex-col gap-4">
        <div>
          <div className="absolute top-4 right-4" onClick={handleCloseModal}>
            <XIcon />
          </div>
          <div className="w-full">
            <h1 className="text-2xl font-bold">Edit Supplier</h1>
            <p className="text-gray-500">
              Fill in the details to edit the supplier in the database.
            </p>
          </div>
        </div>

        <EditSupplierForm selectedSupplier={selectedSupplier} />
      </div>
    </div>
  );
};
