import { Separator } from "@/components/separator";
import { Switch } from "@/components/ui/switch";
import { PurchaseOrderRecord } from "@/features/purchase-order/purchase-order.model";
import { XIcon } from "@/icons";
import { format } from "date-fns";
// [CHANGED] Removed: import { PhilippinePeso } from "lucide-react";
import jsPDF from "jspdf";
import { PhilippinePeso, Printer } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface PurchaseOrderPreviewProps {
  purchaseOrder: PurchaseOrderRecord;
  closeModal: () => void;
}

export const PurchaseOrderPreview = ({
  purchaseOrder,
  closeModal,
}: PurchaseOrderPreviewProps) => {
  const [isPackagingPresetOn, setIsPackagingPresetOn] = useState(false);

  const buildUnitChain = (
    levels: { level: number; uom_Name: string; conversion_Factor: number }[],
  ) =>
    [...levels]
      .sort((a, b) => a.level - b.level)
      .map((l) =>
        l.conversion_Factor !== 1
          ? `${l.uom_Name} (${l.conversion_Factor}x)`
          : l.uom_Name,
      )
      .join(" > ");

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
      // Less margins all-around, black & white only, A4.
      const left = 10;
      const right = pageWidth - 10;
      const contentWidth = right - left;
      const bottomLimit = pageHeight - 10;
      let y = 14;
      let pageCount = 1;

      const pushNewPageIfNeeded = (requiredSpace = 8) => {
        if (y + requiredSpace <= bottomLimit) return;
        doc.addPage();
        pageCount += 1;
        y = 14;
      };

      const formatMoneyForPdf = (value: number) => {
        const amount = Number.isFinite(value) ? value : 0;
        const sign = amount < 0 ? "-" : "";
        const parts = Math.abs(amount).toFixed(2).split(".");
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return `${sign}${parts.join(".")}`;
      };

      doc.setTextColor(0);
      doc.setDrawColor(0);

      // HEADER SECTION
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.text("PRINCE", left, y);
      doc.text("PURCHASE ORDER", right, y, { align: "right" });

      const infoLabelX = right - 55;
      let leftY = y + 8;
      let rightY = y + 8;

      // Company info below PRINCE
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text(`Address: ${purchaseOrder.supplier.address}`, left, leftY);
      leftY += 5;
      // doc.text("City, State, ZIP", left, leftY);
      // leftY += 5;
      doc.text(`Contact No.: ${purchaseOrder.supplier.email}`, left, leftY);
      leftY += 5;
      doc.text(`Email: ${purchaseOrder.supplier.email}`, left, leftY);
      leftY += 5;

      // P.O. #, Date, Page below PURCHASE ORDER
      const infoRow = (label: string, value: string) => {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9.5);
        doc.text(label, infoLabelX, rightY);
        doc.setFont("helvetica", "normal");
        doc.text(value, right, rightY, { align: "right" });
        rightY += 5;
      };

      infoRow("P.O. #:", purchaseOrder.purchase_Order_Number || "-");
      infoRow("Date:", formatDate(purchaseOrder.created_At));
      infoRow("Page:", `${pageCount} of 1`);

      y = Math.max(leftY, rightY) + 3;

      // Header separator
      doc.setLineWidth(0.4);
      doc.line(left, y, right, y);

      y += 7;

      // SUPPLIER / REQUESTED DELIVERY / PREPARED BY / DELIVER TO
      const midColumn = left + contentWidth * 0.52;
      const leftValueX = left + 24;

      const detailRow = (
        leftLabel: string,
        leftValue: string,
        rightLabel: string,
        rightValue: string,
      ) => {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9.5);
        doc.text(leftLabel, left, y);
        doc.setFont("helvetica", "normal");
        doc.text(leftValue || "-", leftValueX, y);

        doc.setFont("helvetica", "bold");
        doc.text(rightLabel, midColumn, y);
        doc.setFont("helvetica", "normal");
        doc.text(rightValue || "-", right, y, { align: "right" });

        y += 6.5;
      };

      detailRow(
        "Supplier:",
        purchaseOrder.supplier.company_Name,
        "Requested Delivery Date:",
        formatDate(purchaseOrder.preferred_Delivery),
      );
      detailRow(
        "Prepared By:",
        `${purchaseOrder.clerk.first_Name} ${purchaseOrder.clerk.last_Name}`,
        "Deliver To:",
        purchaseOrder.supplier.address || "[Address]",
      );

      y += 2;

      // Separator before table
      doc.setLineWidth(0.4);
      doc.line(left, y, right, y);

      y += 6;

      // TABLE SECTION - column widths (no vertical/grid lines, category excluded)
      const colWidths = {
        no: 12,
        qty: 22,
        unit: 16,
        unitPrice: 18,
        total: 24,
      };
      const itemWidth =
        contentWidth -
        (colWidths.no +
          colWidths.qty +
          colWidths.unit +
          colWidths.unitPrice +
          colWidths.total);

      const colX = {
        noCenter: left + colWidths.no / 2,
        itemStart: left + colWidths.no,
        qtyEnd: left + colWidths.no + itemWidth + colWidths.qty,
        unitEnd:
          left + colWidths.no + itemWidth + colWidths.qty + colWidths.unit,
        unitPriceEnd:
          left +
          colWidths.no +
          itemWidth +
          colWidths.qty +
          colWidths.unit +
          colWidths.unitPrice,
        totalEnd: right,
      };

      const colGap = 2;

      const renderTableHeader = () => {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9.5);
        doc.text("No.", colX.noCenter, y, { align: "center" });
        doc.text("Item Description", colX.itemStart, y, { align: "left" });
        doc.text("Quantity", colX.qtyEnd - colGap, y, { align: "right" });
        doc.text("Unit", colX.unitEnd - colWidths.unit + colGap, y, {
          align: "left",
        });
        doc.text("Unit Price", colX.unitPriceEnd, y, { align: "right" });
        doc.text("Total", colX.totalEnd, y, { align: "right" });
        y += 3;
        doc.setLineWidth(0.4);
        doc.line(left, y, right, y);
        y += 5.5;
      };

      renderTableHeader();

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);

      const lineHeight = 4.2;
      const itemTextWidth = itemWidth - 3;

      if (purchaseOrder.line_Items.length === 0) {
        doc.setFont("helvetica", "italic");
        doc.text("No items listed.", left + colWidths.no, y);
        y += lineHeight + 2;
        doc.setLineWidth(0.2);
        doc.line(left, y - 3, right, y - 3);
      } else {
        purchaseOrder.line_Items.forEach((line, i) => {
          const itemName = [
            line.product?.product_Name,
            line.product?.brand,
            line.product?.variant,
          ]
            .filter(Boolean)
            .join(" - ");
          const itemLines: string[] = doc.splitTextToSize(
            itemName || "-",
            itemTextWidth,
          );
          const rowHeight = Math.max(lineHeight, itemLines.length * lineHeight);

          pushNewPageIfNeeded(rowHeight + 10);

          const firstLineY = y;
          doc.setFont("helvetica", "normal");
          doc.setFontSize(9);
          doc.text(String(i + 1), colX.noCenter, firstLineY, {
            align: "center",
          });
          doc.text(itemLines, colX.itemStart, firstLineY, { align: "left" });
          doc.text(
            String(line.quantity ?? 0),
            colX.qtyEnd - colGap,
            firstLineY,
            {
              align: "right",
            },
          );
          doc.text(
            line.unit?.uom_Name ?? "-",
            colX.unitEnd - colWidths.unit + colGap,
            firstLineY,
            {
              align: "left",
            },
          );
          doc.text(
            formatMoneyForPdf(Number(line.unit_Price ?? 0)),
            colX.unitPriceEnd,
            firstLineY,
            { align: "right" },
          );
          doc.text(
            formatMoneyForPdf(Number(line.sub_Total ?? 0)),
            colX.totalEnd,
            firstLineY,
            { align: "right" },
          );

          y += rowHeight + 2;

          // Only a horizontal line separates rows - no vertical/grid lines.
          doc.setLineWidth(0.2);
          doc.line(left, y - 2, right, y - 2);
        });
      }

      y += 5;

      // GRAND TOTAL
      pushNewPageIfNeeded(20);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("GRAND TOTAL:", right - 70, y);
      doc.text(
        `PHP ${formatMoneyForPdf(Number(purchaseOrder.grand_Total ?? 0))}`,
        right,
        y,
        { align: "right" },
      );

      y += 12;

      // NOTES SECTION - only occupies space if there is a note.
      pushNewPageIfNeeded(20);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text("Notes", left, y);
      y += 2.5;
      doc.setLineWidth(0.3);
      doc.line(left, y, right, y);
      y += 5;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      const noteText = purchaseOrder.notes?.trim() || "-";
      const noteLines = doc.splitTextToSize(noteText, contentWidth);
      pushNewPageIfNeeded(noteLines.length * lineHeight);
      doc.text(noteLines, left, y);

      doc.save(`${purchaseOrder.purchase_Order_Number}.pdf`);
      toast.success("Purchase order PDF generated successfully.");
    } catch {
      toast.error("Failed to generate purchase order PDF.");
    }
  };

  return (
    <section className="absolute bg-black/40 w-full h-full top-0 left-0 flex justify-center items-center z-60">
      <div className="bg-background flex flex-col w-4/5 max-w-5xl h-fit max-h-4/5 p-6 gap-4 rounded-lg shadow-lg border overflow-hidden">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold">Purchase Order Preview</h3>
          <div
            className="p-2 rounded hover:bg-gray-100 transition-all duration-300 cursor-pointer"
            onClick={closeModal}
            aria-label="Close purchase order preview"
          >
            <XIcon />
          </div>
        </div>

        <Separator orientation="horizontal" />

        <div className="grid grid-cols-[0.1fr_1fr]">
          <label className="font-semibold">PO #:</label>
          <label>{purchaseOrder.purchase_Order_Number}</label>
          <label className="font-semibold">Date: </label>
          <label>{formatDate(purchaseOrder.created_At)}</label>
        </div>

        <Separator orientation="horizontal" />

        <div className="grid grid-cols-[0.4fr_1fr_0.8fr_1fr]">
          <label className="font-semibold">Supplier:</label>
          <label>{purchaseOrder.supplier.company_Name}</label>
          <label className="font-semibold text-nowrap">
            Requested Delivery Date:{" "}
          </label>
          <label>{formatDate(purchaseOrder.preferred_Delivery)}</label>

          <label className="font-semibold">Prepared By: </label>
          <label>
            {purchaseOrder.clerk.first_Name} {purchaseOrder.clerk.last_Name}
          </label>
          <label className="font-semibold">Delivery To: </label>
          <label>{purchaseOrder.supplier.address || "-"}</label>
        </div>

        <Separator orientation="horizontal" />

        <div className="flex gap-2 items-center p-4 bg-blue-50 border-2 border-blue-300 rounded-md">
          <label>Packaging Preset </label>
          <Switch
            checked={isPackagingPresetOn}
            onCheckedChange={setIsPackagingPresetOn}
          />
          <label>{isPackagingPresetOn ? "ON" : "OFF"}</label>
        </div>

        <div className="flex flex-col min-h-0 flex-1">
          <div className="grid grid-cols-[0.2fr_2fr_0.2fr_0.4fr_0.4fr_0.4fr] py-2 px-4 bg-gray-100 border-2 border-gray-300 gap-x-2 shrink-0">
            <label>No.</label>
            <label>Item Description</label>
            <label className="text-right">Quantity</label>
            <label className="text-right">Unit</label>
            <label className="text-right">Unit Price</label>
            <label className="text-right">Total</label>
          </div>

          <div className="overflow-y-auto min-h-0">
            {purchaseOrder.line_Items.map((line, i) => (
              <div
                key={line.purchase_Order_LineItem_ID}
                className="grid grid-cols-[0.2fr_2fr_0.2fr_0.4fr_0.4fr_0.4fr] py-2 px-4 bg-gray-100 border-b-2 border-x-2 border-gray-300 text-xs gap-x-2"
              >
                <label>{i + 1}</label>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <label>
                      {line.product?.product_Name ?? "-"} -{" "}
                      {line.product?.brand ?? "-"} -{" "}
                      {line.product?.variant ?? "-"}
                    </label>
                    {line.product?.category ? (
                      <>
                        <label>•</label>
                        <label>{line.product.category}</label>
                      </>
                    ) : null}
                  </div>
                  {isPackagingPresetOn && line.unit_Preset ? (
                    <label className="text-vesper-gray">
                      {buildUnitChain(line.unit_Preset.preset_Levels)}
                    </label>
                  ) : null}
                </div>
                <label className="text-right">{line.quantity}</label>
                <label className="text-right">
                  {line.unit?.uom_Name ?? "-"}
                </label>
                <label className="text-right">
                  {formatMoney(Number(line.unit_Price ?? 0))}
                </label>
                <label className="text-right">
                  {formatMoney(Number(line.sub_Total ?? 0))}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="flex">
          <div className="w-full" />
          <div className="w-[45%] border-t-2 border-gray-300 pt-2">
            <div className="flex gap-10 items-center">
              <label className="uppercase font-semibold">grand total:</label>
              <span className="flex items-center gap-1 text-lg font-bold">
                <PhilippinePeso size={18} />
                {formatMoney(Number(purchaseOrder.grand_Total ?? 0)).replace(
                  "₱",
                  "",
                )}
              </span>
            </div>
          </div>
        </div>

        <div className="p-2 border-2 border-gray-300 rounded-md flex flex-col">
          <label className="font-semibold capitalize">note</label>
          <textarea
            rows={4}
            className="bg-white"
            disabled
            defaultValue={purchaseOrder.notes || ""}
          />
        </div>

        <div className="flex items-center w-full justify-end gap-2 pt-2">
          {/* <button
            className="px-6 py-4 text-sm rounded border "
            onClick={closeModal}
          >
            Close
          </button> */}
          <button
            className="text-nowrap max-w-fit px-6 py-4 text-sm rounded bg-blue-800 text-white hover:bg-blue-600"
            onClick={handlePrintToPDF}
          >
            <Printer />
            Download PDF
          </button>
        </div>
      </div>
    </section>
  );
};
