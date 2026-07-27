import { PurchaseOrderRecord } from "@/features/purchase-order/purchase-order.model";
import { XIcon } from "@/icons";
import { format } from "date-fns";
import { useState } from "react";
import { PurchaseOrderPreview } from "./purchase-order-print.modal";
import {
  Ban,
  Calendar,
  Check,
  ChevronRight,
  ClipboardList,
  Eye,
  RotateCcw,
  TriangleAlert,
  User,
} from "lucide-react";
import { useRestocksByPurchaseOrderQuery } from "@/features/restock/po-restock-history.query";
import { PORestockHistoryRecord } from "@/features/restock/models/po-restock-history.model";
import {
  DISPLAY_STATUS_CLASSES,
  DISPLAY_STATUS_ICON,
  DISPLAY_STATUS_LABEL,
  countDistinctProducts,
  getDisplayStatus,
  isOpenStatus,
} from "@/features/purchase-order/purchase-order-status.helper";

interface PurchaseOrderDetailsModalProps {
  purchaseOrder: PurchaseOrderRecord;
  onClose: () => void;
  onCancel?: (purchaseOrderId: number, reason: string) => Promise<void> | void;
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
  const [cancelReason, setCancelReason] = useState("");
  const [selectedRestock, setSelectedRestock] =
    useState<PORestockHistoryRecord | null>(null);

  const { data: restockHistory = [] } = useRestocksByPurchaseOrderQuery(
    purchaseOrder.purchase_Order_ID,
  );

  const displayStatus = getDisplayStatus(purchaseOrder);
  const StatusIcon = DISPLAY_STATUS_ICON[displayStatus];
  const isCancelled = purchaseOrder.status?.toUpperCase() === "CANCELLED";
  const canActuallyCancel = canCancel && isOpenStatus(displayStatus);

