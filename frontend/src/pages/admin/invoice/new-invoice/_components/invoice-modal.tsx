import { XIcon } from "@/icons";
import { InvoiceTable } from "./invoice-modal-table";
import { useCustomersQuery } from "@/features/customers/customer-get-all.query";
import { CustomerPicker } from "./customer-picker";
import { useState } from "react";

interface CreateInvoiceModalProps {
  createInvoice: () => void;
}

export const CreateInvoiceModal = ({
  createInvoice,
}: CreateInvoiceModalProps) => {
  const { data: customersData } = useCustomersQuery();
  const [invoiceCreated, setInvoiceCreated] = useState(false);

  const handleClose = () => {
    setInvoiceCreated(false);
    createInvoice();
  };

  const handleInvoiceSuccess = () => {
    setInvoiceCreated(true);
    setTimeout(handleClose, 1500);
  };

  return (
    <div
      className="absolute bg-black/40 w-full h-full top-0 left-0 flex justify-center items-center z-50"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div className="w-3/6 h-4/5 bg-white px-20 py-10 rounded-lg border shadow-lg">
        <div className="flex flex-col gap-5 flex-1 h-full">
          {/* HEADER */}
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold">Order Confirmation</h2>
              <span className="text-vesper-gray text-sm tracking-wider">
                Invoice Details
              </span>
            </div>
            <div
              onClick={handleClose}
              className="cursor-pointer hover:bg-gray-100 p-2 rounded"
            >
              <XIcon />
            </div>
          </div>

          {invoiceCreated ? (
            <div className="flex-1 flex items-center justify-center flex-col gap-4">
              <div className="text-4xl">✅</div>
              <h3 className="text-xl font-semibold text-green-600">
                Invoice Created Successfully!
              </h3>
              <p className="text-vesper-gray text-sm">
                Closing modal in a moment...
              </p>
            </div>
          ) : (
            <>
              {/* SEARCH CONTAINER */}
              <CustomerPicker customersData={customersData} />

              {/* TABLE CONTAINER */}
              <InvoiceTable onSuccess={handleInvoiceSuccess} />
            </>
          )}
        </div>
      </div>
    </div>
  );
};
