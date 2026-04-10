import { Separator } from "@/components/separator";
import { PurchaseOrderRecord } from "@/features/purchase-order/purchase-order.model";
import { XIcon } from "@/icons";
import { format } from "date-fns";
// [CHANGED] Removed: import { PhilippinePeso } from "lucide-react";
import jsPDF from "jspdf";
import { toast } from "sonner";

interface PurchaseOrderPreviewProps {
  purchaseOrder: PurchaseOrderRecord;
  closeModal: () => void;
}

export const PurchaseOrderPreview = ({
  purchaseOrder,
  closeModal,
}: PurchaseOrderPreviewProps) => {
  // Formats currency with explicit ₱ unicode escape sequence to ensure
  // consistent rendering across all environments (fixes ± fallback issues).
  const formatMoney = (value: number) => {
    const amount = Number.isFinite(value) ? value : 0;
    const sign = amount < 0 ? "-" : "";
    const parts = Math.abs(amount).toFixed(2).split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return `${sign}₱${parts.join(".")}`;
  };

  const formatDate = (value: string) => {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;
    return format(parsed, "yyyy MMM dd");
  };

  const handlePrintToPDF = () => {
    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const left = 14;
      const right = pageWidth - 14;
      const contentWidth = right - left;
      let y = 14;

      const pushNewPageIfNeeded = (requiredSpace = 8) => {
        if (y + requiredSpace <= pageHeight - 14) return;
        doc.addPage();
        y = 10;
      };

      const headerColor = "#1F4B76";
      const tableHeaderColor = "#366282";
      const gridColor = "#B8CDE1";

      const formatMoneyForPdf = (value: number) => {
        const amount = Number.isFinite(value) ? value : 0;
        const sign = amount < 0 ? "-" : "";
        const parts = Math.abs(amount).toFixed(2).split(".");
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return `${sign}PHP ${parts.join(".")}`;
      };

      const fitFontSizeToWidth = (
        text: string,
        maxWidth: number,
        initialSize = 9,
        minSize = 6.5
      ) => {
        let size = initialSize;
        doc.setFontSize(size);
        while (size > minSize && doc.getTextWidth(text) > maxWidth) {
          size -= 0.5;
          doc.setFontSize(size);
        }
        return size;
      };

      // HEADER SECTION
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.setTextColor(headerColor);
      doc.text("PRINCE", left, y);

      // Company info below PRINCE
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text("[Street Address]", left, y + 7);
      doc.text("[City, State, ZIP]", left, y + 12);
      doc.text("Contact No: XXX-XXXX", left, y + 17);
      doc.text("Email: email@domain.com", left, y + 22);

      // PURCHASE ORDER on right with underline
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.setTextColor(headerColor);
      doc.text("PURCHASE ORDER", right, y, { align: "right" });
      const titleWidth = doc.getTextWidth("PURCHASE ORDER");
      doc.setDrawColor(headerColor);
      doc.setLineWidth(0.45);
      doc.line(right - titleWidth, y + 1.8, right, y + 1.8);

      // P.O. # and Date directly below PURCHASE ORDER
      const poLabelX = right - 62;
      const poValueX = right;
      const poValueWidth = 50;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text("P.O. #:", poLabelX, y + 10, { align: "left" });
      doc.setFont("helvetica", "normal");
      doc.text(purchaseOrder.purchase_Order_Number || "-", poValueX, y + 10, {
        align: "right",
        maxWidth: poValueWidth,
      });

      doc.setFont("helvetica", "bold");
      doc.text("Date:", poLabelX, y + 16, { align: "left" });
      doc.setFont("helvetica", "normal");
      doc.text(formatDate(purchaseOrder.created_At), poValueX, y + 16, {
        align: "right",
        maxWidth: poValueWidth,
      });

      y += 29;

      // Header separator
      doc.setDrawColor(tableHeaderColor);
      doc.setLineWidth(1.1);
      doc.line(left, y, right, y);

      y += 9;

      // SUPPLIER/BUYER AND DELIVER TO SECTION
      const midColumn = left + contentWidth / 2;
      const leftValueX = left + 24;
      const rightValueX = right;
      const detailRowGap = 9;
      const detailDividerTop = y - 3;
      const detailDividerBottom = y + detailRowGap + 3;

      doc.setDrawColor("#D4DCE5");
      doc.setLineWidth(0.2);
      doc.line(midColumn - 3, detailDividerTop, midColumn - 3, detailDividerBottom);

      // Left column: SUPPLIER and BUYER
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(headerColor);
      doc.text("SUPPLIER:", left, y);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(0);
      doc.text(purchaseOrder.supplier.company_Name || "-", leftValueX, y);

      // Right column: DELIVER TO
      doc.setFont("helvetica", "bold");
      doc.setTextColor(headerColor);
      doc.text("DELIVER TO:", midColumn, y);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(0);
      doc.text("[Address]", rightValueX, y, { align: "right" });

      doc.setDrawColor("#D4DCE5");
      doc.setLineWidth(0.2);
      doc.line(left, y + 2.2, midColumn - 6, y + 2.2);
      doc.line(midColumn, y + 2.2, right, y + 2.2);

      y += detailRowGap;

      // BUYER row
      doc.setFont("helvetica", "bold");
      doc.setTextColor(headerColor);
      doc.text("BUYER:", left, y);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(0);
      doc.text(
        `${purchaseOrder.clerk.first_Name} ${purchaseOrder.clerk.last_Name}`,
        leftValueX,
        y
      );

      // Please Deliver/Ship By row
      doc.setFont("helvetica", "bold");
      doc.setTextColor(headerColor);
      doc.text("Please Deliver/Ship By:", midColumn, y);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(0);
      doc.text(formatDate(purchaseOrder.preferred_Delivery), rightValueX, y, {
        align: "right",
      });

      y += 7;

      // HORIZONTAL LINE SEPARATOR
      doc.setDrawColor(150);
      doc.setLineWidth(0.3);
      doc.line(left, y, right, y);

      y += 6;

      // TABLE SECTION - Define columns carefully
      const colWidths = {
        no: 12,
        item: 72,
        qty: 20,
        unit: 18,
        price: 26,
        subtotal: 34,
      };

      const colEdges = {
        noStart: left,
        noEnd: left + colWidths.no,
        itemStart: left + colWidths.no,
        itemEnd: left + colWidths.no + colWidths.item,
        qtyStart: left + colWidths.no + colWidths.item,
        qtyEnd: left + colWidths.no + colWidths.item + colWidths.qty,
        unitStart: left + colWidths.no + colWidths.item + colWidths.qty,
        unitEnd: left + colWidths.no + colWidths.item + colWidths.qty + colWidths.unit,
        priceStart: left + colWidths.no + colWidths.item + colWidths.qty + colWidths.unit,
        priceEnd:
          left +
          colWidths.no +
          colWidths.item +
          colWidths.qty +
          colWidths.unit +
          colWidths.price,
        subtotalStart:
          left +
          colWidths.no +
          colWidths.item +
          colWidths.qty +
          colWidths.unit +
          colWidths.price,
        subtotalEnd: right,
      };

      const colCenters = {
        no: (colEdges.noStart + colEdges.noEnd) / 2,
        qty: (colEdges.qtyStart + colEdges.qtyEnd) / 2,
        unit: (colEdges.unitStart + colEdges.unitEnd) / 2,
        price: (colEdges.priceStart + colEdges.priceEnd) / 2,
        subtotal: (colEdges.subtotalStart + colEdges.subtotalEnd) / 2,
      };

      const rows = Math.max(10, purchaseOrder.line_Items.length);
      const rowHeight = 6;
      pushNewPageIfNeeded(8 + rows * rowHeight + 58);

      // Table header
      doc.setFillColor(tableHeaderColor);
      doc.setDrawColor(tableHeaderColor);
      doc.rect(left, y, contentWidth, 7, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(255);
      doc.text("No.", colCenters.no, y + 4.8, { align: "center" });
      doc.text("Item Description", colEdges.itemStart + 2, y + 4.8, {
        align: "left",
      });
      doc.text("Quantity", colCenters.qty, y + 4.8, { align: "center" });
      doc.text("Unit", colCenters.unit, y + 4.8, { align: "center" });
      doc.text("Price", colCenters.price, y + 4.8, { align: "center" });
      doc.text("Subtotal", colCenters.subtotal, y + 4.8, { align: "center" });

      y += 7;

      // Draw rows and strong grid lines
      const tableBottomY = y + rows * rowHeight;

      // Horizontal lines
      doc.setDrawColor(gridColor);
      doc.setLineWidth(0.3);
      for (let i = 0; i <= rows; i++) {
        doc.line(left, y + i * rowHeight, right, y + i * rowHeight);
      }

      // Vertical lines for columns
      const vLines = [
        colEdges.noStart,
        colEdges.noEnd,
        colEdges.itemEnd,
        colEdges.qtyEnd,
        colEdges.unitEnd,
        colEdges.priceEnd,
        colEdges.subtotalEnd,
      ];
      vLines.forEach((x) => {
        doc.line(x, y, x, tableBottomY);
      });

      // Table data
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(0);
      const cellPadding = 1.5;
      const itemTextWidth = colWidths.item - cellPadding * 2;
      const priceTextWidth = colWidths.price - cellPadding * 2;
      const subtotalTextWidth = colWidths.subtotal - cellPadding * 2;

      for (let i = 0; i < rows; i++) {
        const rowY = y + i * rowHeight + 4;

        if (i < purchaseOrder.line_Items.length) {
          const line = purchaseOrder.line_Items[i];
          const itemName = `${line.product?.product_Name || "-"} - ${line.product?.brand || "-"} - ${line.product?.variant || "-"}`;
          const unitName = line.unit?.uom_Name ?? "-";
          const itemText = doc.splitTextToSize(itemName, itemTextWidth)[0] || "-";

          doc.text(String(i + 1), colCenters.no, rowY, { align: "center" });
          doc.text(itemText, colEdges.itemStart + cellPadding, rowY, { align: "left" });
          doc.text(String(line.quantity ?? 0), colCenters.qty, rowY, {
            align: "center",
          });
          doc.text(unitName, colCenters.unit, rowY, { align: "center" });

          // Format price and subtotal with ₱ symbol using explicit unicode escape
          const priceStr = formatMoneyForPdf(Number(line.unit_Price ?? 0));
          const subtotalStr = formatMoneyForPdf(Number(line.sub_Total ?? 0));

          const baseFontSize = doc.getFontSize();

          // Fit price text to available width, accounting for currency symbol
          fitFontSizeToWidth(priceStr, priceTextWidth, 8.5, 6);
          doc.text(priceStr, colCenters.price, rowY, {
            align: "center",
          });
          doc.setFontSize(baseFontSize);

          // Fit subtotal text to available width, accounting for currency symbol
          fitFontSizeToWidth(subtotalStr, subtotalTextWidth, 8.5, 6);
          doc.text(subtotalStr, colCenters.subtotal, rowY, {
            align: "center",
          });
          doc.setFontSize(baseFontSize);
        }
      }

      y = tableBottomY + 7;

      // TOTAL SECTION
      pushNewPageIfNeeded(48);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(0);

      // Total row and boxed amount
      const totalRowHeight = 10;
      const totalBoxWidth = 42;
      const totalBoxX = right - totalBoxWidth;
      const totalValueY = y + totalRowHeight / 2 + 1.2;

      doc.setDrawColor("#B8CDE1");
      doc.setLineWidth(0.35);
      doc.rect(left, y, contentWidth, totalRowHeight);

      doc.text("Total:", totalBoxX - 6, totalValueY, { align: "right" });
      doc.setDrawColor("#366282");
      doc.setLineWidth(0.4);
      doc.rect(totalBoxX, y, totalBoxWidth, totalRowHeight);

      const totalStr = formatMoneyForPdf(Number(purchaseOrder.grand_Total ?? 0));
      doc.setFont("helvetica", "normal");
      const totalAvailableWidth = totalBoxWidth - 4;
      fitFontSizeToWidth(totalStr, totalAvailableWidth, 10, 8);
      doc.text(totalStr, totalBoxX + totalBoxWidth / 2, totalValueY, {
        align: "center",
      });
      doc.setFontSize(10);

      y += 15;

      // NOTE SECTION
      pushNewPageIfNeeded(48);

      // Note header with background
      doc.setFillColor("#E5EFFD");
      doc.setDrawColor("#B8CDE1");
      doc.setLineWidth(0.3);
      doc.rect(left, y, contentWidth, 7, "FD");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(headerColor);
      doc.text("NOTE", left + 2, y + 4.8);

      y += 7;

      // Note content box
      doc.setDrawColor("#B8CDE1");
      doc.setLineWidth(0.3);
      const noteBoxHeight = 34;
      doc.rect(left, y, contentWidth, noteBoxHeight);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(0);
      const noteLines = doc.splitTextToSize(purchaseOrder.notes || "-", contentWidth - 4);
      doc.text(noteLines, left + 2, y + 4);

      doc.save(`${purchaseOrder.purchase_Order_Number}.pdf`);
      toast.success("Purchase order PDF generated successfully.");
    } catch {
      toast.error("Failed to generate purchase order PDF.");
    }
  };

  return (
    <section className="absolute bg-black/40 w-full h-full top-0 left-0 flex justify-center items-center z-60">
      <div className="bg-background flex flex-col w-4/5 max-w-5xl h-[86%] p-6 gap-4 rounded-lg shadow-lg border">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold">Purchase Order Preview</h3>
          <button
            className="p-2 rounded hover:bg-gray-100"
            onClick={closeModal}
            aria-label="Close purchase order preview"
          >
            <XIcon />
          </button>
        </div>

        <div className="w-full h-full bg-white rounded-lg flex flex-col overflow-y-auto gap-2 p-3">
          <div className="flex flex-col gap-3 bg-custom-gray-lighter p-4 h-full">
            <div className="flex justify-between w-full">
              <h3 className="w-full text-xl font-bold">Prince</h3>
              <h3 className="uppercase w-[30%] text-right">purchase order</h3>
            </div>

            <Separator orientation="horizontal" />

            <div className="flex flex-col">
              <label>[Street Address]</label>
              <label>[City, State, ZIP]</label>
            </div>
            <div className="flex justify-between w-full">
              <div className="flex flex-col w-full">
                <label>[Phone Number]</label>
                <label>[Email Address]</label>
              </div>

              <div className="flex flex-col w-[30%]">
                <label>P.O. #: {purchaseOrder.purchase_Order_Number}</label>
                <label>Date: {formatDate(purchaseOrder.created_At)}</label>
              </div>
            </div>
            <Separator orientation="horizontal" />

            <div className="flex justify-between w-full">
              <div className="flex w-full">
                <label className="uppercase">supplier: </label>
                <span className="ml-1">
                  {purchaseOrder.supplier.company_Name}
                </span>
              </div>

              <div className="flex w-[30%]">
                <label className="uppercase">deliver to: </label>
                <span className="ml-1">[ Address ]</span>
              </div>
            </div>

            <Separator orientation="horizontal" />

            <div className="flex justify-between w-full">
              <div className="flex w-full">
                <label className="uppercase">buyer: </label>
                <span className="ml-1">
                  {purchaseOrder.clerk.first_Name}{" "}
                  {purchaseOrder.clerk.last_Name}
                </span>
              </div>

              <div className="flex w-[30%]">
                <label className="uppercase">Deliver By: </label>
                <span className="ml-1">
                  {formatDate(purchaseOrder.preferred_Delivery)}
                </span>
              </div>
            </div>

            {/* [CHANGED] Added table-fixed layout and explicit column widths to
                prevent Price/Subtotal cells from overflowing into adjacent cells */}
            <div className="w-full h-full">
              <table className="w-full text-sm table-fixed">
                <colgroup>
                  <col className="w-8" />
                  <col />
                  <col className="w-20" />
                  <col className="w-16" />
                  {/* [CHANGED] Widened Price and Subtotal columns so values fit */}
                  <col className="w-28" />
                  <col className="w-28" />
                </colgroup>
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">No.</th>
                    <th className="text-left py-2">Item</th>
                    <th className="text-right py-2">Quantity</th>
                    <th className="text-right py-2">Unit</th>
                    <th className="text-right py-2">Price</th>
                    <th className="text-right py-2">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {purchaseOrder.line_Items.map((line, index) => (
                    <tr
                      key={line.purchase_Order_LineItem_ID}
                      className="bg-white border-b"
                    >
                      <td className="text-center py-2">{index + 1}</td>
                      <td className="py-2 break-words">
                        {line.product?.product_Name || "-"} -{" "}
                        {line.product?.brand || "-"} -{" "}
                        {line.product?.variant || "-"}
                      </td>
                      <td className="text-right py-2">{line.quantity}</td>
                      <td className="text-right py-2">
                        {line.unit?.uom_Name ?? "-"}
                      </td>
                      {/* [CHANGED] Removed PhilippinePeso icon; use ₱ text character.
                          Added whitespace-nowrap so the value never wraps mid-number. */}
                      <td className="text-right py-2 whitespace-nowrap">
                        {formatMoney(Number(line.unit_Price || 0))}
                      </td>
                      <td className="text-right py-2 whitespace-nowrap">
                        {formatMoney(Number(line.sub_Total || 0))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* [CHANGED] Total uses formatMoney (₱ text) instead of raw Intl output */}
            <div className="flex justify-end">
              <label className="font-bold">Total: </label>
              <span className="ml-1 whitespace-nowrap">
                {formatMoney(Number(purchaseOrder.grand_Total || 0))}
              </span>
            </div>

            <div className="rounded border border-gray-300 p-2 bg-white">
              <label className="font-semibold text-sm">Note</label>
              <p className="text-sm mt-1 whitespace-pre-wrap">
                {purchaseOrder.notes || "-"}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center w-full justify-end gap-2 pt-2">
          <button
            className="px-4 py-2 text-sm rounded border"
            onClick={closeModal}
          >
            Close
          </button>
          <button
            className="px-4 py-2 text-sm rounded bg-blue-500 text-white hover:bg-blue-600"
            onClick={handlePrintToPDF}
          >
            Print
          </button>
        </div>
      </div>
    </section>
  );
};