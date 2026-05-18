import { SearchIcon } from "@/icons";
import { InventoryProductModel } from "@/features/inventory/models/inventory.model";
import { ArrowLeft, FileSearch, Layers, PhilippinePeso, X } from "lucide-react";
import { useMemo, useState } from "react";
import jsPDF from "jspdf";
import { Separator } from "@/components/separator";

interface QuotationGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventory: InventoryProductModel[];
}

// ─── Types ───────────────────────────────────────────────────────────────────

type QuotationUomRow = {
  level: number; // 1 = main unit, 2+ = sub-units
  uom: string;
  conversionFactor: number;
  price: number | null;
  included: boolean;
};

type QuotationLineItem = {
  productId: number;
  product_Code: string;
  description: string;
  rows: QuotationUomRow[];
};

type SelectedItemConfig = {
  item: InventoryProductModel;
  selectedPresetIndex: number;
  rowStates: QuotationUomRow[];
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const buildDescription = (item: InventoryProductModel) =>
  `${item.product.product_Name}`;

const buildPresetLabel = (
  preset: InventoryProductModel["unitPresets"][number],
): string => {
  const levels = [...(preset.preset?.presetLevels ?? [])].sort(
    (a, b) => a.level - b.level,
  );
  return levels
    .map((lvl, idx) =>
      idx === 0
        ? lvl.unitOfMeasure.uom_Name
        : `${lvl.unitOfMeasure.uom_Name} (${lvl.conversion_Factor}x)`,
    )
    .join(" \u2192 ");
};

const buildRowStates = (
  item: InventoryProductModel,
  presetIndex: number,
): QuotationUomRow[] => {
  const preset = item.unitPresets[presetIndex];
  if (!preset) return [];

  const levels = [...(preset.preset?.presetLevels ?? [])].sort(
    (a, b) => a.level - b.level,
  );

  return levels.map((lvl) => {
    const pricing = (preset.presetPricing ?? []).find(
      (p) => p.level === lvl.level,
    );
    return {
      level: lvl.level,
      uom: lvl.unitOfMeasure.uom_Name,
      conversionFactor: lvl.conversion_Factor,
      price: pricing ? pricing.price_Per_Unit : null,
      included: true,
    };
  });
};

// ─── PDF Generation ──────────────────────────────────────────────────────────

const generateQuotationPdf = (lineItems: QuotationLineItem[]) => {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const contentBottom = pageHeight - 12;

  const dateStr = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const xCode = 12;
  const xDesc = 55;
  const xUom = 135;
  const xPrice = pageWidth - 14;
  const codeWidth = 40;
  const descWidth = 76;
  const uomWidth = 45;

  let y = 16;

  const drawHeader = () => {
    doc.setFont("courier", "bold");
    doc.setFontSize(22);
    doc.setTextColor(0, 0, 0);
    doc.text("QUOTATION", xCode, y);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(153, 153, 153);
    doc.text(dateStr, xCode + 115, y);

    y += 12;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);

    doc.text("PRODUCT CODE", xCode + 2, y);
    doc.text("DESCRIPTION", xDesc + 2, y);
    doc.text("UOM", xUom + 2, y);
    doc.text("PRICE", xPrice, y, { align: "right" });

    y += 4;
    doc.setDrawColor(238, 238, 238);
    doc.line(10, y, pageWidth - 10, y);
    y += 6;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
  };

  const ensureSpace = (needed: number) => {
    if (y + needed > contentBottom) {
      doc.addPage();
      y = 16;
      drawHeader();
    }
  };

  drawHeader();

  lineItems.forEach((lineItem, groupIndex) => {
    const includedRows = lineItem.rows.filter((r) => r.included);
    if (includedRows.length === 0) return;

    const isShaded = groupIndex % 2 !== 0;

    includedRows.forEach((row, rowIndex) => {
      const isMainRow = row.level === 1;
      const codeLabel = isMainRow ? lineItem.product_Code : "";
      const descLabel = isMainRow ? lineItem.description : "";
      const uomLabel = isMainRow ? row.uom : `\t ${row.uom}`;
      const priceLabel = row.price === null ? "-" : row.price.toFixed(2);

      const codeLines = isMainRow
        ? doc.splitTextToSize(codeLabel, codeWidth)
        : [""];
      const descLines = isMainRow
        ? doc.splitTextToSize(descLabel, descWidth)
        : [""];
      const uomLines = doc.splitTextToSize(uomLabel, uomWidth);
      const lineCount = Math.max(
        codeLines.length,
        descLines.length,
        uomLines.length,
        1,
      );
      const rowH = lineCount * 5 + 3;

      ensureSpace(rowH);

      if (isShaded) {
        doc.setFillColor(245, 245, 245);
        doc.rect(10, y - 3.5, pageWidth - 20, rowH, "F");
      }

      if (isMainRow && rowIndex === 0) {
        doc.setFont("helvetica", "bold");
      } else {
        doc.setFont("helvetica", "normal");
      }

      doc.setFontSize(10);
      doc.text(codeLines, xCode + 2, y);
      doc.text(descLines, xDesc + 2, y);
      doc.text(uomLines, xUom + 2, y);
      doc.text(priceLabel, xPrice, y, { align: "right" });

      y += rowH;
    });

    y += 1;
  });

  doc.save("quotation.pdf");
};

