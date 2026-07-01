import { PurchaseOrderRecord } from "@/features/purchase-order/purchase-order.model";
import { PORestockDeliveryStatus } from "@/features/restock/models/po-restock.model";
import { PORestockCardState } from "../index";
import { AlertTriangle } from "lucide-react";

interface DeliveryStatusChoiceModalProps {
  po: PurchaseOrderRecord;
  cards: PORestockCardState[];
  isPending: boolean;
  onClose: () => void;
  onChoose: (status: PORestockDeliveryStatus) => void;
}

export const DeliveryStatusChoiceModal = ({
  po,
  cards,
  isPending,
  onClose,
  onChoose,
}: DeliveryStatusChoiceModalProps) => {
  const shortDeliveries = cards
    .filter((c) => !c.removed && c.receivingQuantity < c.remainingQuantity)
    .map((c) => {
      const li = po.line_Items.find(
        (l) => l.purchase_Order_LineItem_ID === c.lineItemId,
      );
      return {
        lineItemId: c.lineItemId,
        productName: li?.product?.product_Name ?? "",
        presetConversion:
          li?.unit_Preset?.preset_Levels.map((l) => l.uom_Name).join(" → ") ??
          "",
        shortQty: c.remainingQuantity - c.receivingQuantity,
        mainUnitName:
          li?.unit_Preset?.preset_Levels[0]?.uom_Name ??
          li?.unit?.uom_Name ??
          "",
      };
    });
  return (
    <section className="absolute bg-black/40 w-full h-full top-0 left-0 flex justify-center items-center z-60">
      <div className="w-[900px] max-w-[95vw] bg-white px-8 py-5 rounded-lg border shadow-xl flex flex-col gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0A1931]">
            Mark Delivery Status
          </h2>
          <p className="text-base text-gray-500 mt-2">
            How would you like to mark this delivery?
          </p>
        </div>

        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="flex items-center gap-2 p-4 pb-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            <span className="font-semibold text-orange-500 text-sm tracking-wide">
              SHORT DELIVERIES
            </span>
          </div>

          <div className="px-4 pb-2">
            <div className="max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-gray-500 text-xs font-semibold">
                    <th className="text-left font-semibold py-3">PRODUCT</th>
                    <th className="text-left font-semibold py-3">
                      PRESET CONVERSION
                    </th>
                    <th className="text-right font-semibold py-3">
                      SHORT QTY (MAIN UNIT)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {shortDeliveries.map((row) => (
                    <tr
                      key={row.lineItemId}
                      className="border-b border-gray-100"
                    >
                      <td className="py-4 text-gray-800 font-medium">
                        {row.productName}
                      </td>
                      <td className="py-4 text-gray-500">
                        {row.presetConversion}
                      </td>
                      <td className="py-4 text-right text-orange-600 font-bold">
                        {row.shortQty} {row.mainUnitName}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex items-center justify-center py-3 border-t text-sm text-gray-500">
            {shortDeliveries.length === 0
              ? "No short deliveries"
              : `${shortDeliveries.length} item${shortDeliveries.length !== 1 ? "s" : ""} short`}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col p-5 rounded-lg border-2 border-yellow-200 bg-[#FFFDF5]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-5 h-5 bg-[#FFC107] rounded-full shrink-0" />
              <label className="font-bold text-[#A67C00] text-lg">
                Partial Delivery
              </label>
            </div>
            <p className="text-sm text-[#A67C00] flex-grow leading-relaxed mb-4 font-medium">
              The PO stays open. Remaining quantities are remembered and will be
              pre-filled the next time you restock from this PO.
            </p>
            <button
              disabled={isPending}
              onClick={() => onChoose("PARTIAL")}
              className="self-center bg-transparent border-none outline-none whitespace-nowrap text-center font-bold text-[#A67C00] disabled:opacity-50 hover:underline transition-all"
            >
              Mark As Partial Delivery
            </button>
          </div>

          <div className="flex flex-col p-5 rounded-lg border-2 border-green-200 bg-[#F5FFF9]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-5 h-5 bg-[#4ADE80] rounded-full shrink-0" />
              <label className="font-bold text-[#208350] text-lg">
                Fully Delivered
              </label>
            </div>
            <p className="text-sm text-[#208350] flex-grow leading-relaxed mb-4 font-medium">
              Received items are added to inventory. Any remaining undelivered
              quantities are waived. This PO will be closed.
            </p>
            <button
              disabled={isPending}
              onClick={() => onChoose("FULLY_DELIVERED")}
              className="self-center bg-transparent border-none outline-none whitespace-nowrap text-center font-bold text-[#208350] disabled:opacity-50 hover:underline transition-all"
            >
              Mark As Fully Delivered
            </button>
          </div>
        </div>

        <div className="flex justify-center mt-2">
          <button
            className="w-48 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none"
            onClick={onClose}
            disabled={isPending}
          >
            Go Back
          </button>
        </div>
      </div>
    </section>
  );
};
