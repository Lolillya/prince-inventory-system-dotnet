import { useAuth } from "@/context/use-auth";
import { createInvoice } from "@/features/invoice/create-invoice.service";
import { useSelectedInvoiceCustomer } from "@/features/invoice/invoice-customer.state";
import { useInvoiceTermQuery } from "@/features/invoice/invoice-term.state";
import { useSelectedProductInvoiceQuery } from "@/features/invoice/selected-product";

export const InvoiceTable = () => {
  const { data: selectedInvoices = [] } = useSelectedProductInvoiceQuery();
  const { data: selecterCustomer } = useSelectedInvoiceCustomer();
  const { data: invoiceTerm } = useInvoiceTermQuery();
  const { user } = useAuth();

  const handleCreateInvoice = () => {
    createInvoice(
      selectedInvoices,
      selecterCustomer?.id,
      user?.user_ID,
      invoiceTerm
    );
  };
  return (
    <div className="flex-1 flex flex-col overflow-hidden gap-2">
      {/* TABLE DATA HEADERS */}
      <div className="flex justify-between py-3 px-5 bg-custom-gray rounded-lg gap-2">
        <label className="text-left w-full">Item</label>
        <label className="text-left w-full">Quantity</label>
        <label className="text-left w-full">Unit</label>
        <label className="text-right w-full">Unit Price</label>
        <label className="text-right w-full">Quantity</label>
        <label className="text-right w-full">Discount</label>
        <label className="text-right w-full">Subtotal</label>
      </div>

      {/* TABLE DATA BODY */}
      <div className="overflow-auto flex flex-col h-full">
        {selectedInvoices.map((item, i) => (
          <div
            className={`py-3 px-5 flex justify-between gap-2 rounded-lg items-center ${i % 2 != 0 && "bg-custom-gray"}`}
            key={i}
          >
            <span className="text-left w-full">
              {item.invoice.item.product.productName}
            </span>
            <span className="text-left w-full">
              {item.invoice.item.product.productName}
            </span>
            <span className="text-left w-full">UPDATE UNIT STATE</span>
            <span className="text-right w-full">
              P {item.invoice.unit_price}
            </span>
            <span className="text-right w-full">
              {item.invoice.unit_quantity}
            </span>
            <span className="text-right w-full">{item.invoice.discount}</span>
            <span className="text-right w-full">
              P {item.invoice.unit_price * item.invoice.unit_quantity}
            </span>
          </div>
        ))}
      </div>

      <span className="text-vesper-gray text-xs">
        Note: This order includes more than 10 items. We'll move the additional
        items to new invoices accordingly.
      </span>

      <div className="flex justify-between">
        <div className="flex flex-col">
          <div className="flex gap-2  text-sm tracking-wider">
            <span className="text-vesper-gray">P 0000.00</span>
            <label className="text-vesper-gray ">Discount</label>
          </div>

          <div className="flex gap-2 font-bold tracking-wider">
            <span>TOTAL: </span>
            <label>P 0000.00</label>
          </div>
        </div>

        <button onClick={handleCreateInvoice}>Save</button>
      </div>
    </div>
  );
};
