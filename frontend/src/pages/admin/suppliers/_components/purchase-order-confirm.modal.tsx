type PurchaseOrderConfirmItem = {
  key: string;
  product: string;
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
  const formatMoney = (value: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  return (
    <section className="absolute bg-black/40 w-full h-full top-0 left-0 flex justify-center items-center z-50">
      <div className="w-[800px] max-h-[90vh] overflow-y-auto bg-white px-10 py-8 rounded-lg border shadow-lg relative flex flex-col gap-4">
        <div>
          <h1 className="text-2xl font-bold">Confirm Purchase Order</h1>
          <p className="text-gray-500">
            Please review the purchase order details before confirming.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <div className="text-sm grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <span className="text-vesper-gray">Supplier: </span>
              <span className="font-semibold">{supplierName || "-"}</span>
            </div>
            <div>
              <span className="text-vesper-gray">Preferred Delivery: </span>
              <span className="font-semibold">{preferredDelivery || "-"}</span>
            </div>
          </div>

          <div className="rounded-lg border overflow-hidden">
            <div className="grid grid-cols-12 gap-2 px-3 py-2 bg-custom-gray text-xs font-semibold uppercase">
              <div className="col-span-4">Product</div>
              <div className="col-span-2">Quantity</div>
              <div className="col-span-2">Unit</div>
              <div className="col-span-2">Price</div>
              <div className="col-span-2 text-right">Sub-total</div>
            </div>

            <div className="max-h-72 overflow-y-auto">
              {items.length === 0 ? (
                <div className="px-3 py-6 text-sm text-gray-400 text-center">
                  No item lines to confirm
                </div>
              ) : (
                items.map((item, index) => (
                  <div
                    key={item.key}
                    className={`grid grid-cols-12 gap-2 px-3 py-2 text-sm ${
                      index !== items.length - 1 ? "border-b" : ""
                    }`}
                  >
                    <div className="col-span-4">{item.product}</div>
                    <div className="col-span-2">{item.quantity}</div>
                    <div className="col-span-2">{item.unit}</div>
                    <div className="col-span-2">{formatMoney(item.price)}</div>
                    <div className="col-span-2 text-right font-medium">
                      {formatMoney(item.subtotal)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Note</label>
            <textarea
              className="input-style-2 min-h-24"
              placeholder="Add purchase order notes"
              value={note}
              onChange={(e) => onNoteChange(e.target.value)}
            />
          </div>

          <div className="flex justify-end text-sm">
            <span className="text-vesper-gray mr-2">Grand total:</span>
            <span className="font-bold">{formatMoney(grandTotal)}</span>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            className="px-4 py-2 text-sm rounded bg-gray-300 text-gray-700 hover:bg-gray-400"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 text-sm rounded bg-blue-500 text-white hover:bg-blue-600"
            onClick={onGenerate}
            disabled={isGenerating}
          >
            {isGenerating ? "Generating..." : "Generate"}
          </button>
        </div>
      </div>
    </section>
  );
};
