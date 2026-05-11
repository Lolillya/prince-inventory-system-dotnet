import { Activity, useState } from "react";
import { SearchIcon, XIcon } from "@/icons";
import {
  ArrowRight,
  CheckIcon,
  ChevronDown,
  ChevronUp,
  CircleAlert,
  Layers,
  PhilippinePeso,
} from "lucide-react";
import { UseInventoryQuery } from "@/features/inventory/get-inventory.query";
import { InventoryProductModel } from "@/features/inventory/models/inventory.model";
import { updatePresetPricing } from "@/features/unit-of-measure/update-preset-pricing/update-preset-pricing.service";
import { toast } from "sonner";
import {
  ProductPackagingPricingModal,
  ProductPackagingPricingData,
} from "./product-packaging-pricing.modal";
import { Separator } from "@/components/separator";
import { useUnitPresetQuery } from "@/features/unit-of-measure/get-unit-presets/get-unit-presets.state";
import { UnitPresetLevel } from "@/features/unit-of-measure/get-unit-presets/get-unit-presets.model";
import { assignProductsToPreset } from "@/features/unit-of-measure/assign-product-to-preset/assign-product.service";
import { editProductService } from "@/features/inventory/edit-product/edit-product.service";
import { useProductAuditLogQuery } from "@/features/inventory/audit-log/audit-log.query";

type UnitPreset = InventoryProductModel["unitPresets"][number];

interface ProductPackagingModalProps {
  onClose: () => void;
}

