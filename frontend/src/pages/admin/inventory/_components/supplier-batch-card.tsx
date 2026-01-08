import { ChevronUpIcon } from "lucide-react";

export const SupplierBatchCard = () => {
  return (
    <div className="flex rounded-lg border">
      <span className="p-5 bg-red-300 rounded-l-lg">1</span>
      <div className="w-full p-5 bg-white rounded-r-lg">
        <div className="flex w-full justify-between items-center">
          <span>from SupplierName</span>
          <ChevronUpIcon />
        </div>
      </div>
    </div>
  );
};
