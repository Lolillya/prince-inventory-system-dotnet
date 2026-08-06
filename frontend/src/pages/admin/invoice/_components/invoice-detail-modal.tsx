import { InvoiceAllModel } from "@/features/invoice/models/invoice-all.model";
import {
  getInvoicePaymentStatus,
  invoicePaymentStatusDot,
} from "@/features/invoice/invoice-status";
import { XIcon } from "@/icons";
import { Bot, Calendar, Info, Printer, Tag } from "lucide-react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

interface Props {
  selectedInvoice: InvoiceAllModel;
  onClose: () => void;
}

export const InvoiceDetailModal = ({ selectedInvoice, onClose }: Props) => {
  const customerDisplay = selectedInvoice.customer.companyName
    ? selectedInvoice.customer.companyName
    : `${selectedInvoice.customer.firstName} ${selectedInvoice.customer.lastName}`;

  const clerkDisplay =
    `${selectedInvoice.clerk.firstName} ${selectedInvoice.clerk.lastName}`.trim();

  const paymentStatus = getInvoicePaymentStatus(selectedInvoice);

  return (
    <section className="absolute bg-black/40 w-full h-full top-0 left-0 flex justify-center items-center z-50">
      <div className="w-3/6 h-4/5 bg-white p-10 rounded-lg border shadow-lg flex flex-col gap-5">
        {/* HEADER */}
        <div className="flex items-start justify-between w-full">
          <div className="flex flex-col gap-2">
            <h3 className="text-2xl font-bold tracking-wide">
              DR/INV-{String(selectedInvoice.invoice_Number).padStart(6, "0")}
            </h3>
            <div className="flex items-center gap-2 text-sm text-saltbox-gray">
              <Calendar size={16} />
              <span>
                {new Intl.DateTimeFormat("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                }).format(new Date(selectedInvoice.createdAt))}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="font-semibold">Status:</span>
              <span
                className={`w-2.5 h-2.5 rounded-full ${invoicePaymentStatusDot[paymentStatus]}`}
              />
              <span className="font-semibold">{paymentStatus}</span>
            </div>
          </div>
          <div
            onClick={onClose}
            className="cursor-pointer hover:bg-gray-100 p-1 rounded"
          >
            <XIcon />
          </div>
        </div>

        <div className="border-t" />

        {/* CUSTOMER & TERM / RECORDED BY */}
        <div className="flex gap-3">
          <div className="flex flex-col w-full gap-2">
            <label className="text-sm font-semibold">Customer & Term</label>
            <div className="flex items-center bg-custom-gray rounded-lg overflow-hidden">
              <span className="flex-1 px-4 py-3 text-sm">
                {customerDisplay}
              </span>
              <span className="w-px self-stretch bg-gray-300" />
              <span className="px-4 py-3 text-sm">{selectedInvoice.term}</span>
            </div>
          </div>
          <div className="flex flex-col w-full gap-2">
            <label className="text-sm font-semibold">Recorded by</label>
            <div className="bg-custom-gray rounded-lg px-4 py-3 text-sm">
              {clerkDisplay || "-"}
            </div>
          </div>
        </div>

        {/* LINE ITEMS TABLE */}
        <div className="flex-1 flex flex-col overflow-hidden gap-2">
          <div className="flex justify-between py-2 px-4 bg-custom-gray rounded-lg gap-2">
            <label className="text-left w-full uppercase text-xs font-semibold">
              Product
            </label>
            <label className="text-right w-[20%] uppercase text-xs font-semibold">
              Quantity
            </label>
            <label className="text-left w-[20%] uppercase text-xs font-semibold pl-2">
              Unit
            </label>
            <label className="text-right w-[25%] uppercase text-xs font-semibold">
              Unit Price
            </label>
            <label className="text-right w-[25%] uppercase text-xs font-semibold">
              Total
            </label>
          </div>

          {selectedInvoice.lineItems.some(
            (item) =>
              selectedInvoice.autoReplenishRestockNumber ||
              (item.standardPrice !== null &&
                item.unit_Price !== item.standardPrice),
          ) && (
            <div className="flex flex-wrap items-center gap-4 px-1 text-[11px] text-gray-500 font-semibold">
              <div className="flex items-center gap-1">
                <span className="text-purple-500 font-semibold p-0.5 rounded-md bg-purple-50 border-2 border-purple-400">
                  <Bot size={16} />
                </span>
                <span>Used Auto-replenish deficit</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-green-700 font-semibold p-0.5 rounded-md bg-green-50 border-2 border-green-400">
                  <Tag size={16} />
                </span>
                <span>Used Manual Price</span>
              </div>
            </div>
          )}

          <div className="overflow-auto flex flex-col h-full">
            {selectedInvoice.lineItems.map((item, i) => {
              const hasAutoReplenish =
                !!selectedInvoice.autoReplenishRestockNumber;
              const hasManualPrice =
                item.standardPrice !== null &&
                item.unit_Price !== item.standardPrice;

              return (
                <div
                  key={item.lineItem_ID}
                  className={`py-2 px-4 flex justify-between gap-2 rounded-lg items-center text-sm ${
                    i % 2 !== 0 && "bg-custom-gray"
                  }`}
                >
                  <span className="text-left w-full flex flex-col">
                    <span className="">{item.product.product_Name}</span>
                    {item.product.categoryName && (
                      <span className="text-xs text-vesper-gray">
                        • {item.product.categoryName}
                      </span>
                    )}
                  </span>
                  <span className="text-right w-[20%] flex gap-2">
                    {item.unit_Quantity}

                    {hasAutoReplenish && (
                      <HoverCard openDelay={100} closeDelay={0}>
                        <HoverCardTrigger asChild>
                          <span className="flex items-center gap-1 text-[11px] font-semibold text-purple-500 bg-purple-50 border-2 border-purple-400 rounded-md px-1.5 py-0.5 cursor-default">
                            <Bot size={14} />
                            {/* Used Auto-replenish deficit */}
                            {/* <Info size={12} /> */}
                          </span>
                        </HoverCardTrigger>
                        <HoverCardContent className="w-fit p-3 text-xs">
                          <span>
                            Restock:{" "}
                            <span className="font-semibold">
                              #{selectedInvoice.autoReplenishRestockNumber}
                            </span>
                          </span>
                        </HoverCardContent>
                      </HoverCard>
                    )}
                  </span>
                  <span className="text-left w-[20%] pl-2">{item.unit}</span>
                  <span className="text-right w-[25%] flex gap-2">
                    ₱{item.unit_Price.toLocaleString()}
                    {hasManualPrice && (
                      <HoverCard openDelay={100} closeDelay={0}>
                        <HoverCardTrigger asChild>
                          <span className="flex items-center gap-1 text-[11px] font-semibold text-green-700 bg-green-50 border-2 border-green-400 rounded-md px-1.5 py-0.5 cursor-default">
                            <Tag size={14} />
                            {/* Used Manual Price */}
                          </span>
                        </HoverCardTrigger>
                        <HoverCardContent className="w-fit p-3 text-xs flex flex-col gap-1">
                          <span>
                            Standard price:{" "}
                            <span className="font-semibold">
                              ₱{item.standardPrice?.toFixed(2)}
                            </span>
                          </span>
                          <span>
                            As of:{" "}
                            <span className="font-semibold">
                              {item.standardPriceDate
                                ? new Date(
                                    item.standardPriceDate,
                                  ).toLocaleDateString("en-US", {
                                    month: "long",
                                    day: "numeric",
                                    year: "numeric",
                                  })
                                : "N/A"}
                            </span>
                          </span>
                        </HoverCardContent>
                      </HoverCard>
                    )}
                  </span>
                  <span className="text-right w-[25%] font-medium">
                    ₱{item.sub_Total.toLocaleString()}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* NOTES */}
        <div className="bg-custom-gray rounded-lg px-4 py-3 text-sm text-vesper-gray min-h-16">
          {selectedInvoice.notes?.trim() || "No invoice notes"}
        </div>

        {/* FOOTER */}
        <div className="flex justify-between items-center pt-2">
          <div className="flex items-center gap-3">
            <span className="text-lg font-bold tracking-wide">
              GRAND TOTAL:
            </span>
            <span className="text-2xl font-bold">
              ₱{selectedInvoice.total_Amount.toLocaleString()}
            </span>
          </div>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 text-white hover:bg-green-700 px-6 py-3 rounded-lg"
          >
            <Printer size={18} />
            Print Invoice
          </button>
        </div>
      </div>
    </section>
  );
};
