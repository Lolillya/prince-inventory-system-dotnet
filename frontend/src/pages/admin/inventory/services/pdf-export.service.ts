import { InventoryProductModel } from "@/features/inventory/models/inventory.model";
import jsPDF from "jspdf";

const buildProductDescription = (item: InventoryProductModel) => {
  return item.product.product_Name;
};

export const exportMasterlistPdf = (
  inventory: InventoryProductModel[],
  includePackagingHierarchy: boolean,
) => {
  if (!inventory || inventory.length === 0) return;

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const dateStr = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const pageHeight = doc.internal.pageSize.getHeight();
  const pageWidth = doc.internal.pageSize.getWidth();

  const xCode = 12;
  const xDescription = 55;
  const descMaxWidth = 95;
  const xUom = 155;
  const contentBottom = pageHeight - 12;

  let y = 15;
  let rowIndex = 0;

  const drawHeader = () => {
    doc.setFont("courier", "bold");
    doc.setFontSize(22);
    doc.setTextColor(0, 0, 0);
    doc.text("INVENTORY MASTERLIST", xCode, y);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(153, 153, 153);
    doc.text(dateStr, xCode + 115, y);

    y += 12;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);

    doc.text("PRODUCT CODE", xCode + 2, y);
    doc.text("DESCRIPTION", xDescription + 2, y);
    doc.text("UOM", xUom + 2, y);

    y += 4;
    doc.setDrawColor(238, 238, 238);
    doc.line(10, y, pageWidth - 10, y);

    y += 6;
  };

  const ensureSpace = (neededHeight: number) => {
    if (y + neededHeight > contentBottom) {
      doc.addPage();
      y = 15;
      drawHeader();
    }
  };

  drawHeader();

  const source = inventory.filter((item) => {
    return item.unitPresets && item.unitPresets.length > 0;
  });

  source.forEach((item) => {
    item.unitPresets.forEach((unitPreset) => {
      const sortedLevels = [...(unitPreset.preset.presetLevels ?? [])].sort(
        (a, b) => a.level - b.level,
      );

      const primaryUom = sortedLevels[0]?.unitOfMeasure.uom_Name ?? "-";
      const sku = unitPreset.sku ?? item.product.product_Code ?? "-";
      const codeLines = doc.splitTextToSize(sku, 40);
      const descLines = doc.splitTextToSize(
        buildProductDescription(item),
        descMaxWidth,
      );

      const maxLines = Math.max(codeLines.length, descLines.length);
      let blockHeight = maxLines * 5 + 4;

      if (includePackagingHierarchy && sortedLevels.length > 1) {
        blockHeight += (sortedLevels.length - 1) * 5;
      }

      ensureSpace(blockHeight);

      if (rowIndex % 2 === 1) {
        doc.setFillColor(250, 250, 250);
        doc.rect(10, y - 4, pageWidth - 20, blockHeight + 2, "F");
      }

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10.5);
      doc.setTextColor(0, 0, 0);

      doc.text(codeLines, xCode + 2, y);
      doc.text(descLines, xDescription + 2, y);

      doc.setFont("helvetica", "bold");
      doc.text(primaryUom, xUom + 2, y);

      let currentY = y + 5;

      if (includePackagingHierarchy && sortedLevels.length > 1) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9.5);
        doc.setTextColor(153, 153, 153);

        sortedLevels.slice(1).forEach((level) => {
          doc.text(
            `${level.unitOfMeasure.uom_Name} (${level.conversion_Factor}x)`,
            xUom + 6,
            currentY,
          );
          currentY += 5;
        });
      }

      y += blockHeight - 2;

      doc.setDrawColor(238, 238, 238);
      doc.line(10, y, pageWidth - 10, y);
      y += 6;

      rowIndex++;
    });
  });

  const hierarchySuffix = includePackagingHierarchy
    ? "with-packaging-hierarchy"
    : "without-packaging-hierarchy";

  doc.save(`inventory-masterlist-${hierarchySuffix}.pdf`);
};

