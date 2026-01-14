import { XIcon } from "@/icons";
import { RestockTable } from "./restock-modal-table";
import { useSuppliersQuery } from "@/features/suppliers/supplier-get-all.query";
import { SupplierPicker } from "./supplier-picker";

interface CreateRestockModalProps {
  createRestock: () => void;
}

export const CreateRestockModal = ({
  createRestock,
}: CreateRestockModalProps) => {
  const { data: suppliersData } = useSuppliersQuery();
  return (
    <div className="absolute bg-black/40 w-full h-full top-0 left-0 flex justify-center items-center z-50">
      <div className="w-3/6 h-4/5 bg-white p-10 rounded-lg border shadow-lg">
        <div className="flex flex-col gap-5 flex-1 h-full">
          {/* HEADER */}
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <h2>Restock Confirmation</h2>
              <span className="text-vesper-gray text-lg tracking-wider">
                #000000
              </span>
            </div>
            <div onClick={createRestock}>
              <XIcon />
            </div>
          </div>

          {/* SEARCH CONTAINER */}
          <SupplierPicker suppliersData={suppliersData} />

          {/* TABLE CONTAINER */}
          <RestockTable />
        </div>
      </div>
    </div>
  );
};
