import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import axios from "axios";
import { FilterIcon, PlusIcon, SearchIcon } from "../../../icons";
import { useInvoiceQuery } from "@/features/invoice/invoice-get-all";
import {
  voidInvoice,
  VoidInvoicePrecheckFailure,
} from "@/features/invoice/void-invoice.service";
import { VoidInvoiceBlockedModal } from "./_components/void-invoice-blocked.modal";
import { VoidInvoiceModal } from "./_components/void-invoice.modal";
import { buildInvoicePdf } from "@/features/invoice/invoice-pdf";
import { useCustomersQuery } from "@/features/customers/customer-get-all.query";
import { useSetCustomerSelected } from "@/features/customers/customer-selector.query";
import { NoInvoiceState } from "./_components/no-invoice-state";
import { InvoiceDetailModal } from "./_components/invoice-detail-modal";
import { InvoiceAllModel } from "@/features/invoice/models/invoice-all.model";
import {
  getInvoicePaymentStatus,
  invoicePaymentStatusColor,
} from "@/features/invoice/invoice-status";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  Calendar,
  Ellipsis,
  Pin,
  Receipt,
  User,
  Wallet,
} from "lucide-react";
import { Popover } from "@/components/ui/popover";
import { PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Separator } from "@/components/separator";

const InvoicePage = () => {
  const { data: invoiceData, isLoading: isLoadingInvoice } = useInvoiceQuery();
  const { data: customersData } = useCustomersQuery();
  const setCustomerSelected = useSetCustomerSelected();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [selectedInvoice, setSelectedInvoice] =
    useState<InvoiceAllModel | null>(null);
  const [openPopoverId, setOpenPopoverId] = useState<number | null>(null);
  const [voidingInvoiceId, setVoidingInvoiceId] = useState<number | null>(null);
  const [voidBlockedInfo, setVoidBlockedInfo] = useState<{
    activePaymentCount: number;
    activePaymentTotal: number;
  } | null>(null);
  const [voidConfirmInvoice, setVoidConfirmInvoice] =
    useState<InvoiceAllModel | null>(null);

  const handleExport = (inv: InvoiceAllModel) => {
    const invoiceNumberLabel = String(inv.invoice_Number).padStart(6, "0");
    const customerName = inv.customer.companyName
      ? inv.customer.companyName
      : `${inv.customer.firstName} ${inv.customer.lastName}`;

    buildInvoicePdf({
      invoiceNumberLabel,
      customerName,
      term: String(inv.term),
      dateLabel: new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(new Date(inv.createdAt)),
      lineItems: inv.lineItems.map((item) => ({
        label: `${item.product.product_Name} - ${item.product.brandName} - ${item.product.variantName}`,
        quantity: item.unit_Quantity,
        unit: item.unit,
        unitPrice: item.unit_Price,
        total: item.sub_Total,
      })),
      subtotal: inv.total_Amount + inv.discount,
      discountAmount: inv.discount,
      discountLabel: `P${inv.discount.toLocaleString()}`,
      grandTotal: inv.total_Amount,
      fileName: `Invoice-${invoiceNumberLabel}.pdf`,
      isVoided: inv.status === "VOIDED",
    });
  };

  const handleViewCustomer = (inv: InvoiceAllModel) => {
    const customer = customersData?.find((c) => c.id === inv.customer.id);
    if (!customer) {
      toast.error("Could not find this customer's record.");
      return;
    }
    setCustomerSelected(customer);
    navigate("/admin/customers");
  };

  const handleVoid = (inv: InvoiceAllModel) => {
    if (voidingInvoiceId !== null) return;
    setVoidConfirmInvoice(inv);
  };

  const confirmVoid = async ({
    invoiceId,
    password,
    reason,
  }: {
    invoiceId: number;
    password: string;
    reason: string;
  }) => {
    setVoidingInvoiceId(invoiceId);
    const toastId = toast.loading("Voiding invoice...");
    try {
      const res = await voidInvoice(invoiceId, password, reason);
      if (res) {
        toast.success("Invoice voided successfully.", { id: toastId });
        queryClient.invalidateQueries({ queryKey: ["invoice-items"] });
        setVoidConfirmInvoice(null);
      }
    } catch (e) {
      const failure = e as VoidInvoicePrecheckFailure;
      if (failure?.isPrecheckFailure) {
        toast.dismiss(toastId);
        setVoidConfirmInvoice(null);
        setVoidBlockedInfo({
          activePaymentCount: failure.activePaymentCount,
          activePaymentTotal: failure.activePaymentTotal,
        });
      } else if (axios.isAxiosError(e) && e.response?.status === 401) {
        // Wrong password — let the modal's inline error show, keep it open.
        toast.dismiss(toastId);
        throw e;
      } else {
        toast.error("Failed to void invoice.", { id: toastId });
      }
    } finally {
      setVoidingInvoiceId(null);
    }
  };

  const sortedInvoices = useMemo(
    () =>
      invoiceData
        ? [...invoiceData].sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          )
        : [],
    [invoiceData],
  );

  if (isLoadingInvoice) return <div>Loading...</div>;

  return (
    <section>
      {selectedInvoice && (
        <InvoiceDetailModal
          selectedInvoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
        />
      )}

      {voidBlockedInfo && (
        <VoidInvoiceBlockedModal
          activePaymentCount={voidBlockedInfo.activePaymentCount}
          activePaymentTotal={voidBlockedInfo.activePaymentTotal}
          onClose={() => setVoidBlockedInfo(null)}
        />
      )}

      {voidConfirmInvoice && (
        <VoidInvoiceModal
          selectedInvoice={voidConfirmInvoice}
          isVoiding={voidingInvoiceId === voidConfirmInvoice.invoice_ID}
          onConfirm={confirmVoid}
          onClose={() => setVoidConfirmInvoice(null)}
        />
      )}

      <div className="w-full mb-8">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3 max-w-lg w-full shrink-0">
            <div className="relative w-full">
              <input placeholder="Search..." className="input-style-2" />
              <i className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <SearchIcon />
              </i>
            </div>

            <div className="p-3 bg-custom-gray rounded-lg">
              <FilterIcon />
            </div>
          </div>

          <div className="flex w/full justify-end gap-2">
            <button
              className="flex items-center justify-center gap-2"
              onClick={() => navigate("/admin/invoice/new")}
            >
              <PlusIcon />
              new invoice
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 overflow-y-auto overflow-x-hidden flex-1 pr-1">
        {sortedInvoices.length === 0 ? (
          <div className="flex-1 flex justify-center items-center">
            <NoInvoiceState />
          </div>
        ) : (
          sortedInvoices.map((inv) => {
            const customerLabel = inv.customer.companyName
              ? inv.customer.companyName
              : `${inv.customer.firstName} ${inv.customer.lastName}`;

            const paymentStatus = getInvoicePaymentStatus(inv);
            const statusColor = invoicePaymentStatusColor[paymentStatus];

            return (
              <div
                key={inv.invoice_ID}
                className="flex flex-col gap-5 border rounded-lg py-3 px-5 bg-custom-gray h-fit w-full break-inside-avoid"
              >
                {/* CARD HEADER */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-semibold text-saltbox-gray tracking-wide">
                        #DR/INV-{String(inv.invoice_Number).padStart(6, "0")}
                      </span>
                      <Pin className="text-amber-400" size={18} />
                      <Popover
                        open={openPopoverId === inv.invoice_ID}
                        onOpenChange={(open) =>
                          setOpenPopoverId(open ? inv.invoice_ID : null)
                        }
                      >
                        <PopoverTrigger asChild className="cursor-pointer">
                          <Ellipsis className="text-saltbox-gray" />
                        </PopoverTrigger>
                        <PopoverContent className="w-fit">
                          <ul className="flex flex-col gap-1">
                            <li
                              className="text-sm cursor-pointer hover:underline flex items-center gap-1"
                              onClick={() => {
                                handleExport(inv);
                                setOpenPopoverId(null);
                              }}
                            >
                              Export
                              <label className="text-xs text-red-500">
                                {inv.status === "VOIDED" ? "(Voided)" : ""}
                              </label>
                            </li>
                            <li
                              className="text-sm cursor-pointer hover:underline"
                              onClick={() => {
                                setOpenPopoverId(null);
                                handleViewCustomer(inv);
                              }}
                            >
                              View Customer
                            </li>
                          </ul>
                          {inv.status !== "VOIDED" && (
                            <>
                              <Separator orientation="horizontal" />
                              <ul>
                                <li
                                  className={`text-sm hover:underline ${
                                    voidingInvoiceId === inv.invoice_ID
                                      ? "text-red-300 cursor-not-allowed"
                                      : "text-red-400 cursor-pointer"
                                  }`}
                                  onClick={() => {
                                    setOpenPopoverId(null);
                                    handleVoid(inv);
                                  }}
                                >
                                  {voidingInvoiceId === inv.invoice_ID
                                    ? "Voiding..."
                                    : "Void"}
                                </li>
                              </ul>
                            </>
                          )}
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="flex items-center flex-1 flex-wrap gap-2">
                      <div className="flex gap-2 items-center">
                        <Calendar className="text-saltbox-gray" size={16} />
                        <span className="text-saltbox-gray text-sm">
                          {new Intl.DateTimeFormat("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }).format(new Date(inv.createdAt))}
                        </span>
                      </div>

                      <div className="flex gap-2 items-center ml-5 border-l-2 border-gray-300 pl-5">
                        <User className="text-saltbox-gray" size={16} />
                        <span className="text-saltbox-gray text-sm">
                          {customerLabel}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <div className="bg-background rounded-lg p-2 shrink-0">
                        <Wallet className="text-saltbox-gray" size={18} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-saltbox-gray text-xs">
                          Grand Total
                        </span>
                        <span className="text-lg font-semibold text-saltbox-gray whitespace-nowrap">
                          ₱{inv.total_Amount.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="bg-background rounded-lg p-2 shrink-0">
                        <Receipt className="text-saltbox-gray" size={18} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-saltbox-gray text-xs">
                          Status
                        </span>
                        <span
                          className={`text-xs font-semibold px-2 py-1 rounded-full w-fit ${statusColor}`}
                        >
                          {paymentStatus}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-300" />

                {/* FOOTER */}
                <button
                  onClick={() => setSelectedInvoice(inv)}
                  className="bg-white shadow-none text-saltbox-gray w-full max-w-full self-end flex items-center gap-1 cursor-pointer hover:underline"
                >
                  View Details
                  <ArrowRight size={18} />
                </button>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
};

export default InvoicePage;
