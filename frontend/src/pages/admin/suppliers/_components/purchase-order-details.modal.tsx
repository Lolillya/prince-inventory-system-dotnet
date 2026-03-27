import { PurchaseOrderRecord } from "@/features/purchase-order/purchase-order.model";
import { XIcon } from "@/icons";
import { format } from "date-fns";

interface PurchaseOrderDetailsModalProps {
  purchaseOrder: PurchaseOrderRecord;
  onClose: () => void;
}

export const PurchaseOrderDetailsModal = ({
  purchaseOrder,
  onClose,
}: PurchaseOrderDetailsModalProps) => {
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

  const handlePrint = () => {
    const printWindow = window.open("", "_blank", "width=980,height=720");
    if (!printWindow) return;

    const rowsHtml = purchaseOrder.line_Items
      .map(
        (line) => `
          <tr>
            <td>${line.product?.product_Name || "-"} - ${line.product?.brand || ""} - ${line.product?.variant || ""}</td>
            <td style="text-align:right;">${line.quantity}</td>
            <td>${line.unit?.uom_Name || "-"}</td>
            <td style="text-align:right;">${formatMoney(Number(line.unit_Price || 0))}</td>
            <td style="text-align:right;">${formatMoney(Number(line.sub_Total || 0))}</td>
          </tr>
        `,
      )
      .join("");

    const html = `
      <html>
        <head>
          <title>${purchaseOrder.purchase_Order_Number}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #111827; }
            h1 { margin: 0 0 8px 0; font-size: 24px; }
            p { margin: 4px 0; }
            .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 16px; }
            table { width: 100%; border-collapse: collapse; margin-top: 12px; }
            th, td { border: 1px solid #e5e7eb; padding: 8px; font-size: 12px; }
            th { background: #f3f4f6; text-align: left; }
            .totals { margin-top: 12px; text-align: right; font-weight: 700; }
            .note { margin-top: 16px; border: 1px solid #e5e7eb; padding: 10px; border-radius: 8px; min-height: 64px; }
          </style>
        </head>
        <body>
          <h1>Purchase Order Receipt</h1>
          <p><strong>PO Number:</strong> ${purchaseOrder.purchase_Order_Number}</p>
          <div class="meta">
            <p><strong>Supplier:</strong> ${purchaseOrder.supplier.company_Name}</p>
            <p><strong>Status:</strong> ${purchaseOrder.status}</p>
            <p><strong>Preferred Delivery:</strong> ${formatDate(purchaseOrder.preferred_Delivery)}</p>
            <p><strong>Created At:</strong> ${formatDate(purchaseOrder.created_At)}</p>
          </div>

          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th style="text-align:right;">Quantity</th>
                <th>Unit</th>
                <th style="text-align:right;">Price</th>
                <th style="text-align:right;">Sub-total</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>

          <div class="totals">Grand Total: ${formatMoney(Number(purchaseOrder.grand_Total || 0))}</div>

          <div class="note">
            <strong>Note</strong>
            <p>${purchaseOrder.notes || "-"}</p>
          </div>
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  return (
    <section className="absolute bg-black/40 w-full h-full top-0 left-0 flex justify-center items-center z-60">
      <div className="w-3/5 h-4/5 bg-white p-8 rounded-lg border shadow-lg flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <h2 className="text-xl font-bold">Purchase Order Details</h2>
            <span className="text-sm text-vesper-gray">
              {purchaseOrder.purchase_Order_Number}
            </span>
          </div>
          <button className="p-2 rounded hover:bg-gray-100" onClick={onClose}>
            <XIcon />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-vesper-gray">Supplier: </span>
            <span className="font-semibold">
              {purchaseOrder.supplier.company_Name}
            </span>
          </div>
          <div>
            <span className="text-vesper-gray">Status: </span>
            <span className="font-semibold">{purchaseOrder.status}</span>
          </div>
          <div>
            <span className="text-vesper-gray">Preferred Delivery: </span>
            <span className="font-semibold">
              {formatDate(purchaseOrder.preferred_Delivery)}
            </span>
          </div>
          <div>
            <span className="text-vesper-gray">Created At: </span>
            <span className="font-semibold">
              {formatDate(purchaseOrder.created_At)}
            </span>
          </div>
        </div>

        <div className="rounded-lg border overflow-hidden flex-1 min-h-0">
          <div className="grid grid-cols-12 gap-2 px-3 py-2 bg-custom-gray text-xs font-semibold uppercase">
            <div className="col-span-4">Product</div>
            <div className="col-span-2 text-right">Quantity</div>
            <div className="col-span-2">Unit</div>
            <div className="col-span-2 text-right">Price</div>
            <div className="col-span-2 text-right">Sub-total</div>
          </div>

          <div className="max-h-[42vh] overflow-y-auto">
            {purchaseOrder.line_Items.map((line) => (
              <div
                key={line.purchase_Order_LineItem_ID}
                className="grid grid-cols-12 gap-2 px-3 py-2 text-sm border-t first:border-t-0"
              >
                <div className="col-span-4">
                  {line.product?.product_Name} - {line.product?.brand} -{" "}
                  {line.product?.variant}
                </div>
                <div className="col-span-2 text-right">{line.quantity}</div>
                <div className="col-span-2">{line.unit?.uom_Name || "-"}</div>
                <div className="col-span-2 text-right">
                  {formatMoney(Number(line.unit_Price || 0))}
                </div>
                <div className="col-span-2 text-right font-medium">
                  {formatMoney(Number(line.sub_Total || 0))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border p-3 bg-custom-gray">
          <label className="text-xs text-vesper-gray uppercase tracking-wide">
            Note
          </label>
          <p className="text-sm mt-1 whitespace-pre-wrap">
            {purchaseOrder.notes || "-"}
          </p>
        </div>

        <div className="flex justify-between items-center">
          <div className="text-sm">
            <span className="text-vesper-gray mr-2">Grand total:</span>
            <span className="font-bold">
              {formatMoney(Number(purchaseOrder.grand_Total || 0))}
            </span>
          </div>

          <div className="flex gap-2">
            <button
              className="px-4 py-2 text-sm rounded border"
              onClick={onClose}
            >
              Close
            </button>
            <button
              className="px-4 py-2 text-sm rounded bg-blue-500 text-white hover:bg-blue-600"
              onClick={handlePrint}
            >
              Print
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
