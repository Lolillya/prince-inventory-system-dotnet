import { ChevronDownIcon } from "@/icons";

interface SupplierBatchCardProps {
  supplierBatch: RestockBatch;
}

type RestockBatch = {
  base_Unit_Price: number;
  base_Unit_Quantity: number;
  batchId: number;
  clerk: SupplierClerk;
  restockId: number;
  restockNumber: string;
  supplier: Supplier;
};

type SupplierClerk = {
  firstName: string;
  lastName: string;
  id: string;
};

type Supplier = {
  companyName: string;
  firstName: string;
  lastName: string;
  id: string;
};

export const SupplierBatchCard = ({
  supplierBatch,
}: SupplierBatchCardProps) => {
  console.log("restock Batch: ", supplierBatch);
  return (
    <div className="flex rounded-lg border">
      <span className="p-5 bg-red-300 rounded-l-lg">1</span>
      <div className="w-full p-5 bg-white rounded-r-lg">
        <div className="flex w-full justify-between items-center">
          <span>from {supplierBatch.supplier.companyName}</span>
          <ChevronDownIcon />
        </div>
      </div>
    </div>
  );
};
