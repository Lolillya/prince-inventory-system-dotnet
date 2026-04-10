import { SearchIcon } from "@/icons";
import { InventoryProductModel } from "@/features/inventory/models/inventory.model";
import { ArrowLeft, FileSearch, X } from "lucide-react";
import { useMemo, useState } from "react";
import jsPDF from "jspdf";

interface QuotationGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventory: InventoryProductModel[];
}

// ─── Types ───────────────────────────────────────────────────────────────────

type QuotationUomRow = {
  level: number; // 1 = main unit, 2+ = sub-units
  uom: string;
  price: number | null;
  included: boolean; // main unit is always true; sub-units can be toggled
};

type QuotationLineItem = {
  productId: number;
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
  `${item.product.product_Name}-${item.brand.brandName}-${item.variant.variant_Name}`;

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

  const xItem = 14;
  const xUom = 105;
  const xPrice = pageWidth - 14; // right-aligned
  const itemWidth = 86;
  const uomWidth = 56;

  let y = 16;

  const drawHeader = () => {
    // Company name
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("Prince", xItem, y);
    y += 7;

    // Document title
    doc.setFontSize(12);
    doc.text("Quotation", xItem, y);
    y += 3;

    // Divider
    doc.setDrawColor(180, 180, 180);
    doc.setLineWidth(0.4);
    doc.line(xItem, y, pageWidth - 14, y);
    y += 6;

    // Column headers
    doc.setFontSize(10);
    doc.text("Item", xItem, y);
    doc.text("UOM", xUom, y);
    doc.text("Price per Unit", xPrice, y, { align: "right" });
    y += 2;
    doc.line(xItem, y, pageWidth - 14, y);
    y += 5;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
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
      const itemLabel = isMainRow ? lineItem.description : "";
      const uomLabel = isMainRow ? row.uom : `\u2514\u2500 ${row.uom}`;
      const priceLabel = row.price === null ? "-" : row.price.toFixed(2);

      const itemLines = isMainRow
        ? doc.splitTextToSize(itemLabel, itemWidth)
        : [""];
      const uomLines = doc.splitTextToSize(uomLabel, uomWidth);
      const lineCount = Math.max(itemLines.length, uomLines.length, 1);
      const rowH = lineCount * 5 + 3;

      ensureSpace(rowH);

      if (isShaded) {
        doc.setFillColor(245, 245, 245);
        doc.rect(xItem - 2, y - 3.5, pageWidth - 26, rowH, "F");
      }

      if (isMainRow && rowIndex === 0) {
        doc.setFont("helvetica", "bold");
      } else {
        doc.setFont("helvetica", "normal");
      }

      doc.setFontSize(10);
      doc.text(itemLines, xItem, y);
      doc.text(uomLines, xUom, y);
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

  // Toggles the included checkbox for a sub-unit row
  const handleToggleRow = (level: number) => {
    if (!selectedConfig) return;
    setSelectedConfig({
      ...selectedConfig,
      rowStates: selectedConfig.rowStates.map((r) =>
        r.level === level ? { ...r, included: !r.included } : r,
      ),
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
    setLineItems((prev) => [
      ...prev,
      {
        productId: item.product.product_ID,
        description: buildDescription(item),
        rows: rowStates,
      },
    ]);
    setSelectedConfig(null);
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
              <button
                className="p-1 rounded-md hover:bg-custom-gray transition text-vesper-gray"
                onClick={() => setSelectedConfig(null)}
                aria-label="Back to search"
              >
                <ArrowLeft size={18} />
              </button>
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
                className="input-style-2 text-sm"
                value={selectedConfig.selectedPresetIndex}
                onChange={(e) => handlePresetChange(Number(e.target.value))}
              >
                {selectedConfig.item.unitPresets.map((preset, i) => (
                  <option key={preset.preset_ID} value={i}>
                    {preset.preset.preset_Name}
                  </option>
                ))}
              </select>
            </div>

            {/* Unit hierarchy */}
            <div className="flex flex-col gap-2 flex-1 min-h-0 overflow-y-auto">
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
                      {/* Checkbox (locked for main unit) */}
                      <input
                        type="checkbox"
                        checked={row.included}
                        disabled={row.level === 1}
                        onChange={() => handleToggleRow(row.level)}
                        className="shrink-0 cursor-pointer disabled:cursor-default"
                      />

                      {/* UOM label */}
                      <span className="text-sm flex-1 truncate">
                        {row.level === 1 ? row.uom : `└─ ${row.uom}`}
                      </span>

                      {/* Local price input */}
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
            </div>

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
                const preset = item.unitPresets[0];
                const levels = [...(preset?.preset?.presetLevels ?? [])].sort(
                  (a, b) => a.level - b.level,
                );
                const primaryUom =
                  levels[0]?.unitOfMeasure.uom_Name ??
                  item.restockInfo?.[0]?.presetPricing?.[0]?.unitName ??
                  "-";
                const primaryPrice =
                  (preset?.presetPricing ?? []).find((p) => p.level === 1)
                    ?.price_Per_Unit ??
                  item.restockInfo?.[0]?.base_Unit_Price ??
                  null;

                return (
                  <div
                    key={item.product.product_ID}
                    className="p-3 rounded-lg border bg-custom-gray flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">
                        {buildDescription(item)}
                      </p>
                      <p className="text-xs text-vesper-gray">
                        {primaryUom}
                        {" · "}
                        {primaryPrice === null
                          ? "No price"
                          : primaryPrice.toFixed(2)}
                      </p>
                    </div>

                    <button
                      className="max-w-fit px-3 py-2 text-xs shrink-0"
                      onClick={() => handleSelectItem(item)}
                      disabled={isAdded}
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
