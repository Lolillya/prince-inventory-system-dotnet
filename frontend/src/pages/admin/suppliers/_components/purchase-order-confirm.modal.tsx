import { Separator } from "@/components/separator";
import { Box, CalendarDays, Info, Plus, User, X } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";

type PurchaseOrderConfirmItem = {
  key: string;
  product: string;
  category?: string;
  presetPath?: string;
  quantity: number;
  unit: string;
  price: number;
  subtotal: number;
};

interface PurchaseOrderConfirmModalProps {
  supplierName: string;
  preferredDelivery: string;
  items: PurchaseOrderConfirmItem[];
  grandTotal: number;
  note: string;
  isGenerating?: boolean;
  onNoteChange: (value: string) => void;
  onCancel: () => void;
  onGenerate: () => void;
}

export const PurchaseOrderConfirmModal = ({
  supplierName,
  preferredDelivery,
  items,
  grandTotal,
  note,
  isGenerating = false,
  onNoteChange,
  onCancel,
  onGenerate,
}: PurchaseOrderConfirmModalProps) => {
  const [isAddingNote, setIsAddingNote] = useState(Boolean(note));

  const formatMoney = (value: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatDate = (value: string) => {
    if (!value) return "-";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;
    return format(parsed, "MMMM d, yyyy");
  };

  return (
    <section className="absolute bg-black/40 w-full h-full top-0 left-0 flex justify-center items-center z-50">
      <div className="w-[1000px] max-h-[90vh] bg-white px-10 py-8 rounded-lg border shadow-lg relative flex flex-col gap-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">Confirm Purchase Order</h1>
            <p className="text-gray-500">
              Review the purchase order before generating the final document.
            </p>
          </div>
          <div
            className="p-2 rounded-md cursor-pointer duration-300 transition-all hover:bg-gray-100"
            onClick={onCancel}
          >
            <X />
          </div>
        </div>

        <Separator />

        <div className="text-xs grid grid-cols-3">
          <span className="flex gap-1">
            <User className="text-vesper-gray" size={18} />
            <div className="flex items-center gap-1">
              <label className="text-vesper-gray">Supplier: </label>
              <label className="font-semibold">{supplierName || "-"}</label>
            </div>
          </span>

          <span className="flex gap-1 items-center justify-center">
            <CalendarDays className="text-vesper-gray" size={18} />
            <div className="flex items-center gap-1">
              <label className="text-vesper-gray">Preferred Delivery: </label>
              <label className="font-semibold">
                {formatDate(preferredDelivery)}
              </label>
            </div>
          </span>

          <span className="flex gap-1 items-center justify-center">
            <Box className="text-vesper-gray" size={18} />
            <div className="flex items-center gap-1">
              <label className="text-vesper-gray">
                {items.length} Products
              </label>
            </div>
          </span>
        </div>

        <Separator />

        <div className="flex gap-2 items-center p-4 bg-blue-50 border-2 border-blue-200 rounded-md text-sm text-blue-900">
          <Info size={18} className="shrink-0" />
          <label>
            Packaging Preset is visible only in Preview. Printed Purchase Orders
            will not include it.
          </label>
        </div>

        <div className="rounded-lg border overflow-hidden">
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-2 px-4 py-2 bg-custom-gray text-xs font-bold text-vesper-gray uppercase">
            <div>Product</div>
            <div>Quantity</div>
            <div>Unit Price</div>
            <div className="text-right">Total</div>
          </div>

          <div className="max-h-64 overflow-y-auto">
            {items.length === 0 ? (
              <div className="px-4 py-6 text-sm text-gray-400 text-center">
                No item lines to confirm
              </div>
            ) : (
              items.map((item, index) => (
                <div
                  key={item.key}
                  className={`grid grid-cols-[2fr_1fr_1fr_1fr] gap-2 px-4 py-3 text-sm items-center ${
                    index !== items.length - 1 ? "border-b" : ""
                  }`}
                >
                  <div className="flex flex-col">
                    <div className="flex gap-1">
                      <label className="font-semibold">{item.product}</label>
                      {item.category ? (
                        <>
                          <span>·</span>
                          <label className="text-vesper-gray">
                            {item.category}
                          </label>
                        </>
                      ) : null}
                    </div>
                    {item.presetPath ? (
                      <label className="text-xs text-vesper-gray">
                        {item.presetPath}
                      </label>
                    ) : null}
                  </div>
                  <div>
                    {item.quantity} {item.unit}
                  </div>
                  <div>{formatMoney(item.price)}</div>
                  <div className="text-right font-medium">
                    {formatMoney(item.subtotal)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="flex items-center justify-between gap-4">
          {isAddingNote ? (
            <div className="flex flex-col gap-1 w-full">
              <label className="text-sm font-medium">Note</label>
              <textarea
                className="input-style-4 w-full min-h-20"
                placeholder="Add purchase order notes"
                value={note}
                onChange={(e) => onNoteChange(e.target.value)}
              />
            </div>
          ) : (
            <div
              className="flex items-center gap-2 text-sm text-vesper-gray hover:text-primary w-fit cursor-pointer"
              onClick={() => setIsAddingNote(true)}
            >
              <Plus size={18} />
              <label className="cursor-pointer">Add Notes (optional)</label>
            </div>
          )}

          <div className="flex flex-col items-end gap-1 bg-green-50 border-2 border-green-200 rounded-md px-4 py-3 min-w-56 mt-6">
            <label className="text-xs font-bold text-river-green uppercase">
              Grand Total
            </label>
            <label className="text-2xl font-bold text-river-green">
              {formatMoney(grandTotal)}
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            className="px-4 py-2 text-sm rounded border-2 bg-white border-gray-300 text-primary"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 text-sm rounded"
            onClick={onGenerate}
            disabled={isGenerating}
          >
            {isGenerating ? "Generating..." : "Generate PO"}
          </button>
        </div>
      </div>
    </section>
  );
};
