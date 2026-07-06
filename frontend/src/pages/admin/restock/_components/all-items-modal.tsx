import { Separator } from "@/components/separator";
import { RestockAllModel } from "@/features/restock/models/restock-all.model";
import { useGetPurchaseOrderByIdQuery } from "@/features/purchase-order/purchase-order.query";
import { useUpdateRestockNotesMutation } from "@/features/restock/update-restock-notes.query";
import {
  AlertTriangle,
  Ban,
  Bot,
  Box,
  Calendar,
  ChevronDown,
  ChevronUp,
  History,
  Link2,
  NotebookText,
  Zap,
} from "lucide-react";
import { useState } from "react";

interface Props {
  selectedRestock: RestockAllModel;
  onClose: () => void;
}

function DeliveryResolutionBadge({
  resolution,
  isVoided,
  fallbackStatus,
}: {
  resolution?: string;
  isVoided: boolean;
  fallbackStatus?: string;
}) {
  const normalizedResolution = (resolution ?? fallbackStatus ?? "")
    .trim()
    .toUpperCase();

  if (isVoided) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200">
        CANCELED
      </span>
    );
  }

  if (normalizedResolution === "PARTIAL") {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700 border border-yellow-200">
        PARTIAL DELIVERY
      </span>
    );
  }

  if (normalizedResolution === "FULLY_DELIVERED") {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200">
        FULLY DELIVERED
      </span>
    );
  }

  if (normalizedResolution === "NOT_DELIVERED") {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
        NOT DELIVERED
      </span>
    );
  }

  if (normalizedResolution === "CANCELLED") {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200">
        CANCELLED
      </span>
    );
  }

  return null;
}

function POStatusLabel({ status }: { status?: string }) {
  if (status === "PARTIAL") {
    return (
      <span className="text-xs font-semibold text-yellow-600 bg-yellow-50 border border-yellow-200 rounded px-1.5 py-0.5">
        PARTIAL
      </span>
    );
  }
  if (status === "FULLY_DELIVERED") {
    return (
      <span className="text-xs font-semibold text-green-600 bg-green-50 border border-green-200 rounded px-1.5 py-0.5">
        FULLY DELIVERED
      </span>
    );
  }
  if (status === "NOT_DELIVERED") {
    return (
      <span className="text-xs font-semibold text-gray-500 bg-gray-50 border border-gray-200 rounded px-1.5 py-0.5">
        NOT DELIVERED
      </span>
    );
  }
  if (status === "CANCELLED") {
    return (
      <span className="text-xs font-semibold text-red-500 bg-red-50 border border-red-200 rounded px-1.5 py-0.5">
        CANCELLED
      </span>
    );
  }
  return null;
}

