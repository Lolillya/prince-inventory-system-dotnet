import { useState } from "react";

type MockLineItem = {
  product: string;
  quantity: number;
  unit: string;
  price: number;
  discount: string;
  subtotal: number;
  hasSupplement: boolean;
  hasAutoReplenish: boolean;
  primaryPreset: number;
  supplementedPresets?: number[];
  generatedPreset?: number;
  pendingRestock?: boolean;
};

const mockLineItems: MockLineItem[] = [
  {
    product: "Item1 - Brand1 - Variant1",
    quantity: 200,
    unit: "Pack",
    price: 300,
    discount: "0%",
    subtotal: 60000,
    hasSupplement: true,
    hasAutoReplenish: false,
    primaryPreset: 60,
    supplementedPresets: [60, 80],
  },
  {
    product: "Item2 - Brand2 - Variant2",
    quantity: 300,
    unit: "Pack",
    price: 200,
    discount: "0%",
    subtotal: 60000,
    hasSupplement: false,
    hasAutoReplenish: true,
    primaryPreset: 60,
    generatedPreset: 240,
    pendingRestock: true,
  },
  {
    product: "Item3 - Brand3 - Variant3",
    quantity: 400,
    unit: "Pack",
    price: 100,
    discount: "0%",
    subtotal: 40000,
    hasSupplement: true,
    hasAutoReplenish: true,
    primaryPreset: 60,
    supplementedPresets: [60, 80],
    generatedPreset: 200,
  },
];

const FulfillmentTooltip = ({ item }: { item: MockLineItem }) => {
  const supplementedValue = (item.supplementedPresets ?? []).join(" + ");

  return (
    <div className="pointer-events-none absolute left-0 top-7 z-30 hidden min-w-96 rounded-md border border-gray-300 bg-white p-3 text-[11px] text-gray-700 shadow-xl group-hover:block">
      <div className="font-semibold text-sm text-gray-900">Primary Preset</div>
      <div className="mt-1 flex items-center justify-between">
        <span>Box &gt; Pack (x10) &gt; Piece (x20)</span>
        <span>{item.primaryPreset} Pack</span>
      </div>

      {item.hasSupplement && (
        <>
          <div className="my-2 border-t border-dashed border-gray-400" />
          <div className="font-semibold text-sm text-gray-900">Supplemented Preset</div>
          <div className="mt-1 flex items-center justify-between">
            <span>Crate &gt; Pack (x5) &gt; Piece (x20)</span>
            <span>{(item.supplementedPresets ?? [])[0]} Pack</span>
          </div>
          <div className="mt-1 flex items-center justify-between">
            <span>Pallet &gt; Pack (x8) &gt; Piece (x20)</span>
            <span>{(item.supplementedPresets ?? [])[1]} Pack</span>
          </div>
        </>
      )}

      {item.hasAutoReplenish && (
        <>
          <div className="my-2 border-t border-dashed border-gray-400" />
          <div className="font-semibold text-sm text-gray-900">
            Generated Preset (Restock #XXXXXX{item.pendingRestock ? " - pending" : ""})
          </div>
          <div className="mt-1 flex items-center justify-between">
            <span>Pack &gt; Piece (x20)</span>
            <span>{item.generatedPreset ?? 0} Pack</span>
          </div>
        </>
      )}

      <div className="my-2 border-t border-dashed border-gray-400" />
      <div className="flex items-center justify-between text-sm font-bold text-gray-900">
        <span>Total</span>
        <span>{item.quantity} Pack</span>
      </div>

      <div className="sr-only">
        {item.hasSupplement ? `Supplemented amount ${supplementedValue}. ` : ""}
        {item.hasAutoReplenish ? `Generated amount ${item.generatedPreset ?? 0}.` : ""}
      </div>
    </div>
  );
};

export const InvoiceTable = () => {
  const [discountValue, setDiscountValue] = useState("0");
  const [discountType, setDiscountType] = useState<"%" | "amount">("%");

  const subtotal = mockLineItems.reduce((total, item) => total + item.subtotal, 0);
  const parsedDiscount = Number(discountValue) || 0;
  const discountAmount =
    discountType === "%"
      ? subtotal * (parsedDiscount / 100)
      : parsedDiscount;
  const total = Math.max(0, subtotal - discountAmount);

  return (
    <div className="flex-1 flex flex-col overflow-hidden gap-2">
      {/* TABLE DATA HEADERS */}
      <div className="flex justify-between py-3 px-5 bg-custom-gray rounded-lg gap-2">
        <label className="text-left w-full">Product</label>
        <label className="text-right w-full">Quantity</label>
        <label className="text-left w-full">Unit</label>
        <label className="text-right w-full">Price</label>
        <label className="text-right w-full">Discount</label>
        <label className="text-right w-full">Subtotal</label>
      </div>

      <div className="flex flex-wrap items-center gap-4 px-1 text-[11px] font-light text-gray-500">
        <div className="flex items-center gap-1">
          <span className="text-red-500 font-semibold">⚯</span>
          <span>Supplemented from other packaging presets</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-orange-500 font-semibold">⟳</span>
          <span>Automatically replenish deficit</span>
        </div>
      </div>

      {/* TABLE DATA BODY */}
      <div className="overflow-auto flex flex-col h-full">
        {mockLineItems.length > 0 ? (
          mockLineItems.map((item, i) => {
            return (
              <div
                className={`py-3 px-5 flex justify-between gap-2 rounded-lg items-center text-xs ${i % 2 != 0 && "bg-custom-gray"
                  }`}
                key={i}
              >
                <span className="text-left w-full relative">
                  <span className="inline-flex items-center gap-1">
                    <span>{item.product}</span>
                    {(item.hasSupplement || item.hasAutoReplenish) && (
                      <span className="relative group inline-flex items-center gap-1 align-middle">
                        {item.hasSupplement && (
                          <span className="text-red-500 text-sm leading-none">⚯</span>
                        )}
                        {item.hasAutoReplenish && (
                          <span className="text-orange-500 text-sm leading-none">⟳</span>
                        )}
                        <FulfillmentTooltip item={item} />
                      </span>
                    )}
                  </span>
                </span>
                <span className="text-right w-full">
                  {item.quantity}
                </span>
                <span className="text-left w-full">{item.unit}</span>
                <span className="text-right w-full">
                  ₱{item.price.toLocaleString()}
                </span>
                <span className="text-right w-full">{item.discount}</span>
                <span className="text-right w-full">
                  ₱{item.subtotal.toLocaleString()}
                </span>
              </div>
            );
          })
        ) : (
          <div className="text-center text-vesper-gray py-5">
            No items added
          </div>
        )}
      </div>

      <div className="flex justify-between items-end pt-2">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-0 text-sm">
            <span className="font-semibold mr-2">Discount</span>
            <input
              className="w-20 px-2 py-1 rounded-l border border-gray-300"
              value={discountValue}
              onChange={(e) => setDiscountValue(e.target.value)}
            />
            <select
              className="w-14 px-1 py-1 rounded-r border border-l-0 border-gray-300 bg-white"
              value={discountType}
              onChange={(e) => setDiscountType(e.target.value as "%" | "amount")}
            >
              <option value="%">%</option>
              <option value="amount">₱</option>
            </select>
          </div>

          <div className="flex gap-2 font-bold tracking-wider text-2xl">
            <span>TOTAL:</span>
            <label>₱{total.toLocaleString()}</label>
          </div>
        </div>

        <button
          className="px-8 py-2 border border-gray-800 bg-white text-gray-900 rounded hover:bg-gray-50"
        >
          Save
        </button>
      </div>
    </div>
  );
};