export const ProductPackagingModal = ({
  onClose,
}: ProductPackagingModalProps) => {
  const { data: inventory, refetch } = UseInventoryQuery();
  const [viewingProduct, setViewingProduct] =
    useState<InventoryProductModel | null>(null);
  const [selectedPresetIds, setSelectedPresetIds] = useState<number[]>([]);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const [pricingFilter, setPricingFilter] = useState<
    "any" | "priced" | "unpriced"
  >("any");
  const [presetSearch, setPresetSearch] = useState("");
  const [newlySelectedPresetIds, setNewlySelectedPresetIds] = useState<
    number[]
  >([]);
  const [isPricingAssignOpen, setIsPricingAssignOpen] = useState(false);
  const [activePricingPresetId, setActivePricingPresetId] = useState<
    number | null
  >(null);
  const [pricingInput, setPricingInput] = useState<
    Record<number, Record<string, string>>
  >({});
  const [stockInput, setStockInput] = useState<
    Record<number, { low: string; veryLow: string }>
  >({});
  const [auditExpanded, setAuditExpanded] = useState(false);

  const { data: allPresets } = useUnitPresetQuery();

  const handleView = (product: InventoryProductModel) => {
    setViewingProduct(product);
    setSelectedPresetIds([]);
  };

  const handlePricingSubmit = async (
    pricingData: ProductPackagingPricingData[],
  ) => {
    if (!viewingProduct) return;
    setIsSubmitting(true);
    try {
      for (const data of pricingData) {
        await updatePresetPricing({
          preset_ID: data.preset_ID,
          product_ID: viewingProduct.product.product_ID,
          unitPrices: data.unitPrices,
        });
      }
      toast.success("Pricing updated successfully");
      setIsPricingModalOpen(false);
      setSelectedPresetIds([]);
      await refetch();
    } catch (error: any) {
      toast.error(error?.response?.data || "Failed to update pricing");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Preset label formatter ──────────────────────────────────────────────────
  const formatPresetLabel = (preset: UnitPresetLevel): string => {
    const mainLevel = [...preset.levels].find((l) => l.level === 1);
    const subLevels = [...preset.levels]
      .filter((l) => l.level > 1)
      .sort((a, b) => a.level - b.level);
    const mainName = mainLevel?.uoM_Name ?? preset.main_Unit_Name;
    const parts = [
      mainName,
      ...subLevels.map((l) => `${l.uoM_Name} (${l.conversion_Factor}x)`),
    ];
    return `[${preset.preset_Code}] ${parts.join(" > ")}`;
  };

  // ── Available-preset toggle ─────────────────────────────────────────────────
  const toggleNewPreset = (presetId: number) => {
    setNewlySelectedPresetIds((prev) =>
      prev.includes(presetId)
        ? prev.filter((id) => id !== presetId)
        : [...prev, presetId],
    );
  };

  // ── Open pricing-assign modal ───────────────────────────────────────────────
  const handleOpenPricingAssign = () => {
    if (newlySelectedPresetIds.length === 0) return;
    const initialPricing: Record<number, Record<string, string>> = {};
    const initialStock: Record<number, { low: string; veryLow: string }> = {};
    newlySelectedPresetIds.forEach((id) => {
      initialPricing[id] = {};
      initialStock[id] = { low: "", veryLow: "" };
    });
    setPricingInput(initialPricing);
    setStockInput(initialStock);
    setActivePricingPresetId(newlySelectedPresetIds[0]);
    setIsPricingAssignOpen(true);
  };

  const handlePricingInputChange = (
    presetId: number,
    unitName: string,
    value: string,
  ) => {
    setPricingInput((prev) => ({
      ...prev,
      [presetId]: { ...prev[presetId], [unitName]: value },
    }));
  };

  const handleStockInputChange = (
    presetId: number,
    field: "low" | "veryLow",
    value: string,
  ) => {
    setStockInput((prev) => ({
      ...prev,
      [presetId]: { ...prev[presetId], [field]: value },
    }));
  };

  const handleCancelPricingAssign = () => {
    setIsPricingAssignOpen(false);
    setNewlySelectedPresetIds([]);
    setPricingInput({});
    setStockInput({});
    setActivePricingPresetId(null);
    setAuditExpanded(false);
  };

  // ── Confirm & assign ────────────────────────────────────────────────────────
  const handleConfirmAssign = async () => {
    if (!viewingProduct) return;
    setIsSubmitting(true);
    try {
      // Step 1: assign each preset (creates Product_Unit_Preset records)
      for (const presetId of newlySelectedPresetIds) {
        const preset = allPresets?.find((p) => p.preset_ID === presetId);
        if (!preset) continue;
        const unitPrices = preset.levels
          .filter((l) => pricingInput[presetId]?.[l.uoM_Name])
          .map((l) => ({
            unitName: l.uoM_Name,
            price: parseFloat(pricingInput[presetId][l.uoM_Name]) || 0,
          }));
        await assignProductsToPreset({
          preset_ID: presetId,
          product_IDs: [viewingProduct.product.product_ID],
          pricingData:
            unitPrices.length > 0
              ? [
                  {
                    product_ID: viewingProduct.product.product_ID,
                    unitPrices,
                  },
                ]
              : undefined,
        });
      }

      // Step 2: update stock thresholds if any were set
      const presetsWithStock = newlySelectedPresetIds.filter(
        (id) => stockInput[id]?.low || stockInput[id]?.veryLow,
      );

      if (presetsWithStock.length > 0) {
        // Refetch to get the newly created product_Preset_IDs
        const freshResult = await refetch();
        const freshProduct = freshResult.data?.find(
          (p) => p.product.product_ID === viewingProduct.product.product_ID,
        );

        if (freshProduct) {
          const unitPresetsPayload = presetsWithStock
            .map((presetId) => {
              const freshUp = freshProduct.unitPresets.find(
                (up) => up.preset_ID === presetId,
              );
              if (!freshUp) return null;
              return {
                product_Preset_ID: freshUp.product_Preset_ID,
                low_Stock_Level:
                  parseInt(stockInput[presetId]?.low || "0") || 0,
                very_Low_Stock_Level:
                  parseInt(stockInput[presetId]?.veryLow || "0") || 0,
              };
            })
            .filter(
              (
                x,
              ): x is {
                product_Preset_ID: number;
                low_Stock_Level: number;
                very_Low_Stock_Level: number;
              } => x !== null,
            );

          if (unitPresetsPayload.length > 0) {
            await editProductService({
              productName: viewingProduct.product.product_Name,
              description: viewingProduct.product.description,
              productCode: viewingProduct.product.product_Code,
              brand_ID: viewingProduct.brand.brand_ID,
              category_Id: viewingProduct.category.category_ID,
              variant_Id: viewingProduct.variant.variant_ID,
              unitPresets: unitPresetsPayload,
            });
          }
        }
      }

      toast.success("Packaging presets assigned successfully");
      handleCancelPricingAssign();
      setViewingProduct(null);
      setPresetSearch("");
      await refetch();
    } catch (error: any) {
      toast.error(error?.response?.data || "Failed to assign presets");
    } finally {
      setIsSubmitting(false);
    }
  };

  const productsWithPresets = (
    inventory?.filter((p) => p.product.is_Active) ?? []
  ).filter((p) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      p.product.product_Name.toLowerCase().includes(q) ||
      p.product.product_Code.toLowerCase().includes(q) ||
      p.brand.brandName.toLowerCase().includes(q) ||
      p.variant.variant_Name.toLowerCase().includes(q);
    const hasPricing =
      p.unitPresets.length > 0 &&
      p.unitPresets.some((up) => up.presetPricing.length > 0);
    const matchesFilter =
      pricingFilter === "any" ||
      (pricingFilter === "priced" && hasPricing) ||
      (pricingFilter === "unpriced" && !hasPricing);
    return matchesSearch && matchesFilter;
  });

  const selectedPresets: UnitPreset[] =
    viewingProduct?.unitPresets.filter((up) =>
      selectedPresetIds.includes(up.preset_ID),
    ) ?? [];

  const assignedPresetIds =
    viewingProduct?.unitPresets.map((up) => up.preset_ID) ?? [];

  const availablePresets = (allPresets ?? []).filter(
    (p) => !assignedPresetIds.includes(p.preset_ID),
  );

  const filteredAvailablePresets = presetSearch
    ? availablePresets.filter((p) =>
        formatPresetLabel(p).toLowerCase().includes(presetSearch.toLowerCase()),
      )
    : availablePresets;

  const selectedPresetsForPricing = (allPresets ?? []).filter((p) =>
    newlySelectedPresetIds.includes(p.preset_ID),
  );

  const activePresetForPricing =
    selectedPresetsForPricing.find(
      (p) => p.preset_ID === activePricingPresetId,
    ) ??
    selectedPresetsForPricing[0] ??
    null;

  const activePricingProductPresetId = viewingProduct?.unitPresets?.find(
    (up) => up.preset_ID === activePresetForPricing?.preset_ID,
  )?.product_Preset_ID;

  const { data: auditLogs, isLoading: auditLoading } = useProductAuditLogQuery(
    viewingProduct?.product.product_ID,
    activePricingProductPresetId,
  );

  return (
    <div className="absolute bg-black/40 w-full h-full top-0 left-0 flex justify-center items-center z-50 gap-3">
      {/* ── MAIN LIST MODAL ── */}
      <Activity
        mode={isPricingModalOpen || isPricingAssignOpen ? "hidden" : "visible"}
      >
        <div className="w-3/6 h-4/5 bg-white px-5 py-10 rounded-lg border shadow-lg relative flex flex-col gap-4">
          <div
            className="absolute top-4 right-4 cursor-pointer"
            onClick={onClose}
          >
            <XIcon />
          </div>
          <h1 className="text-xl font-bold">Product Packaging</h1>

          <div className="flex w-full gap-2">
            {/* SEARCH INPUT */}
            <div className="relative w-full">
              <input
                placeholder="Search..."
                className="input-style-2"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <i className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <SearchIcon />
              </i>
            </div>

            {/* DROPDOWN FILTER SELECT */}
            <div className="relative flex items-center shrink-0 w-1/2">
              <Layers className="absolute left-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
              <select
                value={pricingFilter}
                onChange={(e) =>
                  setPricingFilter(
                    e.target.value as "any" | "priced" | "unpriced",
                  )
                }
                className="w-full text-sm border rounded-lg pl-8 pr-3 py-3 outline-none focus:ring-2 focus:ring-blue-200 bg-white appearance-none cursor-pointer"
              >
                <option value="any">Any</option>
                <option value="priced">Priced</option>
                <option value="unpriced">Unpriced</option>
              </select>
            </div>
          </div>

          {/* Table header */}
          <div className="flex items-center px-2 py-1.5 border-b bg-gray-50 rounded-t-lg">
            <span className="text-xs font-semibold text-gray-500 w-3/5">
              Item
            </span>
            <span className="text-xs font-semibold text-gray-500 w-1/6">
              Packaging Presets
            </span>
            <span className="text-xs font-semibold text-gray-500 w-1/6 text-right">
              Action
            </span>
          </div>

          {/* Table rows */}
          <div className="flex flex-col gap-1 overflow-y-auto flex-1 min-h-0">
            {productsWithPresets.length === 0 ? (
              <p className="text-sm text-gray-500 text-center mt-8">
                No products found.
              </p>
            ) : (
              productsWithPresets.map((product) => (
                <div
                  key={product.product.product_ID}
                  className={`flex items-center px-2 py-2 rounded-lg transition-all border ${
                    viewingProduct?.product.product_ID ===
                    product.product.product_ID
                      ? "bg-blue-50 border-blue-200"
                      : "border-transparent hover:bg-gray-50"
                  }`}
                >
                  <div className="w-3/5">
                    <div className="flex gap-2 items-center">
                      <p className="text-sm font-semibold">
                        {product.product.product_Name}
                      </p>
                      <p className="text-xs rounded-md text-gray-400">
                        {product.category.category_Name}
                      </p>
                    </div>
                    <p className="text-xs text-gray-500">
                      {product.product.product_Code}
                    </p>
                  </div>

                  <div className="w-1/6">
                    <span
                      className={`text-nowrap text-xs px-2 py-0.5 rounded-full ${product.unitPresets.length === 0 ? "bg-red-100 text-red-600" : "bg-teal-100 text-teal-700"}`}
                    >
                      {product.unitPresets.length} packaging preset
                      {product.unitPresets.length !== 1 ? "s" : ""}
                    </span>
                  </div>

                  <div className="flex justify-end w-1/6 ml-auto">
                    <button
                      className="text-xs px-3 py-1 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                      onClick={() => handleView(product)}
                      // disabled={product.unitPresets.length === 0}
                    >
                      View
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </Activity>

      {/* ── VIEW / PRESET PICKER PANEL ── */}
      <Activity
        mode={
          viewingProduct !== null && !isPricingModalOpen && !isPricingAssignOpen
            ? "visible"
            : "hidden"
        }
      >
        {viewingProduct && (
          <div className="bg-white rounded-lg border shadow-lg py-6 px-5 flex flex-col gap-4 max-h-[80vh] w-96 h-full">
            {/* Header */}
            <div className="flex flex-col">
              <div className="flex gap-2 items-center">
                <label className="text-sm font-semibold">
                  {viewingProduct.product.product_Name}
                </label>
                <label className="text-xs text-gray-400">
                  {viewingProduct.category.category_Name}
                </label>
              </div>
              <span className="text-xs text-vesper-gray">
                Select packaging presets to associate with this product
              </span>
            </div>

            <Separator orientation="horizontal" />

            {/* Preset search */}
            <div className="relative w-full">
              <input
                placeholder="Search presets by code or units..."
                className="input-style-2"
                value={presetSearch}
                onChange={(e) => setPresetSearch(e.target.value)}
              />
              <i className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <SearchIcon />
              </i>
            </div>

            {/* Associated Presets */}
            <div className="rounded-lg border border-border p-3 flex flex-col gap-2 shrink-0">
              <div className="flex gap-2 items-center">
                {viewingProduct.unitPresets.some(
                  (up) => up.presetPricing.length === 0,
                ) && (
                  <CircleAlert className="text-red-500 shrink-0" size={16} />
                )}
                <label className="text-sm font-semibold">
                  Associated Presets ({viewingProduct.unitPresets.length})
                </label>
              </div>
              {viewingProduct.unitPresets.length === 0 ? (
                <p className="text-xs text-gray-400">
                  No presets assigned yet.
                </p>
              ) : (
                <div className="flex flex-col gap-1">
                  {viewingProduct.unitPresets.map((up) => {
                    const details = allPresets?.find(
                      (p) => p.preset_ID === up.preset_ID,
                    );
                    const label = details
                      ? formatPresetLabel(details)
                      : up.preset.preset_Name;
                    const hasPricing = up.presetPricing.length > 0;
                    return (
                      <div
                        key={up.preset_ID}
                        className="flex items-center justify-between text-xs py-1.5 px-2 rounded-lg bg-gray-50 border border-gray-100"
                      >
                        <span className="font-mono text-gray-700">{label}</span>
                        {!hasPricing && (
                          <CircleAlert
                            className="text-red-400 shrink-0 ml-2"
                            size={13}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Available Presets */}
            <div className="rounded-lg border border-border p-3 flex flex-col gap-2 overflow-y-auto flex-1 min-h-0">
              <label className="text-sm font-semibold">
                Available Presets ({filteredAvailablePresets.length})
              </label>
              {filteredAvailablePresets.length === 0 ? (
                <p className="text-xs text-gray-400">No available presets.</p>
              ) : (
                <div className="flex flex-col gap-1">
                  {filteredAvailablePresets.map((preset) => {
                    const isChecked = newlySelectedPresetIds.includes(
                      preset.preset_ID,
                    );
                    return (
                      <div
                        key={preset.preset_ID}
                        onClick={() => toggleNewPreset(preset.preset_ID)}
                        className={`flex items-center gap-2 text-xs py-2 px-2 rounded-lg border cursor-pointer transition-all ${
                          isChecked
                            ? "border-blue-400 bg-blue-50"
                            : "border-transparent hover:bg-gray-50"
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 ${
                            isChecked
                              ? "bg-blue-500 border-blue-500"
                              : "border-gray-300"
                          }`}
                        >
                          {isChecked && (
                            <CheckIcon className="w-3 h-3 text-white" />
                          )}
                        </div>
                        <span className="font-mono text-gray-700">
                          {formatPresetLabel(preset)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex gap-2">
              <button
                className="w-full"
                onClick={() => {
                  setViewingProduct(null);
                  setNewlySelectedPresetIds([]);
                  setPresetSearch("");
                }}
              >
                Cancel
              </button>
              <button
                className="w-full"
                disabled={newlySelectedPresetIds.length === 0}
                onClick={handleOpenPricingAssign}
              >
                Next: Set Prices ({newlySelectedPresetIds.length})
              </button>
            </div>
          </div>
        )}
      </Activity>

      {/* ── PRICING ASSIGN MODAL ── */}
      <Activity mode={isPricingAssignOpen ? "visible" : "hidden"}>
        {viewingProduct && (
          <div className="bg-white rounded-lg border shadow-lg h-4/5 max-w-260 w-full flex flex-col overflow-hidden">
            <div className="flex border-b border-border px-5 py-4">
              <div className="flex flex-col">
                <div className="flex gap-2 items-center">
                  <label className="text-base font-semibold">
                    {viewingProduct.product.product_Name}
                  </label>
                  <label className="text-sm text-gray-400">
                    {viewingProduct.category.category_Name}
                  </label>
                </div>
                <span className="text-xs text-vesper-gray">
                  Set prices per unit conversion and stock threshold for each
                  selected packaging preset.
                </span>
              </div>
            </div>

            <div className="flex gap-0 flex-1 min-h-0">
              {/* Left – selected presets list */}
              <div className="w-80 shrink-0 flex flex-col gap-4 p-5 overflow-y-auto min-h-0">
                <div className="flex flex-col gap-1 flex-1 min-h-0">
                  {selectedPresetsForPricing.map((preset) => (
                    <div
                      key={preset.preset_ID}
                      onClick={() => setActivePricingPresetId(preset.preset_ID)}
                      className={`cursor-pointer px-3 py-2 rounded-lg text-xs font-mono border transition-all ${
                        activePricingPresetId === preset.preset_ID
                          ? "border-blue-400 bg-blue-50 text-blue-800"
                          : "border-gray-200 hover:bg-gray-50 text-gray-700"
                      }`}
                    >
                      {formatPresetLabel(preset)}
                    </div>
                  ))}
                </div>
              </div>

              {/* Right – pricing details */}
              <div className="flex-1 flex flex-col gap-4 overflow-y-auto min-h-0 p-5 border-l border-border">
                {activePresetForPricing ? (
                  <>
                    {/* Meta */}
                    <div className="flex flex-col text-xs text-gray-400">
                      <span>Last updated by: —</span>
                      <span>Date: —</span>
                    </div>
                    {/* Pricing container */}
                    <div className="border rounded-lg p-4 flex flex-col gap-3 bg-green-50">
                      {/* <p className="text-xs font-mono text-gray-500">
                      {formatPresetLabel(activePresetForPricing)}
                    </p> */}
                      <label className="text-green-600">
                        [{activePresetForPricing.preset_Code}]
                      </label>
                      <div className="flex flex-col gap-1 font-semibold">
                        {[...activePresetForPricing.levels]
                          .sort((a, b) => a.level - b.level)
                          .map((level, idx) => (
                            <div
                              key={level.level_ID}
                              className="flex items-center justify-between"
                            >
                              <span className="text-sm text-gray-600 flex items-center gap-1">
                                {idx > 0 && (
                                  <span className="text-gray-600 font-mono">
                                    └─
                                  </span>
                                )}
                                {level.uoM_Name}
                                {idx > 0 && (
                                  <span className="text-gray-400">
                                    ({level.conversion_Factor}x)
                                  </span>
                                )}
                              </span>
                              <div className="flex items-center bg-gray-200 rounded-sm">
                                <i className="px-4">
                                  <PhilippinePeso
                                    className="text-gray-400"
                                    size={14}
                                  />
                                </i>
                                <input
                                  type="number"
                                  placeholder="—"
                                  className="drop-shadow-none rounded-r-sm rounded-l-none p-2"
                                  value={
                                    pricingInput[
                                      activePresetForPricing.preset_ID
                                    ]?.[level.uoM_Name] ?? ""
                                  }
                                  onChange={(e) =>
                                    handlePricingInputChange(
                                      activePresetForPricing.preset_ID,
                                      level.uoM_Name,
                                      e.target.value,
                                    )
                                  }
                                />
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>

                    {/* Stock Threshold */}
                    <div className="border rounded-lg p-4 flex flex-col gap-3 bg-green-50">
                      <label className="text-xs font-semibold">
                        Stock Threshold
                      </label>
                      <div className="flex justify-between">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex gap-2 items-center">
                            <div className="rounded-full bg-yellow-400 w-3 h-3" />
                            <span className="text-xs text-gray-600 text-nowrap">
                              Low Stock
                            </span>
                          </div>

                          <input
                            type="number"
                            placeholder="—"
                            className="shadow-none drop-shadow-none "
                            value={
                              stockInput[activePresetForPricing.preset_ID]
                                ?.low ?? ""
                            }
                            onChange={(e) =>
                              handleStockInputChange(
                                activePresetForPricing.preset_ID,
                                "low",
                                e.target.value,
                              )
                            }
                          />
                        </div>
                        <div className="flex items-center justify-between gap-2 ">
                          <div className="flex gap-2 items-center">
                            <div className="rounded-full bg-red-400 w-3 h-3" />
                            <span className="text-xs text-gray-600 text-nowrap">
                              Very Low Stock
                            </span>
                          </div>
                          <input
                            type="number"
                            min="0"
                            placeholder="—"
                            className="shadow-none drop-shadow-none "
                            value={
                              stockInput[activePresetForPricing.preset_ID]
                                ?.veryLow ?? ""
                            }
                            onChange={(e) =>
                              handleStockInputChange(
                                activePresetForPricing.preset_ID,
                                "veryLow",
                                e.target.value,
                              )
                            }
                          />
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <label className="text-xs">
                          Threshold applies only to main unit.
                        </label>

                        <label className="text-xs font-semibold">
                          ({activePresetForPricing.main_Unit_Name})
                        </label>
                      </div>
                    </div>

                    {/* Audit Log */}
                    <div className="border rounded-lg overflow-hidden">
                      <div
                        className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-semibold hover:bg-gray-50 transition-all"
                        onClick={() => setAuditExpanded((prev) => !prev)}
                      >
                        <span>Audit Log (Recent Changes)</span>
                        {auditExpanded ? (
                          <ChevronUp size={14} />
                        ) : (
                          <ChevronDown size={14} />
                        )}
                      </div>
                      {auditExpanded && (
                        <div className="border-t">
                          {auditLoading ? (
                            <p className="text-xs text-gray-400 px-4 py-3">
                              Loading...
                            </p>
                          ) : !auditLogs || auditLogs.length === 0 ? (
                            <p className="text-xs text-gray-400 px-4 py-3">
                              No changes recorded yet.
                            </p>
                          ) : (
                            <table className="w-full text-xs">
                              <thead>
                                <tr className="text-gray-400 border-b">
                                  <th className="text-left px-4 py-2 font-medium w-2/5">
                                    Date & Time
                                  </th>
                                  <th className="text-left px-4 py-2 font-medium w-1/5">
                                    User
                                  </th>
                                  <th className="text-left px-4 py-2 font-medium w-2/5">
                                    Change
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {auditLogs.map((log) => {
                                  const initials = log.userName
                                    .split(" ")
                                    .slice(0, 2)
                                    .map((w) => w[0]?.toUpperCase() ?? "")
                                    .join("");
                                  const date = new Date(log.createdAt);
                                  const formatted = date.toLocaleString(
                                    "en-PH",
                                    {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                      hour: "numeric",
                                      minute: "2-digit",
                                      hour12: true,
                                    },
                                  );
                                  return (
                                    <tr
                                      key={log.auditLog_ID}
                                      className="border-b last:border-b-0 hover:bg-gray-50"
                                    >
                                      <td className="px-4 py-2 text-gray-500">
                                        {formatted}
                                      </td>
                                      <td className="px-4 py-2">
                                        <div className="flex items-center gap-1.5">
                                          <div className="rounded-full bg-purple-500 w-6 h-6 flex items-center justify-center shrink-0">
                                            <span className="text-[10px] text-white font-semibold">
                                              {initials}
                                            </span>
                                          </div>
                                          <span className="text-gray-700">
                                            {log.userName}
                                          </span>
                                        </div>
                                      </td>
                                      <td className="px-4 py-2">
                                        {log.action === "PRICING_UPDATED" &&
                                        log.fieldName &&
                                        log.newValue ? (
                                          <div className="flex items-center gap-1 flex-wrap">
                                            <span className="font-medium text-gray-700">
                                              {log.fieldName}
                                            </span>
                                            {log.oldValue ? (
                                              <>
                                                <div className="flex items-center gap-0.5 text-gray-400">
                                                  <PhilippinePeso size={10} />
                                                  <span>{log.oldValue}</span>
                                                </div>
                                                <ArrowRight
                                                  size={10}
                                                  className="text-gray-400"
                                                />
                                              </>
                                            ) : null}
                                            <div className="flex items-center gap-0.5 text-green-600">
                                              <PhilippinePeso size={10} />
                                              <span className="font-semibold">
                                                {log.newValue}
                                              </span>
                                            </div>
                                          </div>
                                        ) : (
                                          <span className="text-gray-600">
                                            {log.description}
                                          </span>
                                        )}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          )}
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-gray-400 text-center mt-8">
                    Select a preset from the left to configure its pricing.
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-2 border-t border-border px-5 py-4 justify-end">
              <button
                className="w-full"
                onClick={handleConfirmAssign}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Assigning..." : "Confirm & Assign"}
              </button>
              <button className="w-full" onClick={handleCancelPricingAssign}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </Activity>

      {/* ── PRICING MODAL ── */}
      <ProductPackagingPricingModal
        isOpen={isPricingModalOpen}
        product={viewingProduct}
        selectedPresets={selectedPresets}
        isSubmitting={isSubmitting}
        onClose={() => setIsPricingModalOpen(false)}
        onSubmit={handlePricingSubmit}
      />
    </div>
  );
};

// const OldModal = () => {
//   return (
//     <div className="bg-white rounded-lg border shadow-lg py-6 px-5 flex flex-col gap-4 max-h-[80vh] w-92 h-full">
//             {/* Product info */}
//             <div className="flex flex-col gap-0.5">
//               <h3 className="font-bold text-sm">
//                 {viewingProduct.product.product_Name}
//               </h3>
//               <p className="text-xs text-gray-500">
//                 {viewingProduct.unitPresets.length} preset
//                 {viewingProduct.unitPresets.length !== 1 ? "s" : ""} assigned
//               </p>
//             </div>

//             {/* Preset checkboxes */}
//             <div className="flex flex-col gap-2 overflow-y-auto flex-1 min-h-0 rounded-lg">
//               {viewingProduct.unitPresets.map((up) => {
//                 const isSelected = selectedPresetIds.includes(up.preset_ID);
//                 return (
//                   <div
//                     key={up.preset_ID}
//                     onClick={() => togglePreset(up.preset_ID)}
//                     className={`flex flex-col gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all ${
//                       isSelected
//                         ? "border-blue-500 bg-blue-50"
//                         : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
//                     }`}
//                   >
//                     {/* Checkbox row */}
//                     <div className="flex items-center gap-2">
//                       <div
//                         className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 ${
//                           isSelected
//                             ? "bg-blue-500 border-blue-500"
//                             : "border-gray-300"
//                         }`}
//                       >
//                         {isSelected && (
//                           <CheckIcon className="w-3 h-3 text-white" />
//                         )}
//                       </div>
//                       <span className="text-sm font-semibold">
//                         {up.preset.preset_Name}
//                       </span>
//                     </div>

//                     {/* Pricing summary */}
//                     {up.presetPricing.length > 0 && (
//                       <div className="flex flex-col gap-1 pl-6 border-t pt-2 mt-0.5">
//                         {up.presetPricing.map((pp, idx) => (
//                           <div
//                             key={idx}
//                             className="flex items-center justify-between text-xs"
//                           >
//                             <div className="flex gap-2">
//                               {idx > 0 && (
//                                 <span className="text-gray-400 shrink-0">
//                                   └
//                                 </span>
//                               )}
//                               <span className="text-gray-600">
//                                 {pp.unitName}
//                               </span>
//                             </div>
//                             <div className="flex items-center gap-0.5 font-semibold">
//                               <PhilippinePeso className="w-3 h-3" />
//                               <span>
//                                 {pp.price_Per_Unit?.toFixed(2) ?? "0.00"}
//                               </span>
//                             </div>
//                           </div>
//                         ))}
//                       </div>
//                     )}
//                   </div>
//                 );
//               })}
//             </div>

//             <div className="flex gap-2">
//               <button
//                 className="w-full max-w-full"
//                 onClick={handleContinue}
//                 disabled={selectedPresetIds.length === 0}
//               >
//                 Continue with {selectedPresetIds.length} selected
//               </button>
//               <button
//                 className="w-full max-w-full"
//                 onClick={() => setViewingProduct(null)}
//               >
//                 Cancel
//               </button>
//             </div>
//           </div>
//   )
// }
