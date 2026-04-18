import { SupplierDataModel } from "@/features/suppliers/get-all-suppliers.model";
import { useProductsWithPresetsQuery } from "@/features/suppliers/supplier-purchase-prices/get-products-with-presets.query";
import { useSupplierPurchasePricesQuery } from "@/features/suppliers/supplier-purchase-prices/get-supplier-purchase-prices.query";
import { useUpsertSupplierPurchasePricesMutation } from "@/features/suppliers/supplier-purchase-prices/upsert-supplier-purchase-prices.service";
import { ProductWithPresetItem } from "@/features/suppliers/supplier-purchase-prices/supplier-purchase-prices.model";
import {
  ChevronDown,
  ChevronRight,
  Save,
  TrendingDown,
  TrendingUp,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

interface PurchasePriceModalProps {
  handlePurchasePrice: () => void;
  selectedSupplier: SupplierDataModel | null;
}

export const PurchasePriceModal = ({
  handlePurchasePrice,
  selectedSupplier,
}: PurchasePriceModalProps) => {
  const supplierId = selectedSupplier?.supplier_Id ?? null;

  const { data: products = [], isLoading: productsLoading } =
    useProductsWithPresetsQuery();
  const { data: savedPrices = [] } = useSupplierPurchasePricesQuery(supplierId);
  const upsertMutation = useUpsertSupplierPurchasePricesMutation(
    supplierId ?? "",
  );

  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [expandedGlobalPrices, setExpandedGlobalPrices] = useState<Set<string>>(
    new Set(),
  );
  const [selectedPresetByProduct, setSelectedPresetByProduct] = useState<
    Record<number, number>
  >({});
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  const [draftPrice, setDraftPrice] = useState<string>("");

  // "productId:presetId" -> saved price_Per_Unit from server
  const savedPriceMap = useMemo(() => {
    const map = new Map<string, number>();
    savedPrices.forEach((p) => {
      map.set(`${p.product_ID}:${p.preset_ID}`, Number(p.price_Per_Unit));
    });
    return map;
  }, [savedPrices]);

  const getSelectedPresetId = (
    productId: number,
    presets: ProductWithPresetItem[],
  ) => selectedPresetByProduct[productId] ?? presets[0]?.preset_ID ?? null;

  const getKey = (productId: number, presetId: number) =>
    `${productId}:${presetId}`;

  const togglePresetSelection = (key: string) => {
    const [productIdStr] = key.split(":");
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      // One selected preset per product
      Array.from(next).forEach((k) => {
        if (k.startsWith(`${productIdStr}:`) && k !== key) next.delete(k);
      });
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const handlePresetChange = (productId: number, presetId: number) => {
    setSelectedPresetByProduct((prev) => ({ ...prev, [productId]: presetId }));
    const newKey = getKey(productId, presetId);
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      const prefix = `${productId}:`;
      const hasSelection = Array.from(next).some((k) => k.startsWith(prefix));
      if (!hasSelection) return next;
      Array.from(next).forEach((k) => {
        if (k.startsWith(prefix) && k !== newKey) next.delete(k);
      });
      next.add(newKey);
      return next;
    });
    setActiveKey((prev) => {
      if (!prev) return prev;
      return prev.startsWith(`${productId}:`) ? newKey : prev;
    });
  };

  const openPricingPanel = (productId: number, presetId: number) => {
    const key = getKey(productId, presetId);
    setActiveKey(key);
    const existing = savedPriceMap.get(key);
    setDraftPrice(existing !== undefined ? String(existing) : "");
  };

  const toggleGlobalPrices = (key: string) => {
    setExpandedGlobalPrices((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const formatPhp = (value: number) =>
    new Intl.NumberFormat("en-PH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);

  const activeProduct = useMemo(() => {
    if (!activeKey) return null;
    const [productIdStr] = activeKey.split(":");
    return products.find((p) => p.product_ID === Number(productIdStr)) ?? null;
  }, [activeKey, products]);

  const activePreset = useMemo(() => {
    if (!activeKey || !activeProduct) return null;
    const [, presetIdStr] = activeKey.split(":");
    return (
      activeProduct.presets.find((p) => p.preset_ID === Number(presetIdStr)) ??
      null
    );
  }, [activeKey, activeProduct]);

  const activeSavedPrice = activeKey ? savedPriceMap.get(activeKey) : undefined;

  const draftNum = Number(draftPrice);
  const isDraftValid =
    draftPrice !== "" && !Number.isNaN(draftNum) && draftNum > 0;
  const sellingPrice = activePreset?.main_Unit_Selling_Price ?? 0;
  const isProfit = isDraftValid && draftNum < sellingPrice;

  const canSave =
    !!activeKey &&
    selectedKeys.has(activeKey) &&
    isDraftValid &&
    draftNum !== (activeSavedPrice ?? -1);

  const handleSavePrice = async () => {
    if (!activeKey || !activeProduct || !activePreset) return;
    if (!selectedKeys.has(activeKey)) {
      toast.error("Select this preset first before saving a price");
      return;
    }
    if (!isDraftValid) {
      toast.error("Please set a valid primary unit purchase price");
      return;
    }
    await upsertMutation.mutateAsync([
      {
        product_ID: activeProduct.product_ID,
        preset_ID: activePreset.preset_ID,
        price_Per_Unit: draftNum,
      },
    ]);
    toast.success("Purchase price saved");
    handlePurchasePrice();
  };

  const sortedProducts = useMemo(() => {
    return [...products].sort((a, b) => {
      const aPresetId = getSelectedPresetId(a.product_ID, a.presets);
      const bPresetId = getSelectedPresetId(b.product_ID, b.presets);
      const aSelected =
        aPresetId !== null && selectedKeys.has(getKey(a.product_ID, aPresetId));
      const bSelected =
        bPresetId !== null && selectedKeys.has(getKey(b.product_ID, bPresetId));
      if (aSelected === bSelected)
        return a.product_Name.localeCompare(b.product_Name);
      return aSelected ? -1 : 1;
    });
  }, [products, selectedKeys, selectedPresetByProduct]);

  return (
    <section className="absolute left-0 top-0 z-50 flex h-full w-full items-center justify-center bg-black/40 p-4">
      <div className="relative flex h-[760px] w-[1200px] gap-0 overflow-hidden rounded-xl border bg-white shadow-lg">
        <div
          className="absolute right-3 top-3 z-10 rounded-md text-vesper-gray hover:bg-bellflower-gray p-3 cursor-pointer transition"
          onClick={handlePurchasePrice}
          aria-label="Close purchase price modal"
        >
          <X size={18} />
        </div>

        {/* Left panel — Product list */}
        <div className="flex w-7/12 min-w-0 flex-col border-r border-slate-200">
          <div className="border-b border-slate-200 px-5 py-4">
            <h3 className="text-lg font-semibold text-vesper-gray">
              Supplier Product Purchase Prices
            </h3>
            <p className="text-sm text-slate-500">
              {selectedSupplier?.company_Name ?? "No supplier selected"} —
              select a product preset and set the purchase price.
            </p>
          </div>

          <div className="flex items-center justify-between px-5 py-3 text-xs text-slate-500">
            <span>Selected presets appear at the top</span>
            <span>{selectedKeys.size} selected</span>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">
            {productsLoading ? (
              <div className="flex h-full items-center justify-center text-sm text-slate-500">
                Loading products…
              </div>
            ) : sortedProducts.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-slate-500">
                No products with packaging presets found.
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {sortedProducts.map((product) => {
                  const selectedPresetId = getSelectedPresetId(
                    product.product_ID,
                    product.presets,
                  );
                  const selectedPreset =
                    selectedPresetId !== null
                      ? (product.presets.find(
                          (p) => p.preset_ID === selectedPresetId,
                        ) ?? null)
                      : null;
                  const key =
                    selectedPresetId !== null
                      ? getKey(product.product_ID, selectedPresetId)
                      : null;
                  const isSelected = key !== null && selectedKeys.has(key);
                  const isActive = key !== null && activeKey === key;
                  const savedPrice =
                    key !== null ? savedPriceMap.get(key) : undefined;

                  return (
                    <div
                      key={product.product_ID}
                      className={`rounded-lg border p-3 transition ${
                        isActive
                          ? "border-blue-300 bg-blue-50/40"
                          : "border-slate-200 bg-white"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          className="mt-1"
                          checked={isSelected}
                          onChange={() => key && togglePresetSelection(key)}
                          disabled={key === null}
                        />

                        <div className="min-w-0 flex-1 space-y-2">
                          <p className="truncate text-sm font-semibold text-vesper-gray">
                            {product.product_Name}
                          </p>

                          <div>
                            <label className="text-xs font-medium text-slate-500">
                              Packaging preset
                            </label>
                            <select
                              className="mt-1 w-full rounded-md border border-slate-200 bg-white px-2 py-1.5 text-sm text-vesper-gray"
                              value={selectedPresetId ?? ""}
                              onChange={(e) =>
                                handlePresetChange(
                                  product.product_ID,
                                  Number(e.target.value),
                                )
                              }
                            >
                              {product.presets.map((preset) => (
                                <option
                                  key={preset.preset_ID}
                                  value={preset.preset_ID}
                                >
                                  {preset.preset_Name} (
                                  {preset.main_Unit?.uom_Name ?? "Unit"})
                                </option>
                              ))}
                            </select>
                          </div>

                          {savedPrice !== undefined ? (
                            <p className="text-xs text-slate-500">
                              Saved purchase price:{" "}
                              <span className="font-semibold text-vesper-gray">
                                Php {formatPhp(savedPrice)}
                              </span>{" "}
                              / {selectedPreset?.main_Unit?.uom_Name ?? "unit"}
                            </p>
                          ) : null}
                        </div>

                        {isSelected && key ? (
                          <button
                            className={`rounded-md border px-2 py-1 text-xs font-semibold whitespace-nowrap bg-slate-300 ${
                              isActive
                                ? "border-blue-300 bg-blue-100 text-blue-700"
                                : "border-slate-200 text-vesper-gray"
                            }`}
                            onClick={() =>
                              openPricingPanel(
                                product.product_ID,
                                selectedPresetId!,
                              )
                            }
                          >
                            <span className="inline-flex items-center gap-1">
                              <ChevronRight size={14} /> Set price
                            </span>
                          </button>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right panel — Pricing */}
        <div className="relative flex w-5/12 min-w-0 flex-col">
          {activeKey && activeProduct && activePreset ? (
            <>
              <div className="absolute left-0 top-0 h-full w-[3px] bg-blue-400" />

              <div className="border-b border-slate-200 px-5 py-4">
                <p className="text-xs text-slate-500">Pricing Panel</p>
                <h4 className="text-base font-semibold text-vesper-gray">
                  {activeProduct.product_Name}
                </h4>
                <p className="text-sm text-slate-500">
                  {activePreset.preset_Name} · Primary unit:{" "}
                  {activePreset.main_Unit?.uom_Name ?? "Unit"}
                </p>
              </div>

              <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-5 py-4">
                <div className="rounded-lg border border-slate-200 p-3 space-y-3">
                  <label className="text-xs font-semibold text-slate-500">
                    Purchase Price — Primary Unit (Required)
                  </label>

                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-500">Php</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className="input-style-3 w-full"
                      placeholder="0.00"
                      value={draftPrice}
                      onChange={(e) => setDraftPrice(e.target.value)}
                    />
                  </div>

                  {/* Profit / Loss indicator */}
                  {isDraftValid ? (
                    <div
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                        isProfit
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {isProfit ? (
                        <TrendingUp size={12} />
                      ) : (
                        <TrendingDown size={12} />
                      )}
                      {isProfit ? "Profit" : "Loss"} — purchase Php{" "}
                      {formatPhp(draftNum)} vs sell Php{" "}
                      {formatPhp(sellingPrice)}
                    </div>
                  ) : null}

                  <div className="text-xs text-slate-500">
                    Selling price (primary unit): Php{" "}
                    <span className="font-semibold text-vesper-gray">
                      {formatPhp(sellingPrice)}
                    </span>
                  </div>

                  {/* Collapsible selling prices by level */}
                  <div className="rounded-md border border-slate-200 bg-slate-50 p-2">
                    <div
                      className="flex w-full items-center gap-1 text-left text-xs font-semibold text-vesper-gray hover:bg-slate-100 rounded-md px-2 py-1 cursor-pointer transition"
                      onClick={() => toggleGlobalPrices(activeKey)}
                    >
                      {expandedGlobalPrices.has(activeKey) ? (
                        <ChevronDown size={14} />
                      ) : (
                        <ChevronRight size={14} />
                      )}
                      Selling Prices by Level (Global)
                    </div>

                    {expandedGlobalPrices.has(activeKey) ? (
                      <div className="mt-2 flex flex-col gap-1">
                        {activePreset.preset_Levels.length === 0 ? (
                          <p className="text-xs text-slate-400">
                            No preset levels found.
                          </p>
                        ) : (
                          activePreset.preset_Levels.map((lvl, i) => {
                            const isMainUnit =
                              lvl.uoM_ID === activePreset.main_Unit_ID;
                            return (
                              <div
                                key={lvl.level_ID}
                                className="flex items-center justify-between text-xs text-slate-600"
                              >
                                <span className="flex items-center gap-1">
                                  {i !== 0 && (
                                    <span className="text-slate-300">└─</span>
                                  )}
                                  {lvl.unit?.uom_Name ?? `UOM ${lvl.uoM_ID}`}
                                  {isMainUnit ? (
                                    <span className="ml-1 rounded-full bg-blue-100 px-1.5 py-0.5 text-[10px] font-semibold text-blue-600">
                                      primary
                                    </span>
                                  ) : null}
                                </span>
                                <span className="font-medium text-vesper-gray">
                                  Php {formatPhp(lvl.selling_Price)}
                                </span>
                              </div>
                            );
                          })
                        )}
                      </div>
                    ) : null}
                  </div>

                  {activeSavedPrice !== undefined ? (
                    <p className="text-xs text-slate-400">
                      Last saved: Php {formatPhp(activeSavedPrice)} /{" "}
                      {activePreset.main_Unit?.uom_Name ?? "unit"}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="border-t border-slate-200 px-5 py-3 w-full justify-end flex">
                <button
                  className="w-full max-w-fit flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                  disabled={!canSave || upsertMutation.isPending}
                  onClick={handleSavePrice}
                >
                  <Save size={18} />
                  {upsertMutation.isPending ? "Saving…" : "Save Purchase Price"}
                </button>
              </div>
            </>
          ) : (
            <div className="flex h-full items-center justify-center px-8 text-center text-sm text-slate-500">
              Select a product, check its checkbox, then click{" "}
              <span className="mx-1 font-semibold text-vesper-gray">
                Set price
              </span>{" "}
              to configure the purchase price.
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