export const ShowAllModal = ({ selectedRestock, onClose }: Props) => {
  const { mutateAsync: updateNotes, isPending: isSaving } =
    useUpdateRestockNotesMutation();
  const [notes, setNotes] = useState(selectedRestock.restock_Notes ?? "");
  const [shortDeliveriesOpen, setShortDeliveriesOpen] = useState(false);
  const isDirty = notes !== (selectedRestock.restock_Notes ?? "");

  const isPORestock = Boolean(selectedRestock.purchase_order_number);

  const { data: poData } = useGetPurchaseOrderByIdQuery(
    isPORestock ? selectedRestock.purchase_order_id : undefined,
  );

  const shortItems = (() => {
    if (!isPORestock || !poData) return [];
    return poData.line_Items
      .map((li) => {
        const restockLi = selectedRestock.line_Items.find(
          (rli) => rli.product.product_ID === li.product_ID,
        );
        const receivedInThisRestock = restockLi?.base_Unit_Quantity ?? 0;

        let shortQty = 0;
        if (selectedRestock.delivery_resolution === "PARTIAL") {
          shortQty = li.remaining_quantity;
        } else if (selectedRestock.delivery_resolution === "FULLY_DELIVERED") {
          const totalOrdered = li.quantity;
          shortQty = totalOrdered - receivedInThisRestock;
        }

        if (shortQty <= 0) return null;

        const presetConversion =
          li.unit_Preset?.preset_Levels
            ?.map(
              (l) =>
                l.uom_Name +
                (l.conversion_Factor !== 1 ? ` (${l.conversion_Factor}x)` : ""),
            )
            .filter(Boolean)
            .join(" → ") ?? "";
        const mainUnitName =
          li.unit_Preset?.preset_Levels?.[0]?.uom_Name ??
          li.unit?.uom_Name ??
          "";

        return {
          productName: li.product?.product_Name ?? "",
          presetConversion,
          shortQty,
          mainUnitName,
        };
      })
      .filter(Boolean) as {
      productName: string;
      presetConversion: string;
      shortQty: number;
      mainUnitName: string;
    }[];
  })();

  const handleSave = async () => {
    await updateNotes({ restockId: selectedRestock.restock_Id, notes });
    onClose();
  };

  return (
    <section className="absolute bg-black/40 w-full h-full top-0 left-0 flex justify-center items-center z-50">
      <div className="w-3/6 h-4/5 bg-white p-10 rounded-lg border shadow-lg">
        <div className="flex flex-col gap-5 flex-1 h-full">
          {/* HEADER */}
          <div className="flex flex-col gap-2">
            <div className="flex gap-2 items-center">
              {selectedRestock.restock_Number.match("AUTO-") && (
                <div className="flex items-center gap-2 border-2 border-purple-400 bg-purple-50 rounded-sm p-1 w-max">
                  <Bot size={20} className="text-purple-800" />
                  <label className="font-semibold text-xs text-purple-800">
                    Auto Restock
                  </label>
                </div>
              )}

              {selectedRestock.status === "VOIDED" && (
                <div className="flex items-center gap-2 border-2 border-orange-400 bg-orange-50 rounded-sm p-1 w-max">
                  <History size={20} className="text-orange-400" />
                  <label className="font-semibold text-xs text-orange-400">
                    Reversed Restock
                  </label>
                </div>
              )}
            </div>
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <h3>{selectedRestock.restock_Number}</h3>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Calendar size={18} className="text-vesper-gray" />
              <span className="font-semibold text-saltbox-gray">
                {new Date(selectedRestock.updated_At).toLocaleDateString(
                  "en-US",
                  {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  },
                )}
              </span>
            </div>

            {/* Linked PO row */}
            <div className="flex items-center gap-2">
              <Link2 size={18} className="text-vesper-gray shrink-0" />
              <span className="text-sm font-semibold text-vesper-gray">
                Linked Purchase Order:
              </span>
              <span className="text-sm font-bold text-saltbox-gray">
                {selectedRestock.purchase_order_number}
              </span>
              <span className="text-vesper-gray">•</span>
              <POStatusLabel status={selectedRestock.purchase_order_status} />
            </div>

            {/* Delivery Resolution */}
            <div className="flex items-center gap-2 ml-7">
              <span className="text-sm font-semibold text-vesper-gray">
                Delivery Resolution:
              </span>
              <DeliveryResolutionBadge
                resolution={selectedRestock.delivery_resolution}
                isVoided={selectedRestock.status === "VOIDED"}
                fallbackStatus={selectedRestock.purchase_order_status}
              />
            </div>
          </div>

          <Separator />
          <div className="flex gap-3">
            <div className="flex flex-col w-full gap-2">
              <label className="text-sm font-semibold">Supplier</label>
              <div className="relative">
                <input
                  value={selectedRestock.supplier.companyName}
                  className="input-style-3"
                />
                {selectedRestock.restock_Number.match("AUTO-") && (
                  <label className="text-purple-700 absolute left-50 top-1/6 text-xs border-2 border-purple-400 rounded-sm p-1 uppercase font-semibold">
                    internal
                  </label>
                )}
              </div>
            </div>

            <div className="flex flex-col w-full gap-2 relative">
              <label className="text-sm font-semibold">Recorded by</label>

              <input
                value={
                  selectedRestock.clerk.firstName +
                  " " +
                  selectedRestock.clerk.lastName
                }
                className="input-style-3"
              />
            </div>
          </div>

          <Separator />

          {/* TABLE CONTAINER */}
          <div className="flex-1 flex flex-col overflow-hidden gap-2">
            {/* TABLE DATA HEADERS */}
            <div className="flex justify-between py-3 px-5 bg-custom-gray rounded-lg gap-2">
              <label className="text-left w-full text-xs font-semibold uppercase">
                Product
              </label>
              {selectedRestock.restock_Number.match("AUTO-") ? (
                <label className="text-left w-full text-xs font-semibold uppercase">
                  Fullfilment Unit
                </label>
              ) : (
                <label className="text-left w-[70%] uppercase text-xs font-semibold">
                  Conversion
                </label>
              )}

              <label className="text-left w-[30%] uppercase text-xs font-semibold">
                Quantity
              </label>
            </div>

            {/* TABLE DATA BODY */}
            <div className="overflow-auto flex flex-col h-full">
              {selectedRestock.line_Items.map((item, i) => (
                <div
                  className={`py-3 px-5 flex justify-between gap-2 rounded-lg items-center ${i % 2 != 0 && "bg-custom-gray"}`}
                  key={i}
                >
                  <div className="text-sm w-full flex gap-2 font-semibold">
                    <span>{item.product.product_Name}</span>
                    <span>•</span>
                    <span className="text-vesper-gray">
                      {item.product.category.category_Name}
                    </span>
                  </div>
                  {selectedRestock.restock_Number.match("AUTO-") ? (
                    <span className="text-left w-[70%] font-semibold text-sm">
                      {item.base_Unit.uom_Name}
                    </span>
                  ) : (
                    <span className="text-left w-[70%] font-semibold text-sm">
                      {item.unit_Preset?.preset_Levels
                        ?.map(
                          (l) =>
                            l.unit?.uom_Name +
                            (l.conversion_Factor !== 1
                              ? ` (${l.conversion_Factor}x)`
                              : ""),
                        )
                        .filter(Boolean)
                        .join(" → ") || "No preset"}
                    </span>
                  )}

                  <span className="text-left w-[30%] font-semibold text-sm">
                    {item.base_Unit_Quantity}
                  </span>
                </div>
              ))}
            </div>

            {/* PO INFO SECTION */}
            {isPORestock && (
              <>
                <Separator />
                <div className="flex flex-col gap-3">
                  {/* Short Deliveries collapsible */}
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div
                      className="w-full flex items-center gap-2 p-3 text-left hover:bg-gray-50 transition-colors"
                      onClick={() => setShortDeliveriesOpen((o) => !o)}
                    >
                      <AlertTriangle className="w-4 h-4 text-orange-500 shrink-0" />
                      <span className="font-semibold text-orange-500 text-xs tracking-wide flex-1">
                        {selectedRestock.status === "VOIDED" &&
                          isPORestock &&
                          "HISTORICAL "}
                        SHORT DELIVERIES
                        {shortItems.length > 0 && (
                          <span className="ml-2 text-orange-400 font-normal">
                            ({shortItems.length} item
                            {shortItems.length !== 1 ? "s" : ""})
                          </span>
                        )}
                      </span>
                      {shortDeliveriesOpen ? (
                        <ChevronUp size={14} className="text-gray-400" />
                      ) : (
                        <ChevronDown size={14} className="text-gray-400" />
                      )}
                    </div>

                    {shortDeliveriesOpen && (
                      <div className="px-4 pb-3 border-t border-gray-100">
                        {shortItems.length === 0 ? (
                          <p className="text-sm text-gray-400 py-3 text-center">
                            No short deliveries
                          </p>
                        ) : (
                          <table className="w-full text-sm mt-2">
                            <thead>
                              <tr className="border-b text-gray-500 text-xs font-semibold">
                                <th className="text-left font-semibold py-2">
                                  PRODUCT
                                </th>
                                <th className="text-left font-semibold py-2">
                                  PRESET CONVERSION
                                </th>
                                <th className="text-right font-semibold py-2">
                                  SHORT QTY (MAIN UNIT)
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {shortItems.map((row, i) => (
                                <tr
                                  key={i}
                                  className="border-b border-gray-100"
                                >
                                  <td className="py-3 text-gray-800 font-medium">
                                    {row.productName}
                                  </td>
                                  <td className="py-3 text-gray-500">
                                    {row.presetConversion}
                                  </td>
                                  <td className="py-3 text-right text-orange-600 font-bold">
                                    {row.shortQty} {row.mainUnitName}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            <Separator />

            {selectedRestock.restock_Number.match("AUTO-") &&
              selectedRestock.status === "VOIDED" && (
                <div className="flex flex-col gap-4 bg-orange-50 border-2 border-orange-400 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <Ban className="text-red-500" />
                    <label className="text-red-500 font-semibold">
                      Auto Restock Information
                    </label>
                  </div>
                  <div className="flex justify-between">
                    <span className="flex items-center gap-2 text-sm ">
                      <NotebookText size={21} className=" text-red-800" />
                      <label className="font-bold text-xs">
                        Linked Invoice:
                      </label>
                      <label className="text-xs">
                        {selectedRestock.restock_Invoice_Reference}
                      </label>
                    </span>
                    <span className="flex items-center gap-2 text-sm">
                      <Box size={21} className=" text-red-800" />
                      <label className="font-semibold text-xs">Type: </label>
                      <label className="text-xs">Internal System Restock</label>
                    </span>
                    <span className="flex items-center gap-2 text-sm ">
                      <Zap size={21} className=" text-red-800" />
                      <label className="text-xs">
                        Generated Automatically During Invoice Confirmation
                      </label>
                    </span>
                  </div>
                  <Separator orientation="horizontal" />
                  <div className="flex flex-col text-xs gap-1">
                    <span>
                      This auto-restock was automatically voided because the
                      linked invoice was voided.
                    </span>
                    <span>No inventory were reversed or deducted.</span>
                  </div>
                </div>
              )}

            {selectedRestock.restock_Number.match("AUTO-") &&
            selectedRestock.status !== "VOIDED" ? (
              <div className="flex flex-col gap-4 bg-purple-50 border-2 border-purple-400 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <Bot className="text-purple-800" />
                  <label className="text-purple-800 font-semibold">
                    Auto Restock Information
                  </label>
                </div>
                <div className="flex justify-between">
                  <span className="flex items-center gap-2 text-sm ">
                    <NotebookText size={21} className=" text-purple-800" />
                    <label className="font-bold text-xs">Linked Invoice:</label>
                    <label className="text-xs">
                      {selectedRestock.restock_Invoice_Reference}
                    </label>
                  </span>
                  <span className="flex items-center gap-2 text-sm">
                    <Box size={21} className=" text-purple-800" />
                    <label className="font-semibold text-xs">Type: </label>
                    <label className="text-xs">Internal System Restock</label>
                  </span>
                  <span className="flex items-center gap-2 text-sm ">
                    <Zap size={21} className=" text-purple-800" />
                    <label className="text-xs">
                      Generated Automatically During Invoice Confirmation
                    </label>
                  </span>
                </div>
              </div>
            ) : (
              <div className="w-full">
                {selectedRestock.status === "VOIDED" && isPORestock && (
                  <div className="flex items-center gap-2 bg-orange-50 p-2 rounded-t-md border-t-2 border-l-2 border-r-2 border-orange-200 w-fit">
                    <div className="flex items-center gap-2 text-orange-400">
                      <History size={18} />
                      <label className="text-sm font-semibold text-orange-400">
                        Reversal Information
                      </label>
                    </div>
                    <div className="ml-5">
                      <ul className="list-disc">
                        <li className="text-xs">
                          This restock wa reversed on{" "}
                          <span className="font-bold text-orange-400">
                            {selectedRestock.voided_At &&
                              ` on ${new Date(
                                selectedRestock.voided_At,
                              ).toLocaleDateString("en-US", {
                                month: "long",
                                day: "numeric",
                                year: "numeric",
                              })}`}
                            {selectedRestock.voided_By_User &&
                              ` by ${selectedRestock.voided_By_User.firstName} ${selectedRestock.voided_By_User.lastName}`}{" "}
                          </span>
                          and updated Purchase Order{" "}
                          <span className="font-bold text-orange-400">
                            {poData?.purchase_Order_Number}
                          </span>
                        </li>
                        <li className="text-xs ">
                          Purchase Order status after reversal:
                          <span className="font-bold text-orange-400 ml-1">
                            {poData?.status}
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>
                )}

                {!selectedRestock.restock_Number.match("AUTO-") &&
                  selectedRestock.status === "VOIDED" &&
                  !isPORestock && (
                    <div className="flex items-center gap-2 bg-orange-50 p-2 rounded-t-md border-t-2 border-l-2 border-r-2 border-orange-200 w-fit">
                      <label className="text-sm font-semibold">
                        Reversal Information
                      </label>
                      <label>
                        This restock was reversed
                        {selectedRestock.voided_At &&
                          ` on ${new Date(
                            selectedRestock.voided_At,
                          ).toLocaleDateString("en-US", {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          })}`}
                        {selectedRestock.voided_By_User &&
                          ` by ${selectedRestock.voided_By_User.firstName} ${selectedRestock.voided_By_User.lastName}`}
                      </label>
                    </div>
                  )}

                {!selectedRestock.restock_Number.match("AUTO-") && (
                  <textarea
                    rows={4}
                    placeholder="No restock notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="focus:outline-none p-2 resize-none border rounded w-full"
                  />
                )}
              </div>
            )}

            {/* FOOTER */}
            <div className="flex justify-between">
              <div className="flex flex-col">
                <div className="flex gap-2 font-bold tracking-wider">
                  <span>TOTAL PRODUCTS:</span>
                  <label>{selectedRestock.line_Items.length}</label>
                </div>
                <div className="flex gap-2 font-bold tracking-wider">
                  <span>TOTAL QUANTITY: </span>
                  <label>
                    {selectedRestock.line_Items.reduce(
                      (total, item) => total + item.base_Unit_Quantity,
                      0,
                    )}
                  </label>
                </div>
              </div>

              <button
                onClick={isDirty ? handleSave : onClose}
                disabled={isSaving}
                className="disabled:opacity-50"
              >
                {isSaving ? "Saving..." : isDirty ? "Save" : "Close"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
