import { Search, X, ChevronDown, ChevronRight } from "lucide-react";
import jsPDF from "jspdf";
import { Dispatch, SetStateAction, useState } from "react";
import { useCustomerReceivablesSummaryQuery } from "@/features/customers/customer-receivables-summary.query";
import { useCustomerInvoicesQuery } from "@/features/customers/customer-invoices.query";
import { InvoiceAllModel } from "@/features/invoice/models/invoice-all.model";
import { CustomerReceivablesSummary } from "@/features/customers/models/customer-receivables-summary.model";
import { RecordPaymentModal } from "./record-payment.modal";
import { invoicePaymentService } from "@/features/invoice/invoice-payment.service";
import { InvoicePaymentModel } from "@/features/invoice/models/invoice-payment.model";

interface CustomerSOAModalProps {
  setIsSOAModalOpen: Dispatch<SetStateAction<boolean>>;
}

const computeDueDate = (invoice: InvoiceAllModel): Date => {
  const dueDate = new Date(invoice.createdAt);
  dueDate.setDate(dueDate.getDate() + invoice.term);
  return dueDate;
};

const computeInvoiceStatus = (invoice: InvoiceAllModel): string => {
  if (invoice.status?.toUpperCase() === "PAID") return "PAID";
  if (new Date() > computeDueDate(invoice)) return "OVERDUE";
  return "PENDING";
};

const invoiceStatusBadge = (status: string) => {
  const map: Record<string, string> = {
    PAID: "bg-green-100 text-green-700",
    PENDING: "bg-amber-100 text-amber-700",
    OVERDUE: "bg-red-100 text-red-600",
  };
  const cls = map[status] ?? "bg-gray-100 text-gray-600";
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${cls}`}>
      {status}
    </span>
  );
};

const overallStatusBadge = (status: string) => {
  const cls =
    status === "PAID"
      ? "bg-green-100 text-green-700"
      : "bg-amber-100 text-amber-700";
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${cls}`}>
      {status}
    </span>
  );
};

const formatDate = (dateStr: string) =>
  new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(dateStr));

