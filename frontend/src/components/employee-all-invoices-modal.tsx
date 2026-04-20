import { useState } from "react";
import { InvoiceAllModel } from "@/features/invoice/models/invoice-all.model";
import { InvoiceDetailModal } from "@/pages/admin/invoice/_components/invoice-detail-modal";
import { XIcon } from "@/icons";
import { Box, Calendar, FileText, Search } from "lucide-react";
import { Separator } from "./separator";

interface Props {
  invoices: InvoiceAllModel[];
  onClose: () => void;
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

export const EmployeeAllInvoicesModal = ({ invoices, onClose }: Props) => {
  const [search, setSearch] = useState("");
  const [selectedInvoice, setSelectedInvoice] =
    useState<InvoiceAllModel | null>(null);

  const filtered = invoices.filter((inv) => {
    const term = search.toLowerCase();
    const byNumber = String(inv.invoice_Number).includes(term);
    const byCustomer = (
      inv.customer.companyName ??
      `${inv.customer.firstName} ${inv.customer.lastName}`
    )
      .toLowerCase()
      .includes(term);
    return byNumber || byCustomer;
  });

  return (
    <>
      <div className="absolute bg-black/40 w-full h-full top-0 left-0 flex justify-center items-center z-50">
        <div className="w-[520px] max-h-[620px] bg-white px-8 py-6 rounded-lg border shadow-lg relative flex flex-col gap-4">
          <div
            className="absolute top-4 right-4 cursor-pointer hover:bg-gray-100 p-2 rounded-lg"
            onClick={onClose}
          >
            <XIcon />
          </div>

          <div>
            <h1 className="text-xl font-bold">Invoices</h1>
            <p className="text-sm text-gray-500 mt-1">
              {invoices.length} record/s
            </p>
          </div>

          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-wash-gray border border-transparent focus-within:border-gray-300">
            <Search size={14} className="text-vesper-gray shrink-0" />
            <input
              type="text"
              placeholder="Search by invoice # or customer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>

          <Separator />

          <div className="overflow-y-auto flex flex-col gap-3 flex-1">
            {filtered.length === 0 && (
              <p className="text-sm text-center font-semibold text-gray-400 py-8">
                No invoice found
              </p>
            )}
            {filtered.map((invoice) => (
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
                <p className="text-xs text-vesper-gray">
                  {invoice.customer.companyName ||
                    `${invoice.customer.firstName} ${invoice.customer.lastName}`}
                </p>
                <div className="flex items-center justify-between text-xs text-vesper-gray">
                  <div className="flex items-center gap-3">
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
                    <div className="flex items-center gap-1">
                      <Box size={12} />
                      <span>{invoice.lineItems.length} item/s</span>
                    </div>
                  </div>
                  <span className="font-semibold text-saltbox-gray">
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
