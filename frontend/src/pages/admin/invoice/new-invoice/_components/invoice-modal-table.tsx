import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  buildInvoicePdf,
  InvoicePdfLineItem,
} from "@/features/invoice/invoice-pdf";
import {
  useInvoicePayloadQuery,
  useSelectedPayloadInvoiceQuery,
} from "@/features/invoice/invoice-create-payload";
import {
  useSelectedInvoiceProduct,
  useSelectedProductInvoiceQuery,
} from "@/features/invoice/selected-product";
import {
  updateSelectedCustomer,
  useSelectedInvoiceCustomer,
} from "@/features/invoice/invoice-customer.state";
import {
  setInvoiceTermQuery,
  useInvoiceTermQuery,
} from "@/features/invoice/invoice-term.state";
import { useAuth } from "@/context/use-auth";
import { createInvoice } from "@/features/invoice/create-invoice.service";
import { InventoryProductModel } from "@/features/inventory/models/inventory.model";
import { InvoiceAddPayloadModel } from "@/features/invoice/models/invoice-add-payload.model";
import { Bot, Tag } from "lucide-react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

interface InvoiceTableProps {
  invoiceNumber: number;
}

type UnitPresetItem = InventoryProductModel["unitPresets"][number];

const formatCurrency = (value: number): string =>
  value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

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

const getPresetPricingEntry = (
  invoiceItem: InvoiceAddPayloadModel["invoice"],
  product: InventoryProductModel | undefined,
) => {
  const preset = product?.unitPresets.find(
    (up) => up.preset_ID === invoiceItem.preset_ID,
  );
  if (!preset) return undefined;

  const level = preset.preset.presetLevels.find(
    (l) => l.uoM_ID === invoiceItem.uom_ID,
  )?.level;

  return preset.presetPricing.find((pp) => pp.level === level);
};

// Manual price = the stored unit price doesn't match the preset's supplier
// price for the selected unit level.
const isManualPrice = (
  invoiceItem: InvoiceAddPayloadModel["invoice"],
  product: InventoryProductModel | undefined,
): boolean => {
  if (!product) return false;
  const supplierPrice =
    getPresetPricingEntry(invoiceItem, product)?.price_Per_Unit ?? 0;
  return invoiceItem.unit_price !== supplierPrice;
};

const formatPricingDate = (dateString: string): string =>
  new Date(dateString).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