// ─── Component ───────────────────────────────────────────────────────────────

export const QuotationGeneratorModal = ({
  isOpen,
  onClose,
  inventory,
}: QuotationGeneratorModalProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [lineItems, setLineItems] = useState<QuotationLineItem[]>([]);
  const [selectedConfig, setSelectedConfig] =
    useState<SelectedItemConfig | null>(null);
  const [includeHierarchy, setIncludeHierarchy] = useState(false);

  const filteredInventory = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return inventory;
    return inventory.filter(
      (item) =>
        item.product.product_Code.toLowerCase().includes(query) ||
        item.product.product_Name.toLowerCase().includes(query) ||
        item.product.description.toLowerCase().includes(query) ||
        item.brand.brandName.toLowerCase().includes(query) ||
        item.variant.variant_Name.toLowerCase().includes(query) ||
        item.category.category_Name.toLowerCase().includes(query),
    );
  }, [inventory, searchQuery]);

  const addedProductIds = useMemo(
    () => new Set(lineItems.map((li) => li.productId)),
    [lineItems],
  );

  // Opens the configuration panel for a product
  const handleSelectItem = (item: InventoryProductModel) => {
    if (addedProductIds.has(item.product.product_ID)) return;
    setSelectedConfig({
      item,
      selectedPresetIndex: 0,
      rowStates: buildRowStates(item, 0),
    });
  };

  // Changes the active preset and rebuilds row states
  const handlePresetChange = (presetIndex: number) => {
    if (!selectedConfig) return;
    setSelectedConfig({
      ...selectedConfig,
      selectedPresetIndex: presetIndex,
      rowStates: buildRowStates(selectedConfig.item, presetIndex),
    });
  };

  // Updates the local price for a row (does not affect global preset data)
  const handlePriceChange = (level: number, value: string) => {
    if (!selectedConfig) return;
    const parsed = parseFloat(value);
    setSelectedConfig({
      ...selectedConfig,
      rowStates: selectedConfig.rowStates.map((r) =>
        r.level === level ? { ...r, price: isNaN(parsed) ? null : parsed } : r,
      ),
    });
  };

  // Commits the configured item to the quotation list
  const handleAddToQuotation = () => {
    if (!selectedConfig) return;
    const { item, rowStates } = selectedConfig;
    const preset = item.unitPresets[selectedConfig.selectedPresetIndex];
    const product_Code = preset?.sku ?? item.product.product_Code ?? "-";
    const rows = (
      includeHierarchy ? rowStates : rowStates.filter((r) => r.level === 1)
    ).map((r) => ({ ...r, included: true }));
    setLineItems((prev) => [
      ...prev,
      {
        productId: item.product.product_ID,
        product_Code,
        description: buildDescription(item),
        rows,
      },
    ]);
    setSelectedConfig(null);
    setIncludeHierarchy(false);
  };

  if (!isOpen) return null;

  return (
    <div className="absolute bg-black/40 w-full h-full top-0 left-0 flex justify-center items-center z-50 gap-3">
      {/* ── Left panel: quotation list ── */}
      <div className="w-7/12 h-4/5 bg-white px-5 py-10 rounded-lg border shadow-lg relative flex flex-col gap-4">
        <div
          className="absolute right-3 top-3 z-10 rounded-md text-vesper-gray hover:bg-bellflower-gray p-2 cursor-pointer transition"
          onClick={onClose}
          aria-label="Close quotation modal"
        >
          <X size={18} />
        </div>

        <h1>Quotation</h1>

        <div className="flex items-center p-2 border-b">
          <label className="text-sm font-semibold text-saltbox-gray w-full">
            Description
          </label>
          <label className="text-sm font-semibold text-saltbox-gray w-1/3 text-left">
            UOM
          </label>
          <label className="text-sm font-semibold text-saltbox-gray w-1/3 text-right">
            Price
          </label>
        </div>

        <div className="flex-1 overflow-y-auto">
          {lineItems.length === 0 ? (
            <div className="text-saltbox-gray flex flex-col items-center justify-center gap-4 w-full h-full px-6">
              <FileSearch
                size={120}
                strokeWidth={1.5}
                className="text-gray-400"
              />
              <span className="text-sm font-medium text-vesper-gray">
                No item listed yet.
              </span>
            </div>
          ) : (
            <div className="flex flex-col">
              {lineItems.map((lineItem, groupIndex) => {
                const includedRows = lineItem.rows.filter((r) => r.included);
                const isShaded = groupIndex % 2 !== 0;
                return includedRows.map((row) => (
                  <div
                    key={`${lineItem.productId}-${row.level}`}
                    className={`py-2 px-3 flex justify-between gap-2 rounded-lg text-sm items-center ${isShaded ? "bg-custom-gray" : ""}`}
                  >
                    <span className="w-full truncate">
                      {row.level === 1 ? lineItem.description : ""}
                    </span>
                    <span className="w-1/3 text-sm whitespace-nowrap">
                      {row.level === 1 ? row.uom : `└─ ${row.uom}`}
                    </span>
                    <span className="w-1/3 text-right">
                      {row.price === null ? "-" : row.price.toFixed(2)}
                    </span>
                  </div>
                ));
              })}
            </div>
          )}
        </div>

        {lineItems.length > 0 && (
          <button
            className="self-end px-4 py-2 text-sm"
            onClick={() => generateQuotationPdf(lineItems)}
          >
            Generate Quotation
          </button>
        )}
      </div>

      {/* ── Right panel: search list or config ── */}
      <div className="bg-white rounded-lg border shadow-lg py-10 px-5 flex flex-col gap-5 h-4/5 w-4/12">
        {selectedConfig ? (
          /* ── Configuration panel ── */
          <div className="flex flex-col gap-5 flex-1 min-h-0">
            {/* Back button + title */}
            <div className="flex items-center gap-2">
              <div
                className="p-1 rounded-md hover:bg-custom-gray transition text-vesper-gray cursor-pointer"
                onClick={() => setSelectedConfig(null)}
                aria-label="Back to search"
              >
                <ArrowLeft size={18} />
              </div>
              <h3 className="font-bold text-sm truncate">
                {buildDescription(selectedConfig.item)}
              </h3>
            </div>

            {/* Packaging preset dropdown */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-saltbox-gray">
                Packaging Preset
              </label>
              <select
                className="text-sm"
                value={selectedConfig.selectedPresetIndex}
                onChange={(e) => handlePresetChange(Number(e.target.value))}
              >
                {selectedConfig.item.unitPresets.map((preset, i) => (
                  <option key={preset.preset_ID} value={i}>
                    {buildPresetLabel(preset)}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-3 flex-1 min-h-0 overflow-y-auto border border-border rounded-lg p-3">
              {/* Main unit row (level 1) */}
              {selectedConfig.rowStates[0] && (
                <div className="flex items-center gap-2">
                  <Layers size={18} className="text-river-green shrink-0" />
                  <span className="text-sm font-medium flex-1">
                    {selectedConfig.rowStates[0].uom}
                  </span>
                  <div className="flex items-center gap-1">
                    <PhilippinePeso
                      size={14}
                      className="text-gray-500 shrink-0"
                    />
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={
                        selectedConfig.rowStates[0].price === null
                          ? ""
                          : selectedConfig.rowStates[0].price
                      }
                      placeholder="0.00"
                      onChange={(e) => handlePriceChange(1, e.target.value)}
                      className="drop-shadow-none border border-border"
                    />
                  </div>
                </div>
              )}

              <Separator orientation="horizontal" />

              {/* Hierarchy toggle + tree */}
              <div className="flex flex-col gap-1">
                <div className="flex gap-2 items-center">
                  <input
                    type="checkbox"
                    id="include-hierarchy"
                    checked={includeHierarchy}
                    onChange={(e) => setIncludeHierarchy(e.target.checked)}
                    className="cursor-pointer"
                  />
                  <label
                    htmlFor="include-hierarchy"
                    className="text-sm cursor-pointer"
                  >
                    Include packaging hierarchy in the quotation
                  </label>
                </div>

                {includeHierarchy && selectedConfig.rowStates.length > 1 && (
                  <div className="ml-5 flex flex-col gap-1">
                    {selectedConfig.rowStates.slice(1).map((row) => (
                      <div
                        key={row.level}
                        className="relative flex items-center gap-2"
                      >
                        {/* <div className="absolute left-0 top-1/2 w-6  -translate-y-1/2" /> */}
                        <span className="text-sm text-gray-600 flex-1">
                          └─ {row.uom}
                          <span className="text-xs text-gray-400 ml-1">
                            ({row.conversionFactor}x)
                          </span>
                        </span>
                        <div className="flex items-center gap-1">
                          <PhilippinePeso
                            size={14}
                            className="text-gray-500 shrink-0"
                          />
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={row.price === null ? "" : row.price}
                            placeholder="0.00"
                            onChange={(e) =>
                              handlePriceChange(row.level, e.target.value)
                            }
                            className="drop-shadow-none border border-border"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Unit hierarchy */}
            {/* <div className="flex flex-col gap-2 flex-1 min-h-0 overflow-y-auto">
              <label className="text-xs font-semibold text-saltbox-gray">
                Unit Hierarchy
              </label>

              {selectedConfig.rowStates.length === 0 ? (
                <p className="text-xs text-vesper-gray">
                  No units defined for this preset.
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {selectedConfig.rowStates.map((row) => (
                    <div
                      key={row.level}
                      className="flex items-center gap-2 p-2 rounded-lg border bg-custom-gray"
                    >
                      <input
                        type="checkbox"
                        checked={row.included}
                        disabled={row.level === 1}
                        onChange={() => handleToggleRow(row.level)}
                        className="shrink-0 cursor-pointer disabled:cursor-default"
                      />

                      <span className="text-sm flex-1 truncate">
                        {row.level === 1 ? row.uom : `└─ ${row.uom}`}
                      </span>

                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={row.price === null ? "" : row.price}
                        placeholder="Price"
                        onChange={(e) =>
                          handlePriceChange(row.level, e.target.value)
                        }
                        className="w-24 text-sm border rounded px-2 py-1 text-right bg-white"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div> */}

            {/* Add to quotation */}
            <button
              className="px-4 py-2 text-sm w-full"
              onClick={handleAddToQuotation}
            >
              Add to Quotation
            </button>
          </div>
        ) : (
          /* ── Search / item list panel ── */
          <div className="flex flex-col gap-5 flex-1 min-h-0">
            <h3 className="font-bold">Add an Item</h3>

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

            <div className="flex flex-col overflow-y-auto gap-2 border p-3 rounded-lg inset-shadow-sm flex-1 min-h-0">
              {filteredInventory.map((item) => {
                const isAdded = addedProductIds.has(item.product.product_ID);
                const hasNoPreset = item.unitPresets.length === 0;
                const isDisabled = isAdded || hasNoPreset;

                return (
                  <div
                    key={item.product.product_ID}
                    className={`p-3 rounded-lg border flex items-center justify-between gap-2 ${isDisabled ? "opacity-50" : "bg-custom-gray"}`}
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">
                        {buildDescription(item)}
                      </p>
                      {hasNoPreset && (
                        <p className="text-xs text-vesper-gray">
                          No packaging preset assigned
                        </p>
                      )}
                    </div>

                    <button
                      className="max-w-fit px-3 py-2 text-xs shrink-0"
                      onClick={() => handleSelectItem(item)}
                      disabled={isDisabled}
                    >
                      {isAdded ? "Added" : "Add"}
                    </button>
                  </div>
                );
              })}

              {filteredInventory.length === 0 && (
                <div className="text-center text-vesper-gray text-sm py-6">
                  No matching inventory items.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
