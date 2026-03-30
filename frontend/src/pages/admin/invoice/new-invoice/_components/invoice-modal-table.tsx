import { useAuth } from "@/context/use-auth";
import { createInvoice } from "@/features/invoice/create-invoice.service";
import {
  useInvoicePayloadQuery,
  useSelectedPayloadInvoiceQuery,
} from "@/features/invoice/invoice-create-payload";
import {
  useSelectedInvoiceCustomer,
  updateSelectedCustomer,
} from "@/features/invoice/invoice-customer.state";
import {
  useInvoiceTermQuery,
  setInvoiceTermQuery,
} from "@/features/invoice/invoice-term.state";
import { useState } from "react";

export const InvoiceTable = ({ onSuccess }: { onSuccess?: () => void }) => {
  const { data: payload = [] } = useSelectedPayloadInvoiceQuery();
  const { data: selectedCustomer } = useSelectedInvoiceCustomer();
  const { data: invoiceTerm } = useInvoiceTermQuery();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const { CLEAR_INVOICE_PAYLOAD } = useInvoicePayloadQuery();
  const { CLEAR_SELECTED_CUSTOMER } = updateSelectedCustomer();
  const { CLEAR_INVOICE_TERM } = setInvoiceTermQuery();

  console.log(payload);

  const calculateInvoiceTotal = () => {
    return payload.reduce((total, item) => total + item.invoice.total, 0);
  };

  const calculateSubtotal = () => {
    return payload.reduce(
      (total, item) =>
        total + item.invoice.unit_quantity * item.invoice.unit_price,
      0,
    );
  };

  const handleCreateInvoice = async () => {
    if (!selectedCustomer) {
      alert("Please select a customer");
      return;
    }

    if (payload.length === 0) {
      alert("Please add line items");
      return;
    }

    setIsLoading(true);
    try {
      await createInvoice(
        payload,
        selectedCustomer?.id,
        user?.user_ID,
        invoiceTerm,
      );
      alert("Invoice created successfully!");

      // Clear the payload and state after successful creation
      CLEAR_INVOICE_PAYLOAD();
      CLEAR_SELECTED_CUSTOMER();
      CLEAR_INVOICE_TERM();

      // Notify parent to close modal
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error creating invoice:", error);
      alert("Error creating invoice");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="flex-1 flex flex-col overflow-hidden gap-2">
      {/* TABLE DATA HEADERS */}
      <div className="flex justify-between py-3 px-5 bg-custom-gray rounded-lg gap-2">
        <label className="text-left w-full">Item</label>

        <label className="text-left w-full">Unit</label>
        <label className="text-right w-full">Unit Price</label>
        <label className="text-right w-full">Quantity</label>
        <label className="text-right w-full">Discount</label>
        <label className="text-right w-full">Subtotal</label>
      </div>

      {/* TABLE DATA BODY */}
      <div className="overflow-auto flex flex-col h-full">
        {payload && payload.length > 0 ? (
          payload.map((item, i) => {
            return (
              <div
                className={`py-3 px-5 flex justify-between gap-2 rounded-lg items-center text-xs ${
                  i % 2 != 0 && "bg-custom-gray"
                }`}
                key={i}
              >
                <span className="text-left w-full truncate">
                  {item.invoice.product.product_Name}
                </span>
                <span className="text-left w-full">{item.invoice.unit}</span>
                <span className="text-right w-full">
                  ₱{item.invoice.unit_price.toFixed(2)}
                </span>
                <span className="text-right w-full">
                  {item.invoice.unit_quantity}
                </span>
                <span className="text-right w-full">
                  {item.invoice.isDiscountPercentage
                    ? `${item.invoice.discount}%`
                    : `₱${item.invoice.discount.toFixed(2)}`}
                </span>
                <span className="text-right w-full">
                  ₱{item.invoice.total.toFixed(2)}
                </span>
              </div>
            );
          })
        ) : (
          <div className="text-center text-vesper-gray py-5">
            No items added
          </div>
        )}
      </div>

      <span className="text-vesper-gray text-xs">
        Invoice will include {payload.length} item
        {payload.length !== 1 ? "s" : ""}
      </span>

      <div className="flex justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex gap-2 text-sm tracking-wider">
            <span className="text-vesper-gray">Subtotal:</span>
            <label className="font-semibold">
              ₱{calculateSubtotal().toFixed(2)}
            </label>
          </div>

          <div className="flex gap-2 font-bold tracking-wider text-base">
            <span>TOTAL:</span>
            <label>₱{calculateInvoiceTotal().toFixed(2)}</label>
          </div>
        </div>

        <button
          onClick={handleCreateInvoice}
          disabled={isLoading || payload.length === 0 || !selectedCustomer}
          className="px-6 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isLoading ? "Creating..." : "Create Invoice"}
        </button>
      </div>
    </div>
  );
};