export const exportPricelistPdf = (
  inventory: InventoryProductModel[],
  includePackagingHierarchy: boolean,
) => {
  if (!inventory || inventory.length === 0) return;

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const dateStr = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const source = inventory.filter((item) => {
    return item.unitPresets && item.unitPresets.length > 0;
  });

  const pageHeight = doc.internal.pageSize.getHeight();
  const pageWidth = doc.internal.pageSize.getWidth();
  const contentBottom = pageHeight - 12;

  const xCode = 12;
  const xDesc = 55; // Adjusted to align with masterlist
  const xUom = 135;
  const xPrice = 196;

  const codeWidth = 40;
  const descWidth = 75; // Increased width for description

  let y = 16;
  let rowIndex = 0; // tracking for zebra shading

  const drawHeader = () => {
    doc.setFont("courier", "bold");
    doc.setFontSize(22);
    doc.setTextColor(0, 0, 0);
    doc.text("INVENTORY PRICE LIST", xCode, y);

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
  };

  const ensureSpace = (neededHeight: number) => {
    if (y + neededHeight > contentBottom) {
      doc.addPage();
      y = 16;
      drawHeader();
    }
  };

  drawHeader();

  source.forEach((item) => {
    item.unitPresets.forEach((unitPreset) => {
      const sortedLevels = [...(unitPreset.preset?.presetLevels ?? [])].sort(
        (a, b) => a.level - b.level,
      );

      const levelsToRender = includePackagingHierarchy
        ? sortedLevels
        : sortedLevels.slice(0, 1);

      const sku = unitPreset.sku ?? item.product.product_Code ?? "-";
      const codeLines = doc.splitTextToSize(sku, codeWidth);
      const descLines = doc.splitTextToSize(
        buildProductDescription(item),
        descWidth,
      );

      const rowContentHeight = Math.max(
        codeLines.length * 5,
        descLines.length * 5,
      );
      const uomBlockHeight = levelsToRender.length * 5;
      const totalBlockHeight = Math.max(rowContentHeight, uomBlockHeight) + 4;

      ensureSpace(totalBlockHeight);

      if (rowIndex % 2 === 1) {
        doc.setFillColor(250, 250, 250);
        doc.rect(10, y - 4, pageWidth - 20, totalBlockHeight + 2, "F");
      }

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10.5);
      doc.setTextColor(0, 0, 0);
      doc.text(codeLines, xCode + 2, y);
      doc.text(descLines, xDesc + 2, y);

      levelsToRender.forEach((lvl, index) => {
        const pricing = (unitPreset?.presetPricing ?? []).find(
          (p) => p.level === lvl.level,
        );
        const price = pricing != null ? pricing.price_Per_Unit.toFixed(2) : "-";
        const currentY = y + index * 5;

        if (index === 0) {
          doc.setFont("helvetica", "bold");
          doc.setFontSize(10.5);
          doc.setTextColor(0, 0, 0);
          doc.text(lvl.unitOfMeasure.uom_Name, xUom + 2, currentY);
        } else {
          doc.setFont("helvetica", "normal");
          doc.setFontSize(9.5);
          doc.setTextColor(153, 153, 153);
          doc.text(
            `${lvl.unitOfMeasure.uom_Name} (${lvl.conversion_Factor}x)`,
            xUom + 6,
            currentY,
          );
        }

        doc.setFont("helvetica", "normal");
        doc.text(price, xPrice, currentY, { align: "right" });
      });

      y += totalBlockHeight - 2;

      doc.setDrawColor(238, 238, 238);
      doc.line(10, y, pageWidth - 10, y);
      y += 6;

      rowIndex++;
    });
  });

  const hierarchySuffix = includePackagingHierarchy
    ? "include-packaging-hierarchy"
    : "exclude-packaging-hierarchy";

  doc.save(`inventory-pricelist-${hierarchySuffix}.pdf`);
};

