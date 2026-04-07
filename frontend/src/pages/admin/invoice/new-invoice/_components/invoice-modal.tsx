import { XIcon } from "@/icons";
import { InvoiceTable } from "./invoice-modal-table";
import { CustomerPicker } from "./customer-picker";

interface CreateInvoiceModalProps {
  createInvoice: () => void;
}

export const CreateInvoiceModal = ({
  createInvoice,
}: CreateInvoiceModalProps) => {
  const handleClose = () => {
    createInvoice();
  };

  return (
    <div
      className="absolute bg-black/40 w-full h-full top-0 left-0 flex justify-center items-center z-50"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div className="w-4/5 h-4/5 bg-white px-10 py-8 rounded-lg border shadow-lg">
        <div className="flex flex-col gap-5 flex-1 h-full">
          {/* HEADER */}
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-semibold tracking-wide">
                Invoice Confirmation #XXXXX
              </h2>
            </div>
            <div
              onClick={handleClose}
              className="cursor-pointer hover:bg-gray-100 p-2 rounded"
            >
              <XIcon />
            </div>
          </div>

          {/* SEARCH CONTAINER */}
          <CustomerPicker />

          {/* TABLE CONTAINER */}
          <InvoiceTable />
        </div>
      </div>
    </div>
  );
};
