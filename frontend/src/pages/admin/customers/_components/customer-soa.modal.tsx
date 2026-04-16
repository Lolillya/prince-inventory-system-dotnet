import { Search, X, ChevronDown, ChevronRight } from "lucide-react";
import { Dispatch, SetStateAction, useState } from "react";
import { useCustomerReceivablesSummaryQuery } from "@/features/customers/customer-receivables-summary.query";
import { useCustomerInvoicesQuery } from "@/features/customers/customer-invoices.query";
import { InvoiceAllModel } from "@/features/invoice/models/invoice-all.model";
import { CustomerReceivablesSummary } from "@/features/customers/models/customer-receivables-summary.model";

interface CustomerSOAModalProps {
  setIsSOAModalOpen: Dispatch<SetStateAction<boolean>>;
}

const computeInvoiceStatus = (invoice: InvoiceAllModel): string => {
  if (invoice.status?.toUpperCase() === "PAID") return "PAID";
  const dueDate = new Date(invoice.createdAt);
  dueDate.setDate(dueDate.getDate() + invoice.term);
  if (new Date() > dueDate) return "OVERDUE";
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
}

const InvoiceAccordion = ({
  title,
  invoices,
  computedStatuses,
  defaultOpen = true,
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
                    Date
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
                      {formatDate(inv.createdAt)}
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

  return (
    <div className="absolute bg-black/40 w-full h-full top-0 left-0 flex justify-center items-start z-50 py-10">
      <div className="max-w-5xl max-h-320 h-full w-full bg-white px-10 py-8 rounded-lg border shadow-lg overflow-y-auto relative flex flex-col gap-6 mx-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold text-saltbox-gray">
            General Receivables
          </h1>
          <button
            className="p-2 rounded-lg hover:bg-bellflower-gray transition-colors"
            onClick={() => setIsSOAModalOpen(false)}
          >
            <X size={18} className="text-vesper-gray" />
          </button>
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
