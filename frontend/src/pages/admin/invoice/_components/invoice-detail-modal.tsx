import { Separator } from "@/components/separator";
import { InvoiceAllModel } from "@/features/invoice/models/invoice-all.model";
import { XIcon } from "@/icons";
import { Calendar, User } from "lucide-react";

interface Props {
  selectedInvoice: InvoiceAllModel;
  onClose: () => void;
}

export const InvoiceDetailModal = ({ selectedInvoice, onClose }: Props) => {
  const customerDisplay = selectedInvoice.customer.companyName
    ? selectedInvoice.customer.companyName
    : `${selectedInvoice.customer.firstName} ${selectedInvoice.customer.lastName}`;

  return (
    <section className="absolute bg-black/40 w-full h-full top-0 left-0 flex justify-center items-center z-50">
      <div className="w-3/6 h-4/5 bg-white p-10 rounded-lg border shadow-lg flex flex-col gap-5">
        {/* HEADER */}
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold tracking-wide">
              Invoice #{selectedInvoice.invoice_Number}
            </h3>
            {selectedInvoice.status === "PAID" && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                PAID
              </span>
            )}
          </div>
          <div
            onClick={onClose}
            className="cursor-pointer hover:bg-gray-100 p-1 rounded"
          >
            <XIcon />
          </div>
        </div>

        {/* META */}
        <div className="flex gap-5">
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
          <div className="flex items-center gap-2 text-sm text-saltbox-gray">
            <User size={16} />
            <span>
              {selectedInvoice.clerk.firstName} {selectedInvoice.clerk.lastName}
            </span>
          </div>
        </div>

        <Separator />

        {/* CUSTOMER & TERM */}
        <div className="flex gap-3">
          <div className="flex flex-col w-full gap-2">
            <label className="text-sm font-semibold">Customer</label>
            <input readOnly value={customerDisplay} className="input-style-3" />
          </div>
          <div className="flex flex-col w-full gap-2">
            <label className="text-sm font-semibold">Term</label>
            <input
              readOnly
              value={`Net ${selectedInvoice.term}`}
              className="input-style-3"
            />
          </div>
        </div>

        <Separator />

        {/* LINE ITEMS TABLE */}
        <div className="flex-1 flex flex-col overflow-hidden gap-2">
          <div className="flex justify-between py-2 px-4 bg-custom-gray rounded-lg gap-2">
            <label className="text-left w-full uppercase text-xs font-semibold">
              Product
            </label>
            <label className="text-right w-[20%] uppercase text-xs font-semibold">
              Qty
            </label>
            <label className="text-left w-[20%] uppercase text-xs font-semibold pl-2">
              Unit
            </label>
            <label className="text-right w-[25%] uppercase text-xs font-semibold">
              Price
            </label>
            <label className="text-right w-[25%] uppercase text-xs font-semibold">
              Subtotal
            </label>
          </div>

          <div className="overflow-auto flex flex-col h-full">
            {selectedInvoice.lineItems.map((item, i) => (
              <div
                key={item.lineItem_ID}
                className={`py-2 px-4 flex justify-between gap-2 rounded-lg items-center text-sm ${
                  i % 2 !== 0 && "bg-custom-gray"
                }`}
              >
                <span className="text-left w-full">
                  {item.product.product_Name}
                </span>
                <span className="text-right w-[20%]">{item.unit_Quantity}</span>
                <span className="text-left w-[20%] pl-2">{item.unit}</span>
                <span className="text-right w-[25%]">
                  ₱{item.unit_Price.toLocaleString()}
                </span>
                <span className="text-right w-[25%] font-medium">
                  ₱{item.sub_Total.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex justify-between items-center pt-2 border-t">
          {selectedInvoice.discount > 0 && (
            <span className="text-sm text-saltbox-gray">
              Discount: ₱{selectedInvoice.discount.toLocaleString()}
            </span>
          )}
          <div className="ml-auto flex items-center gap-3">
            <span className="text-sm font-semibold text-saltbox-gray tracking-wide">
              TOTAL:
            </span>
            <span className="text-2xl font-bold">
              ₱{selectedInvoice.total_Amount.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
