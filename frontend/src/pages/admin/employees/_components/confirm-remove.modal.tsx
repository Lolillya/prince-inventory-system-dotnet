import { DeleteUserService } from "@/features/suppliers/remove-supplier/remove-supplier.service";
import { GetEmployeeInvoices } from "@/features/employees/get-employee-invoices.service";
import { GetEmployeeRestocks } from "@/features/employees/get-employee-restocks.service";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

interface ConfirmRemoveModalProps {
  setIsConfirmRemoveModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  userId: string;
}

export const ConfirmRemoveModal = ({
  setIsConfirmRemoveModalOpen,
  userId,
}: ConfirmRemoveModalProps) => {
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  const handleCloseModal = () => {
    setIsConfirmRemoveModalOpen(false);
  };

  const handleRemove = async () => {
    setIsLoading(true);
    try {
      const [invoicesRes, restocksRes] = await Promise.all([
        GetEmployeeInvoices(userId),
        GetEmployeeRestocks(userId),
      ]);

      const invoices = invoicesRes?.data ?? [];
      const restocks = restocksRes?.data ?? [];

      if (invoices.length > 0 || restocks.length > 0) {
        const parts: string[] = [];
        if (invoices.length > 0) parts.push(`${invoices.length} invoice/s`);
        if (restocks.length > 0) parts.push(`${restocks.length} restock/s`);
        toast.error(
          `Cannot delete employee with existing ${parts.join(" and ")}.`,
        );
        handleCloseModal();
        return;
      }

      await DeleteUserService(userId);
      queryClient.invalidateQueries({ queryKey: ["employee"] });
      toast.success("Employee removed successfully.");
      handleCloseModal();
    } catch {
      toast.error("Failed to remove employee. Please try again.");
    } finally {
      setIsLoading(false);
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
          <button onClick={handleRemove} disabled={isLoading}>
            {isLoading ? "Removing..." : "Remove"}
          </button>
          <button onClick={handleCloseModal} disabled={isLoading}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
