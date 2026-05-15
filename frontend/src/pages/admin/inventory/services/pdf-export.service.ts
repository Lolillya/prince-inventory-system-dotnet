import { InventoryProductModel } from "@/features/inventory/models/inventory.model";
import jsPDF from "jspdf";

const buildProductDescription = (item: InventoryProductModel) => {
    return `${item.product.product_Name} - ${item.brand.brandName} - ${item.variant.variant_Name}`;
};

export const exportMasterlistPdf = (
    inventory: InventoryProductModel[],
    includePackagingHierarchy: boolean
) => {
    if (!inventory || inventory.length === 0) return;

    const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
    });

    const dateStr = new Date().toLocaleDateString("en-US", {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
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
        const sortedLevels = [
            ...(item.unitPresets[0]?.preset.presetLevels ?? []),
        ].sort((a, b) => a.level - b.level);

        const primaryUom = sortedLevels[0]?.unitOfMeasure.uom_Name ?? "-";
        const codeLines = doc.splitTextToSize(item.product.product_Code ?? "-", 40);
        const descLines = doc.splitTextToSize(buildProductDescription(item), descMaxWidth);

        const maxLines = Math.max(codeLines.length, descLines.length);
        let blockHeight = maxLines * 5 + 4;

        if (includePackagingHierarchy && sortedLevels.length > 1) {
            blockHeight += (sortedLevels.length - 1) * 5;
        }

        ensureSpace(blockHeight);

        if (rowIndex % 2 === 1) {
            doc.setFillColor(250, 250, 250);
            doc.rect(10, y - 4, pageWidth - 20, blockHeight + 2, 'F');
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
                    `└─ ${level.unitOfMeasure.uom_Name} (${level.conversion_Factor}x)`,
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

    const flattenedRows = inventory.flatMap((item) => {
        const preset = item.unitPresets[0];
        const sortedLevels = [...(preset?.preset?.presetLevels ?? [])].sort(
            (a, b) => a.level - b.level,
        );

        const levelsToRender = includePackagingHierarchy
            ? sortedLevels
            : sortedLevels.slice(0, 1);

        return levelsToRender.map((lvl, index) => {
            const pricing = (preset?.presetPricing ?? []).find(
                (p) => p.level === lvl.level,
            );
            const price = pricing != null ? pricing.price_Per_Unit.toFixed(2) : "-";
            return {
                code: index === 0 ? item.product.product_Code : "",
                description: index === 0 ? buildProductDescription(item) : "",
                uom:
                    index === 0
                        ? lvl.unitOfMeasure.uom_Name
                        : `-- ${lvl.unitOfMeasure.uom_Name}`,
                price,
            };
        });
    });

    const pageHeight = doc.internal.pageSize.getHeight();
    const contentBottom = pageHeight - 12;

    const xCode = 12;
    const xDesc = 58;
    const xUom = 135;
    const xPrice = 196;

    const codeWidth = 40;
    const descWidth = 72;
    const uomWidth = 48;

    let y = 16;

    const drawHeader = () => {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.text("Price List", xCode, y);

        y += 8;
        y += 6;
        doc.setFontSize(10.5);
        doc.text("Product Code", xCode, y);
        doc.text("Description", xDesc, y);
        doc.text("UOM", xUom, y);
        doc.text("Price", xPrice, y, { align: "right" });

        y += 9;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
    };

    const ensureSpace = (neededHeight: number) => {
        if (y + neededHeight > contentBottom) {
            doc.addPage();
            y = 16;
            drawHeader();
        }
    };

    drawHeader();

    flattenedRows.forEach((row) => {
        const codeLines = row.code
            ? doc.splitTextToSize(row.code, codeWidth)
            : [""];
        const descLines = row.description
            ? doc.splitTextToSize(row.description, descWidth)
            : [""];
        const uomLines = doc.splitTextToSize(row.uom, uomWidth);

        const lineCount = Math.max(
            codeLines.length,
            descLines.length,
            uomLines.length,
            1,
        );
        const rowHeight = lineCount * 5 + 2;

        ensureSpace(rowHeight + 1);

        doc.text(codeLines, xCode, y);
        doc.text(descLines, xDesc, y);
        doc.text(uomLines, xUom, y);
        doc.text(row.price, xPrice, y, { align: "right" });

        y += rowHeight;
    });

    const hierarchySuffix = includePackagingHierarchy
        ? "include-packaging-hierarchy"
        : "exclude-packaging-hierarchy";

    doc.save(`inventory-pricelist-${hierarchySuffix}.pdf`);
};

export const exportStocklistPdf = (
    inventory: InventoryProductModel[],
    activeFilters: Set<string>,
) => {
    if (!inventory || inventory.length === 0) return;
    if (activeFilters.size === 0) return;

    const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
    });

    const filteredItems = inventory.filter((item) => {
        // Exclude items with no packaging preset configured
        if (item.unitPresets.length === 0) return false;

        const qty = item.product.quantity;
        const preset = item.unitPresets[0];
        const lowLevel = preset?.low_Stock_Level ?? null;
        const veryLowLevel = preset?.very_Low_Stock_Level ?? null;

        // Categorize into exactly one bucket
        const isNoStock = qty === 0;
        const isVeryLow =
            !isNoStock && veryLowLevel != null && qty <= veryLowLevel;
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

    const rows = filteredItems.flatMap((item) => {
        const preset = item.unitPresets[0];
        const sortedLevels = [...(preset?.preset?.presetLevels ?? [])].sort(
            (a, b) => a.level - b.level,
        );

        const sortedQuantities = [...(preset?.presetQuantities ?? [])].sort(
            (a, b) => a.level - b.level,
        );

        if (sortedLevels.length === 0) {
            return [
                {
                    code: item.product.product_Code,
                    description: buildProductDescription(item),
                    uom: "-",
                    quantity: String(item.product.quantity),
                },
            ];
        }

        return sortedLevels.map((lvl, index) => {
            const qty = sortedQuantities.find((q) => q.level === lvl.level);
            const quantityStr = qty != null ? String(qty.remaining_Quantity) : "-";
            return {
                code: index === 0 ? item.product.product_Code : "",
                description: index === 0 ? buildProductDescription(item) : "",
                uom:
                    index === 0
                        ? lvl.unitOfMeasure.uom_Name
                        : `-- ${lvl.unitOfMeasure.uom_Name}`,
                quantity: quantityStr,
            };
        });
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const startX = 10;
    const startY = 14;
    const colWidths = {
        code: 38,
        description: 66,
        uom: 54,
        qty: 30,
    };
    const rowHeight = 11;
    const headerHeight = 11;
    const tableWidth =
        colWidths.code + colWidths.description + colWidths.uom + colWidths.qty;

    const xCode = startX;
    const xDesc = xCode + colWidths.code;
    const xUom = xDesc + colWidths.description;
    const xQty = xUom + colWidths.uom;

    doc.setFillColor(28, 29, 33);
    doc.rect(0, 0, pageWidth, pageHeight, "F");

    const drawTableHeader = (sy: number) => {
        doc.setFillColor(32, 33, 37);
        doc.rect(startX, sy, tableWidth, headerHeight, "F");
        doc.setDrawColor(58, 60, 65);
        doc.setLineWidth(0.3);
        doc.setTextColor(238, 238, 238);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10.5);
        doc.text("Product Code", xCode + 2, sy + 7);
        doc.text("Description", xDesc + 2, sy + 7);
        doc.text("UOM", xUom + 2, sy + 7);
        doc.text("Quantity", xQty + 2, sy + 7);
        doc.setFont("helvetica", "normal");
    };

    drawTableHeader(startY);

    let currentY = startY + headerHeight;

    rows.forEach((row) => {
        const contentBottom = pageHeight - 10;
        if (currentY + rowHeight > contentBottom) {
            doc.addPage();
            doc.setFillColor(28, 29, 33);
            doc.rect(0, 0, pageWidth, pageHeight, "F");
            drawTableHeader(startY);
            currentY = startY + headerHeight;
        }

        doc.setDrawColor(58, 60, 65);
        doc.setLineWidth(0.3);
        doc.line(startX, currentY, startX + tableWidth, currentY);

        doc.setTextColor(238, 238, 238);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10.5);

        doc.text(
            doc.splitTextToSize(row.code, colWidths.code - 4),
            xCode + 2,
            currentY + 7,
        );
        doc.text(
            doc.splitTextToSize(row.description, colWidths.description - 4),
            xDesc + 2,
            currentY + 7,
        );
        doc.text(
            doc.splitTextToSize(row.uom, colWidths.uom - 4),
            xUom + 2,
            currentY + 7,
        );
        doc.text(
            doc.splitTextToSize(row.quantity, colWidths.qty - 4),
            xQty + 2,
            currentY + 7,
        );

        currentY += rowHeight;
    });

    doc.setDrawColor(58, 60, 65);
    doc.line(startX, currentY, startX + tableWidth, currentY);

    const filterSuffix = [
        activeFilters.has("sufficient-stock") ? "sufficient" : "",
        activeFilters.has("low-stock") ? "low" : "",
        activeFilters.has("very-low-stock") ? "very-low" : "",
        activeFilters.has("no-stock") ? "no-stock" : "",
    ]
        .filter(Boolean)
        .join("-");

    doc.save(`inventory-stocklist-${filterSuffix || "all"}.pdf`);
};