  const handleCancel = async () => {
    if (!onCancel || !cancelReason.trim()) return;
    setIsCancelling(true);
    try {
      await onCancel(purchaseOrder.purchase_Order_ID, cancelReason.trim());
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

  const shortDeliveries = purchaseOrder.line_Items.filter(
    (row) => row.remaining_quantity > 0,
  );

  return (
    <section className="absolute bg-black/40 w-full h-full top-0 left-0 flex justify-center items-center z-60">
      {isPrintPreviewOpen && (
        <PurchaseOrderPreview
          purchaseOrder={purchaseOrder}
          closeModal={() => setIsPrintPreviewOpen(false)}
        />
      )}

      {selectedRestock && (
        <RestockDetailsModal
          restock={selectedRestock}
          onClose={() => setSelectedRestock(null)}
        />
      )}

      <div className="w-3/5 h-4/5 bg-white p-8 rounded-lg border shadow-lg flex flex-col gap-2 overflow-y-auto">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <h2 className="text-xl font-bold">Purchase Order Details</h2>
            <span className="text-lg  font-semibold flex items-center gap-2">
              <ClipboardList />
              {purchaseOrder.purchase_Order_Number}

              <span
                className={`font-semibold rounded-full text-xs py-1 px-3 flex items-center gap-2 ${DISPLAY_STATUS_CLASSES[displayStatus]}`}
              >
                {StatusIcon ? <StatusIcon size={16} /> : null}
                {DISPLAY_STATUS_LABEL[displayStatus]}
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
              Preferred Delivery
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
            <span className="font-semibold">
              {formatDate(purchaseOrder.created_At)}
            </span>
            <span className="font-semibold">
              {formatDate(purchaseOrder.preferred_Delivery)}
            </span>
            <span className="font-semibold">
              {countDistinctProducts(purchaseOrder)}
            </span>
            <span className="font-semibold">
              {formatMoney(Number(purchaseOrder.grand_Total || 0))}
            </span>
          </div>
        </div>

        {isCancelled && purchaseOrder.cancellation_Info && (
          <div className="border-2 border-gray-300 bg-gray-50 p-3 rounded-md flex flex-col gap-2">
            <span className="flex items-center gap-2 text-gray-700 font-semibold">
              <Ban size={18} />
              Cancellation Information
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-vesper-gray">Cancelled by: </span>
                <span className="font-semibold">
                  {purchaseOrder.cancellation_Info.cancelled_By
                    ? `${purchaseOrder.cancellation_Info.cancelled_By.first_Name} ${purchaseOrder.cancellation_Info.cancelled_By.last_Name}`
                    : "-"}
                </span>
              </div>
              <div>
                <span className="text-vesper-gray">Cancelled at: </span>
                <span className="font-semibold">
                  {purchaseOrder.cancellation_Info.cancelled_At
                    ? formatDate(purchaseOrder.cancellation_Info.cancelled_At)
                    : "-"}
                </span>
              </div>
              <div className="md:col-span-2">
                <span className="text-vesper-gray">Reason: </span>
                <span className="font-semibold">
                  {purchaseOrder.cancellation_Info.reason || "-"}
                </span>
              </div>
            </div>
          </div>
        )}

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

              <div className="flex flex-col bg-white h-full flex-1 overflow-y-auto rounded-md">
                {shortDeliveries.length === 0 ? (
                  <div className="flex justify-between flex-col items-center my-auto">
                    <div className="bg-green-100 rounded-full p-4 w-fit h-fit flex">
                      <span className="p-2 rounded-md border-3 border-green-700 text-green-700 text-nowrap m-h-0">
                        <Check />
                      </span>
                    </div>

                    <div className="flex flex-col gap-2 text-center">
                      <span className="capitalize font-semibold text-lg">
                        no short deliveries
                      </span>

                      <span className="text-sm font-semibold text-vesper-gray">
                        All products were delivered completely.
                      </span>
                    </div>
                  </div>
                ) : (
                  // <div className="p-4 text-xs text-vesper-gray text-center">
                  //   No short deliveries
                  // </div>
                  shortDeliveries.map((row, i) => (
                    <div
                      key={i}
                      className="grid grid-cols-[2fr_2.5fr_1fr] gap-2 p-4 border-b-2"
                    >
                      <label className="text-xs font-semibold wrap-break-word">
                        {row.product?.product_Name}
                      </label>
                      <label className="text-xs text-vesper-gray font-semibold wrap-break-word">
                        {row.unit_Preset?.preset_Levels?.map((l, idx, arr) => {
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
                        })}
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
            <div className="flex flex-col flex-1 min-h-0 rounded-md">
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

              <div className="flex flex-col bg-white h-full flex-1 overflow-y-auto rounded-md">
                {restockHistory.length === 0 ? (
                  <div className="p-4 text-xs text-vesper-gray text-center">
                    No restocks found
                  </div>
                ) : (
                  restockHistory.map((restock) => (
                    <div
                      key={restock.restock_ID}
                      onClick={() => setSelectedRestock(restock)}
                      className={`grid grid-cols-[2fr_2.5fr_2.5fr_1fr] gap-2 p-4 border-b-2 cursor-pointer hover:bg-gray-50 ${
                        restock.is_Reversed ? "bg-gray-50 opacity-70" : ""
                      }`}
                    >
                      <label className="text-xs font-semibold wrap-break-word cursor-pointer">
                        <div className="flex items-center gap-2 flex-wrap">
                          {restock.restock_Number}
                          {restock.is_Reversed && (
                            <span className="flex items-center gap-1 bg-orange-200 text-orange-600 rounded-sm p-1 font-semibold w-fit h-fit">
                              <RotateCcw size={14} />
                            </span>
                          )}
                        </div>
                        <div className="text-vesper-gray font-semibold">
                          {purchaseOrder.purchase_Order_Number}
                        </div>
                      </label>
                      <label className="text-xs text-vesper-gray font-semibold wrap-break-word flex items-center gap-2">
                        <Calendar size={18} /> {formatDate(restock.created_At)}
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

        <div className="flex gap-2 items-center justify-center">
          <div
            className={`${canActuallyCancel ? "w-full" : ""}flex gap-2 items-center rounded-md border-2 border-gray-300 p-2 cursor-pointer hover:bg-gray-50`}
            onClick={() => setIsPrintPreviewOpen(true)}
          >
            <span className="bg-gray-100 rounded-md p-2 items-center justify-center w-fit h-fit text-blue-900">
              <Eye />
            </span>
            <div className="flex flex-col">
              <label className="font-semibold capitalize text-blue-900 cursor-pointer">
                view purchase order
              </label>
              <span className="text-vesper-gray text-sm">
                View full purchase order details
              </span>
            </div>

            <span className="ml-auto p-2 items-center justify-center w-fit h-fit">
              <ChevronRight />
            </span>
          </div>

          {canActuallyCancel && onCancel && (
            <div
              className="w-full flex gap-2 items-center rounded-md border-2 border-red-200 p-2 cursor-pointer hover:bg-red-50"
              onClick={() => setIsConfirmingCancel(true)}
            >
              <span className="bg-red-100 rounded-md p-2 items-center justify-center w-fit h-fit text-red-700">
                <Ban />
              </span>
              <div className="flex flex-col">
                <label className="font-semibold capitalize text-red-700 cursor-pointer">
                  cancel purchase order
                </label>
                <span className="text-vesper-gray text-sm">
                  Cancel this purchase order
                </span>
              </div>

              <span className="ml-auto p-2 items-center justify-center w-fit h-fit">
                <ChevronRight />
              </span>
            </div>
          )}
        </div>

        {isConfirmingCancel && (
          <section className="absolute bg-black/40 w-full h-full top-0 left-0 flex justify-center items-center z-70 rounded-lg">
            <div className="w-[420px] bg-white p-6 rounded-lg border shadow-xl flex flex-col gap-4">
              <h3 className="text-lg font-bold">Cancel Purchase Order</h3>
              <p className="text-sm text-gray-500">
                Are you sure you want to cancel{" "}
                {purchaseOrder.purchase_Order_Number}? This action cannot be
                undone.
              </p>
              <div>
                <label className="text-xs uppercase tracking-wide text-vesper-gray font-semibold">
                  Reason for cancellation
                </label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  rows={3}
                  className="w-full mt-1 px-3 py-2 text-sm rounded-lg border focus:outline-none focus:ring-1 focus:ring-red-400"
                  placeholder="Explain why this purchase order is being cancelled"
                />
              </div>
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
                  disabled={isCancelling || !cancelReason.trim()}
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

interface RestockDetailsModalProps {
  restock: PORestockHistoryRecord;
  onClose: () => void;
}

const RestockDetailsModal = ({
  restock,
  onClose,
}: RestockDetailsModalProps) => {
  const formatDate = (value: string) => {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;
    return format(parsed, "yyyy MMM dd");
  };

  return (
    <section className="absolute bg-black/40 w-full h-full top-0 left-0 flex justify-center items-center z-70">
      <div className="w-[560px] max-h-[80vh] overflow-y-auto bg-white p-6 rounded-lg border shadow-xl flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <h3 className="text-lg font-bold flex items-center gap-2">
              {restock.restock_Number}
              {restock.is_Reversed && (
                <span className="flex items-center gap-1 bg-orange-200 text-orange-600 rounded-sm p-1">
                  <RotateCcw size={14} />
                </span>
              )}
            </h3>
            <span className="text-sm text-vesper-gray">
              {restock.is_Reversed ? "Reversed Restock" : "Restock Details"}
            </span>
          </div>
          <div
            className="p-2 rounded hover:bg-gray-100 cursor-pointer"
            onClick={onClose}
          >
            <XIcon />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-vesper-gray">Clerk: </span>
            <span className="font-semibold flex items-center gap-1">
              <User size={14} />
              {restock.clerk
                ? `${restock.clerk.FirstName} ${restock.clerk.LastName}`
                : "-"}
            </span>
          </div>
          <div>
            <span className="text-vesper-gray">Date: </span>
            <span className="font-semibold">
              {formatDate(restock.created_At)}
            </span>
          </div>
          <div>
            <span className="text-vesper-gray">Total Quantity: </span>
            <span className="font-semibold">{restock.total_Quantity}</span>
          </div>
          <div>
            <span className="text-vesper-gray">Status: </span>
            <span className="font-semibold">
              {restock.is_Reversed ? "Reversed" : restock.status}
            </span>
          </div>
        </div>

        {restock.is_Reversed && (
          <div className="rounded-md border-2 border-orange-200 bg-orange-50 p-3 text-sm flex flex-col gap-1">
            <span className="font-semibold text-orange-700">
              Reversal Information
            </span>
            <span>
              <span className="text-vesper-gray">Reversed by: </span>
              {restock.voided_By_User
                ? `${restock.voided_By_User.FirstName} ${restock.voided_By_User.LastName}`
                : "-"}
            </span>
            <span>
              <span className="text-vesper-gray">Reversed at: </span>
              {restock.voided_At ? formatDate(restock.voided_At) : "-"}
            </span>
            <span>
              <span className="text-vesper-gray">Reason: </span>
              {restock.restock_Notes || "-"}
            </span>
          </div>
        )}

        <div className="rounded-md border-2 border-gray-300 overflow-hidden">
          <div className="grid grid-cols-[2fr_1fr_1fr] gap-2 px-3 py-2 bg-gray-50 text-xs font-semibold uppercase">
            <div>Product</div>
            <div className="text-right">Quantity</div>
            <div>Unit</div>
          </div>
          <div className="max-h-[30vh] overflow-y-auto">
            {restock.line_Items.map((line, i) => (
              <div
                key={i}
                className="grid grid-cols-[2fr_1fr_1fr] gap-2 px-3 py-2 text-sm border-t"
              >
                <div>
                  {line.product?.product_Name} - {line.product?.brand} -{" "}
                  {line.product?.variant}
                </div>
                <div className="text-right">{line.base_Unit_Quantity}</div>
                <div>{line.base_Unit?.uom_Name ?? "-"}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            className="px-4 py-2 text-sm rounded border"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </section>
  );
};
