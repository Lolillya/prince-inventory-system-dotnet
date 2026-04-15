import { useCustomerInvoicesQuery } from "@/features/customers/customer-invoices.query";
import { InvoiceAllModel } from "@/features/invoice/models/invoice-all.model";
import { XIcon } from "@/icons";
import { Calendar, FileText } from "lucide-react";
import { Dispatch, SetStateAction, useState } from "react";
import { Separator } from "./separator";
import { InvoiceDetailModal } from "@/pages/admin/invoice/_components/invoice-detail-modal";

interface InvoiceHistoryModalProps {
  customerId: string;
  setIsInvoiceHistoryModalOpen: Dispatch<SetStateAction<boolean>>;
}

const statusTag = (status: string | null) => {
  if (!status) return null;
  const map: Record<string, string> = {
    PAID: "bg-green-100 text-green-700",
    PENDING: "bg-amber-100 text-amber-700",
    VOIDED: "bg-red-100 text-red-600",
  };
  const classes = map[status.toUpperCase()] ?? "bg-gray-100 text-gray-600";
  return (
    <span
      className={`text-xs px-2 py-0.5 rounded-full font-semibold capitalize ${classes}`}
    >
      {status}
    </span>
  );
};

export const InvoiceHistoryModal = ({
  customerId,
  setIsInvoiceHistoryModalOpen,
}: InvoiceHistoryModalProps) => {
  const handleClose = () => setIsInvoiceHistoryModalOpen(false);
  const { data: invoices, isLoading } = useCustomerInvoicesQuery(customerId);
  const [selectedInvoice, setSelectedInvoice] =
    useState<InvoiceAllModel | null>(null);

  return (
    <>
      <div className="absolute bg-black/40 w-full h-full top-0 left-0 flex justify-center items-center z-50">
        <div className="w-[520px] max-h-[600px] bg-white px-8 py-6 rounded-lg border shadow-lg relative flex flex-col gap-4">
          <div
            className="absolute top-4 right-4 cursor-pointer hover:bg-gray-100 p-2 rounded-lg"
            onClick={handleClose}
          >
            <XIcon />
          </div>

          <div>
            <h1 className="text-xl font-bold">Invoice History</h1>
            <p className="text-sm text-gray-500 mt-1">
              {isLoading ? "Loading..." : `${invoices?.length ?? 0} record/s`}
            </p>
          </div>

          <Separator />

          <div className="overflow-y-auto flex flex-col gap-3 flex-1">
            {isLoading && (
              <p className="text-sm text-center text-gray-400 py-8">
                Loading invoices...
              </p>
            )}

            {!isLoading && (!invoices || invoices.length === 0) && (
              <p className="text-sm text-center font-semibold text-gray-400 py-8">
                No invoice found
              </p>
            )}

            {!isLoading &&
              invoices?.map((invoice) => (
                <div
                  key={invoice.invoice_ID}
                  className="flex flex-col gap-2 p-3 rounded-lg bg-wash-gray hover:shadow-sm cursor-pointer transition-shadow"
                  onClick={() => setSelectedInvoice(invoice)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText size={14} className="text-vesper-gray" />
                      <span className="text-sm font-semibold text-saltbox-gray">
                        #{invoice.invoice_Number}
                      </span>
                    </div>
                    {statusTag(invoice.status)}
                  </div>

                  <div className="flex items-center justify-between text-xs text-vesper-gray">
                    <div className="flex items-center gap-1">
                      <Calendar size={12} />
                      <span>
                        {new Intl.DateTimeFormat("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        }).format(new Date(invoice.createdAt))}
                      </span>
                    </div>
                    <span className="text-xs text-vesper-gray">
                      {invoice.lineItems.length} item/s
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">
                      Net {invoice.term}
                    </span>
                    <span className="text-sm font-bold text-saltbox-gray">
                      ₱{invoice.total_Amount.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {selectedInvoice && (
        <InvoiceDetailModal
          selectedInvoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
        />
      )}
    </>
  );
};