// Original = quantity fulfilled from the preset's own remaining stock;
// replenished = the remainder covered by auto-replenish.
const getAutoReplenishBreakdown = (
  invoiceItem: InvoiceAddPayloadModel["invoice"],
  product: InventoryProductModel | undefined,
): { original: number; replenished: number } | undefined => {
  const preset = product?.unitPresets.find(
    (up) => up.preset_ID === invoiceItem.preset_ID,
  );
  if (!preset) return undefined;

  const available = computeAvailableAtUom(preset, invoiceItem.uom_ID);
  const original = Math.min(available, invoiceItem.unit_quantity);
  const replenished = Math.max(0, invoiceItem.unit_quantity - original);

  return { original, replenished };
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

export const InvoiceTable = ({ invoiceNumber }: InvoiceTableProps) => {
  const navigate = useNavigate();
  const [notes, setNotes] = useState("");
  const [discountValue, setDiscountValue] = useState("0");
  const [discountType, setDiscountType] = useState<"%" | "amount">("%");
  const [isSaving, setIsSaving] = useState(false);

  const { data: payloadData = [] } = useSelectedPayloadInvoiceQuery();
  const { data: selectedInvoices = [] } = useSelectedProductInvoiceQuery();
  const { data: selectedCustomer } = useSelectedInvoiceCustomer();
  const { data: invoiceTerm } = useInvoiceTermQuery();
  const { user } = useAuth();
  const { CLEAR_TO_INVOICE_LIST } = useSelectedInvoiceProduct();
  const { CLEAR_INVOICE_PAYLOAD } = useInvoicePayloadQuery();
  const { CLEAR_SELECTED_CUSTOMER } = updateSelectedCustomer();
  const { CLEAR_INVOICE_TERM } = setInvoiceTermQuery();

  // Subtotal is the sum of per-line totals (each already has per-item discount applied)
  const subtotal = payloadData.reduce((acc, p) => acc + p.invoice.total, 0);
  const parsedDiscount = Number(discountValue) || 0;
  const discountAmount =
    discountType === "%" ? subtotal * (parsedDiscount / 100) : parsedDiscount;
  const total = Math.max(0, subtotal - discountAmount);

  const formatDiscount = (discount: number, isPercentage: boolean): string => {
    if (discount === 0) return "—";
    return isPercentage ? `${discount}%` : `₱${formatCurrency(discount)}`;
  };

  const generateInvoicePdf = () => {
    const invoiceNumberLabel = String(invoiceNumber).padStart(6, "0");
    const dateLabel = new Date().toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

    const lineItems: InvoicePdfLineItem[] = payloadData.map((p) => {
      const inv = p.invoice;
      return {
        label: `${inv.product.product_Name} - ${inv.brand.brandName} - ${inv.variant.variant_Name}`,
        quantity: inv.unit_quantity,
        unit: inv.unit,
        unitPrice: inv.unit_price,
        total: inv.total,
      };
    });

    buildInvoicePdf({
      invoiceNumberLabel,
      customerName: selectedCustomer?.companyName ?? "-",
      term: invoiceTerm ? String(invoiceTerm) : "-",
      dateLabel,
      lineItems,
      subtotal,
      discountAmount,
      discountLabel: `P${formatCurrency(discountAmount)}`,
      grandTotal: total,
      fileName: `Invoice-${invoiceNumberLabel}.pdf`,
    });
  };

  // ── TEST HELPER: generates dummy multi-page data so the multi-page PDF
  // layout (page counting, "(Continued on Page N)", simplified continuation
  // headers, and last-page-only totals/signatures) can be verified without
  // needing to build a real, huge invoice first. Not wired to any real
  // invoice data — purely for QA/demo purposes. ──
  const generateTestMultiPagedInvoicePdf = () => {
    // 100 rows comfortably spans multiple A4 pages regardless of exact row
    // density, guaranteeing the multi-page path (page counting, continuation
    // headers, "(Continued on Page N)") actually gets exercised.
    const dummyLineItems: InvoicePdfLineItem[] = Array.from(
      { length: 100 },
      () => ({
        label: "testItem - testBrand - Variant1",
        quantity: 25,
        unit: "PIECE",
        unitPrice: 2000,
        total: 50000,
      }),
    );

    const dummySubtotal = dummyLineItems.reduce((acc, li) => acc + li.total, 0);
    const dummyDiscountAmount = dummySubtotal * 0.1;
    const dummyGrandTotal = dummySubtotal - dummyDiscountAmount;

    buildInvoicePdf({
      invoiceNumberLabel: "000011",
      customerName: "Madeline Corp",
      term: "30",
      dateLabel: "March 1, 2025",
      lineItems: dummyLineItems,
      subtotal: dummySubtotal,
      discountAmount: dummyDiscountAmount,
      discountLabel: `P${formatCurrency(dummyDiscountAmount)}`,
      grandTotal: dummyGrandTotal,
      fileName: "Invoice-000011-TEST-multipage.pdf",
    });
  };

  const handleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);
    const toastId = toast.loading("Saving invoice...");
    try {
      const res = await createInvoice(
        payloadData,
        selectedCustomer?.id,
        user?.user_ID,
        invoiceTerm,
        notes,
      );
      if (!res) {
        toast.dismiss(toastId);
        return;
      }

      generateInvoicePdf();
      toast.success("Invoice created successfully.", { id: toastId });

      CLEAR_TO_INVOICE_LIST();
      CLEAR_INVOICE_PAYLOAD();
      CLEAR_SELECTED_CUSTOMER();
      CLEAR_INVOICE_TERM();

      navigate("/admin/invoice");
    } catch {
      toast.error("Failed to create invoice.", { id: toastId });
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

      <div className="flex flex-wrap items-center gap-4 px-1 text-[11px] text-gray-500 font-semibold">
        <div className="flex items-center gap-1">
          <span className="text-purple-500 font-semibold p-0.5 rounded-md bg-purple-50 border-2 border-purple-400">
            <Bot size={16} />
          </span>
          <span>Used Auto-replenish deficit</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-green-700 font-semibold p-0.5 rounded-md bg-green-50 border-2 border-green-400">
            <Tag size={16} />
          </span>
          <span>Used Manual Price</span>
        </div>
      </div>

      {/* TABLE DATA BODY */}
      <div className="overflow-auto flex flex-col h-full">
        {payloadData.length > 0 ? (
          payloadData.map((p, i) => {
            const inv = p.invoice;
            const productLabel = `${inv.product.product_Name} - ${inv.brand.brandName} - ${inv.variant.variant_Name}`;
            const hasAutoReplenish = inv.auto_Replenish ?? false;
            const product = selectedInvoices.find(
              (si) => si.itemKey === inv.itemKey,
            )?.data;
            const hasManualPrice = isManualPrice(inv, product);

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
                    {(hasAutoReplenish || hasManualPrice) && (
                      <span className="relative group inline-flex items-center gap-1 align-middle">
                        {hasAutoReplenish &&
                          (() => {
                            const breakdown = getAutoReplenishBreakdown(
                              inv,
                              product,
                            );
                            return (
                              <HoverCard openDelay={100} closeDelay={0}>
                                <HoverCardTrigger asChild>
                                  <span className="text-purple-500 font-semibold p-0.5 rounded-md bg-purple-50 border-2 border-purple-400 inline-flex cursor-default">
                                    <Bot size={12} />
                                  </span>
                                </HoverCardTrigger>
                                <HoverCardContent className="w-fit p-3 text-xs flex flex-col gap-1">
                                  <span>
                                    Original:{" "}
                                    <span className="font-semibold">
                                      {breakdown?.original ?? 0}
                                    </span>
                                  </span>
                                  <span>
                                    Auto-replenished:{" "}
                                    <span className="font-semibold">
                                      +{breakdown?.replenished ?? 0}
                                    </span>
                                  </span>
                                </HoverCardContent>
                              </HoverCard>
                            );
                          })()}
                        {hasManualPrice &&
                          (() => {
                            const pricingEntry = getPresetPricingEntry(
                              inv,
                              product,
                            );
                            return (
                              <HoverCard openDelay={100} closeDelay={0}>
                                <HoverCardTrigger asChild>
                                  <span className="text-green-700 font-semibold p-0.5 rounded-md bg-green-50 border-2 border-green-400 inline-flex cursor-default">
                                    <Tag size={12} />
                                  </span>
                                </HoverCardTrigger>
                                <HoverCardContent className="w-fit p-3 text-xs flex flex-col gap-1">
                                  <span>
                                    Standard price:{" "}
                                    <span className="font-semibold">
                                      ₱
                                      {(
                                        pricingEntry?.price_Per_Unit ?? 0
                                      ).toFixed(2)}
                                    </span>
                                  </span>
                                  <span>
                                    As of:{" "}
                                    <span className="font-semibold">
                                      {pricingEntry
                                        ? formatPricingDate(
                                            pricingEntry.created_At,
                                          )
                                        : "N/A"}
                                    </span>
                                  </span>
                                </HoverCardContent>
                              </HoverCard>
                            );
                          })()}
                        {/* <FulfillmentTooltip
                          invoiceItem={inv}
                          product={product}
                        /> */}
                      </span>
                    )}
                  </span>
                </span>
                <span className="text-right w-full">{inv.unit_quantity}</span>
                <span className="text-left w-full">{inv.unit}</span>
                <span className="text-right w-full">
                  ₱{formatCurrency(inv.unit_price)}
                </span>
                <span className="text-right w-full">
                  {formatDiscount(inv.discount, inv.isDiscountPercentage)}
                </span>
                <span className="text-right w-full">
                  ₱{formatCurrency(inv.total)}
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

      <div className="flex flex-col gap-1">
        <label className="text-sm font-semibold">Notes</label>
        <textarea
          className="bg-custom-gray rounded-lg px-4 py-3 text-sm resize-none"
          rows={3}
          placeholder="Add any notes for this invoice..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      <div className="flex justify-between items-end pt-2">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-0 text-sm">
            <span className="font-semibold mr-2">Discount</span>
            <input
              className="w-20 px-2 py-1 rounded-l-md rounded-r-none shadow-none drop-shadow-none border border-gray-300"
              value={discountValue}
              onChange={(e) => setDiscountValue(e.target.value)}
            />
            <select
              className="w-14 px-1 py-1 rounded-r-md rounded-l-none border border-l-0 border-gray-300 bg-white"
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
            <label>₱{formatCurrency(total)}</label>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* <button
            type="button"
            onClick={generateTestMultiPagedInvoicePdf}
            className="text-xs border rounded-md px-3 py-2"
            title="Generates a PDF with dummy data to test the multi-page invoice layout — not tied to real invoice data."
          >
            Test Multi-Page PDF
          </button> */}
          <button
            onClick={handleSave}
            disabled={isSaving || payloadData.length === 0}
            className="disabled:cursor-not-allowed"
          >
            {isSaving ? "Saving..." : "Save Invoice"}
          </button>
        </div>
      </div>
    </div>
  );
};
