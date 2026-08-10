import { Search, X, ArrowLeft, FileText, FileSearch } from "lucide-react";
import jsPDF from "jspdf";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { useCustomerReceivablesSummaryQuery } from "@/features/customers/customer-receivables-summary.query";
import { useCustomerInvoicesQuery } from "@/features/customers/customer-invoices.query";
import { InvoiceAllModel } from "@/features/invoice/models/invoice-all.model";
import { CustomerReceivablesSummary } from "@/features/customers/models/customer-receivables-summary.model";
import { RecordPaymentModal } from "./record-payment.modal";
import { InvoiceDetailModal } from "@/pages/admin/invoice/_components/invoice-detail-modal";
import { invoicePaymentService } from "@/features/invoice/invoice-payment.service";
import { InvoicePaymentModel } from "@/features/invoice/models/invoice-payment.model";

interface CustomerSOAModalProps {
  setIsSOAModalOpen: Dispatch<SetStateAction<boolean>>;
  initialCustomerId?: string;
}

type InvoiceStatus =
  | "Pending"
  | "Partially Paid"
  | "Overdue"
  | "Paid"
  | "Voided";

type InvoiceTab = "open" | "closed" | "all";

const computeDueDate = (invoice: InvoiceAllModel): Date => {
  const dueDate = new Date(invoice.createdAt);
  dueDate.setDate(dueDate.getDate() + invoice.term);
  return dueDate;
};

const computeInvoiceStatus = (invoice: InvoiceAllModel): InvoiceStatus => {
  if (invoice.status?.toUpperCase() === "VOIDED") return "Voided";
  if (invoice.balance <= 0) return "Paid";
  if (invoice.balance < invoice.total_Amount) return "Partially Paid";
  if (new Date() > computeDueDate(invoice)) return "Overdue";
  return "Pending";
};

const isOpenStatus = (status: InvoiceStatus) =>
  status === "Pending" || status === "Partially Paid" || status === "Overdue";

const isClosedStatus = (status: InvoiceStatus) =>
  status === "Paid" || status === "Voided";

const STATUS_BADGE_CLASSES: Record<InvoiceStatus, string> = {
  Pending: "bg-indigo-100 text-indigo-700",
  "Partially Paid": "bg-amber-100 text-amber-700",
  Overdue: "bg-red-100 text-red-600",
  Paid: "bg-green-100 text-green-700",
  Voided: "bg-gray-100 text-gray-600",
};

const invoiceStatusBadge = (status: InvoiceStatus) => (
  <span
    className={`text-xs px-2.5 py-1 rounded-full font-semibold uppercase whitespace-nowrap ${STATUS_BADGE_CLASSES[status]}`}
  >
    {status}
  </span>
);

const formatDate = (dateStr: string) =>
  new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "2-digit",
  }).format(new Date(dateStr));

