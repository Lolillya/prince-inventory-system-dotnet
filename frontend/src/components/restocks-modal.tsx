import { XIcon } from "@/icons";
import { Box, Calendar } from "lucide-react";
import { Separator } from "./separator";

interface RestocksModalProps {
  setIsRestocksModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  supplierName?: string;
}

export const RestocksModal = ({
  setIsRestocksModalOpen,
  supplierName = "Supplier",
}: RestocksModalProps) => {
  const handleCloseModal = () => {
    setIsRestocksModalOpen(false);
  };

  // Mock data - replace with actual data from props/API
  const restocks = [
    {
      id: "#RS-00123",
      poRef: "#PO-456",
      date: "3/2/2025",
      itemCount: 100,
      status: "Completed",
    },
    {
      id: "#RS-00124",
      poRef: "#PO-457",
      date: "3/5/2025",
      itemCount: 150,
      status: "Completed",
    },
    {
      id: "#RS-00125",
      poRef: "#PO-458",
      date: "3/8/2025",
      itemCount: 75,
      status: "Pending",
    },
  ];

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
          {restocks.length === 0 ? (
            <div className="w-full h-full flex items-center justify-center py-10">
              <span className="font-semibold text-gray-400">
                No restocks found
              </span>
            </div>
          ) : (
            restocks.map((restock, idx) => (
              <div
                key={idx}
                className="flex flex-col gap-3 p-4 rounded-lg bg-wash-gray hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <div className="flex justify-between items-start">
                  <div className="flex flex-col gap-1">
                    <label className="text-base text-saltbox-gray font-semibold">
                      {restock.id}
                    </label>
                    <label className="text-sm text-vesper-gray">
                      PO Ref: {restock.poRef}
                    </label>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      restock.status === "Completed"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {restock.status}
                  </span>
                </div>

                <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="text-vesper-gray" size={16} />
                    <label className="text-vesper-gray text-sm font-semibold">
                      {restock.date}
                    </label>
                  </div>
                  <Separator orientation="vertical" className="h-5" />
                  <div className="flex gap-2 items-center">
                    <Box className="text-vesper-gray" size={16} />
                    <label className="text-vesper-gray text-sm font-semibold">
                      {restock.itemCount} items
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
