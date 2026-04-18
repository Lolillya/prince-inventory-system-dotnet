import { DeleteUserService } from "@/features/suppliers/remove-supplier/remove-supplier.service";
import axios from "axios";
import { useState } from "react";

interface ConfirmRemoveModalProps {
  setIsConfirmRemoveModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  userId: string;
  onSuccess?: (deletedUserId: string) => void;
}

export const ConfirmRemoveModal = ({
  setIsConfirmRemoveModalOpen,
  userId,
  onSuccess,
}: ConfirmRemoveModalProps) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleCloseModal = () => {
    setIsConfirmRemoveModalOpen(false);
  };

  const handleRemove = async () => {
    setErrorMessage(null);
    try {
      await DeleteUserService(userId);
      handleCloseModal();
      onSuccess?.(userId);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 400) {
        setErrorMessage(
          typeof error.response.data === "string"
            ? error.response.data
            : "Cannot delete this customer due to pending invoices.",
        );
      } else {
        console.error("Error deleting customer:", error);
        setErrorMessage("An unexpected error occurred. Please try again.");
      }
    }
  };

  return (
    <div className="absolute bg-black/40 w-full h-full top-0 left-0 flex justify-center items-center z-50">
      <div className="w-4/12 h-4/12 bg-white px-20 py-10 rounded-lg border shadow-lg relative flex flex-col gap-4 items-center justify-between">
        <h1>Confirm Remove</h1>
        <p className="text-center max-w-100">
          Are you sure you want to remove this customer? This action cannot be
          undone.
        </p>
        {errorMessage && (
          <p className="text-red-500 text-sm text-center">{errorMessage}</p>
        )}
        <div className="flex gap-4">
          <button onClick={handleRemove}>Remove</button>
          <button onClick={handleCloseModal}>Cancel</button>
        </div>
      </div>
    </div>
  );
};
