import { Search, X, ChevronDown, ChevronRight } from "lucide-react";
import jsPDF from "jspdf";
import { Dispatch, SetStateAction, useState } from "react";
import { useCustomerReceivablesSummaryQuery } from "@/features/customers/customer-receivables-summary.query";
import { useCustomerInvoicesQuery } from "@/features/customers/customer-invoices.query";
import { InvoiceAllModel } from "@/features/invoice/models/invoice-all.model";
import { CustomerReceivablesSummary } from "@/features/customers/models/customer-receivables-summary.model";
import { RecordPaymentModal } from "./record-payment.modal";

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

  const handlePrint = () => {
    const doc = new jsPDF();

    // Add custom font if needed, but we'll stick to Arial/Helvetica for standard jspdf
    doc.setFont("helvetica");

    // Title
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("STATEMENT OF ACCOUNT", 15, 20);

    // Company
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Acme Corp", 15, 30);
    doc.text("Address line goes here", 15, 36);
    doc.text("City, Country", 15, 42);

    // Statement Dates
    doc.setFont("helvetica", "bold");
    doc.text("Statement Date:", 15, 52);
    doc.setFont("helvetica", "normal");
    doc.text("Feb 17, 2026", 45, 52);

    doc.setFont("helvetica", "bold");
    doc.text("Statement Period:", 15, 58);
    doc.setFont("helvetica", "normal");
    doc.text("Jan 1, 2026 - Feb 15, 2026", 48, 58);

    doc.setDrawColor(220, 220, 220);
    doc.line(15, 65, 195, 65);

    // Summary Section
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Account Summary", 15, 78);

    doc.setFontSize(10);
    doc.text("Invoice No.", 15, 88);
    doc.text("Date", 60, 88);
    doc.text("Invoice Amount", 110, 88);
    doc.text("Balance Due", 160, 88);

    doc.line(15, 92, 195, 92);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("#######", 15, 100);
    doc.text("Jan 1, 2026", 60, 100);
    doc.text("PHP 450,000.00", 110, 100);
    doc.text("PHP 150,000.00", 160, 100);

    doc.line(15, 104, 195, 104);

    doc.text("#######", 15, 112);
    doc.text("Jan 30, 2026", 60, 112);
    doc.text("PHP 300,000.00", 110, 112);
    doc.text("PHP 180,000.00", 160, 112);

    doc.line(15, 116, 195, 116);

    doc.text("#######", 15, 124);
    doc.text("Feb 15, 2026", 60, 124);
    doc.text("PHP 150,000.00", 110, 124);
    doc.text("PHP 100,000.00", 160, 124);

    doc.line(15, 128, 195, 128);

    // Total section right aligned
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Total Outstanding Balance", 195, 142, { align: "right" });

    doc.setFontSize(16);
    doc.text("PHP 430,000.00", 195, 152, { align: "right" });

    doc.line(15, 162, 195, 162);

    // Payment History
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Payment History", 15, 175);

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");

    let y = 185;
    const history = [
      "####### \u00B7 PHP 300,000.00 \u00B7 Jan 5, 2026 \u00B7 Bank Transfer \u00B7 Ref: XXXXX",
      "####### \u00B7 PHP 60,000.00 \u00B7 Jan 14, 2026 \u00B7 Cash",
      "####### \u00B7 PHP 100,000.00 \u00B7 Jan 17, 2026 \u00B7 E-Wallet \u00B7 Ref: XXXXX",
      "####### \u00B7 PHP 40,000.00 \u00B7 Feb 1, 2026 \u00B7 Check \u00B7 Ref: XXXXX",
      "####### \u00B7 PHP 20,000.00 \u00B7 Feb 12, 2026 \u00B7 Cash",
    ];

    history.forEach((line) => {
      doc.text(`\u2022 ${line}`, 15, y);
      y += 8;
    });

    doc.save("Statement_of_Account.pdf");
  };
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
              className="px-4 py-1.5 border rounded-lg text-sm text-saltbox-gray cursor-pointer hover:bg-gray-50 flex items-center font-medium"
              onClick={handlePrint}
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
