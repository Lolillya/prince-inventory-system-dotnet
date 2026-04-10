import { useState, useMemo } from "react";
import {
  ChevronDown,
  ChevronRight,
  Search,
  TrendingDown,
  TrendingUp,
  X,
} from "lucide-react";
import { useBenchmarkOverviewQuery } from "@/features/suppliers/supplier-benchmark/get-benchmark-overview.query";
import { useBenchmarkPresetSuppliersQuery } from "@/features/suppliers/supplier-benchmark/get-benchmark-preset-suppliers.query";
import { BenchmarkPresetItem } from "@/features/suppliers/supplier-benchmark/supplier-benchmark.model";

interface PurchasePriceBenchmarkModalProps {
  onClose: () => void;
}

const formatPhp = (value: number) =>
  value.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const formatDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString("en-PH", {
    month: "2-digit",
    day: "2-digit",
    year: "2-digit",
  });
};

export const PurchasePriceBenchmarkModal = ({
  onClose,
}: PurchasePriceBenchmarkModalProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  // key: "productId:mainUnitId" — which primary-unit accordions are open
  const [expandedMainUnits, setExpandedMainUnits] = useState<
    Record<string, boolean>
  >({});
  // key: "productId:presetId" — active selection that drives the right panel
  const [activeKey, setActiveKey] = useState<string | null>(null);
  // key: supplierId — which supplier detail rows are expanded
  const [expandedSuppliers, setExpandedSuppliers] = useState<
    Record<string, boolean>
  >({});

  const { data: products, isLoading: overviewLoading } =
    useBenchmarkOverviewQuery();

  const [activeProductId, activePresetId] = useMemo(() => {
    if (!activeKey) return [null, null];
    const parts = activeKey.split(":");
    return [Number(parts[0]), Number(parts[1])];
  }, [activeKey]);

  const { data: presetDetail, isLoading: detailLoading } =
    useBenchmarkPresetSuppliersQuery(activeProductId, activePresetId);

  const activeProduct = useMemo(
    () => products?.find((p) => p.product_ID === activeProductId) ?? null,
    [products, activeProductId],
  );

  const activePreset = useMemo(
    () =>
      activeProduct?.presets.find((p) => p.preset_ID === activePresetId) ??
      null,
    [activeProduct, activePresetId],
  );

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    const q = searchQuery.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => p.product_Name.toLowerCase().includes(q));
  }, [products, searchQuery]);

  // Group presets by main_Unit_ID within a product
  const groupPresetsByMainUnit = (presets: BenchmarkPresetItem[]) => {
    const map = new Map<
      number,
      { uomName: string; presets: BenchmarkPresetItem[] }
    >();
    for (const p of presets) {
      const id = p.main_Unit_ID;
      if (!map.has(id)) {
        map.set(id, {
          uomName: p.main_Unit?.uom_Name ?? `UOM ${id}`,
          presets: [],
        });
      }
      map.get(id)!.presets.push(p);
    }
    return map;
  };

  const formatPresetChain = (preset: BenchmarkPresetItem): string => {
    const levels = [...preset.preset_Levels].sort((a, b) => a.level - b.level);
    return levels
      .map((lvl) => {
        const name = (lvl.unit?.uom_Name ?? `UOM ${lvl.uoM_ID}`).toUpperCase();
        return lvl.uoM_ID === preset.main_Unit_ID
          ? name
          : `${name} (${lvl.conversion_Factor}x)`;
      })
      .join(" > ");
  };

  const toggleMainUnit = (key: string) =>
    setExpandedMainUnits((prev) => ({ ...prev, [key]: !prev[key] }));

  const toggleSupplier = (supplierId: string) =>
    setExpandedSuppliers((prev) => ({
      ...prev,
      [supplierId]: !prev[supplierId],
    }));

  return (
    <section className="absolute left-0 top-0 z-50 flex h-full w-full items-center justify-center bg-black/40 p-4">
      <div
        className={`transition-all duration-300 relative flex h-[760px] overflow-hidden rounded-xl border bg-white shadow-lg ${activeKey ? "w-[1200px]" : "w-[860px]"}`}
      >
        {/* Close button */}
        <div
          className="absolute right-3 top-3 z-10 cursor-pointer rounded-md p-3 text-vesper-gray transition hover:bg-bellflower-gray"
          onClick={onClose}
          aria-label="Close benchmark modal"
        >
          <X size={18} />
        </div>

        {/* Left panel */}
        <div
          className={`flex min-w-0 flex-col border-r border-slate-200 transition-all duration-300 ${activeKey ? "w-1/2" : "w-full"}`}
        >
          {/* Header */}
          <div className="border-b border-slate-200 px-5 py-4 pr-12">
            <h3 className="text-lg font-semibold text-vesper-gray">
              Purchase Price Benchmark
            </h3>
            <p className="text-sm text-slate-500">
              Compare purchase prices for the same product across all suppliers.
            </p>
          </div>

          {/* Search + Legend */}
          <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-3">
            <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2">
              <Search size={14} className="shrink-0 text-slate-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-sm text-vesper-gray outline-none placeholder:text-slate-400"
              />
            </div>
            <div className="flex items-center gap-5 text-xs text-slate-500">
              <span className="font-medium">Legend:</span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                All prices profitable
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                At least 1 price at a loss
              </span>
            </div>
          </div>

          {/* Product list */}
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
            {overviewLoading && (
              <div className="flex h-full items-center justify-center text-sm text-slate-500">
                Loading products…
              </div>
            )}
            {!overviewLoading &&
              (!filteredProducts || filteredProducts.length === 0) && (
                <div className="flex h-full items-center justify-center text-sm text-slate-500">
                  No products with benchmark data found.
                </div>
              )}
            <div className="flex flex-col gap-2 w-full">
              {filteredProducts?.map((product) => {
                const presetGroups = groupPresetsByMainUnit(product.presets);
                return (
                  <div
                    key={product.product_ID}
                    className="rounded-lg border border-slate-200 bg-white p-3"
                  >
                    <p className="truncate text-sm font-semibold text-vesper-gray">
                      {product.product_Name}
                    </p>
                    <div className="mt-2 flex flex-col gap-1.5">
                      {Array.from(presetGroups.entries()).map(
                        ([mainUnitId, group]) => {
                          const accordionKey = `${product.product_ID}:${mainUnitId}`;
                          const isOpen = !!expandedMainUnits[accordionKey];
                          return (
                            <div key={mainUnitId}>
                              <button
                                className="flex items-center gap-1.5 rounded-md px-1.5 py-1 text-xs text-slate-600 transition hover:bg-slate-100 bg-white border"
                                onClick={() => toggleMainUnit(accordionKey)}
                              >
                                {isOpen ? (
                                  <ChevronDown size={13} />
                                ) : (
                                  <ChevronRight size={13} />
                                )}
                                <span className="w-full">
                                  Primary Unit:{" "}
                                  <span className="font-semibold text-vesper-gray">
                                    {group.uomName}
                                  </span>
                                </span>
                              </button>
                              {isOpen && (
                                <div className="ml-5 mt-1 flex flex-col gap-1 border-l border-slate-200 pl-3 min-w-0 overflow-hidden">
                                  {group.presets.map((preset) => {
                                    const key = `${product.product_ID}:${preset.preset_ID}`;
                                    const isActive = activeKey === key;
                                    return (
                                      <button
                                        key={preset.preset_ID}
                                        className={`flex max-w-full w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-xs transition ${
                                          isActive
                                            ? "bg-blue-50 text-blue-700"
                                            : "text-slate-600 hover:bg-slate-100"
                                        }`}
                                        onClick={() => {
                                          setActiveKey(key);
                                          setExpandedSuppliers({});
                                        }}
                                      >
                                        <span
                                          className="truncate font-medium"
                                          title={formatPresetChain(preset)}
                                        >
                                          {formatPresetChain(preset)}
                                        </span>
                                        <span className="mr-3 flex shrink-0 items-center gap-2">
                                          <span className="text-slate-400">
                                            {preset.supplier_count} supplier
                                            {preset.supplier_count !== 1
                                              ? "s"
                                              : ""}
                                          </span>
                                          <span
                                            className={`h-2 w-2 rounded-full ${preset.has_loss ? "bg-red-500" : "bg-emerald-500"}`}
                                            title={
                                              preset.has_loss
                                                ? "At least 1 price at a loss"
                                                : "All prices profitable"
                                            }
                                          />
                                        </span>
                                      </button>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        },
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right panel */}
        {activeKey && (
          <div className="relative flex w-1/2 min-w-0 flex-col">
            <div className="absolute left-0 top-0 h-full w-[3px] bg-blue-400" />

            {/* Right panel header */}
            {activeProduct && activePreset ? (
              <div className="border-b border-slate-200 px-5 py-4">
                <p className="text-xs text-slate-500">Benchmark Detail</p>
                <h4 className="text-base font-semibold text-vesper-gray">
                  {activeProduct.product_Name}
                </h4>
                <p className="text-sm text-slate-500">
                  {activePreset.preset_Name} · Primary unit:{" "}
                  {activePreset.main_Unit?.uom_Name ??
                    `UOM ${activePreset.main_Unit_ID}`}
                </p>
              </div>
            ) : (
              <div className="border-b border-slate-200 px-5 py-4">
                <p className="text-xs text-slate-500">Benchmark Detail</p>
              </div>
            )}

            {/* Table */}
            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
              {detailLoading && (
                <div className="flex h-full items-center justify-center text-sm text-slate-500">
                  Loading suppliers…
                </div>
              )}

              {!detailLoading && presetDetail && (
                <>
                  {presetDetail.suppliers.length === 0 ? (
                    <div className="flex h-full items-center justify-center text-sm text-slate-500">
                      No supplier prices set for this preset.
                    </div>
                  ) : (
                    <div className="rounded-lg border border-slate-200 overflow-hidden">
                      {/* Table header */}
                      <div className="grid grid-cols-4 border-b border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-500">
                        <div>Supplier</div>
                        <div className="text-center">
                          Purchase Price
                          <span className="ml-1 font-normal text-slate-400">
                            ({presetDetail.main_Unit?.uom_Name ?? "Unit"})
                          </span>
                        </div>
                        <div className="text-center">Last Update</div>
                        <div className="text-center">Profit / Loss</div>
                      </div>

                      {/* Rows */}
                      {presetDetail.suppliers.map((supplier) => {
                        const isExpanded =
                          !!expandedSuppliers[supplier.supplier_ID];
                        const subLevels = presetDetail.preset_Levels.filter(
                          (lvl) => lvl.uoM_ID !== presetDetail.main_Unit_ID,
                        );
                        const mainLevel = presetDetail.preset_Levels.find(
                          (lvl) => lvl.uoM_ID === presetDetail.main_Unit_ID,
                        );

                        return (
                          <div
                            key={supplier.supplier_ID}
                            className="border-b border-slate-200 last:border-0"
                          >
                            {/* Main row */}
                            <div className="grid grid-cols-4 items-center px-4 py-3 text-sm hover:bg-slate-50/60 transition">
                              <div
                                className="truncate pr-2 font-medium text-vesper-gray"
                                title={supplier.supplier_Name}
                              >
                                {supplier.supplier_Name}
                              </div>
                              <div className="text-center text-vesper-gray">
                                Php {formatPhp(supplier.price_Per_Unit)}
                              </div>
                              <div className="text-center text-slate-500">
                                {formatDate(supplier.updated_At)}
                              </div>
                              <div className="flex items-center justify-center gap-1.5">
                                {supplier.is_loss ? (
                                  <TrendingDown
                                    size={13}
                                    className="text-red-500"
                                  />
                                ) : (
                                  <TrendingUp
                                    size={13}
                                    className="text-emerald-500"
                                  />
                                )}
                                <span
                                  className={`text-xs font-semibold ${supplier.is_loss ? "text-red-600" : "text-emerald-600"}`}
                                >
                                  {supplier.is_loss ? "Loss" : "Profit"}
                                </span>
                              </div>
                            </div>

                            {/* Expandable details toggle */}
                            <div className="px-4 pb-2">
                              <button
                                className="flex items-center gap-1 rounded-md px-1.5 py-1 text-xs text-slate-500 transition hover:bg-slate-100"
                                onClick={() =>
                                  toggleSupplier(supplier.supplier_ID)
                                }
                              >
                                {isExpanded ? (
                                  <ChevronDown size={12} />
                                ) : (
                                  <ChevronRight size={12} />
                                )}
                                <span className="font-medium">
                                  View unit breakdown
                                </span>
                              </button>

                              {isExpanded && (
                                <div className="mt-3 flex gap-10 pl-4 text-xs">
                                  {/* Sub-unit Purchase Prices */}
                                  {/* {subLevels.length > 0 && (
                                    <div className="flex flex-col gap-2">
                                      <p className="border-b border-slate-200 pb-1 font-semibold text-vesper-gray">
                                        Sub-unit Purchase Prices
                                      </p>
                                      <div className="flex flex-col gap-1.5 text-slate-600">
                                        {subLevels.map((lvl) => {
                                          const derivedPrice =
                                            lvl.conversion_Factor > 0
                                              ? supplier.price_Per_Unit /
                                                lvl.conversion_Factor
                                              : 0;
                                          const subIsLoss =
                                            derivedPrice >= lvl.selling_Price;
                                          return (
                                            <div
                                              key={lvl.level_ID}
                                              className="flex items-center gap-2"
                                            >
                                              <span className="w-32 text-slate-500">
                                                └─{" "}
                                                {lvl.unit?.uom_Name ??
                                                  `UOM ${lvl.uoM_ID}`}
                                                <span className="ml-1 text-slate-400">
                                                  (×{lvl.conversion_Factor})
                                                </span>
                                              </span>
                                              <span className="font-medium">
                                                Php {formatPhp(derivedPrice)}
                                              </span>
                                              <span
                                                className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-semibold ${subIsLoss ? "bg-red-100 text-red-600" : "bg-emerald-100 text-emerald-600"}`}
                                              >
                                                {subIsLoss ? (
                                                  <TrendingDown size={9} />
                                                ) : (
                                                  <TrendingUp size={9} />
                                                )}
                                              </span>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  )} */}

                                  {/* Selling Prices */}
                                  <div className="flex flex-col gap-2">
                                    <p className="border-b border-slate-200 pb-1 font-semibold text-vesper-gray">
                                      Selling Prices (Global)
                                    </p>
                                    <div className="flex flex-col gap-1.5 text-slate-600">
                                      {mainLevel && (
                                        <div className="flex items-center gap-2">
                                          <span className="w-28 font-medium text-vesper-gray">
                                            {presetDetail.main_Unit?.uom_Name ??
                                              `UOM ${presetDetail.main_Unit_ID}`}
                                            <span className="ml-1 rounded-full bg-blue-100 px-1.5 py-0.5 text-[10px] font-semibold text-blue-600">
                                              primary
                                            </span>
                                          </span>
                                          <span className="font-medium">
                                            Php{" "}
                                            {formatPhp(mainLevel.selling_Price)}
                                          </span>
                                        </div>
                                      )}
                                      {subLevels.map((lvl) => (
                                        <div
                                          key={lvl.level_ID}
                                          className="flex items-center gap-2"
                                        >
                                          <span className="w-28 text-slate-500">
                                            └─{" "}
                                            {lvl.unit?.uom_Name ??
                                              `UOM ${lvl.uoM_ID}`}
                                          </span>
                                          <span className="font-medium">
                                            Php {formatPhp(lvl.selling_Price)}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
