import { useState } from "react";
import { useSelectedPayloadInvoiceQuery } from "@/features/invoice/invoice-create-payload";
import { useSelectedProductInvoiceQuery } from "@/features/invoice/selected-product";
import { useSelectedInvoiceCustomer } from "@/features/invoice/invoice-customer.state";
import { useInvoiceTermQuery } from "@/features/invoice/invoice-term.state";
import { useAuth } from "@/context/use-auth";
import { createInvoice } from "@/features/invoice/create-invoice.service";
import { InventoryProductModel } from "@/features/inventory/models/inventory.model";
import { InvoiceAddPayloadModel } from "@/features/invoice/models/invoice-add-payload.model";

type UnitPresetItem = InventoryProductModel["unitPresets"][number];

// Build a human-readable preset chain, e.g. "Box > Pack (x10) > Piece (x20)"
const buildPresetPath = (preset: UnitPresetItem): string => {
  const sorted = [...preset.preset.presetLevels].sort(
    (a, b) => a.level - b.level,
  );
  return sorted
    .map((l, i) =>
      i === 0
        ? l.unitOfMeasure.uom_Name
        : `${l.unitOfMeasure.uom_Name} (x${sorted[i - 1].conversion_Factor})`,
    )
    .join(" > ");
};

// Compute available stock from a preset at the target UOM (identified by uom_ID)
const computeAvailableAtUom = (
  preset: UnitPresetItem,
  targetUomId: number,
): number => {
  const presetQuantities = (preset as any).presetQuantities as
    | Array<{ level: number; remaining_Quantity?: number }>
    | undefined;

  const sortedLevels = [...preset.preset.presetLevels].sort(
    (a, b) => a.level - b.level,
  );
  const targetLevel = sortedLevels.find((l) => l.uoM_ID === targetUomId);
  if (!targetLevel) return 0;

  const levelOneQty =
    presetQuantities?.find((q) => q.level === 1)?.remaining_Quantity ?? 0;

  let available = levelOneQty;
  for (const l of sortedLevels) {
    if (l.level === 1) continue;
    if (l.level > targetLevel.level) break;
    available *= l.conversion_Factor;
  }
  return Math.floor(available);
};

type TooltipProps = {
  invoiceItem: InvoiceAddPayloadModel["invoice"];
  product: InventoryProductModel | undefined;
};

const FulfillmentTooltip = ({ invoiceItem, product }: TooltipProps) => {
  if (!product) return null;

  const primaryPreset = product.unitPresets.find(
    (up) => up.preset_ID === invoiceItem.preset_ID,
  );
  const supplementPresets = (invoiceItem.supplement_Preset_IDs ?? [])
    .map((id) => product.unitPresets.find((up) => up.preset_ID === id))
    .filter((p): p is UnitPresetItem => p !== undefined);

  const hasAutoReplenish = invoiceItem.auto_Replenish ?? false;
  const hasSupplement = supplementPresets.length > 0;
  const unitName = invoiceItem.unit;
  const targetUomId = invoiceItem.uom_ID;

  // Allocate quantities across sources
  const primaryAvailable = primaryPreset
    ? computeAvailableAtUom(primaryPreset, targetUomId)
    : 0;
  const primaryUsed = Math.min(primaryAvailable, invoiceItem.unit_quantity);
  let remaining = invoiceItem.unit_quantity - primaryUsed;

  const supplementAmounts = supplementPresets.map((sp) => {
    const available = computeAvailableAtUom(sp, targetUomId);
    const used = Math.min(available, remaining);
    remaining -= used;
    return used;
  });

  const deficit = hasAutoReplenish ? remaining : 0;

  return (
    <div className="pointer-events-none absolute left-0 top-7 z-30 hidden min-w-96 rounded-md border border-gray-300 bg-white p-3 text-[11px] text-gray-700 shadow-xl group-hover:block">
      <div className="font-semibold text-sm text-gray-900">Primary Preset</div>
      <div className="mt-1 flex items-center justify-between">
        <span>{primaryPreset ? buildPresetPath(primaryPreset) : "N/A"}</span>
        <span>
          {primaryUsed} {unitName}
        </span>
      </div>

      {hasSupplement && (
        <>
          <div className="my-2 border-t border-dashed border-gray-400" />
          <div className="font-semibold text-sm text-gray-900">
            Supplemented Preset
          </div>
          {supplementPresets.map((sp, i) => (
            <div
              key={sp.preset_ID}
              className="mt-1 flex items-center justify-between"
            >
              <span>{buildPresetPath(sp)}</span>
              <span>
                {supplementAmounts[i]} {unitName}
              </span>
            </div>
          ))}
        </>
      )}

      {hasAutoReplenish && (
        <>
          <div className="my-2 border-t border-dashed border-gray-400" />
          <div className="font-semibold text-sm text-gray-900">
            Generated Preset (Auto-Replenish)
          </div>
          <div className="mt-1 flex items-center justify-between">
            <span>
              {primaryPreset ? buildPresetPath(primaryPreset) : "N/A"}
            </span>
            <span>
              {deficit} {unitName}
            </span>
          </div>
        </>
      )}

      <div className="my-2 border-t border-dashed border-gray-400" />
      <div className="flex items-center justify-between text-sm font-bold text-gray-900">
        <span>Total</span>
        <span>
          {invoiceItem.unit_quantity} {unitName}
        </span>
      </div>

      <div className="sr-only">
        {hasSupplement
          ? `Supplemented amounts: ${supplementAmounts.join(" + ")}. `
          : ""}
        {hasAutoReplenish ? `Generated amount: ${deficit}.` : ""}
      </div>
    </div>
  );
};

