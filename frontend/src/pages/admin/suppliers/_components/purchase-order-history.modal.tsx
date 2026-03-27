import {
  usePurchaseOrdersBySupplierQuery,
  useUpdatePurchaseOrderStatusMutation,
} from "@/features/purchase-order/purchase-order.query";
import { PurchaseOrderRecord } from "@/features/purchase-order/purchase-order.model";
import { SupplierDataModel } from "@/features/suppliers/get-all-suppliers.model";
import { XIcon } from "@/icons";
import { format } from "date-fns";
import { toast } from "sonner";
import { useMemo, useState } from "react";
import { PurchaseOrderDetailsModal } from "./purchase-order-details.modal";

interface PurchaseOrderHistoryModalProps {
  selectedSupplier: SupplierDataModel;
  setIsPurchaseOrderHistoryModalOpen: React.Dispatch<
    React.SetStateAction<boolean>
  >;
}

export const PurchaseOrderHistoryModal = ({
  selectedSupplier,
  setIsPurchaseOrderHistoryModalOpen,
}: PurchaseOrderHistoryModalProps) => {
  const [selectedPurchaseOrder, setSelectedPurchaseOrder] =
    useState<PurchaseOrderRecord | null>(null);

  const { data: purchaseOrders = [], isLoading } =
    usePurchaseOrdersBySupplierQuery(selectedSupplier.supplier_Id);
  const { mutateAsync: updateStatus, isPending } =
    useUpdatePurchaseOrderStatusMutation(selectedSupplier.supplier_Id);

  const stats = useMemo(() => {
    const pending = purchaseOrders.filter(
      (po) => po.status?.toUpperCase() === "PENDING",
    ).length;
    const completed = purchaseOrders.filter(
      (po) => po.status?.toUpperCase() === "COMPLETED",
    ).length;

    const totalAmount = purchaseOrders.reduce(
      (acc, po) => acc + Number(po.grand_Total || 0),
      0,
    );

    return {
      total: purchaseOrders.length,
      pending,
      completed,
      totalAmount,
    };
  }, [purchaseOrders]);

  const formatMoney = (value: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const handleClose = () => {
    setIsPurchaseOrderHistoryModalOpen(false);
  };

  const formatDate = (value: string) => {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;
    return format(parsed, "yyyy MMM dd");
  };

  const handleComplete = async (purchaseOrderId: number) => {
    try {
      await updateStatus({ purchaseOrderId, status: "COMPLETED" });
      toast.success("Purchase order marked as COMPLETED.");
    } catch {
      // Error handling is centralized in service layer.
    }
  };

  return (
    <section className="absolute bg-black/40 w-full h-full top-0 left-0 flex justify-center items-center z-50">
      {selectedPurchaseOrder && (
        <PurchaseOrderDetailsModal
          purchaseOrder={selectedPurchaseOrder}
          onClose={() => setSelectedPurchaseOrder(null)}
        />
      )}

      <div className="w-[980px] max-h-[90vh] overflow-y-auto bg-white px-10 py-8 rounded-lg border shadow-lg relative flex flex-col gap-4">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold">Purchase Order History</h1>
            <p className="text-gray-500">
              {selectedSupplier.company_Name} purchase order records
            </p>
          </div>
          <button
            className="p-2 rounded hover:bg-gray-100"
            onClick={handleClose}
            aria-label="Close purchase order history"
          >
            <XIcon />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="rounded-lg border bg-custom-gray p-3">
            <p className="text-xs uppercase text-vesper-gray">Total records</p>
            <p className="text-lg font-bold">{stats.total}</p>
          </div>
          <div className="rounded-lg border bg-custom-gray p-3">
            <p className="text-xs uppercase text-vesper-gray">Pending</p>
            <p className="text-lg font-bold text-amber-700">{stats.pending}</p>
          </div>
          <div className="rounded-lg border bg-custom-gray p-3">
            <p className="text-xs uppercase text-vesper-gray">Completed</p>
            <p className="text-lg font-bold text-green-700">
              {stats.completed}
            </p>
          </div>
          <div className="rounded-lg border bg-custom-gray p-3">
            <p className="text-xs uppercase text-vesper-gray">Total amount</p>
            <p className="text-lg font-bold">
              {formatMoney(stats.totalAmount)}
            </p>
          </div>
        </div>

        <div className="rounded-lg border overflow-hidden">
          <div className="grid grid-cols-12 gap-2 px-3 py-2 bg-custom-gray text-xs font-semibold uppercase tracking-wide">
            <div className="col-span-3">PO Number</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2">Preferred Delivery</div>
            <div className="col-span-2 text-right">Grand Total</div>
            <div className="col-span-1 text-right">Items</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>

          <div className="max-h-[56vh] overflow-y-auto">
            {isLoading ? (
              <div className="px-3 py-8 text-sm text-gray-500 text-center">
                Loading purchase orders...
              </div>
            ) : purchaseOrders.length === 0 ? (
              <div className="px-3 py-8 text-sm text-gray-500 text-center">
                No purchase orders found
              </div>
            ) : (
              purchaseOrders.map((po) => {
                const isPendingStatus = po.status?.toUpperCase() === "PENDING";

                return (
                  <div
                    key={po.purchase_Order_ID}
                    className="border-b last:border-b-0 px-3 py-3"
                  >
                    <div className="grid grid-cols-12 gap-2 text-sm items-center">
                      <div className="col-span-3 font-semibold">
                        {po.purchase_Order_Number}
                        <div className="text-xs text-vesper-gray mt-1">
                          {formatDate(po.created_At)}
                        </div>
                      </div>
                      <div className="col-span-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            isPendingStatus
                              ? "bg-amber-100 text-amber-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {po.status}
                        </span>
                      </div>
                      <div className="col-span-2">
                        {formatDate(po.preferred_Delivery)}
                      </div>
                      <div className="col-span-2 text-right font-medium">
                        {formatMoney(Number(po.grand_Total || 0))}
                      </div>
                      <div className="col-span-1 text-right">
                        {po.line_Items.length}
                      </div>
                      <div className="col-span-2 flex gap-2 justify-end">
                        <button
                          className="px-3 py-1 text-xs rounded border hover:bg-gray-50"
                          onClick={() => setSelectedPurchaseOrder(po)}
                        >
                          View details
                        </button>

                        {isPendingStatus ? (
                          <button
                            className="px-3 py-1 text-xs rounded bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-60"
                            onClick={() => handleComplete(po.purchase_Order_ID)}
                            disabled={isPending}
                          >
                            Set COMPLETE
                          </button>
                        ) : (
                          <button
                            className="px-3 py-1 text-xs rounded bg-green-100 text-green-700 cursor-default"
                            disabled
                          >
                            Completed
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            className="px-4 py-2 text-sm rounded border"
            onClick={handleClose}
          >
            Close
          </button>
        </div>
      </div>
    </section>
  );
};
