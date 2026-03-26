import { XIcon } from "@/icons";
import { Box, Calendar } from "lucide-react";
import { Separator } from "./separator";
import { SupplierDataModel } from "@/features/suppliers/get-all-suppliers.model";
import { format } from "date-fns/format";

interface RestocksModalProps {
  setIsRestocksModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  supplierName?: string;
  selectedSupplier: SupplierDataModel;
}

export const RestocksModal = ({
  setIsRestocksModalOpen,
  supplierName = "Supplier",
  selectedSupplier,
}: RestocksModalProps) => {
  const handleCloseModal = () => {
    setIsRestocksModalOpen(false);
  };

  const formatRestockDate = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return format(date, "yyyy MMMM dd");
  };

  return (
    <div className="absolute bg-black/40 w-full h-full top-0 left-0 flex justify-center items-center z-50">
      <div className="w-[800px] max-h-[600px] bg-white px-10 py-8 rounded-lg border shadow-lg relative flex flex-col gap-4">
        <div>
          <div
            className="absolute top-4 right-4 cursor-pointer hover:bg-gray-100 p-2 rounded-lg"
            onClick={handleCloseModal}
          >
            <XIcon />
          </div>
          <div className="w-full">
            <h1 className="text-2xl font-bold">Restocks</h1>
            <p className="text-gray-500">All restocks from {supplierName}</p>
          </div>
        </div>

        <Separator />

        <div className="flex flex-col gap-3 overflow-y-auto pr-2">
          {selectedSupplier.restocks.length === 0 ? (
            <div className="w-full h-full flex items-center justify-center py-10">
              <span className="font-semibold text-gray-400">
                No restocks found
              </span>
            </div>
          ) : (
            selectedSupplier.restocks.map((restock, idx) => (
              <div
                key={idx}
                className="flex flex-col gap-3 p-4 rounded-lg bg-wash-gray hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <div className="flex justify-between items-start">
                  <div className="flex flex-col gap-1">
                    <label className="text-base text-saltbox-gray font-semibold">
                      {restock.restock_Info.restock_Number}
                    </label>
                    <label className="text-sm text-vesper-gray">
                      PO Ref: {restock.restock_Info.restock_ID}
                    </label>
                  </div>
                  {restock.restock_Info.status === "VOIDED" && (
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        restock.restock_Info.status === "VOIDED"
                          ? "bg-red-100 text-red-400"
                          : "bg-yellow-100 text-green-700"
                      }`}
                    >
                      {restock.restock_Info.status}
                    </span>
                  )}
                </div>

                <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="text-vesper-gray" size={16} />
                    <label className="text-vesper-gray text-sm font-semibold">
                      {formatRestockDate(restock.created_At)}
                    </label>
                  </div>
                  <Separator orientation="vertical" className="h-5" />
                  <div className="flex gap-2 items-center">
                    <Box className="text-vesper-gray" size={16} />
                    <label className="text-vesper-gray text-sm font-semibold">
                      {restock.line_Items.length} item/s
                    </label>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
