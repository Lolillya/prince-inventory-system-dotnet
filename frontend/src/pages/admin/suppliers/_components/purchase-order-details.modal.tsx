import { PurchaseOrderRecord } from "@/features/purchase-order/purchase-order.model";
import { XIcon } from "@/icons";
import { format } from "date-fns";
import { useState } from "react";
import { PurchaseOrderPreview } from "./purchase-order-print.modal";

interface PurchaseOrderDetailsModalProps {
  purchaseOrder: PurchaseOrderRecord;
  onClose: () => void;
  onCancel?: (purchaseOrderId: number) => Promise<void> | void;
  canCancel?: boolean;
}

export const PurchaseOrderDetailsModal = ({
  purchaseOrder,
  onClose,
  onCancel,
  canCancel = false,
}: PurchaseOrderDetailsModalProps) => {
  const [isPrintPreviewOpen, setIsPrintPreviewOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isConfirmingCancel, setIsConfirmingCancel] = useState(false);

  const handleCancel = async () => {
    if (!onCancel) return;
    setIsCancelling(true);
    try {
      await onCancel(purchaseOrder.purchase_Order_ID);
      setIsConfirmingCancel(false);
      onClose();
    } finally {
      setIsCancelling(false);
    }
  };

  const formatMoney = (value: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatDate = (value: string) => {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;
    return format(parsed, "yyyy MMM dd");
  };

  return (
    <section className="absolute bg-black/40 w-full h-full top-0 left-0 flex justify-center items-center z-60">
      {isPrintPreviewOpen && (
        <PurchaseOrderPreview
          purchaseOrder={purchaseOrder}
          closeModal={() => setIsPrintPreviewOpen(false)}
        />
      )}

      <div className="w-3/5 h-4/5 bg-white p-8 rounded-lg border shadow-lg flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <h2 className="text-xl font-bold">Purchase Order Details</h2>
            <span className="text-sm text-vesper-gray">
              {purchaseOrder.purchase_Order_Number}
            </span>
          </div>
          <div className="p-2 rounded hover:bg-gray-100 cursor-pointer duration-300 transition-all" onClick={onClose}>
            <XIcon />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-vesper-gray">Supplier: </span>
            <span className="font-semibold">
              {purchaseOrder.supplier.company_Name}
            </span>
          </div>
          <div>
            <span className="text-vesper-gray">Status: </span>
            <span className="font-semibold">{purchaseOrder.status}</span>
          </div>
          <div>
            <span className="text-vesper-gray">Preferred Delivery: </span>
            <span className="font-semibold">
              {formatDate(purchaseOrder.preferred_Delivery)}
            </span>
          </div>
          <div>
            <span className="text-vesper-gray">Created At: </span>
            <span className="font-semibold">
              {formatDate(purchaseOrder.created_At)}
            </span>
          </div>
        </div>

        <div className="rounded-lg border overflow-hidden flex-1 min-h-0">
          <div className="grid grid-cols-12 gap-2 px-3 py-2 bg-custom-gray text-xs font-semibold uppercase">
            <div className="col-span-4">Product</div>
            <div className="col-span-2 text-right">Quantity</div>
            <div className="col-span-2">Unit</div>
            <div className="col-span-2 text-right">Price</div>
            <div className="col-span-2 text-right">Sub-total</div>
          </div>

          <div className="max-h-[42vh] overflow-y-auto">
            {purchaseOrder.line_Items.map((line) => (
              <div
                key={line.purchase_Order_LineItem_ID}
                className="grid grid-cols-12 gap-2 px-3 py-2 text-sm border-t first:border-t-0"
              >
                <div className="col-span-4">
                  {line.product?.product_Name} - {line.product?.brand} -{" "}
                  {line.product?.variant}
                </div>
                <div className="col-span-2 text-right">{line.quantity}</div>
                <div className="col-span-2">{line.unit?.uom_Name || "-"}</div>
                <div className="col-span-2 text-right">
                  {formatMoney(Number(line.unit_Price || 0))}
                </div>
                <div className="col-span-2 text-right font-medium">
                  {formatMoney(Number(line.sub_Total || 0))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border p-3 bg-custom-gray">
          <label className="text-xs text-vesper-gray uppercase tracking-wide">
            Note
          </label>
          <p className="text-sm mt-1 whitespace-pre-wrap">
            {purchaseOrder.notes || "-"}
          </p>
        </div>

        <div className="flex justify-between items-center">
          <div className="text-sm">
            <span className="text-vesper-gray mr-2">Grand total:</span>
            <span className="font-bold">
              {formatMoney(Number(purchaseOrder.grand_Total || 0))}
            </span>
          </div>

          <div className="flex gap-2">
            {canCancel && onCancel && (
              <button
                className="px-4 py-2 text-sm rounded border border-red-300 text-red-600 hover:bg-red-50 text-nowrap bg-red-200"
                onClick={() => setIsConfirmingCancel(true)}
              >
                Cancel PO
              </button>
            )}
            <button
              className="px-4 py-2 text-sm rounded border"
              onClick={onClose}
            >
              Close
            </button>
            <button
              className="px-4 py-2 text-sm rounded bg-blue-500 text-white hover:bg-blue-600"
              onClick={() => setIsPrintPreviewOpen(true)}
            >
              Print
            </button>
          </div>
        </div>

        {isConfirmingCancel && (
          <section className="absolute bg-black/40 w-full h-full top-0 left-0 flex justify-center items-center z-70 rounded-lg">
            <div className="w-[380px] bg-white p-6 rounded-lg border shadow-xl flex flex-col gap-4">
              <h3 className="text-lg font-bold">Cancel Purchase Order</h3>
              <p className="text-sm text-gray-500">
                Are you sure you want to cancel {purchaseOrder.purchase_Order_Number}?
                This action cannot be undone.
              </p>
              <div className="flex justify-end gap-2">
                <button
                  className="px-4 py-2 text-sm rounded border"
                  onClick={() => setIsConfirmingCancel(false)}
                  disabled={isCancelling}
                >
                  Go Back
                </button>
                <button
                  className="px-4 py-2 text-sm rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
                  onClick={handleCancel}
                  disabled={isCancelling}
                >
                  {isCancelling ? "Cancelling..." : "Confirm Cancel"}
                </button>
              </div>
            </div>
          </section>
        )}
      </div>
    </section>
  );
};
