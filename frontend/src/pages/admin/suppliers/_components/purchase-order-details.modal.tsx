import { PurchaseOrderRecord } from "@/features/purchase-order/purchase-order.model";
import { XIcon } from "@/icons";
import { format } from "date-fns";
import { useState } from "react";
import { PurchaseOrderPreview } from "./purchase-order-print.modal";
import {
  Calendar,
  ClipboardList,
  FileText,
  RotateCcw,
  TriangleAlert,
} from "lucide-react";
import { purchaseOrderService } from "@/features/purchase-order/purchase-order.service";
import { useRestocksByPurchaseOrderQuery } from "@/features/restock/po-restock-history.query";

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

  const { data: restockHistory = [] } = useRestocksByPurchaseOrderQuery(
    purchaseOrder.purchase_Order_ID,
  );

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
            <span className="text-lg  font-semibold flex items-center gap-2">
              <ClipboardList />
              {purchaseOrder.purchase_Order_Number}

              <span className="font-semibold bg-blue-100 rounded-full text-xs py-1 px-3 flex items-center gap-2 text-blue-600">
                <FileText size={18} />
                {purchaseOrder.status}
              </span>
            </span>
          </div>

          <div
            className="p-2 rounded hover:bg-gray-100 cursor-pointer duration-300 transition-all"
            onClick={onClose}
          >
            <XIcon />
          </div>
        </div>

        <div className="border-2 border-gray-300 p-3 rounded-md ">
          <div className="grid grid-cols-5 grid-rows-2">
            <label className="text-vesper-gray font-semibold">Supplier</label>
            <label className="text-vesper-gray font-semibold">
              Date Created
            </label>
            <label className="text-vesper-gray font-semibold">
              Prefered Delivery
            </label>
            <label className="text-vesper-gray font-semibold">
              Total Products
            </label>
            <label className="text-vesper-gray font-semibold">
              Grand Total
            </label>

            <span className="font-semibold">
              {purchaseOrder.supplier.company_Name}
            </span>
            <span className="font-semibold">{purchaseOrder.created_At}</span>
            <span className="font-semibold">
              {purchaseOrder.preferred_Delivery}
            </span>
            <span className="font-semibold">
              {purchaseOrder.line_Items.length}
            </span>
            {purchaseOrder.line_Items.map((line, i) => (
              <span className="font-semibold">
                {formatMoney(Number(line.sub_Total || 0))}
              </span>
            ))}
          </div>
        </div>

        <div className="flex flex-row gap-2 py-2 mb-2 flex-1 min-h-0">
          {/* SHORT DELIVERIES */}
          <div className="rounded-md border-2 border-gray-300 w-full flex flex-col min-h-0">
            <span className="flex items-center gap-2 text-orange-500 p-4 bg-gray-50 rounded-md shrink-0">
              <TriangleAlert />
              <label className="text-orange-500 font-semibold">
                Short Deliveries
              </label>
            </span>

            <div className="flex flex-col flex-1 min-h-0">
              <div className="grid grid-cols-[2fr_2.5fr_1fr] gap-2 px-4 py-2 border-b-2 bg-gray-50 shrink-0">
                <label className="font-semibold uppercase text-vesper-gray text-xs">
                  product
                </label>
                <label className="font-semibold uppercase text-vesper-gray text-xs">
                  preset conversion
                </label>
                <label className="font-semibold uppercase text-vesper-gray text-xs text-nowrap">
                  short qty (main unit)
                </label>
              </div>

              <div className="flex flex-col bg-white h-full flex-1 overflow-y-auto">
                {purchaseOrder.line_Items.filter(
                  (row) => row.remaining_quantity > 0,
                ).length === 0 ? (
                  <div className="p-4 text-xs text-vesper-gray text-center">
                    No short deliveries
                  </div>
                ) : (
                  purchaseOrder.line_Items
                    .filter((row) => row.remaining_quantity > 0)
                    .map((row, i) => (
                      <div
                        key={i}
                        className="grid grid-cols-[2fr_2.5fr_1fr] gap-2 p-4 border-b-2"
                      >
                        <label className="text-xs font-semibold break-words">
                          {row.product?.product_Name}
                        </label>
                        <label className="text-xs text-vesper-gray font-semibold break-words">
                          {row.unit_Preset?.preset_Levels?.map(
                            (l, idx, arr) => {
                              const hasConv =
                                l.conversion_Factor !== undefined &&
                                l.conversion_Factor !== null;
                              return (
                                <span key={idx}>
                                  {l.uom_Name}
                                  {hasConv ? ` (${l.conversion_Factor}x)` : ""}
                                  {idx < arr.length - 1 && " -> "}
                                </span>
                              );
                            },
                          )}
                        </label>
                        <label className="text-xs text-orange-500 font-semibold">
                          {row.remaining_quantity} {row.unit?.uom_Name ?? ""}
                        </label>
                      </div>
                    ))
                )}
              </div>
            </div>
          </div>

          {/* RESTOCK HISTORY */}
          <div className="rounded-md border-2 border-gray-300 w-full flex flex-col min-h-0">
            <span className="flex items-center gap-2 text-blue-500 p-4 bg-gray-50 rounded-md shrink-0">
              <RotateCcw />
              <label className="text-blue-500 font-semibold">
                Restock History
              </label>
            </span>
            <div className="flex flex-col flex-1 min-h-0">
              <div className="grid grid-cols-[2fr_2.5fr_2.5fr_1fr] gap-2 px-4 py-2 border-b-2 bg-gray-50 shrink-0">
                <label className="font-semibold uppercase text-vesper-gray text-xs">
                  restock reference
                </label>
                <label className="font-semibold uppercase text-vesper-gray text-xs">
                  date
                </label>
                <label className="font-semibold uppercase text-vesper-gray text-xs text-nowrap">
                  product/s
                </label>
                <label className="font-semibold uppercase text-vesper-gray text-xs text-nowrap">
                  total quantity
                </label>
              </div>

              <div className="flex flex-col bg-white h-full flex-1 overflow-y-auto">
                {restockHistory.length === 0 ? (
                  <div className="p-4 text-xs text-vesper-gray text-center">
                    No restocks found
                  </div>
                ) : (
                  restockHistory.map((restock) => (
                    <div
                      key={restock.restock_ID}
                      className="grid grid-cols-[2fr_2.5fr_2.5fr_1fr] gap-2 p-4 border-b-2"
                    >
                      <label className="text-xs font-semibold wrap-break-word">
                        {restock.restock_Number}
                        <div className="text-vesper-gray font-normal">
                          Ref: {purchaseOrder.purchase_Order_Number}
                        </div>
                      </label>
                      <label className="text-xs text-vesper-gray font-semibold wrap-break-word flex items-center gap-2">
                        <Calendar size={18}/> {formatDate(restock.created_At)}
                      </label>
                      <label className="text-xs font-semibold flex items-center">
                        {restock.line_Items.length} product
                        {restock.line_Items.length === 1 ? "" : "s"}
                      </label>
                      <label className="text-xs font-semibold flex items-center">
                        {restock.total_Quantity}
                      </label>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
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
                Are you sure you want to cancel{" "}
                {purchaseOrder.purchase_Order_Number}? This action cannot be
                undone.
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
        )} */}
      </div>
    </section>
  );
};