const formatCurrency = (amount: number) =>
  `₱${amount.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

interface InvoiceAccordionProps {
  title: string;
  invoices: InvoiceAllModel[];
  computedStatuses: string[];
  defaultOpen?: boolean;
  showRecordPayment?: boolean;
  onRecordPayment?: (invoice: InvoiceAllModel) => void;
}

const InvoiceAccordion = ({
  title,
  invoices,
  computedStatuses,
  defaultOpen = true,
  showRecordPayment = false,
  onRecordPayment,
}: InvoiceAccordionProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border rounded-lg overflow-hidden">
      <button
        className="w-full max-w-full flex items-center justify-between px-4 py-3 bg-custom-gray hover:bg-bellflower-gray transition-colors text-left"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2">
          {isOpen ? (
            <ChevronDown size={16} className="text-vesper-gray" />
          ) : (
            <ChevronRight size={16} className="text-vesper-gray" />
          )}
          <span className="text-sm font-semibold text-saltbox-gray">
            {title}
          </span>
          <span className="text-xs text-vesper-gray">
            {invoices.length} record/s
          </span>
        </div>
      </button>

      {isOpen && (
        <div className="overflow-x-auto">
          {invoices.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-vesper-gray">
              No invoices found
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
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
                  {showRecordPayment && (
                    <th className="text-center px-4 py-2 text-xs font-semibold text-vesper-gray whitespace-nowrap">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv, idx) => (
                  <tr
                    key={inv.invoice_ID}
                    className="border-b last:border-b-0 hover:bg-wash-gray transition-colors"
                  >
                    <td className="px-4 py-2 text-saltbox-gray font-semibold">
                      #{inv.invoice_Number}
                    </td>
                    <td className="px-4 py-2 text-vesper-gray">
                      {formatDate(computeDueDate(inv).toISOString())}
                    </td>
                    <td className="px-4 py-2 text-right text-saltbox-gray">
                      {formatCurrency(inv.total_Amount)}
                    </td>
                    <td className="px-4 py-2 text-right text-saltbox-gray">
                      {formatCurrency(inv.balance)}
                    </td>
                    <td className="px-4 py-2 text-center">
                      {invoiceStatusBadge(computedStatuses[idx])}
                    </td>
                    {showRecordPayment && (
                      <td className="px-4 py-2 text-center flex items-end justify-end">
                        <div
                          className="text-xs text-saltbox-gray font-semibold border rounded-md px-3 py-1 hover:bg-bellflower-gray transition-colors cursor-pointer"
                          onClick={() => onRecordPayment?.(inv)}
                        >
                          Record Payment
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export const CustomerSOAModal = ({
  setIsSOAModalOpen,
}: CustomerSOAModalProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedCustomer, setSelectedCustomer] =
    useState<CustomerReceivablesSummary | null>(null);
  const [paymentInvoice, setPaymentInvoice] = useState<InvoiceAllModel | null>(
    null,
  );

  const { data: summary, isLoading: isSummaryLoading } =
    useCustomerReceivablesSummaryQuery();

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

  const computedStatuses = invoices?.map(computeInvoiceStatus) ?? [];

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
      `PHP ${amount.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    const checkPageBreak = (doc: jsPDF, y: number, needed = 14): number => {
      if (y + needed > 275) {
        doc.addPage();
        return 20;
      }
      return y;
    };

    const doc = new jsPDF();
    doc.setFont("helvetica");

    // Title
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("STATEMENT OF ACCOUNT", 15, 20);

    // Customer info
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(selectedCustomer.companyName, 15, 30);
    doc.text(
      `${selectedCustomer.firstName} ${selectedCustomer.lastName}`,
      15,
      36,
    );

    // Statement Date
    const todayStr = formatDate(new Date().toISOString());
    doc.setFont("helvetica", "bold");
    doc.text("Statement Date:", 15, 46);
    doc.setFont("helvetica", "normal");
    doc.text(todayStr, 48, 46);

    // Statement Period (min–max of invoice createdAt)
    let periodStr = "N/A";
    if (invoices.length > 0) {
      const timestamps = invoices.map((inv) =>
        new Date(inv.createdAt).getTime(),
      );
      const minDate = formatDate(
        new Date(Math.min(...timestamps)).toISOString(),
      );
      const maxDate = formatDate(
        new Date(Math.max(...timestamps)).toISOString(),
      );
      periodStr = `${minDate} - ${maxDate}`;
    }
    doc.setFont("helvetica", "bold");
    doc.text("Statement Period:", 15, 52);
    doc.setFont("helvetica", "normal");
    doc.text(periodStr, 50, 52);

    doc.setDrawColor(220, 220, 220);
    doc.line(15, 59, 195, 59);

    // Account Summary header
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Account Summary", 15, 72);

    doc.setFontSize(9);
    doc.text("Invoice No.", 15, 82);
    doc.text("Due Date", 60, 82);
    doc.text("Invoice Amount", 110, 82);
    doc.text("Balance Due", 160, 82);
    doc.line(15, 86, 195, 86);

    // Invoice rows
    let y = 94;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);

    invoices.forEach((inv) => {
      y = checkPageBreak(doc, y);
      const dueDate = computeDueDate(inv);
      doc.text(`#${inv.invoice_Number}`, 15, y);
      doc.text(formatDate(dueDate.toISOString()), 60, y);
      doc.text(pdfCurrency(inv.total_Amount), 110, y);
      doc.text(pdfCurrency(inv.balance), 160, y);
      doc.line(15, y + 4, 195, y + 4);
      y += 12;
    });

    y += 8;
    y = checkPageBreak(doc, y, 20);

    // Total Outstanding Balance
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Total Outstanding Balance", 195, y, { align: "right" });
    doc.setFontSize(14);
    doc.text(
      pdfCurrency(selectedCustomer.totalOutstandingBalance),
      195,
      y + 10,
      { align: "right" },
    );

    y += 24;

    // Payment History section
    y = checkPageBreak(doc, y, 30);
    doc.setDrawColor(220, 220, 220);
    doc.line(15, y, 195, y);
    y += 10;

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Payment History", 15, y);
    y += 10;

    if (allPayments.length === 0) {
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text("No payments recorded.", 15, y);
    } else {
      // Column headers
      doc.setFontSize(9);
      doc.text("Invoice No.", 15, y);
      doc.text("Date", 50, y);
      doc.text("Amount", 95, y);
      doc.text("Method", 135, y);
      doc.text("Reference", 170, y);
      doc.line(15, y + 4, 195, y + 4);
      y += 12;

      doc.setFont("helvetica", "normal");
      const methodLabel: Record<string, string> = {
        Cash: "Cash",
        Check: "Check",
        BankTransfer: "Bank Transfer",
        Ewallet: "E-Wallet",
      };

      allPayments.forEach((p) => {
        y = checkPageBreak(doc, y);
        doc.text(`#${p.invoiceNumber}`, 15, y);
        doc.text(formatDate(p.createdAt), 50, y);
        doc.text(pdfCurrency(p.amount), 95, y);
        doc.text(methodLabel[p.paymentMethod] ?? p.paymentMethod, 135, y);
        doc.text(p.referenceNo ?? "-", 170, y);
        doc.line(15, y + 4, 195, y + 4);
        y += 12;
      });
    }

    doc.save(
      `SOA_${selectedCustomer.companyName.replace(/\s+/g, "_")}_${todayStr.replace(/,?\s+/g, "_")}.pdf`,
    );
  };

  const pendingInvoices =
    invoices?.filter((_, idx) => computedStatuses[idx] !== "PAID") ?? [];
  const pendingStatuses = computedStatuses.filter((s) => s !== "PAID");

  const paidInvoices =
    invoices?.filter((_, idx) => computedStatuses[idx] === "PAID") ?? [];
  const paidStatuses = computedStatuses.filter((s) => s === "PAID");

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

  return (
    <div className="absolute bg-black/40 w-full h-full top-0 left-0 flex justify-center items-start z-50 py-10">
      <div className="max-w-5xl max-h-320 h-full w-full bg-white px-10 py-8 rounded-lg border shadow-lg overflow-y-auto relative flex flex-col gap-6 mx-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold text-saltbox-gray">
            General Receivables
          </h1>
          <div className="flex items-center gap-2">
            <div
              className={`px-4 py-1.5 border rounded-lg text-sm font-medium flex items-center transition-colors ${
                selectedCustomer
                  ? "text-saltbox-gray cursor-pointer hover:bg-gray-50"
                  : "text-gray-300 cursor-not-allowed border-gray-200"
              }`}
              onClick={selectedCustomer ? handlePrint : undefined}
            >
              Print
            </div>
            <div
              className="p-2 rounded-lg hover:bg-bellflower-gray transition-colors cursor-pointer"
              onClick={() => setIsSOAModalOpen(false)}
            >
              <X size={18} className="text-vesper-gray" />
            </div>
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

        {/* Table 1 — Customer Summary */}
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-custom-gray px-4 py-3 border-b">
            <span className="text-sm font-semibold text-saltbox-gray">
              Customers
            </span>
          </div>
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
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSummary?.length === 0 && (
                    <tr>
                      <td
                        colSpan={3}
                        className="px-4 py-6 text-center text-sm text-vesper-gray"
                      >
                        No customers found
                      </td>
                    </tr>
                  )}
                  {filteredSummary?.map((customer) => (
                    <tr
                      key={customer.id}
                      className={`border-b last:border-b-0 cursor-pointer transition-colors ${
                        selectedCustomer?.id === customer.id
                          ? "bg-bellflower-gray"
                          : "hover:bg-wash-gray"
                      }`}
                      onClick={() =>
                        setSelectedCustomer(
                          selectedCustomer?.id === customer.id
                            ? null
                            : customer,
                        )
                      }
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
                      <td className="px-4 py-2 text-center">
                        {overallStatusBadge(customer.overallStatus)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Tables 2 & 3 — Invoice detail for selected customer */}
        {selectedCustomer && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-saltbox-gray">
                {selectedCustomer.companyName}
              </p>
              <span className="text-xs text-vesper-gray">— Invoice Detail</span>
            </div>

            {isInvoicesLoading ? (
              <div className="px-4 py-6 text-center text-sm text-vesper-gray">
                Loading invoices...
              </div>
            ) : (
              <>
                {/* Table 2 — Pending / Overdue */}
                <InvoiceAccordion
                  title="Pending Invoices"
                  invoices={pendingInvoices}
                  computedStatuses={pendingStatuses}
                  defaultOpen={true}
                  showRecordPayment={true}
                  onRecordPayment={setPaymentInvoice}
                />

                {/* Table 3 — Paid */}
                <InvoiceAccordion
                  title="Paid Invoices"
                  invoices={paidInvoices}
                  computedStatuses={paidStatuses}
                  defaultOpen={false}
                />
              </>
            )}
          </div>
        )}

        {!selectedCustomer && (
          <p className="text-sm text-vesper-gray text-center">
            Click a customer row to view their invoice detail.
          </p>
        )}
      </div>
    </div>
  );
};
