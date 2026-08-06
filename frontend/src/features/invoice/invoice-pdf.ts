import jsPDF from "jspdf";

export const formatPdfCurrency = (value: number): string =>
  value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export type InvoicePdfLineItem = {
  label: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  total: number;
};

export type InvoicePdfOptions = {
  invoiceNumberLabel: string;
  customerName: string;
  term: string;
  dateLabel: string;
  lineItems: InvoicePdfLineItem[];
  subtotal: number;
  discountAmount: number;
  discountLabel: string;
  grandTotal: number;
  fileName: string;
};

// Shared PDF builder used by the "Save Invoice" flow, the multi-page test
// flow, and exporting a previously saved invoice — so all three always
// render identically.
export const buildInvoicePdf = ({
  invoiceNumberLabel,
  customerName,
  term,
  dateLabel,
  lineItems,
  subtotal,
  discountAmount,
  discountLabel,
  grandTotal,
  fileName,
}: InvoicePdfOptions) => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const left = 10;
  const right = pageWidth - 10;
  const contentWidth = right - left;
  const bottomLimit = pageHeight - 10;

  doc.setTextColor(0);
  doc.setDrawColor(0);

  const infoLabelX = right - 55;

  // TABLE geometry (shared across pages)
  const colWidths = { qty: 22, unit: 20, unitPrice: 26, total: 30 };
  const descWidth =
    contentWidth -
    (colWidths.qty + colWidths.unit + colWidths.unitPrice + colWidths.total);
  const colX = {
    descStart: left,
    qtyEnd: left + descWidth + colWidths.qty,
    unitStart: left + descWidth + colWidths.qty + 2,
    unitPriceEnd:
      left + descWidth + colWidths.qty + colWidths.unit + colWidths.unitPrice,
    totalEnd: right,
  };
  const lineHeight = 4.2;
  const descTextWidth = descWidth - 3;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);

  // Pre-compute each row's wrapped description + height once, so both the
  // dry-run (page counting) and real render pass use identical values.
  // rowHeight is the height of the TEXT itself (line-count * lineHeight for
  // a wrapped description) — it does NOT include any breathing room around
  // it, that's handled separately by ROW_VERTICAL_PADDING below.
  const rows = lineItems.map((item) => {
    const descLines: string[] = doc.splitTextToSize(item.label, descTextWidth);
    const rowHeight = Math.max(lineHeight, descLines.length * lineHeight);
    return { ...item, descLines, rowHeight };
  });

  const FIRST_PAGE_TABLE_START_Y = 46.5; // after full header + table header
  const CONTINUATION_TABLE_START_Y = 33.5; // after simplified header + table header
  const CONTINUED_TEXT_RESERVE = 10; // room for "(Continued on Page N)"
  const FOOTER_RESERVE = discountAmount > 0 ? 62 : 55; // grand total + signatures (+ discount lines)

  // Total vertical space reserved around each row's text block (split
  // above/below via centering) before the next divider line is drawn.
  // This is deliberately generous so the divider never touches descenders
  // (g, y, p, etc.) and single-line values look centered in the row.
  const ROW_VERTICAL_PADDING = 6;
  // Approx. distance from the vertical center of a text's line-box down
  // to its baseline, for 9pt Helvetica — used to convert a "center Y" into
  // the Y jsPDF actually expects (which is always a baseline).
  const TEXT_BASELINE_CENTER_OFFSET = 1.3;

  // ── PASS 1: dry run — figure out how many pages this invoice needs ──
  let dryY = FIRST_PAGE_TABLE_START_Y;
  let totalPages = 1;
  rows.forEach((row, i) => {
    const rowConsumption = row.rowHeight + ROW_VERTICAL_PADDING;
    const isLastRow = i === rows.length - 1;
    const reserve = isLastRow ? FOOTER_RESERVE : CONTINUED_TEXT_RESERVE;
    if (dryY + rowConsumption + reserve > bottomLimit) {
      totalPages += 1;
      dryY = CONTINUATION_TABLE_START_Y;
    }
    dryY += rowConsumption;
  });

  // ── PASS 2: real render, now that totalPages is known ──
  let y = 14;
  let currentPage = 1;

  const renderFirstPageHeader = () => {
    y = 14;
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
      doc.text(leftValue || "-", left + 22, y);

      doc.setFont("helvetica", "bold");
      doc.text(rightLabel, infoLabelX, y);
      doc.setFont("helvetica", "normal");
      doc.text(rightValue || "-", right, y, { align: "right" });

      y += 6.5;
    };

    detailRow("Customer:", customerName, "DR/Invoice #:", invoiceNumberLabel);
    detailRow("Term:", term, "Date:", dateLabel);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.text("Page:", infoLabelX, y);
    doc.setFont("helvetica", "normal");
    doc.text(`1 of ${totalPages}`, right, y, { align: "right" });

    y += 4;
    doc.setLineWidth(0.4);
    doc.line(left, y, right, y);
    y += 7;
  };

  const renderContinuationHeader = () => {
    y = 14;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.text(`DR/INV-${invoiceNumberLabel}`, left, y);
    doc.text(`Page ${currentPage} of ${totalPages}`, right, y, {
      align: "right",
    });

    y += 4;
    doc.setLineWidth(0.4);
    doc.line(left, y, right, y);
    y += 7;
  };

  const renderTableHeader = () => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.text("Description", colX.descStart, y);
    doc.text("Quantity", colX.qtyEnd, y, { align: "right" });
    doc.text("Unit", colX.unitStart, y);
    doc.text("Unit Price", colX.unitPriceEnd, y, { align: "right" });
    doc.text("Total", colX.totalEnd, y, { align: "right" });
    y += 3;
    doc.setLineWidth(0.4);
    doc.line(left, y, right, y);
    y += 5.5;
  };

  const renderContinuedFooter = (nextPage: number) => {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8.5);
    doc.text(`(Continued on Page ${nextPage})`, pageWidth / 2, bottomLimit, {
      align: "center",
    });
  };

  renderFirstPageHeader();
  renderTableHeader();

  rows.forEach((row, i) => {
    const rowConsumption = row.rowHeight + ROW_VERTICAL_PADDING;
    const isLastRow = i === rows.length - 1;
    const reserve = isLastRow ? FOOTER_RESERVE : CONTINUED_TEXT_RESERVE;

    if (y + rowConsumption + reserve > bottomLimit) {
      renderContinuedFooter(currentPage + 1);
      doc.addPage();
      currentPage += 1;
      renderContinuationHeader();
      renderTableHeader();
    }

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);

    // The row occupies [y, rowBottom). Center every column's text
    // vertically within that box: single-line columns center around the
    // box's midline directly; the (possibly multi-line) description is
    // centered as a whole block, so its first line starts higher up when
    // it wraps to 2+ lines.
    const rowBottom = y + rowConsumption;
    const centerY = (y + rowBottom) / 2;
    const singleLineY = centerY + TEXT_BASELINE_CENTER_OFFSET;
    const descFirstLineY =
      centerY -
      row.rowHeight / 2 +
      lineHeight / 2 +
      TEXT_BASELINE_CENTER_OFFSET;

    doc.text(row.descLines, colX.descStart, descFirstLineY);
    doc.text(String(row.quantity), colX.qtyEnd, singleLineY, {
      align: "right",
    });
    doc.text(row.unit, colX.unitStart, singleLineY);
    doc.text(formatPdfCurrency(row.unitPrice), colX.unitPriceEnd, singleLineY, {
      align: "right",
    });
    doc.text(formatPdfCurrency(row.total), colX.totalEnd, singleLineY, {
      align: "right",
    });

    doc.setLineWidth(0.2);
    doc.line(left, rowBottom, right, rowBottom);
    y = rowBottom;
  });

  // ── FOOTER (Subtotal/Discount + Grand Total + Signatures) — LAST PAGE ONLY ──
  y += 5;

  if (discountAmount > 0) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("Subtotal:", right - 70, y);
    doc.text(`P${formatPdfCurrency(subtotal)}`, right, y, { align: "right" });
    y += 5.5;

    doc.text("Discount:", right - 70, y);
    doc.text(`-${discountLabel}`, right, y, { align: "right" });
    y += 6.5;

    doc.setLineWidth(0.3);
    doc.line(right - 70, y - 4.5, right, y - 4.5);
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("GRAND TOTAL:", right - 70, y);
  doc.text(`P${formatPdfCurrency(grandTotal)}`, right, y, { align: "right" });

  y += 20;

  // SIGNATURE BLOCKS
  const signatureWidth = contentWidth / 3 - 4;
  const signatureLineHeight = 3.5;
  const signatureBlock = (x: number, label: string) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    const labelLines: string[] = doc.splitTextToSize(label, signatureWidth);
    doc.text(labelLines, x, y);

    const lineY = y + labelLines.length * signatureLineHeight + 6;
    doc.setLineWidth(0.3);
    doc.line(x, lineY, x + signatureWidth, lineY);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.text("Signature Above Printed Name", x, lineY + 4);
  };

  signatureBlock(left, "\nPrepared By:");
  signatureBlock(left + signatureWidth + 6, "\nChecked By:");
  signatureBlock(
    left + (signatureWidth + 6) * 2,
    "Received the Above Goods in Good Order and Condition:",
  );

  doc.save(fileName);
};
