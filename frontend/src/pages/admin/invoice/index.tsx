import { useNavigate } from "react-router-dom";
import { FilterIcon, PlusIcon, SearchIcon } from "../../../icons";
import { useInvoiceQuery } from "@/features/invoice/invoice-get-all";
import { NoInvoiceState } from "./_components/no-invoice-state";
import { InvoiceDetailModal } from "./_components/invoice-detail-modal";
import { InvoiceAllModel } from "@/features/invoice/models/invoice-all.model";
import { useState } from "react";
import { Calendar, CornerRightUp, User } from "lucide-react";

const InvoicePage = () => {
  const { data: invoiceData, isLoading: isLoadingInvoice } = useInvoiceQuery();
  const navigate = useNavigate();

  const [selectedInvoice, setSelectedInvoice] =
    useState<InvoiceAllModel | null>(null);

  if (isLoadingInvoice) return <div>Loading...</div>;

  return (
    <section>
      {selectedInvoice && (
        <InvoiceDetailModal
          selectedInvoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
        />
      )}

      <div className="w-full mb-8">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3 max-w-lg w-full shrink-0">
            <div className="relative w-full">
              <input placeholder="Search..." className="input-style-2" />
              <i className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <SearchIcon />
              </i>
            </div>

            <div className="p-3 bg-custom-gray rounded-lg">
              <FilterIcon />
            </div>
          </div>

          <div className="flex w/full justify-end gap-2">
            <button
              className="flex items-center justify-center gap-2"
              onClick={() => navigate("/admin/invoice/new")}
            >
              <PlusIcon />
              new invoice
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 overflow-y-auto overflow-x-hidden flex-1 pr-1">
        {invoiceData?.length === 0 ? (
          <div className="flex-1 flex justify-center items-center">
            <NoInvoiceState />
          </div>
        ) : (
          invoiceData?.map((inv) => {
            const customerLabel = inv.customer.companyName
              ? inv.customer.companyName
              : `${inv.customer.firstName} ${inv.customer.lastName}`;
            const previewItems = inv.lineItems.slice(0, 2);
            const extraCount = inv.lineItems.length - previewItems.length;

            return (
              <div
                key={inv.invoice_ID}
                className="relative flex flex-col justify-between gap-5 border rounded-lg py-3 px-5 bg-custom-gray h-fit w-full break-inside-avoid"
              >
                {/* STATUS BADGE */}
                <div className="absolute -top-1">
                  {inv.status === "VOIDED" && (
                    <div className="bg-red-500 text-white text-xs px-2 py-1 rounded-b-lg shadow-md">
                      Voided
                    </div>
                  )}
                </div>

                {/* CARD HEADER */}
                <div className="flex flex-1 p-3">
                  <div className="flex flex-col gap-3 w-full">
                    <div className="flex flex-col gap-2">
                      {/* Invoice number + total */}
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-semibold text-saltbox-gray tracking-wide">
                          #{inv.invoice_Number}
                        </span>
                        <span className="text-xl font-semibold text-saltbox-gray">
                          ₱{inv.total_Amount.toLocaleString()}
                        </span>
                      </div>

                      {/* Date + Customer */}
                      <div className="flex items-center flex-1 flex-wrap gap-2">
                        <div className="flex gap-2 items-center">
                          <Calendar className="text-saltbox-gray" size={16} />
                          <span className="text-saltbox-gray text-sm">
                            {new Intl.DateTimeFormat("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }).format(new Date(inv.createdAt))}
                          </span>
                        </div>

                        <div className="flex gap-2 items-center ml-5 border-l-2 border-gray-300 pl-5">
                          <User className="text-saltbox-gray" size={16} />
                          <span className="text-saltbox-gray text-sm">
                            {customerLabel}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* LINE ITEMS PREVIEW */}
                <div className="flex flex-col gap-2">
                  {previewItems.map((item) => (
                    <div
                      key={item.lineItem_ID}
                      className="bg-background rounded-lg flex flex-col p-3 gap-1"
                    >
                      <div className="flex w-full justify-between">
                        <span className="text-saltbox-gray text-sm font-semibold truncate">
                          {item.product.product_Name}
                        </span>
                        <span className="text-saltbox-gray text-sm font-semibold ml-3 shrink-0">
                          {item.unit_Quantity} {item.unit}
                        </span>
                      </div>
                      <div className="flex w-full justify-between text-xs text-saltbox-gray">
                        <span>
                          ₱{item.unit_Price.toLocaleString()} / {item.unit}
                        </span>
                        <span className="font-medium">
                          ₱{item.sub_Total.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* FOOTER */}
                <div className="bg-background rounded-lg flex items-center justify-between px-3 py-1">
                  <label className="text-saltbox-gray text-sm font-semibold tracking-wide">
                    {extraCount > 0
                      ? `+${extraCount} more item${extraCount > 1 ? "s" : ""}...`
                      : "No more items..."}
                  </label>
                  <button
                    onClick={() => setSelectedInvoice(inv)}
                    className="bg-background text-saltbox-gray w-fit cursor-pointer hover:underline hover:shadow-none hover:bg-gray-300 transition-colors"
                  >
                    view details
                    <CornerRightUp size={18} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
};

export default InvoicePage;
