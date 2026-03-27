import { Separator } from "@/components/separator";
import { PurchaseOrderRecord } from "@/features/purchase-order/purchase-order.model";
import { XIcon } from "@/icons";
import { format } from "date-fns";
import { PhilippinePeso } from "lucide-react";
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
  const formatMoney = (value: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
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
      let y = 14;

      const pushNewPageIfNeeded = (requiredSpace = 8) => {
        if (y + requiredSpace <= pageHeight - 14) return;
        doc.addPage();
        y = 14;
      };

      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text("PRINCE", left, y);
      doc.setFontSize(14);
      doc.text("PURCHASE ORDER", right, y, { align: "right" });

      y += 7;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text("[Street Address]", left, y);
      y += 4;
      doc.text("[City, State, ZIP]", left, y);
      y += 4;
      doc.text("[Phone Number]", left, y);
      y += 4;
      doc.text("[Email Address]", left, y);

      doc.text(`P.O. #: ${purchaseOrder.purchase_Order_Number}`, right, y - 8, {
        align: "right",
      });
      doc.text(`Date: ${formatDate(purchaseOrder.created_At)}`, right, y - 4, {
        align: "right",
      });

      y += 4;
      doc.setDrawColor(180);
      doc.line(left, y, right, y);
      y += 6;

      doc.setFont("helvetica", "bold");
      doc.text("Supplier:", left, y);
      doc.setFont("helvetica", "normal");
      doc.text(purchaseOrder.supplier.company_Name || "-", left + 18, y);

      doc.setFont("helvetica", "bold");
      doc.text("Deliver To:", right - 48, y);
      doc.setFont("helvetica", "normal");
      doc.text("[Address]", right, y, { align: "right" });

      y += 6;
      doc.setFont("helvetica", "bold");
      doc.text("Buyer:", left, y);
      doc.setFont("helvetica", "normal");
      doc.text(
        `${purchaseOrder.clerk.first_Name} ${purchaseOrder.clerk.last_Name}`,
        left + 12,
        y,
      );

      doc.setFont("helvetica", "bold");
      doc.text("Deliver By:", right - 48, y);
      doc.setFont("helvetica", "normal");
      doc.text(formatDate(purchaseOrder.preferred_Delivery), right, y, {
        align: "right",
      });

      y += 6;
      doc.line(left, y, right, y);
      y += 6;

      const colNo = left;
      const colItem = left + 12;
      const colQty = left + 114;
      const colPrice = left + 136;
      const colSubtotal = right;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text("No.", colNo, y);
      doc.text("Item", colItem, y);
      doc.text("Quantity", colQty, y, { align: "right" });
      doc.text("Price", colPrice, y, { align: "right" });
      doc.text("Subtotal", colSubtotal, y, { align: "right" });
      y += 2;
      doc.line(left, y, right, y);
      y += 5;

      doc.setFont("helvetica", "normal");
      purchaseOrder.line_Items.forEach((line, index) => {
        const itemName = `${line.product?.product_Name || "-"} - ${line.product?.brand || "-"} - ${line.product?.variant || "-"}`;
        const itemLines = doc.splitTextToSize(itemName, 95) as string[];
        const rowHeight = Math.max(5, itemLines.length * 4);

        pushNewPageIfNeeded(rowHeight + 4);

        doc.text(String(index + 1), colNo, y);
        doc.text(itemLines, colItem, y);
        doc.text(String(line.quantity), colQty, y, { align: "right" });
        doc.text(Number(line.unit_Price || 0).toFixed(2), colPrice, y, {
          align: "right",
        });
        doc.text(formatMoney(Number(line.sub_Total || 0)), colSubtotal, y, {
          align: "right",
        });

        y += rowHeight;
        doc.setDrawColor(230);
        doc.line(left, y, right, y);
        y += 4;
      });

      pushNewPageIfNeeded(16);
      doc.setFont("helvetica", "bold");
      doc.text("Total:", right - 38, y);
      doc.text(formatMoney(Number(purchaseOrder.grand_Total || 0)), right, y, {
        align: "right",
      });

      y += 8;
      pushNewPageIfNeeded(16);
      doc.setFont("helvetica", "bold");
      doc.text("Note", left, y);
      y += 4;
      doc.setFont("helvetica", "normal");
      const noteText = doc.splitTextToSize(
        purchaseOrder.notes || "-",
        right - left,
      );
      doc.text(noteText, left, y);

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

            <div className="w-full h-full">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">No.</th>
                    <th className="text-left py-2">Item</th>
                    <th className="text-right py-2">Quantity</th>
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
                      <td className="py-2">
                        {line.product?.product_Name || "-"} -{" "}
                        {line.product?.brand || "-"} -{" "}
                        {line.product?.variant || "-"}
                      </td>
                      <td className="text-right py-2">{line.quantity}</td>
                      <td className="text-right py-2">
                        <span className="inline-flex items-center gap-1 justify-end w-full">
                          <PhilippinePeso size={14} />
                          {Number(line.unit_Price || 0).toFixed(2)}
                        </span>
                      </td>
                      <td className="text-right py-2">
                        {formatMoney(Number(line.sub_Total || 0))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end">
              <label className="font-bold">Total: </label>
              <span className="ml-1">
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
