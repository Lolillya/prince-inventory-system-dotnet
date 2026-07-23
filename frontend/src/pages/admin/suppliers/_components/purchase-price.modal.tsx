import { SupplierDataModel } from "@/features/suppliers/get-all-suppliers.model";
import { useProductsWithPresetsQuery } from "@/features/suppliers/supplier-purchase-prices/get-products-with-presets.query";
import { useSupplierPurchasePricesQuery } from "@/features/suppliers/supplier-purchase-prices/get-supplier-purchase-prices.query";
import { useSupplierPurchasePriceHistoryQuery } from "@/features/suppliers/supplier-purchase-prices/get-supplier-purchase-price-history.query";
import { useUpsertSupplierPurchasePricesMutation } from "@/features/suppliers/supplier-purchase-prices/upsert-supplier-purchase-prices.service";
import { useRemoveSupplierPurchasePriceMutation } from "@/features/suppliers/supplier-purchase-prices/remove-supplier-purchase-price.service";
import { ProductWithPresetItem } from "@/features/suppliers/supplier-purchase-prices/supplier-purchase-prices.model";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  ChevronDown,
  ChevronRight,
  Handbag,
  Info,
  Layers,
  PhilippinePeso,
  Save,
  SearchIcon,
  TrendingDown,
  TrendingUp,
  UserRound,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

interface PurchasePriceModalProps {
  handlePurchasePrice: () => void;
  selectedSupplier: SupplierDataModel | null;
}

type StatusFilter = "all" | "complete" | "partial" | "none";

