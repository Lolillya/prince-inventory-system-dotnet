import { useState, useMemo } from "react";
import {
  ChevronDown,
  ChevronRight,
  ExternalLink,
  ShoppingBag,
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
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

export const PurchasePriceBenchmarkModal = ({
  onClose,
}: PurchasePriceBenchmarkModalProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  // key: productId — which product cards are expanded
  const [expandedProducts, setExpandedProducts] = useState<
    Record<number, boolean>
  >({});
  // key: "productId:mainUnitId" — which primary-unit accordions are open
  const [expandedMainUnits, setExpandedMainUnits] = useState<
    Record<string, boolean>
  >({});
  // key: "productId:presetId" — active selection that drives the right panel
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [isSellingPricesOpen, setIsSellingPricesOpen] = useState(false);

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

  const toggleProduct = (productId: number) =>
    setExpandedProducts((prev) => ({ ...prev, [productId]: !prev[productId] }));

  const toggleMainUnit = (key: string) =>
    setExpandedMainUnits((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <section className="absolute left-0 top-0 z-50 flex h-full w-full items-center justify-center bg-black/40 p-4">
      <div className="relative flex h-[760px] w-[1300px] overflow-hidden rounded-xl border bg-white shadow-lg">
        {/* Close button */}
        <div
          className="absolute right-3 top-3 z-10 cursor-pointer rounded-md border border-slate-200 p-2 text-vesper-gray transition hover:bg-bellflower-gray"
          onClick={onClose}
          aria-label="Close benchmark modal"
        >
          <X size={18} />
        </div>

        {/* Left panel */}
        <div className="flex w-1/2 min-w-0 flex-col border-r border-slate-200">
          {/* Header */}
          <div className="border-b border-slate-200 px-5 py-6 pr-12">
            <h3 className="text-xl font-bold text-custom-black">
              Purchase Price Benchmark
            </h3>
            <p className="text-sm text-slate-500">
              Compare purchase prices across suppliers for the same product and
              packaging preset.
            </p>
          </div>

          {/* Search + Legend */}
          <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4">
            <div className="flex items-center gap-3 rounded-lg border border-slate-200 px-4 py-2.5">
              <ShoppingBag size={20} className="shrink-0 text-river-green" />
              <div className="flex w-full flex-col">
                <label className="text-sm font-semibold text-custom-black">
                  Product
                </label>
                <input
                  type="text"
                  placeholder="Search product..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full border-none bg-transparent p-0 text-sm text-slate-400 outline-none placeholder:text-slate-400"
                />
              </div>
            </div>
            <div className="flex items-center gap-5 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                All supplier prices profitable
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                At least one supplier price at loss
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
                const isProductOpen = !!expandedProducts[product.product_ID];
                return (
                  <div
                    key={product.product_ID}
                    className="rounded-lg border border-slate-200 bg-white p-3"
                  >
                    <div
                      className="flex w-full items-center gap-2 text-left"
                      onClick={() => toggleProduct(product.product_ID)}
                    >
                      {isProductOpen ? (
                        <ChevronDown
                          size={16}
                          className="shrink-0 text-slate-400"
                        />
                      ) : (
                        <ChevronRight
                          size={16}
                          className="shrink-0 text-slate-400"
                        />
                      )}
                      <span className="truncate text-sm font-bold text-custom-black">
                        {product.product_Name}
                      </span>
                      {product.category_Name ? (
                        <>
                          <span className="text-slate-400">·</span>
                          <span className="truncate text-sm text-slate-500">
                            {product.category_Name}
                          </span>
                        </>
                      ) : null}
                      <span className="ml-auto shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                        {product.presets.length} packaging preset
                        {product.presets.length !== 1 ? "s" : ""}
                      </span>
                    </div>

                    {isProductOpen && (
                      <div className="mt-2 flex flex-col gap-1.5">
                        {Array.from(presetGroups.entries()).map(
                          ([mainUnitId, group]) => {
                            const accordionKey = `${product.product_ID}:${mainUnitId}`;
                            const isOpen = !!expandedMainUnits[accordionKey];
                            return (
                              <div key={mainUnitId} className="">
                                <div
                                  className="flex items-center gap-1.5 rounded-md px-1.5 py-1.5 text-xs text-slate-600 transition hover:bg-slate-100 bg-white border border-slate-200 w-full text-left"
                                  onClick={() => toggleMainUnit(accordionKey)}
                                >
                                  {isOpen ? (
                                    <ChevronDown size={13} />
                                  ) : (
                                    <ChevronRight size={13} />
                                  )}
                                  <span className="font-semibold text-custom-black">
                                    {group.uomName}
                                  </span>
                                  <span className="text-slate-400">
                                    · {group.presets.length} packaging preset
                                    {group.presets.length !== 1 ? "s" : ""}
                                  </span>
                                </div>
                                {isOpen && (
                                  <div className="mt-1 flex flex-col min-w-0 overflow-hidden ">
                                    {group.presets.map((preset, index) => {
                                      const key = `${product.product_ID}:${preset.preset_ID}`;
                                      const isActive = activeKey === key;
                                      return (
                                        <div
                                          key={preset.preset_ID}
                                          className={`flex max-w-full w-full items-center justify-between gap-2 px-3 py-2.5 text-left text-xs transition cursor-pointer${
                                            index !== 0
                                              ? "border-t border-slate-200"
                                              : ""
                                          } ${
                                            isActive
                                              ? "border-l-2 border-l-blue-500 bg-blue-50"
                                              : "border-l-2 border-l-gray-300 hover:bg-slate-50"
                                          }`}
                                          onClick={() => {
                                            setActiveKey(key);
                                            setIsSellingPricesOpen(false);
                                          }}
                                        >
                                          <span
                                            className={`shrink-0 font-semibold ${
                                              isActive
                                                ? "text-blue-600"
                                                : "text-slate-400"
                                            }`}
                                          >
                                            [{preset.preset_Code}]
                                          </span>
                                          <span
                                            className="min-w-0 flex-1 truncate font-medium text-slate-600"
                                            title={formatPresetChain(preset)}
                                          >
                                            {formatPresetChain(preset)}
                                          </span>
                                          <span className="flex shrink-0 items-center gap-2">
                                            <span
                                              className={`h-2 w-2 rounded-full ${preset.has_loss ? "bg-red-500" : "bg-emerald-500"}`}
                                              title={
                                                preset.has_loss
                                                  ? "At least 1 price at a loss"
                                                  : "All prices profitable"
                                              }
                                            />
                                            <span className="text-slate-400">
                                              {preset.supplier_count} supplier
                                              {preset.supplier_count !== 1
                                                ? "s"
                                                : ""}{" "}
                                              priced
                                            </span>
                                            {isActive && (
                                              <ChevronRight
                                                size={13}
                                                className="text-blue-500"
                                              />
                                            )}
                                          </span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            );
                          },
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className="flex w-1/2 min-w-0 flex-col bg-custom-gray-lighter">
          {!activeKey || !activeProduct || !activePreset ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 px-8 text-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-slate-100">
                <TrendingUp className="text-slate-400" size={36} />
              </div>
              <p className="text-lg font-bold text-custom-black">
                No Benchmark Available
              </p>
              <p className="text-sm text-slate-500">
                Select a packaging preset to view purchase price benchmarks.
              </p>
            </div>
          ) : (
            <>
              {/* Right panel header */}
              <div className="flex items-start justify-between border-b border-slate-200 bg-white px-5 py-4.5">
                <div>
                  <h4 className="flex items-center gap-1.5 text-base font-bold text-custom-black">
                    {activeProduct.product_Name}
                    {activeProduct.category_Name ? (
                      <span className="text-sm font-normal text-slate-400">
                        · {activeProduct.category_Name}
                      </span>
                    ) : null}
                  </h4>
                  <p className="mt-1 text-sm">
                    <span className="font-semibold text-blue-600">
                      [{activePreset.preset_Code}]
                    </span>{" "}
                    <span className="text-slate-500">
                      {formatPresetChain(activePreset)}
                    </span>
                  </p>
                </div>
                <div
                  className="cursor-pointer rounded-md border border-slate-200 p-1.5 text-vesper-gray transition hover:bg-bellflower-gray"
                  onClick={() => setActiveKey(null)}
                  aria-label="Close benchmark detail"
                >
                  <X size={16} />
                </div>
              </div>

              {/* Table */}
              <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
                {detailLoading && (
                  <div className="flex h-full items-center justify-center text-sm text-slate-500">
                    Loading suppliers…
                  </div>
                )}

                {!detailLoading && presetDetail && (
                  <div className="flex flex-col gap-4">
                    {presetDetail.suppliers.length === 0 ? (
                      <div className="flex items-center justify-center rounded-lg border border-slate-200 bg-white py-10 text-sm text-slate-500">
                        No supplier prices set for this preset.
                      </div>
                    ) : (
                      <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
                        {/* Table header */}
                        <div className="grid grid-cols-[1.4fr_1fr_1fr_0.8fr_0.8fr] gap-2 border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-500">
                          <div>Supplier</div>
                          <div className="text-center">
                            Purchase Price
                            <br />
                            <span className="font-normal text-slate-400">
                              (
                              {(
                                presetDetail.main_Unit?.uom_Name ?? "MAIN UNIT"
                              ).toUpperCase()}
                              )
                            </span>
                          </div>
                          <div className="text-center">Last Update</div>
                          <div className="text-center">Profit / Loss</div>
                          <div className="text-center">Action</div>
                        </div>

                        {/* Rows */}
                        {presetDetail.suppliers.map((supplier) => (
                          <div
                            key={supplier.supplier_ID}
                            className="grid grid-cols-[1.4fr_1fr_1fr_0.8fr_0.8fr] items-center gap-2 border-b border-slate-200 px-4 py-3 text-sm last:border-0"
                          >
                            <div
                              className="truncate pr-2 text-custom-black text-xs font-semibold"
                              title={supplier.supplier_Name}
                            >
                              {supplier.supplier_Name}
                            </div>
                            <div className="text-center text-slate-600">
                              ₱{formatPhp(supplier.price_Per_Unit)}
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
                            <div className="flex justify-center">
                              <button className="flex w-fit items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-custom-black hover:bg-slate-50">
                                Open
                                <ExternalLink size={12} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Selling Prices by Level (Global) */}
                    <div className="rounded-lg border border-slate-200 bg-white">
                      <div
                        className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-semibold text-custom-black"
                        onClick={() => setIsSellingPricesOpen((prev) => !prev)}
                      >
                        {isSellingPricesOpen ? (
                          <ChevronDown size={16} />
                        ) : (
                          <ChevronRight size={16} />
                        )}
                        Selling Prices by Level (Global)
                      </div>

                      {isSellingPricesOpen && (
                        <div className="flex flex-col gap-2 border-t border-slate-200 px-4 py-3 text-xs text-slate-600">
                          {[...presetDetail.preset_Levels]
                            .sort((a, b) => a.level - b.level)
                            .map((lvl) => (
                              <div
                                key={lvl.level_ID}
                                className="flex items-center gap-2"
                              >
                                <span className="w-32 font-medium text-custom-black">
                                  {lvl.unit?.uom_Name ?? `UOM ${lvl.uoM_ID}`}
                                  {lvl.uoM_ID === presetDetail.main_Unit_ID ? (
                                    <span className="ml-1 rounded-full bg-blue-100 px-1.5 py-0.5 text-[10px] font-semibold text-blue-600">
                                      primary
                                    </span>
                                  ) : null}
                                </span>
                                <span className="font-medium">
                                  ₱{formatPhp(lvl.selling_Price)}
                                </span>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
};
