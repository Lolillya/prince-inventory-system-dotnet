import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  X,
  CircleAlert,
} from "lucide-react";
import { useState } from "react";
import axios from "axios";
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
  const [isPaymentFormOpen, setIsPaymentFormOpen] = useState(false);
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
      setIsPaymentFormOpen(false);
      setIsHistoryOpen(true);
    } catch (e) {
      if (axios.isAxiosError(e)) {
        setFormError(e.response?.data ?? "Failed to record payment.");
      } else {
        setFormError("Failed to record payment.");
      }
    }
  };

  const handleOpenInvalidation = (paymentId: number) => {
    setInvalidatingPaymentId(paymentId);
    setInvalidationStep("confirm");
    setInvalidationPassword("");
    setInvalidationReason("");
    setInvalidationPasswordError("");
    setInvalidationReasonError("");
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
      <div className="max-w-3xl max-h-320 h-full w-full bg-white px-10 py-8 rounded-lg border shadow-lg overflow-y-auto relative flex flex-col gap-6 mx-4">
        {/* Header */}
        <div className="flex flex-col">
          <div className="flex justify-between w-full items-center gap-3">
            <div
              className="p-2 rounded-lg hover:bg-bellflower-gray transition-colors"
              onClick={onBack}
            >
              <ArrowLeft size={18} className="text-vesper-gray" />
            </div>
            <div
              className="p-2 rounded-lg hover:bg-bellflower-gray transition-colors"
              onClick={onClose}
            >
              <X size={18} className="text-vesper-gray" />
            </div>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-saltbox-gray">
              Record Payment
            </h1>
            <p className="text-xs text-vesper-gray">
              Invoice #{invoice.invoice_Number} — {invoice.customer.companyName}
            </p>
          </div>
        </div>

        {/* Invoice Summary */}
        <div className="border rounded-lg p-4 flex flex-col gap-2 bg-wash-gray">
          <div className="flex justify-between text-sm">
            <span className="text-vesper-gray">Customer</span>
            <span className="font-semibold text-saltbox-gray">
              {invoice.customer.companyName}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-vesper-gray">Invoice Total</span>
            <span className="text-saltbox-gray">
              {formatCurrency(invoice.total_Amount)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-vesper-gray">Remaining Balance</span>
            <span className="font-semibold text-saltbox-gray">
              {formatCurrency(liveBalance)}
            </span>
          </div>
        </div>

        {/* Record Payment Toggle */}
        <div className="border rounded-lg overflow-hidden">
          <button
            className="w-full flex items-center gap-2 px-4 py-3 bg-custom-gray hover:bg-bellflower-gray transition-colors text-left max-w-full"
            onClick={() => setIsPaymentFormOpen((v) => !v)}
          >
            {isPaymentFormOpen ? (
              <ChevronDown size={16} className="text-vesper-gray" />
            ) : (
              <ChevronRight size={16} className="text-vesper-gray" />
            )}
            <span className="text-sm font-semibold text-saltbox-gray">
              Record Payment
            </span>
          </button>

          {isPaymentFormOpen && (
            <div className="p-4 flex flex-col gap-4">
              {/* Payment Method */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-vesper-gray uppercase">
                  Payment Method
                </label>
                <select
                  className="input-style-2"
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

              {/* Amount */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-vesper-gray uppercase">
                  Amount
                </label>
                <input
                  type="number"
                  min={0.01}
                  className="input-style-2"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                    setFormError("");
                  }}
                />
                <span className="text-xs text-vesper-gray">
                  Max: {formatCurrency(liveBalance)}
                </span>
              </div>

              {/* Reference No — only for non-Cash */}
              {needsReference && (
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-vesper-gray uppercase">
                    Reference No.
                  </label>
                  <input
                    type="text"
                    className="input-style-2"
                    placeholder="Enter reference number"
                    value={referenceNo}
                    onChange={(e) => {
                      setReferenceNo(e.target.value);
                      setFormError("");
                    }}
                  />
                </div>
              )}

              {formError && (
                <div className="flex items-center gap-2">
                  <CircleAlert size={14} className="text-red-400" />
                  <span className="text-xs text-red-500">{formError}</span>
                </div>
              )}

              <div className="flex justify-end">
                <button
                  className="px-4 py-2 bg-saltbox-gray text-white text-sm rounded-lg disabled:opacity-50 transition-opacity"
                  onClick={handleRecordPayment}
                  disabled={isRecording}
                >
                  {isRecording ? "Recording..." : "Confirm Payment"}
                </button>
              </div>
            </div>
          )}
        </div>

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
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-wash-gray border-b">
                      <th className="text-left px-4 py-2 text-xs font-semibold text-vesper-gray whitespace-nowrap">
                        Date
                      </th>
                      <th className="text-right px-4 py-2 text-xs font-semibold text-vesper-gray whitespace-nowrap">
                        Amount
                      </th>
                      <th className="text-left px-4 py-2 text-xs font-semibold text-vesper-gray whitespace-nowrap">
                        Method
                      </th>
                      <th className="text-left px-4 py-2 text-xs font-semibold text-vesper-gray whitespace-nowrap">
                        Ref. No.
                      </th>
                      <th className="text-left px-4 py-2 text-xs font-semibold text-vesper-gray whitespace-nowrap">
                        By
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
                          {PAYMENT_METHODS.find(
                            (m) => m.value === payment.paymentMethod,
                          )?.label ?? payment.paymentMethod}
                        </td>
                        <td className="px-4 py-2 text-vesper-gray">
                          {payment.referenceNo ?? "—"}
                        </td>
                        <td className="px-4 py-2 text-vesper-gray whitespace-nowrap">
                          {payment.createdByName}
                        </td>
                        <td className="px-4 py-2 text-center">
                          {payment.isInvalidated ? (
                            <div className="flex flex-col items-center gap-0.5">
                              <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-red-100 text-red-600">
                                INVALIDATED
                              </span>
                              <span className="text-xs text-vesper-gray">
                                by {payment.invalidatedByName}
                              </span>
                              {payment.invalidationReason && (
                                <span
                                  className="text-xs text-vesper-gray italic max-w-[140px] truncate"
                                  title={payment.invalidationReason}
                                >
                                  "{payment.invalidationReason}"
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-green-100 text-green-700">
                              VALID
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-2 text-center">
                          {!payment.isInvalidated && (
                            <button
                              className="text-xs text-red-500 hover:underline"
                              onClick={() =>
                                handleOpenInvalidation(payment.payment_ID)
                              }
                            >
                              Invalidate
                            </button>
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
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-60">
          <div className="w-full max-w-md bg-white rounded-lg border shadow-lg p-6 flex flex-col gap-4 mx-4">
            {invalidationStep === "confirm" ? (
              <>
                <h3 className="text-lg font-semibold text-saltbox-gray">
                  Invalidate Payment
                </h3>
                <p className="text-sm text-vesper-gray">
                  Are you sure you want to invalidate this payment? This will
                  restore the invoice balance.
                </p>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-vesper-gray uppercase">
                    Reason
                  </label>
                  <textarea
                    className="border rounded-md p-2 text-sm resize-none"
                    rows={3}
                    placeholder="Enter reason for invalidation"
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
                <div className="flex items-center gap-2 text-amber-600">
                  <CircleAlert size={14} />
                  <span className="text-xs">
                    The invoice balance will be recalculated upon invalidation.
                  </span>
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    className="px-4 py-2 border rounded-md text-sm"
                    onClick={handleCloseInvalidation}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-4 py-2 bg-red-500 text-white text-sm rounded-md"
                    onClick={handleInvalidationContinue}
                  >
                    Continue
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3 className="text-lg font-semibold text-saltbox-gray">
                  Confirm Password
                </h3>
                <p className="text-sm text-vesper-gray">
                  Enter your password to proceed with invalidation.
                </p>
                <input
                  type="password"
                  className="border rounded-md p-2 text-sm"
                  placeholder="Enter your password"
                  value={invalidationPassword}
                  onChange={(e) => {
                    setInvalidationPassword(e.target.value);
                    if (e.target.value.trim()) setInvalidationPasswordError("");
                  }}
                />
                {invalidationPasswordError && (
                  <span className="text-xs text-red-500">
                    {invalidationPasswordError}
                  </span>
                )}
                <div className="flex justify-end gap-3">
                  <button
                    className="px-4 py-2 border rounded-md text-sm"
                    onClick={() => setInvalidationStep("confirm")}
                    disabled={isInvalidating}
                  >
                    Back
                  </button>
                  <button
                    className="px-4 py-2 bg-red-500 text-white text-sm rounded-md disabled:opacity-60"
                    onClick={handleConfirmInvalidation}
                    disabled={isInvalidating}
                  >
                    {isInvalidating ? "Invalidating..." : "Invalidate Payment"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