export const PurchasePriceModal = ({
  handlePurchasePrice,
  selectedSupplier,
}: PurchasePriceModalProps) => {
  const supplierId = selectedSupplier?.supplier_Id ?? null;
  const queryClient = useQueryClient();

  const { data: products = [], isLoading: productsLoading } =
    useProductsWithPresetsQuery();
  const { data: savedPrices = [] } = useSupplierPurchasePricesQuery(supplierId);
  const upsertMutation = useUpsertSupplierPurchasePricesMutation(
    supplierId ?? "",
  );
  const removeMutation = useRemoveSupplierPurchasePriceMutation(
    supplierId ?? "",
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [expandedProductId, setExpandedProductId] = useState<number | null>(
    null,
  );
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [expandedGlobalPrices, setExpandedGlobalPrices] = useState<Set<string>>(
    new Set(),
  );
  const [isAuditLogOpen, setIsAuditLogOpen] = useState(false);
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

  const getKey = (productId: number, presetId: number) =>
    `${productId}:${presetId}`;

  const toggleExpand = (productId: number) => {
    setExpandedProductId((prev) => (prev === productId ? null : productId));
  };

  const handleSelectPreset = (productId: number, presetId: number) => {
    const key = getKey(productId, presetId);
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      const prefix = `${productId}:`;
      Array.from(next).forEach((k) => {
        if (k.startsWith(prefix) && k !== key) next.delete(k);
      });
      next.add(key);
      return next;
    });
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

  const buildUnitChain = (preset: ProductWithPresetItem) => {
    const levels = [...preset.preset_Levels].sort((a, b) => a.level - b.level);
    if (levels.length === 0) return preset.main_Unit?.uom_Name ?? "Unit";
    return levels
      .map((lvl) => {
        const name = lvl.unit?.uom_Name ?? `UOM ${lvl.uoM_ID}`;
        return lvl.conversion_Factor !== 1
          ? `${name} (${lvl.conversion_Factor}x)`
          : name;
      })
      .join(" > ");
  };

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

  const { data: history = [] } = useSupplierPurchasePriceHistoryQuery(
    supplierId,
    activeProduct?.product_ID ?? null,
    activePreset?.preset_ID ?? null,
  );

  useEffect(() => {
    setIsAuditLogOpen(false);
  }, [activeKey]);

  const activeSavedPrice = activeKey ? savedPriceMap.get(activeKey) : undefined;

  const draftNum = Number(draftPrice);
  const isDraftValid =
    draftPrice !== "" && !Number.isNaN(draftNum) && draftNum > 0;
  const sellingPrice = activePreset?.main_Unit_Selling_Price ?? 0;
  const isProfit = isDraftValid && draftNum < sellingPrice;

  const isRevertAction = draftPrice === "" && activeSavedPrice !== undefined;

  const canSave =
    !!activeKey &&
    selectedKeys.has(activeKey) &&
    (isRevertAction ||
      (isDraftValid && draftNum !== (activeSavedPrice ?? -1)));

  const handleSavePrice = async () => {
    if (!activeKey || !activeProduct || !activePreset) return;
    if (!selectedKeys.has(activeKey)) {
      toast.error("Select this preset first before saving a price");
      return;
    }

    if (isRevertAction) {
      await removeMutation.mutateAsync({
        product_ID: activeProduct.product_ID,
        preset_ID: activePreset.preset_ID,
      });
      await queryClient.invalidateQueries({
        queryKey: [
          "supplier-purchase-price-history",
          supplierId,
          activeProduct.product_ID,
          activePreset.preset_ID,
        ],
      });
      toast.success("Purchase price reverted to unconfigured");
      handlePurchasePrice();
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
    await queryClient.invalidateQueries({
      queryKey: [
        "supplier-purchase-price-history",
        supplierId,
        activeProduct.product_ID,
        activePreset.preset_ID,
      ],
    });
    toast.success("Purchase price saved");
    handlePurchasePrice();
  };

  const getConfiguredCount = (product: (typeof products)[number]) =>
    product.presets.filter((p) =>
      savedPriceMap.has(getKey(product.product_ID, p.preset_ID)),
    ).length;

  const sortedProducts = useMemo(() => {
    return [...products].sort((a, b) => {
      const aSelected = a.presets.some((p) =>
        selectedKeys.has(getKey(a.product_ID, p.preset_ID)),
      );
      const bSelected = b.presets.some((p) =>
        selectedKeys.has(getKey(b.product_ID, p.preset_ID)),
      );
      if (aSelected === bSelected)
        return a.product_Name.localeCompare(b.product_Name);
      return aSelected ? -1 : 1;
    });
  }, [products, selectedKeys]);

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return sortedProducts.filter((product) => {
      const matchesQuery =
        !query ||
        product.product_Name.toLowerCase().includes(query) ||
        product.product_Code.toLowerCase().includes(query);
      if (!matchesQuery) return false;

      if (statusFilter === "all") return true;

      const configuredCount = getConfiguredCount(product);
      const total = product.presets.length;

      if (statusFilter === "complete")
        return total > 0 && configuredCount === total;
      if (statusFilter === "none") return configuredCount === 0;
      return configuredCount > 0 && configuredCount < total;
    });
  }, [sortedProducts, searchQuery, statusFilter, savedPriceMap]);

  return (
    <section className="absolute left-0 top-0 z-50 flex h-full w-full items-center justify-center bg-black/40 p-4">
      <div className="relative flex h-[760px] w-[1300px] gap-0 overflow-hidden rounded-xl border bg-white shadow-lg">
        <div
          className="absolute right-3 top-3 z-10 rounded-md text-vesper-gray hover:bg-bellflower-gray p-3 cursor-pointer transition"
          onClick={handlePurchasePrice}
          aria-label="Close purchase price modal"
        >
          <X size={18} />
        </div>

        {/* Left panel — Product list */}
        <div className="flex w-8/12 min-w-0 flex-col border-r border-slate-200">
          <div className="border-b border-slate-200 px-5 py-4 gap-2 flex flex-col">
            <h3 className="text-lg font-semibold text-vesper-gray">
              Supplier Purchase Prices
            </h3>

            <p className="text-sm text-slate-500">
              Supplier:{" "}
              {selectedSupplier?.company_Name ?? "No supplier selected"}
            </p>

            <div className="flex items-center gap-2">
              <div className="relative w-full">
                <input
                  placeholder="Search..."
                  className="input-style-2"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <i className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <SearchIcon />
                </i>
              </div>
              <div className="relative flex items-center shrink-0 w-1/2">
                <Layers className="absolute left-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
                <select
                  className="w-full text-sm border rounded-lg pl-8 pr-3 py-3 outline-none focus:ring-2 focus:ring-blue-200 bg-white appearance-none cursor-pointer"
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(e.target.value as StatusFilter)
                  }
                >
                  <option value="all">All Statuses</option>
                  <option value="complete">Complete</option>
                  <option value="partial">Partial</option>
                  <option value="none">Not Configured</option>
                </select>
              </div>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4 py-3">
            {productsLoading ? (
              <div className="flex h-full items-center justify-center text-sm text-slate-500">
                Loading products…
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-slate-500">
                No products with packaging presets found.
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {filteredProducts.map((product) => {
                  const isExpanded = expandedProductId === product.product_ID;
                  const configuredCount = getConfiguredCount(product);

                  return (
                    <div
                      key={product.product_ID}
                      className="flex flex-col border rounded-md overflow-hidden"
                    >
                      <div
                        className="flex w-full justify-between p-2 cursor-pointer hover:bg-slate-50 transition"
                        onClick={() => toggleExpand(product.product_ID)}
                      >
                        <div className="flex items-center gap-2 text-sm w-full">
                          {isExpanded ? <ChevronDown /> : <ChevronRight />}
                          <label className="font-semibold cursor-pointer">
                            {product.product_Name}
                          </label>
                          {product.category_Name ? (
                            <>
                              <span>•</span>
                              <span className="text-vesper-gray font-semibold">
                                {product.category_Name}
                              </span>
                            </>
                          ) : null}
                        </div>
                        <label className="font-semibold text-sm text-vesper-gray text-nowrap cursor-pointer">
                          {configuredCount} of {product.presets.length}{" "}
                          Configured
                        </label>
                      </div>

                      {isExpanded
                        ? product.presets.map((preset) => {
                            const key = getKey(
                              product.product_ID,
                              preset.preset_ID,
                            );
                            const isSelected = selectedKeys.has(key);
                            const savedPrice = savedPriceMap.get(key);
                            const isConfigured = savedPrice !== undefined;
                            const hasPendingChange = key === activeKey && canSave;

                            return (
                              <div
                                key={preset.preset_ID}
                                className={`flex gap-2 items-center border-t p-2 cursor-pointer transition border-l-2 ${
                                  isConfigured
                                    ? "border-l-emerald-500"
                                    : isSelected
                                      ? "border-l-blue-500"
                                      : "border-l-transparent"
                                } ${
                                  hasPendingChange
                                    ? "bg-yellow-50"
                                    : isSelected
                                      ? "bg-blue-50"
                                      : "hover:bg-slate-50"
                                }`}
                                onClick={() =>
                                  handleSelectPreset(
                                    product.product_ID,
                                    preset.preset_ID,
                                  )
                                }
                              >
                                <div
                                  className={`rounded-full w-2 h-2 ml-10 shrink-0 ${
                                    isConfigured
                                      ? "bg-emerald-500"
                                      : isSelected
                                        ? "bg-blue-500"
                                        : "bg-gray-400"
                                  }`}
                                />
                                <label className="text-sm font-semibold text-vesper-gray text-nowrap cursor-pointer">
                                  [{preset.preset_Code}]
                                </label>
                                <span className="font-semibold text-sm flex-1 cursor-pointer">
                                  {buildUnitChain(preset)}
                                </span>

                                {savedPrice !== undefined
                                  ? (() => {
                                      const rowIsProfit =
                                        savedPrice <
                                        preset.main_Unit_Selling_Price;
                                      return (
                                        <span
                                          className={`text-xs font-semibold text-nowrap flex items-center gap-2 rounded-full p-1 px-2 ${
                                            rowIsProfit
                                              ? "text-emerald-600 bg-emerald-100"
                                              : "text-red-600 bg-red-100"
                                          }`}
                                        >
                                          <PhilippinePeso size={12} />{" "}
                                          {formatPhp(savedPrice)}
                                          {rowIsProfit ? (
                                            <TrendingUp size={18} />
                                          ) : (
                                            <TrendingDown size={18} />
                                          )}
                                          {rowIsProfit ? "Profit" : "Loss"}
                                        </span>
                                      );
                                    })()
                                  : null}
                              </div>
                            );
                          })
                        : null}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          <div className="mb-5 item-center justify-center w-full flex">
            <div className="bg-blue-50 flex gap-2 p-2 rounded-md">
              <Info size={18} className="text-blue-500" />
              <span className="text-xs">
                Once a purchase price is set, the product with the assigned
                preset will be available in Generate Purchase Order for this
                supplier only.
              </span>
            </div>
          </div>
        </div>

        {/* Right panel — Pricing */}
        <div
          className={`relative flex w-5/12 min-w-0 flex-col ${
            canSave
              ? "bg-yellow-50"
              : activeSavedPrice !== undefined
                ? "bg-green-50"
                : ""
          }`}
        >
          {activeKey && activeProduct && activePreset ? (
            <>
              <div
                className={`absolute left-0 top-0 h-full w-[3px] ${
                  canSave
                    ? "bg-yellow-400"
                    : activeSavedPrice !== undefined
                      ? "bg-emerald-400"
                      : "bg-blue-400"
                }`}
              />

              <div className="border-b border-slate-200 px-5 py-4">
                <h4 className="text-base font-semibold text-vesper-gray">
                  {activeProduct.product_Name}
                </h4>
                <p className="text-sm text-slate-500">
                  {activePreset.preset_Code} · {buildUnitChain(activePreset)}
                </p>
                {history[0] ? (
                  <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                    <UserRound size={12} />
                    Last updated by{" "}
                    <span className="font-semibold text-vesper-gray">
                      {history[0].userName}
                    </span>{" "}
                    on{" "}
                    {format(
                      new Date(history[0].createdAt),
                      "MMM d, yyyy h:mm a",
                    )}
                  </p>
                ) : null}
              </div>

              <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-5 py-4">
                <div className="rounded-lg border border-slate-200 p-3 space-y-3">
                  <label className="text-xs font-semibold text-slate-500">
                    Purchase Price — Primary Unit (Required)
                  </label>

                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-500">
                      {activePreset.main_Unit?.uom_Name ?? "Unit"}
                    </span>
                    <div className="flex items-center bg-slate-50 rounded-md">
                      <div className="px-2">
                        <PhilippinePeso size={14} className="" />
                      </div>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        className="input-style-3 w-full rounded-l-none"
                        placeholder="0.00"
                        value={draftPrice}
                        onChange={(e) => setDraftPrice(e.target.value)}
                      />
                    </div>
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
                        <TrendingDown size={18} />
                      )}
                      {isProfit ? "Profit" : "Loss"} — purchase{" "}
                      <PhilippinePeso size={12} />
                      {formatPhp(draftNum)} vs sell <PhilippinePeso size={12} />
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

                <div className="flex flex-col border rounded-md overflow-hidden">
                  <div
                    className="flex p-2 justify-between items-center cursor-pointer hover:bg-slate-50 transition"
                    onClick={() => setIsAuditLogOpen((prev) => !prev)}
                  >
                    <div className="flex gap-2 items-center font-semibold">
                      <span className="text-sm">Audit Log</span>
                      <span className="text-xs text-vesper-gray">
                        ({history.length} recent change
                        {history.length === 1 ? "" : "s"})
                      </span>
                    </div>

                    {isAuditLogOpen ? (
                      <ChevronDown size={18} />
                    ) : (
                      <ChevronRight size={18} />
                    )}
                  </div>

                  {isAuditLogOpen ? (
                    <div className="border-t overflow-x-auto">
                      {history.length === 0 ? (
                        <p className="p-3 text-xs text-slate-400">
                          No pricing changes recorded yet.
                        </p>
                      ) : (
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="border-b bg-slate-50 text-left text-vesper-gray">
                              <th className="p-2 font-semibold text-nowrap">
                                Date &amp; Time
                              </th>
                              <th className="p-2 font-semibold text-nowrap">
                                User
                              </th>
                              <th className="p-2 font-semibold">Changes</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y ">
                            {history.map((log) => (
                              <tr key={log.auditLog_ID}>
                                <td className="p-2 align-middle text-slate-500 text-nowrap">
                                  {format(
                                    new Date(log.createdAt),
                                    "MMM d, yyyy h:mm a",
                                  )}
                                </td>
                                <td className="p-2 align-middle">
                                  <div className="flex items-center gap-2">
                                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-500 text-[10px] font-semibold text-white">
                                      {log.userName.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="font-semibold text-vesper-gray text-nowrap">
                                      {log.userName}
                                    </span>
                                  </div>
                                </td>
                                <td className="p-2 align-middle text-slate-500">
                                  {log.fieldName ?? "Purchase Price"}{" "}
                                  {log.action === "SUPPLIER_PRICE_REMOVED"
                                    ? `P ${log.oldValue} → Unconfigured`
                                    : log.oldValue
                                      ? `P ${log.oldValue} → P ${log.newValue}`
                                      : `set to P ${log.newValue}`}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="border-t border-slate-200 px-5 py-3 w-full justify-end flex">
                <button
                  className="w-full max-w-fit flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                  disabled={
                    !canSave || upsertMutation.isPending || removeMutation.isPending
                  }
                  onClick={handleSavePrice}
                >
                  <Save size={18} />
                  {upsertMutation.isPending || removeMutation.isPending
                    ? "Saving…"
                    : isRevertAction
                      ? "Revert to Unconfigured"
                      : "Save Purchase Price"}
                </button>
              </div>
            </>
          ) : (
            <div className="flex  h-full items-center justify-center px-8 text-center text-sm text-slate-500 bg-gray-200">
              <div className="flex flex-col bg-gray-50 items-center p-8 gap-5">
                <div className="rounded-full bg-slate-50 p-10 w-fit">
                  <Handbag size={100} />
                </div>
                <label className="text-xl font-semibold">
                  No Product-Preset Selected Yet
                </label>
                <label className="text-nowrap">
                  Select a product-preset to view and set the pruchase price.
                </label>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
