import { SupplierDataModel } from "@/features/suppliers/get-all-suppliers.model";
import { format } from "date-fns";
import { ChevronDown, ChevronRight, CircleAlert, Save, X } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

type ProductPresetGroup = {
  productId: number;
  productName: string;
  presetId: number;
  presetName: string;
  primaryUnitName: string;
  referenceSellingPrice: number;
};

type ProductGroup = {
  productId: number;
  productName: string;
  presets: ProductPresetGroup[];
};

type PriceHistoryEntry = {
  changedAt: string;
  changedBy: string;
  previousPrice: number;
  nextPrice: number;
  primaryUnitName: string;
};

interface PurchasePriceModalProps {
  handlePurchasePrice: () => void;
  selectedSupplier: SupplierDataModel | null;
}

export const PurchasePriceModal = ({
  handlePurchasePrice,
  selectedSupplier,
}: PurchasePriceModalProps) => {
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [selectedPresetByProduct, setSelectedPresetByProduct] = useState<
    Record<number, string>
  >({});
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  const [expandedHistory, setExpandedHistory] = useState<Set<string>>(
    new Set(),
  );

  const groupedRows = useMemo<ProductPresetGroup[]>(() => {
    if (!selectedSupplier) return [];

    const grouped = new Map<string, ProductPresetGroup>();

    selectedSupplier.restocks.forEach((restock) => {
      restock.line_Items.forEach((lineItem) => {
        if (!lineItem.product || !lineItem.unit_Preset) return;

        const key = `${lineItem.product.product_ID}:${lineItem.unit_Preset.preset_ID}`;
        if (grouped.has(key)) return;

        const primaryUomId = lineItem.unit_Preset.main_Unit_ID;
        const primaryPresetPrice =
          lineItem.preset_Pricing.find((p) => p.uoM_ID === primaryUomId)
            ?.price_Per_Unit ?? 0;

        grouped.set(key, {
          productId: lineItem.product.product_ID,
          productName: lineItem.product.product_Name,
          presetId: lineItem.unit_Preset.preset_ID,
          presetName: lineItem.unit_Preset.preset_Name,
          primaryUnitName: lineItem.unit_Preset.main_Unit?.uom_Name ?? "Unit",
          referenceSellingPrice: Number(primaryPresetPrice),
        });
      });
    });

    return Array.from(grouped.values()).sort((a, b) =>
      a.productName.localeCompare(b.productName),
    );
  }, [selectedSupplier]);

  const defaultPurchasePrices = useMemo(() => {
    const defaults: Record<string, number> = {};
    groupedRows.forEach((row) => {
      defaults[`${row.productId}:${row.presetId}`] = row.referenceSellingPrice;
    });
    return defaults;
  }, [groupedRows]);

  const [savedPurchasePrices, setSavedPurchasePrices] = useState<
    Record<string, number>
  >({});
  const [draftPurchasePrices, setDraftPurchasePrices] = useState<
    Record<string, string>
  >({});
  const [lastUpdatedMeta, setLastUpdatedMeta] = useState<
    Record<string, { updatedAt: string; updatedBy: string }>
  >({});
  const [priceHistory, setPriceHistory] = useState<
    Record<string, PriceHistoryEntry[]>
  >({});

  const groupedProducts = useMemo<ProductGroup[]>(() => {
    const grouped = new Map<number, ProductGroup>();

    groupedRows.forEach((row) => {
      if (!grouped.has(row.productId)) {
        grouped.set(row.productId, {
          productId: row.productId,
          productName: row.productName,
          presets: [],
        });
      }

      grouped.get(row.productId)?.presets.push(row);
    });

    return Array.from(grouped.values())
      .map((product) => ({
        ...product,
        presets: product.presets.sort((a, b) =>
          a.presetName.localeCompare(b.presetName),
        ),
      }))
      .sort((a, b) => a.productName.localeCompare(b.productName));
  }, [groupedRows]);

  const getDefaultPresetKey = (product: ProductGroup) => {
    const firstPreset = product.presets[0];
    if (!firstPreset) return "";
    return `${product.productId}:${firstPreset.presetId}`;
  };

  const getSelectedPresetKey = (product: ProductGroup) => {
    return selectedPresetByProduct[product.productId] ?? getDefaultPresetKey(product);
  };

  const sortedProducts = useMemo(() => {
    const list = [...groupedProducts];
    return list.sort((a, b) => {
      const aSelected = selectedKeys.has(getSelectedPresetKey(a));
      const bSelected = selectedKeys.has(getSelectedPresetKey(b));
      if (aSelected === bSelected)
        return a.productName.localeCompare(b.productName);
      return aSelected ? -1 : 1;
    });
  }, [groupedProducts, selectedKeys, selectedPresetByProduct]);

  const rowByKey = useMemo(() => {
    const map = new Map<string, ProductPresetGroup>();
    groupedRows.forEach((row) => {
      map.set(`${row.productId}:${row.presetId}`, row);
    });
    return map;
  }, [groupedRows]);

  const activeRow = useMemo(() => {
    if (!activeKey) return null;
    return rowByKey.get(activeKey) ?? null;
  }, [activeKey, rowByKey]);

  const getSavedPrice = (key: string, fallbackPrice: number) => {
    if (savedPurchasePrices[key] !== undefined) return savedPurchasePrices[key];
    return defaultPurchasePrices[key] ?? fallbackPrice;
  };

  const getDraftPrice = (key: string, fallbackPrice: number) => {
    if (draftPurchasePrices[key] !== undefined) return draftPurchasePrices[key];
    return String(getSavedPrice(key, fallbackPrice));
  };

  const togglePresetSelection = (key: string) => {
    const productId = key.split(":")[0];

    setSelectedKeys((prev) => {
      const next = new Set(prev);

      // Keep one selected preset per product row by replacing prior selection.
      Array.from(next).forEach((existingKey) => {
        if (existingKey.startsWith(`${productId}:`) && existingKey !== key) {
          next.delete(existingKey);
        }
      });

      if (next.has(key)) next.delete(key);
      else next.add(key);

      return next;
    });
  };

  const handlePresetChangeForProduct = (productId: number, nextKey: string) => {
    setSelectedPresetByProduct((prev) => ({ ...prev, [productId]: nextKey }));

    setSelectedKeys((prev) => {
      const next = new Set(prev);
      const productPrefix = `${productId}:`;
      const hasSelectedPresetForProduct = Array.from(next).some((existingKey) =>
        existingKey.startsWith(productPrefix),
      );

      if (!hasSelectedPresetForProduct) return next;

      Array.from(next).forEach((existingKey) => {
        if (existingKey.startsWith(productPrefix) && existingKey !== nextKey) {
          next.delete(existingKey);
        }
      });

      next.add(nextKey);
      return next;
    });

    setActiveKey((prev) => {
      if (!prev) return prev;
      return prev.startsWith(`${productId}:`) ? nextKey : prev;
    });
  };

  const toggleHistory = (key: string) => {
    setExpandedHistory((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const handleSavePrice = () => {
    if (!activeRow || !activeKey) return;

    if (!selectedKeys.has(activeKey)) {
      toast.error("Select this preset first before saving a price");
      return;
    }

    const draftValue = getDraftPrice(
      activeKey,
      activeRow.referenceSellingPrice,
    );
    const nextPrice = Number(draftValue);

    if (Number.isNaN(nextPrice) || nextPrice <= 0) {
      toast.error("Please set a valid primary unit purchase price");
      return;
    }

    const previousPrice = getSavedPrice(
      activeKey,
      activeRow.referenceSellingPrice,
    );
    const now = new Date().toISOString();

    setSavedPurchasePrices((prev) => ({ ...prev, [activeKey]: nextPrice }));
    setLastUpdatedMeta((prev) => ({
      ...prev,
      [activeKey]: { updatedAt: now, updatedBy: "Admin" },
    }));

    setPriceHistory((prev) => ({
      ...prev,
      [activeKey]: [
        {
          changedAt: now,
          changedBy: "Admin",
          previousPrice,
          nextPrice,
          primaryUnitName: activeRow.primaryUnitName,
        },
        ...(prev[activeKey] ?? []),
      ],
    }));

    toast.success("Purchase price saved");
  };

  return (
    <section className="absolute left-0 top-0 z-50 flex h-full w-full items-center justify-center bg-black/40 p-4">
      <div className="relative flex h-[760px] w-[1200px] gap-0 overflow-hidden rounded-xl border bg-white shadow-lg">
        <button
          className="absolute right-3 top-3 z-10 rounded-md p-1 text-vesper-gray hover:bg-bellflower-gray"
          onClick={handlePurchasePrice}
          aria-label="Close purchase price modal"
        >
          <X size={18} />
        </button>

        <div className="flex w-7/12 min-w-0 flex-col border-r border-slate-200">
          <div className="border-b border-slate-200 px-5 py-4">
            <h3 className="text-lg font-semibold text-vesper-gray">
              Supplier Product Purchase Prices
            </h3>
            <p className="text-sm text-slate-500">
              {selectedSupplier?.company_Name ?? "No supplier selected"} can
              provide {groupedProducts.length} products with {groupedRows.length}{" "}
              distinct packaging presets.
            </p>
          </div>

          <div className="flex items-center justify-between px-5 py-3 text-xs text-slate-500">
            <span>Selected presets appear at the top</span>
            <span>{selectedKeys.size} selected</span>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">
            {sortedProducts.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-slate-500">
                No restock line items found for this supplier.
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {sortedProducts.map((product) => {
                  const selectedPresetKey = getSelectedPresetKey(product);
                  const selectedPresetRow = rowByKey.get(selectedPresetKey);
                  const isSelected = selectedKeys.has(selectedPresetKey);
                  const isActive = activeKey === selectedPresetKey;

                  return (
                    <div
                      key={product.productId}
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
                          onChange={() => togglePresetSelection(selectedPresetKey)}
                        />

                        <div className="min-w-0 flex-1 space-y-2">
                          <p className="truncate text-sm font-semibold text-vesper-gray">
                            {product.productName}
                          </p>

                          <div>
                            <label className="text-xs font-medium text-slate-500">
                              Packaging preset
                            </label>
                            <select
                              className="mt-1 w-full rounded-md border border-slate-200 bg-white px-2 py-1.5 text-sm text-vesper-gray"
                              value={selectedPresetKey}
                              onChange={(e) =>
                                handlePresetChangeForProduct(
                                  product.productId,
                                  e.target.value,
                                )
                              }
                            >
                              {product.presets.map((preset) => {
                                const presetKey = `${preset.productId}:${preset.presetId}`;
                                return (
                                  <option key={presetKey} value={presetKey}>
                                    {preset.presetName} ({preset.primaryUnitName})
                                  </option>
                                );
                              })}
                            </select>
                          </div>

                          {selectedPresetRow ? (
                            <p className="text-xs text-slate-500">
                              Selected: {selectedPresetRow.presetName} ({selectedPresetRow.primaryUnitName})
                            </p>
                          ) : null}
                        </div>

                        {isSelected ? (
                          <button
                            className={`rounded-md border px-2 py-1 text-xs font-semibold ${
                              isActive
                                ? "border-blue-300 bg-blue-100 text-blue-700"
                                : "border-slate-200 text-vesper-gray"
                            }`}
                            onClick={() => setActiveKey(selectedPresetKey)}
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

        <div className="relative flex w-5/12 min-w-0 flex-col">
          {activeRow && activeKey ? (
            <>
              <div className="absolute left-0 top-0 h-full w-[3px] bg-blue-400" />
              <div className="border-b border-slate-200 px-5 py-4">
                <p className="text-xs text-slate-500">Pricing Panel</p>
                <h4 className="text-base font-semibold text-vesper-gray">
                  {activeRow.productName}
                </h4>
                <p className="text-sm text-slate-500">
                  {activeRow.presetName} · Primary unit:{" "}
                  {activeRow.primaryUnitName}
                </p>
              </div>

              <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-5 py-4">
                <div className="rounded-lg border border-slate-200 p-3">
                  <label className="text-xs font-semibold text-slate-500">
                    Primary Unit Purchase Price (Required)
                  </label>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-sm text-slate-500">Php</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className="input-style-3 w-full"
                      value={getDraftPrice(
                        activeKey,
                        activeRow.referenceSellingPrice,
                      )}
                      onChange={(e) =>
                        setDraftPurchasePrices((prev) => ({
                          ...prev,
                          [activeKey]: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="mt-3 text-xs text-slate-500">
                    Reference selling price (primary unit): Php{" "}
                    {activeRow.referenceSellingPrice.toFixed(2)}
                  </div>

                  {(() => {
                    const draft = Number(
                      getDraftPrice(activeKey, activeRow.referenceSellingPrice),
                    );
                    const isProfit = draft <= activeRow.referenceSellingPrice;
                    return (
                      <div
                        className={`mt-3 inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${
                          isProfit
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        <CircleAlert size={12} />
                        {isProfit ? "Profit awareness" : "Loss awareness"}
                      </div>
                    );
                  })()}
                </div>

                <div className="rounded-lg border border-slate-200 p-3">
                  <p className="text-xs text-slate-500">
                    Last updated:{" "}
                    {lastUpdatedMeta[activeKey]
                      ? `${format(new Date(lastUpdatedMeta[activeKey].updatedAt), "MMM dd, yyyy")} by ${lastUpdatedMeta[activeKey].updatedBy}`
                      : "Not set"}
                  </p>

                  <button
                    className="mt-2 flex items-center gap-1 text-xs font-semibold text-vesper-gray"
                    onClick={() => toggleHistory(activeKey)}
                  >
                    {expandedHistory.has(activeKey) ? (
                      <ChevronDown size={14} />
                    ) : (
                      <ChevronRight size={14} />
                    )}
                    Price history
                  </button>

                  {expandedHistory.has(activeKey) ? (
                    <div className="mt-2 flex flex-col gap-2">
                      {(priceHistory[activeKey] ?? []).length === 0 ? (
                        <p className="text-xs text-slate-400">
                          No changes recorded yet.
                        </p>
                      ) : (
                        (priceHistory[activeKey] ?? []).map((entry, idx) => (
                          <div
                            key={idx}
                            className="rounded border border-slate-200 bg-slate-50 p-2 text-xs text-slate-600"
                          >
                            {format(new Date(entry.changedAt), "MMM dd, yyyy")}{" "}
                            - {entry.primaryUnitName} Php{" "}
                            {entry.previousPrice.toFixed(2)} to Php{" "}
                            {entry.nextPrice.toFixed(2)}
                          </div>
                        ))
                      )}
                    </div>
                  ) : null}
                </div>
              </div>

              {(() => {
                const draft = Number(
                  getDraftPrice(activeKey, activeRow.referenceSellingPrice),
                );
                const saved = getSavedPrice(
                  activeKey,
                  activeRow.referenceSellingPrice,
                );
                const canSave =
                  selectedKeys.has(activeKey) &&
                  !Number.isNaN(draft) &&
                  draft > 0 &&
                  draft !== saved;

                return (
                  <div className="border-t border-slate-200 px-5 py-3">
                    <button
                      className="w-full"
                      disabled={!canSave}
                      onClick={handleSavePrice}
                    >
                      <Save size={14} /> Save Purchase Price
                    </button>
                  </div>
                );
              })()}
            </>
          ) : (
            <div className="flex h-full items-center justify-center px-8 text-center text-sm text-slate-500">
              Select a product, choose a packaging preset, then open Set price
              to configure primary-unit purchase price.
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
