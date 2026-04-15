import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/use-auth";
import { PurchaseOrderRecord } from "@/features/purchase-order/purchase-order.model";
import { useCreatePORestockMutation } from "@/features/restock/po-restock.query";
import { PORestockDeliveryStatus } from "@/features/restock/models/po-restock.model";
import { PORestockCardState } from "../index";
import { DeliveryStatusChoiceModal } from "./delivery-status-choice.modal";

interface PORestockConfirmModalProps {
  po: PurchaseOrderRecord;
  cards: PORestockCardState[];
  notes: string;
  onNotesChange: (value: string) => void;
  onClose: () => void;
}

const formatMoney = (value: number) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

export const PORestockConfirmModal = ({
  po,
  cards,
  notes,
  onNotesChange,
  onClose,
}: PORestockConfirmModalProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { mutateAsync: createPORestock, isPending } =
    useCreatePORestockMutation();
  const [isStatusChoiceOpen, setIsStatusChoiceOpen] = useState(false);

  const lineItemRows = cards.map((card) => {
    const li = po.line_Items.find(
      (l) => l.purchase_Order_LineItem_ID === card.lineItemId,
    );
    const discrepancy = card.removed
      ? -card.remainingQuantity
      : card.receivingQuantity - card.remainingQuantity;

    return {
      lineItemId: card.lineItemId,
      productName: li?.product?.product_Name ?? "",
      brand: li?.product?.brand ?? "",
      presetName: li?.unit_Preset?.preset_Name ?? "",
      orderedQuantity: card.orderedQuantity,
      receivedSoFar: card.receivedQuantity,
      remainingQuantity: card.remainingQuantity,
      receivingQuantity: card.removed ? 0 : card.receivingQuantity,
      discrepancy,
      removed: card.removed,
    };
  });

  const handleSubmit = async (deliveryStatus: PORestockDeliveryStatus) => {
    if (!user) {
      alert("User not authenticated!");
      return;
    }

    const activeItems = cards.filter(
      (c) => !c.removed && c.receivingQuantity > 0,
    );

    await createPORestock({
      purchase_Order_ID: po.purchase_Order_ID,
      delivery_Status: deliveryStatus,
      lineItems: activeItems.map((c) => ({
        product_ID: c.productId,
        preset_ID: c.presetId,
        main_Unit_Quantity: c.receivingQuantity,
      })),
      restock_Clerk: user.user_ID,
      notes,
    });

    navigate("/admin/restock");
  };

  return (
    <>
      <section className="absolute bg-black/40 w-full h-full top-0 left-0 flex justify-center items-center z-50">
        <div className="w-[820px] max-h-[90vh] overflow-y-auto bg-white px-10 py-8 rounded-lg border shadow-lg flex flex-col gap-4">
          {/* Header */}
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">Restock Confirmation</h1>
              <span className="text-sm bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200">
                PO: {po.purchase_Order_Number}
              </span>
            </div>
            <p className="text-gray-500 text-sm mt-1">
              Review the items before confirming delivery.
            </p>
          </div>

          {/* Supplier read-only */}
          <div className="text-sm grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <span className="text-vesper-gray">Supplier: </span>
              <span className="font-semibold">
                {po.supplier.company_Name ||
                  `${po.supplier.first_Name} ${po.supplier.last_Name}`}
              </span>
            </div>
            <div>
              <span className="text-vesper-gray">Preferred Delivery: </span>
              <span className="font-semibold">
                {new Intl.DateTimeFormat("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                }).format(new Date(po.preferred_Delivery))}
              </span>
            </div>
          </div>

          {/* Items table */}
          <div className="rounded-lg border overflow-hidden">
            <div className="grid grid-cols-12 gap-2 px-3 py-2 bg-custom-gray text-xs font-semibold uppercase">
              <div className="col-span-3">Product</div>
              <div className="col-span-2 text-right">Ordered</div>
              <div className="col-span-2 text-right">Prev. Received</div>
              <div className="col-span-2 text-right">Remaining</div>
              <div className="col-span-2 text-right">Receiving</div>
              <div className="col-span-1 text-right">Disc.</div>
            </div>

            <div className="max-h-64 overflow-y-auto">
              {lineItemRows.map((row, idx) => (
                <div
                  key={row.lineItemId}
                  className={`grid grid-cols-12 gap-2 px-3 py-2 text-xs ${
                    row.removed ? "opacity-40 line-through" : ""
                  } ${idx !== lineItemRows.length - 1 ? "border-b" : ""}`}
                >
                  <div className="col-span-3">
                    <div className="font-medium">{row.productName}</div>
                    {row.presetName && (
                      <div className="text-gray-400 text-xs">
                        {row.presetName}
                      </div>
                    )}
                  </div>
                  <div className="col-span-2 text-right">
                    {row.orderedQuantity}
                  </div>
                  <div className="col-span-2 text-right text-gray-500">
                    {row.receivedSoFar}
                  </div>
                  <div className="col-span-2 text-right">
                    {row.remainingQuantity}
                  </div>
                  <div className="col-span-2 text-right font-medium">
                    {row.receivingQuantity}
                  </div>
                  <div
                    className={`col-span-1 text-right font-semibold ${
                      row.discrepancy > 0
                        ? "text-blue-600"
                        : row.discrepancy < 0
                          ? "text-red-500"
                          : "text-green-600"
                    }`}
                  >
                    {row.discrepancy > 0
                      ? `+${row.discrepancy}`
                      : row.discrepancy}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Discrepancy legend */}
          <div className="flex gap-4 text-xs text-gray-400">
            <span>
              <span className="text-blue-600 font-semibold">+n</span>{" "}
              over-delivery
            </span>
            <span>
              <span className="text-red-500 font-semibold">-n</span> short
              delivery
            </span>
            <span>
              <span className="text-green-600 font-semibold">0</span> exact
              match
            </span>
          </div>

          {/* Notes */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Note</label>
            <textarea
              className="input-style-2 min-h-20"
              placeholder="Add restock notes..."
              value={notes}
              onChange={(e) => onNotesChange(e.target.value)}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <button
              className="px-4 py-2 text-sm rounded bg-gray-300 text-gray-700 hover:bg-gray-400"
              onClick={onClose}
              disabled={isPending}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 text-sm rounded bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50"
              onClick={() => setIsStatusChoiceOpen(true)}
              disabled={isPending}
            >
              Continue
            </button>
          </div>
        </div>
      </section>

      {isStatusChoiceOpen && (
        <DeliveryStatusChoiceModal
          isPending={isPending}
          onClose={() => setIsStatusChoiceOpen(false)}
          onChoose={handleSubmit}
        />
      )}
    </>
  );
};
