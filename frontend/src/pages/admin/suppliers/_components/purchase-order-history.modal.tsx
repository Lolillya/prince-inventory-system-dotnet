import {
  usePurchaseOrdersBySupplierQuery,
  useUpdatePurchaseOrderStatusMutation,
} from "@/features/purchase-order/purchase-order.query";
import { SupplierDataModel } from "@/features/suppliers/get-all-suppliers.model";
import { XIcon } from "@/icons";
import { format } from "date-fns";
import { toast } from "sonner";

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
  const { data: purchaseOrders = [], isLoading } =
    usePurchaseOrdersBySupplierQuery(selectedSupplier.supplier_Id);
  const { mutateAsync: updateStatus, isPending } =
    useUpdatePurchaseOrderStatusMutation(selectedSupplier.supplier_Id);

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

        <div className="rounded-lg border overflow-hidden">
          <div className="grid grid-cols-12 gap-2 px-3 py-2 bg-custom-gray text-xs font-semibold uppercase">
            <div className="col-span-2">PO Number</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2">Preferred Delivery</div>
            <div className="col-span-2 text-right">Grand Total</div>
            <div className="col-span-2 text-right">Products</div>
            <div className="col-span-2 text-right">Action</div>
          </div>

          <div className="max-h-[55vh] overflow-y-auto">
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
                    className="border-b last:border-b-0"
                  >
                    <div className="grid grid-cols-12 gap-2 px-3 py-2 text-sm items-center">
                      <div className="col-span-2 font-semibold">
                        {po.purchase_Order_Number}
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
                      <div className="col-span-2 text-right">
                        {po.line_Items.length}
                      </div>
                      <div className="col-span-2 text-right">
                        {isPendingStatus ? (
                          <button
                            className="px-3 py-1 text-xs rounded bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-60"
                            onClick={() => handleComplete(po.purchase_Order_ID)}
                            disabled={isPending}
                          >
                            Set COMPLETE
                          </button>
                        ) : (
                          <span className="text-xs text-green-700 font-semibold">
                            Completed
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="px-3 pb-3">
                      <div className="rounded border overflow-hidden">
                        <div className="grid grid-cols-12 gap-2 px-2 py-1 bg-gray-50 text-xs font-semibold uppercase">
                          <div className="col-span-4">Product</div>
                          <div className="col-span-2 text-right">Qty</div>
                          <div className="col-span-2">Unit</div>
                          <div className="col-span-2 text-right">Price</div>
                          <div className="col-span-2 text-right">Sub-total</div>
                        </div>
                        {po.line_Items.map((line) => (
                          <div
                            key={line.purchase_Order_LineItem_ID}
                            className="grid grid-cols-12 gap-2 px-2 py-1 text-xs border-t first:border-t-0"
                          >
                            <div className="col-span-4">
                              {line.product?.product_Name} -{" "}
                              {line.product?.brand} - {line.product?.variant}
                            </div>
                            <div className="col-span-2 text-right">
                              {line.quantity}
                            </div>
                            <div className="col-span-2">
                              {line.unit?.uom_Name || "-"}
                            </div>
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