export const InvoiceTable = () => {
  const [discountValue, setDiscountValue] = useState("0");
  const [discountType, setDiscountType] = useState<"%" | "amount">("%");
  const [isSaving, setIsSaving] = useState(false);

  const { data: payloadData = [] } = useSelectedPayloadInvoiceQuery();
  const { data: selectedInvoices = [] } = useSelectedProductInvoiceQuery();
  const { data: selectedCustomer } = useSelectedInvoiceCustomer();
  const { data: invoiceTerm } = useInvoiceTermQuery();
  const { user } = useAuth();

  // Subtotal is the sum of per-line totals (each already has per-item discount applied)
  const subtotal = payloadData.reduce((acc, p) => acc + p.invoice.total, 0);
  const parsedDiscount = Number(discountValue) || 0;
  const discountAmount =
    discountType === "%" ? subtotal * (parsedDiscount / 100) : parsedDiscount;
  const total = Math.max(0, subtotal - discountAmount);

  const formatDiscount = (discount: number, isPercentage: boolean): string => {
    if (discount === 0) return "—";
    return isPercentage ? `${discount}%` : `₱${discount.toLocaleString()}`;
  };

  const handleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      await createInvoice(
        payloadData,
        selectedCustomer?.id,
        user?.user_ID,
        invoiceTerm,
      );
    } finally {
      setIsSaving(false);
    }
  };

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
        {payloadData.length > 0 ? (
          payloadData.map((p, i) => {
            const inv = p.invoice;
            const productLabel = `${inv.product.product_Name} - ${inv.brand.brandName} - ${inv.variant.variant_Name}`;
            const hasSupplement = (inv.supplement_Preset_IDs ?? []).length > 0;
            const hasAutoReplenish = inv.auto_Replenish ?? false;
            const product = selectedInvoices.find(
              (si) => si.itemKey === inv.itemKey,
            )?.data;

            return (
              <div
                className={`py-3 px-5 flex justify-between gap-2 rounded-lg items-center text-xs ${
                  i % 2 !== 0 && "bg-custom-gray"
                }`}
                key={inv.itemKey}
              >
                <span className="text-left w-full relative">
                  <span className="inline-flex items-center gap-1">
                    <span>{productLabel}</span>
                    {(hasSupplement || hasAutoReplenish) && (
                      <span className="relative group inline-flex items-center gap-1 align-middle">
                        {hasSupplement && (
                          <span className="text-red-500 text-sm leading-none">
                            ⚯
                          </span>
                        )}
                        {hasAutoReplenish && (
                          <span className="text-orange-500 text-sm leading-none">
                            ⟳
                          </span>
                        )}
                        <FulfillmentTooltip
                          invoiceItem={inv}
                          product={product}
                        />
                      </span>
                    )}
                  </span>
                </span>
                <span className="text-right w-full">{inv.unit_quantity}</span>
                <span className="text-left w-full">{inv.unit}</span>
                <span className="text-right w-full">
                  ₱{inv.unit_price.toLocaleString()}
                </span>
                <span className="text-right w-full">
                  {formatDiscount(inv.discount, inv.isDiscountPercentage)}
                </span>
                <span className="text-right w-full">
                  ₱{inv.total.toLocaleString()}
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
              onChange={(e) =>
                setDiscountType(e.target.value as "%" | "amount")
              }
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
          onClick={handleSave}
          disabled={isSaving || payloadData.length === 0}
          className="px-8 py-2 border border-gray-800 bg-white text-gray-900 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
};
