import {
  ArrowLeft,
  Ban,
  Calendar,
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
  LockKeyhole,
  ShieldCheck,
  TriangleAlert,
  X,
  CircleAlert,
} from "lucide-react";
import { useState } from "react";
import axios from "axios";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { InvoiceAllModel } from "@/features/invoice/models/invoice-all.model";
import { PaymentMethod } from "@/features/invoice/models/invoice-payment.model";
import {
  useInvoicePaymentsQuery,
  useRecordPaymentMutation,
  useInvalidatePaymentMutation,
} from "@/features/invoice/invoice-payment.query";

const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: "Cash", label: "Cash" },
  { value: "Check", label: "Check" },
  { value: "BankTransfer", label: "Bank Transfer" },
  { value: "Ewallet", label: "E-wallet" },
];

type InvoiceStatus =
  | "Pending"
  | "Partially Paid"
  | "Overdue"
  | "Paid"
  | "Voided";

const INVOICE_STATUS_BADGE_CLASSES: Record<InvoiceStatus, string> = {
  Pending: "bg-indigo-100 text-indigo-700",
  "Partially Paid": "bg-amber-100 text-amber-700",
  Overdue: "bg-red-100 text-red-600",
  Paid: "bg-green-100 text-green-700",
  Voided: "bg-gray-100 text-gray-600",
};

const computeInvoiceDueDate = (invoice: InvoiceAllModel): Date => {
  const dueDate = new Date(invoice.createdAt);
  dueDate.setDate(dueDate.getDate() + invoice.term);
  return dueDate;
};

const computeInvoiceStatus = (invoice: InvoiceAllModel): InvoiceStatus => {
  if (invoice.status?.toUpperCase() === "VOIDED") return "Voided";
  if (invoice.balance <= 0) return "Paid";
  if (invoice.balance < invoice.total_Amount) return "Partially Paid";
  if (new Date() > computeInvoiceDueDate(invoice)) return "Overdue";
  return "Pending";
};

