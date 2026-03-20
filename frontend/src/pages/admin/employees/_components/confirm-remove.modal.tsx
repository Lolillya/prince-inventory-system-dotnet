import { DeleteUserService } from "@/features/suppliers/remove-supplier/remove-supplier.service";
import { useQueryClient } from "@tanstack/react-query";

interface ConfirmRemoveModalProps {
  setIsConfirmRemoveModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  userId: string;
}

export const ConfirmRemoveModal = ({
  setIsConfirmRemoveModalOpen,
  userId,
}: ConfirmRemoveModalProps) => {
  const queryClient = useQueryClient();

  const handleCloseModal = () => {
    setIsConfirmRemoveModalOpen(false);
  };

  const handleRemove = async () => {
    const result = await DeleteUserService(userId);
    if (result) {
      // Close the modal
      handleCloseModal();
      // Refetch the employee list
      queryClient.invalidateQueries({ queryKey: ["employee"] });
    }
  };

  return (
    <div className="absolute bg-black/40 w-full h-full top-0 left-0 flex justify-center items-center z-50">
      <div className="w-4/12 h-4/12 bg-white px-20 py-10 rounded-lg border shadow-lg relative flex flex-col gap-4 items-center justify-between">
        <h1>Confirm Remove</h1>
        <p className="text-center max-w-100">
          Are you sure you want to remove this employee? This action cannot be
          undone.
        </p>
        <div className="flex gap-4">
          <button onClick={handleRemove}>Remove</button>
          <button onClick={handleCloseModal}>Cancel</button>
        </div>
      </div>
    </div>
  );
};