const formatCurrency = (amount: number) =>
  `₱${amount.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const StatusBreakdownDots = ({
  customer,
}: {
  customer: CustomerReceivablesSummary;
}) => {
  const dots: { color: string; key: string }[] = [];

  if (customer.hasOverdue) dots.push({ color: "bg-red-500", key: "overdue" });
  if (customer.hasPartiallyPaid)
    dots.push({ color: "bg-amber-400", key: "partial" });
  if (customer.hasPending) dots.push({ color: "bg-blue-500", key: "pending" });

  if (dots.length === 0) {
    if (customer.allCollectibleInvoicesArePaid) {
      dots.push({ color: "bg-green-500", key: "paid" });
    } else if (customer.allInvoicesAreVoided) {
      dots.push({ color: "bg-gray-400", key: "voided" });
    }
  }

  if (dots.length === 0) {
    return <span className="text-gray-300 text-lg leading-none">—</span>;
  }

  return (
    <div className="flex items-center justify-center gap-1.5">
      {dots.map((d) => (
        <span key={d.key} className={`h-3 w-3 rounded-full ${d.color}`} />
      ))}
    </div>
  );
};

export const CustomerSOAModal = ({
  setIsSOAModalOpen,
  initialCustomerId,
}: CustomerSOAModalProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedCustomer, setSelectedCustomer] =
    useState<CustomerReceivablesSummary | null>(null);
  const [paymentInvoice, setPaymentInvoice] = useState<InvoiceAllModel | null>(
    null,
  );
  const [viewedInvoice, setViewedInvoice] = useState<InvoiceAllModel | null>(
    null,
  );

  const [activeTab, setActiveTab] = useState<InvoiceTab>("open");
  const [invoiceSearchQuery, setInvoiceSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | "ALL">(
    "ALL",
  );

  const { data: summary, isLoading: isSummaryLoading } =
    useCustomerReceivablesSummaryQuery();

  // Pre-select a customer when opened from their own profile, skipping the
  // customer list. Only auto-selects once, so navigating back to the list
  // afterwards (when allowed) sticks.
  const hasAutoSelected = useRef(false);
  useEffect(() => {
    if (!initialCustomerId || hasAutoSelected.current) return;
    const match = summary?.find((c) => c.id === initialCustomerId);
    if (match) {
      setSelectedCustomer(match);
      hasAutoSelected.current = true;
    }
  }, [initialCustomerId, summary]);

  const { data: invoices, isLoading: isInvoicesLoading } =
    useCustomerInvoicesQuery(selectedCustomer?.id ?? "");

  const filteredSummary = summary?.filter((c) => {
    const q = searchQuery.toLowerCase();
    return (
      c.firstName.toLowerCase().includes(q) ||
      c.lastName.toLowerCase().includes(q) ||
      c.companyName.toLowerCase().includes(q)
    );
  });

  const handleSelectCustomer = (customer: CustomerReceivablesSummary) => {
    setSelectedCustomer(customer);
    setActiveTab("open");
    setInvoiceSearchQuery("");
    setStatusFilter("ALL");
  };

  const invoicesWithStatus = (invoices ?? [])
    .map((invoice) => ({ invoice, status: computeInvoiceStatus(invoice) }))
    .sort(
      (a, b) =>
        new Date(b.invoice.createdAt).getTime() -
        new Date(a.invoice.createdAt).getTime(),
    );

  const openInvoices = invoicesWithStatus.filter((i) => isOpenStatus(i.status));
  const closedInvoices = invoicesWithStatus.filter((i) =>
    isClosedStatus(i.status),
  );

  const outstandingBalance = openInvoices.reduce(
    (sum, i) => sum + i.invoice.balance,
    0,
  );

  const tabInvoices =
    activeTab === "open"
      ? openInvoices
      : activeTab === "closed"
        ? closedInvoices
        : invoicesWithStatus;

  const visibleInvoices = tabInvoices.filter(({ invoice, status }) => {
    if (statusFilter !== "ALL" && status !== statusFilter) return false;
    if (
      invoiceSearchQuery &&
      !String(invoice.invoice_Number).includes(invoiceSearchQuery.trim())
    )
      return false;
    return true;
  });

  const canGenerateSOA = openInvoices.length > 0;

  const handlePrint = async () => {
    if (!selectedCustomer || !invoices) return;

    // Fetch payments for all invoices in parallel, skip errors per invoice
    const allPayments: (InvoicePaymentModel & { invoiceNumber: number })[] = [];
    await Promise.all(
      invoices.map(async (inv) => {
        try {
          const payments = await invoicePaymentService.getInvoicePayments(
            inv.invoice_ID,
          );
          if (payments) {
            payments
              .filter((p) => !p.isInvalidated)
              .forEach((p) =>
                allPayments.push({ ...p, invoiceNumber: inv.invoice_Number }),
              );
          }
        } catch {
          // skip failed invoice payment fetch
        }
      }),
    );

    // Sort payments chronologically
    allPayments.sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );

    const pdfCurrency = (amount: number) =>
      `Php ${amount.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    const formatInvoiceNo = (n: number) =>
      `DR/INV-${String(n).padStart(6, "0")}`;

    const LEFT = 15;
    const RIGHT = 195;
    const BOTTOM = 275;

    const doc = new jsPDF();
    doc.setFont("helvetica");

    const todayStr = formatDate(new Date().toISOString());

    // Statement Period (min–max of open invoice createdAt)
    let periodStr = "N/A";
    if (openInvoices.length > 0) {
      const timestamps = openInvoices.map((i) =>
        new Date(i.invoice.createdAt).getTime(),
      );
      const minDate = formatDate(
        new Date(Math.min(...timestamps)).toISOString(),
      );
      const maxDate = formatDate(
        new Date(Math.max(...timestamps)).toISOString(),
      );
      periodStr = `${minDate} - ${maxDate}`;
    }

    const drawTitle = () => {
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("STATEMENT OF ACCOUNT", LEFT, 20);
    };

    // Full header — customer, address, statement date/period. First page only.
    const drawFirstPageHeader = (): number => {
      drawTitle();
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("Customer Name:", LEFT, 30);
      doc.setFont("helvetica", "normal");
      doc.text(selectedCustomer.companyName, LEFT + 34, 30);

      doc.setFont("helvetica", "bold");
      doc.text("Address:", LEFT, 36);
      doc.setFont("helvetica", "normal");
      doc.text("-", LEFT + 34, 36);

      doc.setFont("helvetica", "bold");
      doc.text("Statement Date:", LEFT, 46);
      doc.setFont("helvetica", "normal");
      doc.text(todayStr, LEFT + 34, 46);

      doc.setFont("helvetica", "bold");
      doc.text("Statement Period:", LEFT, 52);
      doc.setFont("helvetica", "normal");
      doc.text(periodStr, LEFT + 38, 52);

      doc.setDrawColor(220, 220, 220);
      doc.line(LEFT, 59, RIGHT, 59);

      return 72;
    };

    // Condensed header repeated on continuation pages.
    const drawContinuationHeader = (): number => {
      drawTitle();
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("Customer Name:", LEFT, 30);
      doc.setFont("helvetica", "normal");
      doc.text(selectedCustomer.companyName, LEFT + 34, 30);

      doc.setFont("helvetica", "bold");
      doc.text("Statement Period:", LEFT, 36);
      doc.setFont("helvetica", "normal");
      doc.text(periodStr, LEFT + 38, 36);

      doc.setDrawColor(220, 220, 220);
      doc.line(LEFT, 42, RIGHT, 42);

      return 54;
    };

    const drawSummaryColumnHeaders = (y: number): number => {
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.text("Invoice No.", LEFT, y);
      doc.text("Due Date", 75, y);
      doc.text("Invoice Amount", 120, y);
      doc.text("Outstanding Balance", RIGHT, y, { align: "right" });
      doc.setDrawColor(220, 220, 220);
      doc.line(LEFT, y + 4, RIGHT, y + 4);
      return y + 12;
    };

    const drawHistoryColumnHeaders = (y: number): number => {
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.text("Invoice No.", LEFT, y);
      doc.text("Payment Date", 65, y);
      doc.text("Amount", 110, y);
      doc.text("Method", 150, y);
      doc.setDrawColor(220, 220, 220);
      doc.line(LEFT, y + 4, RIGHT, y + 4);
      return y + 12;
    };

    // Which table is currently being rendered — determines which column
    // headers get repeated when a page break happens mid-table.
    let section: "summary" | "history" = "summary";

    const goToNextPage = (): number => {
      const nextPageNumber = doc.getNumberOfPages() + 1;
      doc.setFont("helvetica", "italic");
      doc.setFontSize(8);
      doc.setTextColor(140, 140, 140);
      doc.text(
        `(Continued on Page ${nextPageNumber})`,
        (LEFT + RIGHT) / 2,
        BOTTOM + 4,
        { align: "center" },
      );
      doc.setTextColor(0, 0, 0);

      doc.addPage();
      const headerY = drawContinuationHeader();
      return section === "history"
        ? drawHistoryColumnHeaders(headerY)
        : drawSummaryColumnHeaders(headerY);
    };

    const checkPageBreak = (y: number, needed = 14): number =>
      y + needed > BOTTOM ? goToNextPage() : y;

    // ----- PAGE 1 HEADER -----
    let y = drawFirstPageHeader();

    // ----- ACCOUNT SUMMARY (unpaid or partially paid invoices) -----
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Account Summary", LEFT, y);
    y += 10;

    section = "summary";
    y = drawSummaryColumnHeaders(y);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);

    openInvoices.forEach(({ invoice: inv }) => {
      y = checkPageBreak(y);
      const dueDate = computeDueDate(inv);
      doc.text(formatInvoiceNo(inv.invoice_Number), LEFT, y);
      doc.text(formatDate(dueDate.toISOString()), 75, y);
      doc.text(pdfCurrency(inv.total_Amount), 120, y);
      doc.text(pdfCurrency(inv.balance), RIGHT, y, { align: "right" });
      doc.setDrawColor(220, 220, 220);
      doc.line(LEFT, y + 4, RIGHT, y + 4);
      y += 12;
    });

    y += 8;
    y = checkPageBreak(y, 20);

    // Total Outstanding Balance
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Total Outstanding Balance", RIGHT, y, { align: "right" });
    doc.setFontSize(14);
    doc.text(pdfCurrency(outstandingBalance), RIGHT, y + 10, {
      align: "right",
    });

    y += 24;

    // ----- PAYMENT HISTORY -----
    y = checkPageBreak(y, 30);
    doc.setDrawColor(220, 220, 220);
    doc.line(LEFT, y, RIGHT, y);
    y += 10;

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Payment History", LEFT, y);
    y += 10;

    section = "history";

    if (allPayments.length === 0) {
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text("No payments recorded.", LEFT, y);
    } else {
      y = drawHistoryColumnHeaders(y);

      const methodLabel: Record<string, string> = {
        Cash: "Cash",
        Check: "Check",
        BankTransfer: "Bank Transfer",
        Ewallet: "E-Wallet",
      };

      allPayments.forEach((p) => {
        y = checkPageBreak(y, 16);
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(0, 0, 0);
        doc.text(formatInvoiceNo(p.invoiceNumber), LEFT, y);
        doc.text(formatDate(p.createdAt), 65, y);
        doc.text(pdfCurrency(p.amount), 110, y);
        doc.text(methodLabel[p.paymentMethod] ?? p.paymentMethod, 150, y);
        if (p.referenceNo) {
          doc.setFontSize(8);
          doc.setTextColor(140, 140, 140);
          doc.text(p.referenceNo, 150, y + 4);
          doc.setTextColor(0, 0, 0);
        }
        doc.setDrawColor(220, 220, 220);
        doc.line(LEFT, y + 8, RIGHT, y + 8);
        y += 16;
      });
    }

    // ----- END OF STATEMENT -----
    y = checkPageBreak(y, 14);
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.text("— End of Statement —", (LEFT + RIGHT) / 2, y, {
      align: "center",
    });
    doc.setTextColor(0, 0, 0);

    // ----- PAGE NUMBERS -----
    const totalPages = doc.getNumberOfPages();
    for (let p = 1; p <= totalPages; p++) {
      doc.setPage(p);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Page ${p} of ${totalPages}`, RIGHT, 20, { align: "right" });
    }

    doc.save(
      `SOA_${selectedCustomer.companyName.replace(/\s+/g, "_")}_${todayStr.replace(/,?\s+/g, "_")}.pdf`,
    );
  };

  if (paymentInvoice && selectedCustomer) {
    return (
      <RecordPaymentModal
        invoice={paymentInvoice}
        customerId={selectedCustomer.id}
        onBack={() => setPaymentInvoice(null)}
        onClose={() => {
          setPaymentInvoice(null);
          setIsSOAModalOpen(false);
        }}
      />
    );
  }

  if (viewedInvoice) {
    return (
      <InvoiceDetailModal
        selectedInvoice={viewedInvoice}
        onClose={() => setViewedInvoice(null)}
      />
    );
  }

  return (
    <div className="absolute bg-black/40 w-full h-full top-0 left-0 flex justify-center items-start z-50 py-10">
      <div className="max-w-5xl max-h-320 h-full w-full bg-white px-10 py-8 rounded-lg border shadow-lg overflow-y-auto relative flex flex-col gap-6 mx-4">
        {!selectedCustomer ? (
          <>
            {/* Header */}
            <div className="flex items-center justify-between">
              <h1 className="text-lg font-semibold">General Receivables</h1>
              <div
                className="p-2 rounded-lg hover:bg-bellflower-gray transition-colors cursor-pointer"
                onClick={() => setIsSOAModalOpen(false)}
              >
                <X size={18} className="text-vesper-gray" />
              </div>
            </div>

            {/* Search */}
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-vesper-gray"
              />
              <input
                placeholder="Search customer..."
                className="input-style-2 pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Customer Summary Table */}
            <div className="border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                {isSummaryLoading ? (
                  <div className="px-4 py-6 text-center text-sm text-vesper-gray">
                    Loading...
                  </div>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-wash-gray border-b">
                        <th className="text-left px-4 py-2 text-xs font-semibold text-vesper-gray">
                          Customer
                        </th>
                        <th className="text-right px-4 py-2 text-xs font-semibold text-vesper-gray whitespace-nowrap">
                          Total Balance
                        </th>
                        <th className="text-center px-4 py-2 text-xs font-semibold text-vesper-gray">
                          Status Breakdown
                        </th>
                        <th className="w-10 px-4 py-2" />
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSummary?.length === 0 && (
                        <tr>
                          <td
                            colSpan={4}
                            className="px-4 py-6 text-center text-sm text-vesper-gray"
                          >
                            No customers found
                          </td>
                        </tr>
                      )}
                      {filteredSummary?.map((customer) => (
                        <tr
                          key={customer.id}
                          className="border-b last:border-b-0 cursor-pointer transition-colors hover:bg-wash-gray"
                          onClick={() => handleSelectCustomer(customer)}
                        >
                          <td className="px-4 py-2">
                            <p className="font-semibold text-saltbox-gray">
                              {customer.companyName}
                            </p>
                            <p className="text-xs text-vesper-gray">
                              {customer.firstName} {customer.lastName}
                            </p>
                          </td>
                          <td className="px-4 py-2 text-right text-saltbox-gray font-semibold">
                            {formatCurrency(customer.totalOutstandingBalance)}
                          </td>
                          <td className="px-4 py-2">
                            <StatusBreakdownDots customer={customer} />
                          </td>
                          <td className="px-4 py-2 text-right text-vesper-gray">
                            &gt;
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            <p className="text-sm text-vesper-gray text-center">
              Click a customer row to view their invoice detail.
            </p>
          </>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center justify-between">
              {initialCustomerId ? (
                <div />
              ) : (
                <div
                  className="flex items-center gap-2 cursor-pointer text-vesper-gray hover:text-saltbox-gray transition-colors"
                  onClick={() => setSelectedCustomer(null)}
                >
                  <ArrowLeft size={18} />
                  <span className="text-sm font-semibold">
                    General Receivables
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <button
                  className={`px-4 py-2 border rounded-lg bg-white text-blue-600 text-sm font-semibold flex items-center gap-2 transition-colors ${
                    canGenerateSOA
                      ? " hover:bg-gray-50"
                      : "text-gray-300 cursor-not-allowed border-gray-200"
                  }`}
                  onClick={canGenerateSOA ? handlePrint : undefined}
                  disabled={!canGenerateSOA}
                >
                  <FileText size={16} />
                  Generate SOA
                </button>
                <div
                  className="p-2 rounded-lg hover:bg-bellflower-gray transition-colors cursor-pointer"
                  onClick={() => setIsSOAModalOpen(false)}
                >
                  <X size={18} className="text-vesper-gray" />
                </div>
              </div>
            </div>

            <div>
              <h1 className="text-2xl font-bold text-saltbox-gray">
                Receivables
              </h1>
              <p className="text-sm text-vesper-gray">
                Customer: {selectedCustomer.companyName}
              </p>
            </div>

            {isInvoicesLoading ? (
              <div className="px-4 py-6 text-center text-sm text-vesper-gray">
                Loading invoices...
              </div>
            ) : (
              <>
                {/* Stat Cards */}
                <div className="grid grid-cols-4 gap-4">
                  <div className="border rounded-lg p-4">
                    <p className="text-xs text-vesper-gray">Total Invoices</p>
                    <p className="text-2xl font-bold text-saltbox-gray">
                      {invoicesWithStatus.length}
                    </p>
                  </div>
                  <div className="border border-amber-200 bg-amber-50/40 rounded-lg p-4">
                    <p className="text-xs text-vesper-gray">Open Invoices</p>
                    <p className="text-2xl font-bold text-amber-600">
                      {openInvoices.length}
                    </p>
                  </div>
                  <div className="border border-green-200 bg-green-50/40 rounded-lg p-4">
                    <p className="text-xs text-vesper-gray">Closed Invoices</p>
                    <p className="text-2xl font-bold text-green-600">
                      {closedInvoices.length}
                    </p>
                  </div>
                  <div className="border rounded-lg p-4">
                    <p className="text-xs text-vesper-gray">
                      Outstanding Balance
                    </p>
                    <p className="text-2xl font-bold text-saltbox-gray">
                      {formatCurrency(outstandingBalance)}
                    </p>
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-6 border-b">
                  {(
                    [
                      { key: "open", label: "Open Invoices" },
                      { key: "closed", label: "Closed Invoices" },
                      { key: "all", label: "All" },
                    ] as { key: InvoiceTab; label: string }[]
                  ).map((tab) => (
                    <button
                      key={tab.key}
                      className={`pb-3 text-sm font-semibold border-b-2 -mb-px transition-colors max-w-full w-fit bg-transparent ${
                        activeTab === tab.key
                          ? "border-blue-600 text-blue-600"
                          : "border-transparent text-vesper-gray hover:text-saltbox-gray"
                      }`}
                      onClick={() => setActiveTab(tab.key)}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Search + Filter */}
                <div className="flex items-center justify-between gap-4">
                  <div className="relative flex-1 max-w-sm">
                    <Search
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-vesper-gray"
                    />
                    <input
                      placeholder="Search Invoice Number"
                      className="input-style-2 pl-9"
                      value={invoiceSearchQuery}
                      onChange={(e) => setInvoiceSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-vesper-gray font-semibold whitespace-nowrap">
                      Filter by Status
                    </label>
                    <select
                      className="input-style-2 text-sm"
                      value={statusFilter}
                      onChange={(e) =>
                        setStatusFilter(e.target.value as InvoiceStatus | "ALL")
                      }
                    >
                      <option value="ALL">All Status</option>
                      <option value="Pending">Pending</option>
                      <option value="Partially Paid">Partially Paid</option>
                      <option value="Overdue">Overdue</option>
                      <option value="Paid">Paid</option>
                      <option value="Voided">Voided</option>
                    </select>
                  </div>
                </div>

                {/* Invoice Table */}
                <div className="border rounded-lg overflow-hidden">
                  <div className="overflow-x-auto max-h-full overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead className="sticky top-0 z-10">
                        <tr className="bg-wash-gray border-b">
                          <th className="text-left px-4 py-2 text-xs font-semibold text-vesper-gray whitespace-nowrap">
                            Invoice #
                          </th>
                          <th className="text-left px-4 py-2 text-xs font-semibold text-vesper-gray whitespace-nowrap">
                            Due Date
                          </th>
                          <th className="text-right px-4 py-2 text-xs font-semibold text-vesper-gray whitespace-nowrap">
                            Total
                          </th>
                          <th className="text-right px-4 py-2 text-xs font-semibold text-vesper-gray whitespace-nowrap">
                            Balance
                          </th>
                          <th className="text-center px-4 py-2 text-xs font-semibold text-vesper-gray whitespace-nowrap">
                            Status
                          </th>
                          <th className="text-center px-4 py-2 text-xs font-semibold text-vesper-gray whitespace-nowrap">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {visibleInvoices.length === 0 ? (
                          <tr>
                            <td colSpan={6}>
                              <div className="flex flex-col items-center justify-center gap-3 py-14">
                                <FileSearch
                                  size={48}
                                  className="text-gray-300"
                                />
                                <p className="text-sm font-semibold text-saltbox-gray">
                                  No Invoices Found
                                </p>
                                <p className="text-xs text-vesper-gray">
                                  There are no invoices matching the selected
                                  criteria.
                                </p>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          visibleInvoices.map(({ invoice, status }) => (
                            <tr
                              key={invoice.invoice_ID}
                              className="border-b last:border-b-0 hover:bg-wash-gray transition-colors"
                            >
                              <td className="px-4 py-2 text-saltbox-gray font-semibold whitespace-nowrap">
                                {String(invoice.invoice_Number).padStart(
                                  6,
                                  "0",
                                )}
                              </td>
                              <td className="px-4 py-2 text-vesper-gray whitespace-nowrap">
                                {formatDate(
                                  computeDueDate(invoice).toISOString(),
                                )}
                              </td>
                              <td className="px-4 py-2 text-right text-saltbox-gray whitespace-nowrap">
                                {formatCurrency(invoice.total_Amount)}
                              </td>
                              <td className="px-4 py-2 text-right text-saltbox-gray whitespace-nowrap">
                                {formatCurrency(invoice.balance)}
                              </td>
                              <td className="px-4 py-2 text-center">
                                {invoiceStatusBadge(status)}
                              </td>
                              <td className="px-4 py-2 text-center">
                                {isOpenStatus(status) ? (
                                  <div
                                    className="text-xs text-saltbox-gray font-semibold border rounded-md px-3 py-1 hover:bg-bellflower-gray transition-colors cursor-pointer inline-block"
                                    onClick={() => setPaymentInvoice(invoice)}
                                  >
                                    Record Payment
                                  </div>
                                ) : status === "Paid" ? (
                                  <div
                                    className="text-xs text-saltbox-gray font-semibold border rounded-md px-3 py-1 hover:bg-bellflower-gray transition-colors cursor-pointer inline-block"
                                    onClick={() => setPaymentInvoice(invoice)}
                                  >
                                    Payment History
                                  </div>
                                ) : status === "Voided" ? (
                                  <div
                                    className="text-xs text-saltbox-gray font-semibold border rounded-md px-3 py-1 hover:bg-bellflower-gray transition-colors cursor-pointer inline-block"
                                    onClick={() => setViewedInvoice(invoice)}
                                  >
                                    View Details
                                  </div>
                                ) : null}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};