const formatCurrency = (amount: number) =>
  `₱${amount.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const formatDate = (dateStr: string) =>
  new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(dateStr));

const formatTime = (dateStr: string) =>
  new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateStr));

interface RecordPaymentModalProps {
  invoice: InvoiceAllModel;
  customerId: string;
  onBack: () => void;
  onClose: () => void;
}

export const RecordPaymentModal = ({
  invoice,
  customerId,
  onBack,
  onClose,
}: RecordPaymentModalProps) => {
  // --- Payment form state ---
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("Cash");
  const [amount, setAmount] = useState("");
  const [referenceNo, setReferenceNo] = useState("");
  const [formError, setFormError] = useState("");

  // --- History state ---
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // --- Invalidation state ---
  const [invalidatingPaymentId, setInvalidatingPaymentId] = useState<
    number | null
  >(null);
  const [invalidationStep, setInvalidationStep] = useState<
    "confirm" | "password"
  >("confirm");
  const [invalidationPassword, setInvalidationPassword] = useState("");
  const [invalidationReason, setInvalidationReason] = useState("");
  const [invalidationPasswordError, setInvalidationPasswordError] =
    useState("");
  const [invalidationReasonError, setInvalidationReasonError] = useState("");
  const [showInvalidationPassword, setShowInvalidationPassword] =
    useState(false);

  const { data: payments, isLoading: isPaymentsLoading } =
    useInvoicePaymentsQuery(invoice.invoice_ID);

  const { mutateAsync: record, isPending: isRecording } =
    useRecordPaymentMutation(invoice.invoice_ID, customerId);

  const { mutateAsync: invalidate, isPending: isInvalidating } =
    useInvalidatePaymentMutation(invoice.invoice_ID, customerId);

  // Compute live balance from invoice data (updated by query invalidation)
  const liveBalance = invoice.balance;
  const amountNum = parseFloat(amount);
  const isAmountValid =
    !isNaN(amountNum) && amountNum > 0 && amountNum <= liveBalance;

  const needsReference = paymentMethod !== "Cash";

  const isPaid = computeInvoiceStatus(invoice) === "Paid";

  const handleRecordPayment = async () => {
    setFormError("");
    if (!isAmountValid) {
      setFormError(
        amountNum > liveBalance
          ? `Amount cannot exceed the remaining balance of ${formatCurrency(liveBalance)}.`
          : "Enter a valid amount greater than 0.",
      );
      return;
    }
    if (needsReference && !referenceNo.trim()) {
      setFormError("Reference number is required for this payment method.");
      return;
    }

    try {
      await record({
        amount: amountNum,
        paymentMethod,
        referenceNo: needsReference ? referenceNo.trim() : undefined,
      });
      setAmount("");
      setReferenceNo("");
      setPaymentMethod("Cash");
      setIsHistoryOpen(true);
    } catch (e) {
      if (axios.isAxiosError(e)) {
        setFormError(e.response?.data ?? "Failed to record payment.");
      } else {
        setFormError("Failed to record payment.");
      }
    }
  };

  const invalidatingPayment =
    payments?.find((p) => p.payment_ID === invalidatingPaymentId) ?? null;

  const handleOpenInvalidation = (paymentId: number) => {
    setInvalidatingPaymentId(paymentId);
    setInvalidationStep("confirm");
    setInvalidationPassword("");
    setInvalidationReason("");
    setInvalidationPasswordError("");
    setInvalidationReasonError("");
    setShowInvalidationPassword(false);
  };

  const handleCloseInvalidation = () => {
    setInvalidatingPaymentId(null);
    setInvalidationPassword("");
    setInvalidationReason("");
    setInvalidationPasswordError("");
    setInvalidationReasonError("");
  };

  const handleInvalidationContinue = () => {
    if (!invalidationReason.trim()) {
      setInvalidationReasonError("Reason is required.");
      return;
    }
    setInvalidationReasonError("");
    setInvalidationStep("password");
  };

  const handleConfirmInvalidation = async () => {
    if (!invalidationPassword.trim()) {
      setInvalidationPasswordError("Password is required.");
      return;
    }
    if (invalidatingPaymentId == null) return;

    setInvalidationPasswordError("");

    try {
      await invalidate({
        paymentId: invalidatingPaymentId,
        payload: {
          password: invalidationPassword.trim(),
          reason: invalidationReason.trim(),
        },
      });
      handleCloseInvalidation();
    } catch (e) {
      if (axios.isAxiosError(e) && e.response?.status === 401) {
        setInvalidationPasswordError("Incorrect password. Please try again.");
      } else {
        setInvalidationPasswordError(
          "Unable to invalidate payment. Please try again.",
        );
      }
    }
  };

  return (
    <div className="absolute bg-black/40 w-full h-full top-0 left-0 flex justify-center items-start z-50 py-10">
      <div className="max-w-4xl max-h-320 h-full w-full bg-white px-10 py-8 rounded-lg border shadow-lg overflow-y-auto relative flex flex-col gap-6 mx-4">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <div className="flex justify-between w-full items-center gap-3">
            <div
              className="flex items-center gap-2 cursor-pointer text-vesper-gray hover:text-saltbox-gray transition-colors"
              onClick={onBack}
            >
              <ArrowLeft size={18} />
              <span className="text-sm font-semibold">Receivables</span>
            </div>
            {/* <div
              className="p-2 rounded-lg hover:bg-bellflower-gray transition-colors cursor-pointer"
              onClick={onClose}
            >
              <X size={18} className="text-vesper-gray" />
            </div> */}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-saltbox-gray">
              {isPaid ? "Payment History" : "Record Payment"}
            </h1>
            <p className="text-sm text-vesper-gray flex items-center gap-2">
              <span>{String(invoice.invoice_Number).padStart(6, "0")}</span>
              <span>•</span>
              <span>{invoice.customer.companyName}</span>
            </p>
          </div>
        </div>

        {/* Invoice Summary */}
        <div className="border rounded-lg p-4 flex flex-col gap-3 bg-wash-gray">
          <div className="flex justify-between items-center text-sm">
            <span className="text-vesper-gray">Customer</span>
            <span className="font-semibold text-saltbox-gray">
              {invoice.customer.companyName}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-vesper-gray">Invoice Total</span>
            <span className="text-saltbox-gray">
              {formatCurrency(invoice.total_Amount)}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-vesper-gray">Remaining Balance</span>
            <span className="font-semibold text-saltbox-gray">
              {formatCurrency(liveBalance)}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-vesper-gray">Status</span>
            <span
              className={`text-xs px-2.5 py-1 rounded-full font-semibold uppercase ${INVOICE_STATUS_BADGE_CLASSES[computeInvoiceStatus(invoice)]}`}
            >
              {computeInvoiceStatus(invoice)}
            </span>
          </div>
        </div>

        {/* Enter Payment */}
        {!isPaid && (
        <div className="flex flex-col gap-3">
          <h2 className="text-base font-bold text-saltbox-gray">
            Enter Payment
          </h2>
          <div className="border rounded-lg p-4 flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Payment Date — informational, always today */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-vesper-gray uppercase">
                  Payment Date
                </label>
                <div className="relative">
                  <input
                    type="text"
                    className="input-style-2"
                    value={formatDate(new Date().toISOString())}
                    readOnly
                  />
                  <Calendar
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-vesper-gray"
                  />
                </div>
              </div>

              {/* Payment Method */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-vesper-gray uppercase">
                  Payment Method
                </label>
                <select
                  className="input-style-2 py-3!"
                  value={paymentMethod}
                  onChange={(e) => {
                    setPaymentMethod(e.target.value as PaymentMethod);
                    setFormError("");
                  }}
                >
                  {PAYMENT_METHODS.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Reference No — only for non-Cash */}
            {needsReference && (
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-vesper-gray uppercase">
                  Payment Reference
                </label>
                <input
                  type="text"
                  className="input-style-2"
                  placeholder="Enter payment reference"
                  value={referenceNo}
                  onChange={(e) => {
                    setReferenceNo(e.target.value);
                    setFormError("");
                  }}
                />
              </div>
            )}

            {/* Amount */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-vesper-gray uppercase">
                Amount
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-vesper-gray">
                  ₱
                </span>
                <input
                  type="number"
                  min={0.01}
                  className="input-style-2 pl-8"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                    setFormError("");
                  }}
                />
              </div>
              <span className="text-xs text-vesper-gray">
                Maximum payable: {formatCurrency(liveBalance)}
              </span>
              {amount && !isNaN(amountNum) && amountNum > liveBalance && (
                <div className="flex items-center gap-2">
                  <CircleAlert size={14} className="text-red-400" />
                  <span className="text-xs text-red-500">
                    Amount exceeds the remaining balance.
                  </span>
                </div>
              )}
            </div>

            {formError && (
              <div className="flex items-center gap-2">
                <CircleAlert size={14} className="text-red-400" />
                <span className="text-xs text-red-500">{formError}</span>
              </div>
            )}

            <div className="flex justify-end">
              <button
                className="px-4 py-2 text-white bg-blue-800 text-sm font-semibold rounded-lg disabled:opacity-50 disabled:bg-gray-300 transition-colors"
                onClick={handleRecordPayment}
                disabled={isRecording || !isAmountValid}
              >
                {isRecording ? "Recording..." : "Record Payment"}
              </button>
            </div>
          </div>
        </div>
        )}

        {/* Payment History Toggle */}
        <div className="border rounded-lg overflow-hidden">
          <button
            className="w-full flex items-center gap-2 px-4 py-3 bg-custom-gray hover:bg-bellflower-gray transition-colors text-left max-w-full"
            onClick={() => setIsHistoryOpen((v) => !v)}
          >
            {isHistoryOpen ? (
              <ChevronDown size={16} className="text-vesper-gray" />
            ) : (
              <ChevronRight size={16} className="text-vesper-gray" />
            )}
            <span className="text-sm font-semibold text-saltbox-gray">
              Payment History
            </span>
            {payments && (
              <span className="text-xs text-vesper-gray">
                {payments.length} record/s
              </span>
            )}
          </button>

          {isHistoryOpen && (
            <div className="overflow-x-auto">
              {isPaymentsLoading ? (
                <div className="px-4 py-6 text-center text-sm text-vesper-gray">
                  Loading...
                </div>
              ) : payments && payments.length === 0 ? (
                <div className="px-4 py-6 text-center text-sm text-vesper-gray">
                  No payments recorded yet.
                </div>
              ) : (
                <table className="w-full text-sm relative">
                  <thead>
                    <tr className="bg-wash-gray border-b">
                      <th className="text-left px-4 py-2 text-xs font-semibold text-vesper-gray whitespace-nowrap">
                        Payment Date
                      </th>
                      <th className="text-right px-4 py-2 text-xs font-semibold text-vesper-gray whitespace-nowrap">
                        Amount
                      </th>
                      <th className="text-left px-4 py-2 text-xs font-semibold text-vesper-gray whitespace-nowrap">
                        Method
                      </th>
                      <th className="text-left px-4 py-2 text-xs font-semibold text-vesper-gray whitespace-nowrap">
                        Recorded By
                      </th>
                      <th className="text-left px-4 py-2 text-xs font-semibold text-vesper-gray whitespace-nowrap">
                        Logged At
                      </th>
                      <th className="text-center px-4 py-2 text-xs font-semibold text-vesper-gray whitespace-nowrap">
                        Status
                      </th>
                      <th className="text-center px-4 py-2 text-xs font-semibold text-vesper-gray whitespace-nowrap">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments?.map((payment) => (
                      <tr
                        key={payment.payment_ID}
                        className={`border-b last:border-b-0 transition-colors ${
                          payment.isInvalidated
                            ? "opacity-50"
                            : "hover:bg-wash-gray"
                        }`}
                      >
                        <td className="px-4 py-2 text-vesper-gray whitespace-nowrap">
                          {formatDate(payment.createdAt)}
                        </td>
                        <td
                          className={`px-4 py-2 text-right font-semibold whitespace-nowrap ${payment.isInvalidated ? "line-through text-vesper-gray" : "text-saltbox-gray"}`}
                        >
                          {formatCurrency(payment.amount)}
                        </td>
                        <td className="px-4 py-2 text-vesper-gray whitespace-nowrap">
                          <p className="text-saltbox-gray font-medium">
                            {PAYMENT_METHODS.find(
                              (m) => m.value === payment.paymentMethod,
                            )?.label ?? payment.paymentMethod}
                          </p>
                          <p className="text-xs text-vesper-gray">
                            {payment.referenceNo ?? "—"}
                          </p>
                        </td>
                        <td className="px-4 py-2 text-vesper-gray whitespace-nowrap">
                          {payment.createdByName}
                        </td>
                        <td className="px-4 py-2 text-vesper-gray whitespace-nowrap">
                          <div className="flex flex-col">
                            <span>{formatDate(payment.createdAt)}</span>
                            <span className="text-xs text-vesper-gray font-semibold">
                              {formatTime(payment.createdAt)}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-2 text-center">
                          {payment.isInvalidated ? (
                            <HoverCard openDelay={100} closeDelay={100}>
                              <HoverCardTrigger asChild>
                                <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-red-100 text-red-600 cursor-default">
                                  INVALIDATED
                                </span>
                              </HoverCardTrigger>
                              <HoverCardContent className="w-72 bg-red-50 border-red-200 p-4 text-left">
                                <div className="flex items-center gap-2 text-red-700 font-semibold text-sm">
                                  <Ban size={16} />
                                  Invalidation Information
                                </div>
                                <div className="border-t border-red-200 my-2" />
                                <p className="text-xs text-red-700">
                                  Invalidated on{" "}
                                  <span className="font-bold text-red-800">
                                    {payment.invalidatedAt
                                      ? formatDate(payment.invalidatedAt)
                                      : "—"}
                                  </span>{" "}
                                  by{" "}
                                  <span className="font-bold text-red-800">
                                    {payment.invalidatedByName ?? "—"}
                                  </span>
                                </p>
                                {payment.invalidationReason && (
                                  <div className="mt-2 bg-white rounded-md p-2 text-xs text-saltbox-gray">
                                    <span className="font-bold">Reason:</span>{" "}
                                    {payment.invalidationReason}
                                  </div>
                                )}
                              </HoverCardContent>
                            </HoverCard>
                          ) : (
                            <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-green-100 text-green-700">
                              VALID
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-2 text-center">
                          {!payment.isInvalidated && (
                            <div
                              className="text-xs text-red-500 hover:underline cursor-pointer bg-red-50 p-2 py-1 rounded-md border border-red-300"
                              onClick={() =>
                                handleOpenInvalidation(payment.payment_ID)
                              }
                            >
                              Invalidate
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Invalidation Overlay */}
      {invalidatingPaymentId != null && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-60 p-4">
          {invalidationStep === "confirm" ? (
            <div className="w-full max-w-lg bg-white rounded-xl border shadow-lg p-6 flex flex-col gap-4">
              <div className="flex items-start justify-between">
                <h3 className="text-xl font-bold text-saltbox-gray">
                  Invalidate Payment
                </h3>
                <div
                  className="p-1 rounded-md cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={handleCloseInvalidation}
                >
                  <X size={20} className="text-saltbox-gray" />
                </div>
              </div>

              <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg p-4">
                <TriangleAlert
                  size={26}
                  className="text-red-600 shrink-0 mt-0.5"
                />
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-bold text-red-700">
                    This action will invalidate the payment.
                  </span>
                  <span className="text-sm text-red-600">
                    After invalidating this payment, the invoice balance will be
                    recalculated to reflect the change.
                  </span>
                </div>
              </div>

              {invalidatingPayment && (
                <div className="flex flex-col gap-2">
                  <h4 className="text-sm font-bold text-saltbox-gray">
                    Payment Details
                  </h4>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-wash-gray border-b">
                          <th className="text-left px-4 py-2 text-xs font-semibold text-vesper-gray whitespace-nowrap">
                            Payment Date
                          </th>
                          <th className="text-left px-4 py-2 text-xs font-semibold text-vesper-gray whitespace-nowrap">
                            Amount
                          </th>
                          <th className="text-left px-4 py-2 text-xs font-semibold text-vesper-gray whitespace-nowrap">
                            Method
                          </th>
                          <th className="text-left px-4 py-2 text-xs font-semibold text-vesper-gray whitespace-nowrap">
                            Recorded By
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="px-4 py-2 text-vesper-gray whitespace-nowrap">
                            {formatDate(invalidatingPayment.createdAt)}
                          </td>
                          <td className="px-4 py-2 font-bold text-saltbox-gray line-through whitespace-nowrap">
                            {formatCurrency(invalidatingPayment.amount)}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap">
                            <p className="text-saltbox-gray font-medium">
                              {PAYMENT_METHODS.find(
                                (m) =>
                                  m.value === invalidatingPayment.paymentMethod,
                              )?.label ?? invalidatingPayment.paymentMethod}
                            </p>
                            <p className="text-xs text-vesper-gray">
                              {invalidatingPayment.referenceNo ?? "—"}
                            </p>
                          </td>
                          <td className="px-4 py-2 text-vesper-gray whitespace-nowrap">
                            {invalidatingPayment.createdByName}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-1">
                <label className="text-sm font-bold text-saltbox-gray">
                  Reason <span className="text-red-500">*</span>
                </label>
                <span className="text-xs text-vesper-gray">
                  This reason will be recorded in the payment history.
                </span>
                <textarea
                  className="border rounded-md p-3 text-sm resize-none mt-1"
                  rows={3}
                  placeholder="Enter the reason for invalidating this payment"
                  value={invalidationReason}
                  onChange={(e) => {
                    setInvalidationReason(e.target.value);
                    if (e.target.value.trim()) setInvalidationReasonError("");
                  }}
                />
                {invalidationReasonError && (
                  <span className="text-xs text-red-500">
                    {invalidationReasonError}
                  </span>
                )}
              </div>

              <div className="border-t pt-4 flex justify-end gap-3">
                <button onClick={handleCloseInvalidation}>Cancel</button>
                <button
                  className="bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-md flex items-center gap-2 transition-colors text-nowrap max-w-fit"
                  onClick={handleInvalidationContinue}
                >
                  <TriangleAlert size={18} />
                  Invalidate Payment
                </button>
              </div>
            </div>
          ) : (
            <div className="w-full max-w-md bg-white rounded-xl border shadow-lg p-6 flex flex-col gap-4">
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="rounded-lg p-3 bg-indigo-200 w-fit">
                  <LockKeyhole className="text-indigo-600" size={28} />
                </div>
                <h3 className="text-xl font-bold text-saltbox-gray">
                  Confirm Your Password
                </h3>
                <p className="text-sm text-vesper-gray">
                  Authentication required to proceed
                </p>
              </div>

              <div className="border-t" />

              <div className="flex gap-3 items-start">
                <div className="rounded-lg p-2 bg-orange-100 w-fit shrink-0">
                  <TriangleAlert className="text-orange-500" size={22} />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-saltbox-gray">
                    You are about to:
                  </span>
                  <span className="text-sm font-bold text-saltbox-gray">
                    Invalidate this Payment
                  </span>
                  <span className="text-xs text-vesper-gray">
                    This action cannot be undone.
                  </span>
                </div>
              </div>

              <div className="border-t" />

              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-saltbox-gray">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showInvalidationPassword ? "text" : "password"}
                    className="border rounded-md p-2 pr-10 w-full text-sm"
                    placeholder="Enter your password"
                    value={invalidationPassword}
                    onChange={(e) => {
                      setInvalidationPassword(e.target.value);
                      if (e.target.value.trim())
                        setInvalidationPasswordError("");
                    }}
                  />
                  <div
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-vesper-gray cursor-pointer hover:text-saltbox-gray transition-colors"
                    onClick={() => setShowInvalidationPassword((prev) => !prev)}
                    tabIndex={-1}
                  >
                    {showInvalidationPassword ? (
                      <EyeOff size={16} />
                    ) : (
                      <Eye size={16} />
                    )}
                  </div>
                </div>
                {invalidationPasswordError && (
                  <span className="text-xs text-red-500">
                    {invalidationPasswordError}
                  </span>
                )}
              </div>

              <span className="flex items-center gap-1 text-xs text-vesper-gray font-semibold">
                <ShieldCheck size={14} /> For your security, please confirm your
                password to continue.
              </span>

              <div className="flex justify-end gap-3">
                <button
                  className="px-4 py-2 border rounded-md text-sm font-semibold text-saltbox-gray bg-white! hover:bg-gray-50 transition-colors max-w-full w-full"
                  onClick={() => setInvalidationStep("confirm")}
                  disabled={isInvalidating}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-river-green text-white text-sm font-semibold rounded-md disabled:opacity-60 transition-colors max-w-full w-full"
                  onClick={handleConfirmInvalidation}
                  disabled={isInvalidating}
                >
                  {isInvalidating ? "Please wait..." : "Confirm & Proceed"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