export const exportStocklistPdf = (
  inventory: InventoryProductModel[],
  activeFilters: Set<string>,
  includePackagingHierarchy: boolean,
) => {
  if (!inventory || inventory.length === 0) return;
  if (activeFilters.size === 0) return;

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const dateStr = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const pageHeight = doc.internal.pageSize.getHeight();
  const pageWidth = doc.internal.pageSize.getWidth();

  const xCode = 12;
  const xDescription = 55;
  const descMaxWidth = 85;
  const xUom = 142;
  const xQty = 196;
  const contentBottom = pageHeight - 12;

  let y = 15;
  let rowIndex = 0;

  const drawHeader = () => {
    doc.setFont("courier", "bold");
    doc.setFontSize(22);
    doc.setTextColor(0, 0, 0);
    doc.text("INVENTORY STOCK LIST", xCode, y);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(153, 153, 153);
    doc.text(dateStr, xCode + 115, y);

    y += 12;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);

    doc.text("PRODUCT CODE", xCode + 2, y);
    doc.text("DESCRIPTION", xDescription + 2, y);
    doc.text("UOM", xUom + 2, y);
    doc.text("QUANTITY", xQty, y, { align: "right" });

    y += 4;
    doc.setDrawColor(238, 238, 238);
    doc.line(10, y, pageWidth - 10, y);

    y += 6;
  };

  const ensureSpace = (neededHeight: number) => {
    if (y + neededHeight > contentBottom) {
      doc.addPage();
      y = 15;
      drawHeader();
    }
  };

  drawHeader();

  const filteredItems = inventory.filter((item) => {
    // Exclude items with no packaging preset configured
    if (item.unitPresets.length === 0) return false;

    const qty = item.product.quantity;
    const preset = item.unitPresets[0];
    const lowLevel = preset?.low_Stock_Level ?? null;
    const veryLowLevel = preset?.very_Low_Stock_Level ?? null;

    const isNoStock = qty === 0;
    const isVeryLow = !isNoStock && veryLowLevel != null && qty <= veryLowLevel;
    const isLow =
      !isNoStock && !isVeryLow && lowLevel != null && qty <= lowLevel;
    const isSufficient = !isNoStock && !isVeryLow && !isLow;

    return (
      (activeFilters.has("sufficient-stock") && isSufficient) ||
      (activeFilters.has("low-stock") && isLow) ||
      (activeFilters.has("very-low-stock") && isVeryLow) ||
      (activeFilters.has("no-stock") && isNoStock)
    );
  });

  filteredItems.forEach((item) => {
    const preset = item.unitPresets[0];
    const sortedLevels = [...(preset?.preset?.presetLevels ?? [])].sort(
      (a, b) => a.level - b.level,
    );
    const sortedQuantities = [...(preset?.presetQuantities ?? [])].sort(
      (a, b) => a.level - b.level,
    );

    const levelsToRender = includePackagingHierarchy
      ? sortedLevels
      : sortedLevels.slice(0, 1);

    const codeLines = doc.splitTextToSize(item.product.product_Code ?? "-", 40);
    const descLines = doc.splitTextToSize(
      buildProductDescription(item),
      descMaxWidth,
    );

    const textContentHeight = Math.max(
      codeLines.length * 5,
      descLines.length * 5,
    );
    const uomBlockHeight = levelsToRender.length * 5;
    const totalBlockHeight = Math.max(textContentHeight, uomBlockHeight) + 4;

    ensureSpace(totalBlockHeight);

    if (rowIndex % 2 === 1) {
      doc.setFillColor(250, 250, 250);
      doc.rect(10, y - 4, pageWidth - 20, totalBlockHeight + 2, "F");
    }

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10.5);
    doc.setTextColor(0, 0, 0);
    doc.text(codeLines, xCode + 2, y);
    doc.text(descLines, xDescription + 2, y);

    levelsToRender.forEach((lvl, index) => {
      const currentY = y + index * 5;
      const pq = sortedQuantities.find((q) => q.level === lvl.level);
      const quantityStr = pq != null ? String(pq.remaining_Quantity) : "-";

      if (index === 0) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10.5);
        doc.setTextColor(0, 0, 0);
        doc.text(lvl.unitOfMeasure.uom_Name, xUom + 2, currentY);
      } else {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9.5);
        doc.setTextColor(153, 153, 153);
        doc.text(`   ${lvl.unitOfMeasure.uom_Name}`, xUom + 2, currentY);
      }

      doc.setFont("helvetica", "normal");
      doc.text(quantityStr, xQty, currentY, { align: "right" });
    });

    y += totalBlockHeight - 2;
    doc.setDrawColor(238, 238, 238);
    doc.line(10, y, pageWidth - 10, y);
    y += 6;

    rowIndex++;
  });

  const filterSuffix = [
    activeFilters.has("sufficient-stock") ? "sufficient" : "",
    activeFilters.has("low-stock") ? "low" : "",
    activeFilters.has("very-low-stock") ? "very-low" : "",
    activeFilters.has("no-stock") ? "no-stock" : "",
  ]
    .filter(Boolean)
    .join("-");

  const hierarchySuffix = includePackagingHierarchy
    ? "with-hierarchy"
    : "without-hierarchy";
  doc.save(
    `inventory-stocklist-${filterSuffix || "all"}-${hierarchySuffix}.pdf`,
  );
};
